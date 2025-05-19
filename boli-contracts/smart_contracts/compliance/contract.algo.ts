// boli/boli-contracts/smart_contracts/compliance/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Compliance Contract for Boli platform
 * Manages regulatory compliance, KYC/AML verification, and jurisdiction-specific rules
 * for all Boli asset types
 */
export class ComplianceContract extends Contract {
  // State variables
  regulator = GlobalStateKey<Address>();
  kycProvider = GlobalStateKey<Address>();
  
  // Box storage for jurisdiction regulators with proper key prefixes
  jurisdictionRegulators = BoxMap<string, Address>({ prefix: "jrs" });
  
  // Box storage for KYC status with proper key prefix
  kycStatus = BoxMap<Address, string>({ prefix: "kyc" });
  
  // Box storage for KYC expiration timestamps
  kycExpiration = BoxMap<Address, uint64>({ prefix: "exp" });
  
  // Box storage for jurisdiction rules with proper key prefix
  jurisdictionRules = BoxMap<string, string>({ prefix: "rule" });
  
  // Box storage for asset compliance status with proper key prefix
  assetComplianceStatus = BoxMap<AssetID, string>({ prefix: "comp" });
  
  /**
   * Initializes the compliance contract
   */
  initialize(
    mainRegulator: Address,
    kycProvider: Address
  ): void {
    // Only allow the contract creator to initialize
    assert(this.txn.sender === this.app.creator, "Only the creator can initialize");
    
    // Set the main regulator and KYC provider
    this.regulator.value = mainRegulator;
    this.kycProvider.value = kycProvider;
  }
  
  /**
   * Registers a regulator for a specific jurisdiction
   */
  registerJurisdictionRegulator(
    jurisdictionCode: string,
    regulatorAddress: Address
  ): void {
    // Only allow the main regulator to register jurisdiction regulators
    assert(this.txn.sender === this.regulator.value, "Only the main regulator can register jurisdiction regulators");
    
    // Register the jurisdiction regulator
    this.jurisdictionRegulators(jurisdictionCode).value = regulatorAddress;
  }
  
  /**
   * Sets KYC status for an account
   */
  setKycStatus(
    accountAddress: Address,
    status: string,
    expirationTimestamp: uint64
  ): void {
    // Only allow the KYC provider or main regulator to set KYC status
    assert(
      this.txn.sender === this.kycProvider.value || this.txn.sender === this.regulator.value,
      "Only the KYC provider or main regulator can set KYC status"
    );
    
    // Validate status (approved, pending, rejected)
    assert(
      status === "approved" || status === "pending" || status === "rejected",
      "Invalid KYC status"
    );
    
    // Store KYC status and expiration separately for easier access
    this.kycStatus(accountAddress).value = status;
    this.kycExpiration(accountAddress).value = expirationTimestamp;
  }
  
  /**
   * Gets KYC status for an account
   */
  getKycStatus(
    accountAddress: Address
  ): string {
    // Check if KYC status exists
    if (!this.kycStatus(accountAddress).exists) {
      return "not_registered";
    }
    
    // Get KYC status and expiration
    const status = this.kycStatus(accountAddress).value;
    const expiration = this.kycExpiration(accountAddress).value;
    
    // Check if KYC is expired
    if (expiration > 0 && this.txn.lastValid > expiration) {
      return "expired";
    }
    
    return status;
  }
  
  /**
   * Sets compliance rules for a jurisdiction
   */
  setJurisdictionRules(
    jurisdictionCode: string,
    assetType: string,
    rules: string
  ): void {
    // Check if sender is the main regulator or jurisdiction regulator
    const isMainRegulator = this.txn.sender === this.regulator.value;
    const isJurisdictionRegulator = 
      this.jurisdictionRegulators(jurisdictionCode).exists && 
      this.jurisdictionRegulators(jurisdictionCode).value === this.txn.sender;
    
    assert(
      isMainRegulator || isJurisdictionRegulator,
      "Only the main regulator or jurisdiction regulator can set rules"
    );
    
    // Set the rules for this jurisdiction and asset type
    const key = jurisdictionCode + "|" + assetType;
    this.jurisdictionRules(key).value = rules;
  }
  
  /**
   * Gets compliance rules for a jurisdiction and asset type
   */
  getJurisdictionRules(
    jurisdictionCode: string,
    assetType: string
  ): string {
    // Try to get jurisdiction-specific rules
    const key = jurisdictionCode + "|" + assetType;
    
    if (this.jurisdictionRules(key).exists) {
      return this.jurisdictionRules(key).value;
    }
    
    // Try to get general rules for this asset type
    const generalKey = "ALL|" + assetType;
    
    if (this.jurisdictionRules(generalKey).exists) {
      return this.jurisdictionRules(generalKey).value;
    }
    
    return "No specific rules defined";
  }
  
  /**
   * Sets compliance status for an asset
   */
  setAssetComplianceStatus(
    assetId: AssetID,
    status: string,
    notes: string
  ): void {
    // Check if sender is the main regulator
    assert(
      this.txn.sender === this.regulator.value,
      "Only the main regulator can set asset compliance status"
    );
    
    // Validate status (compliant, pending, non_compliant, suspended)
    assert(
      status === "compliant" || status === "pending" || 
      status === "non_compliant" || status === "suspended",
      "Invalid compliance status"
    );
    
    // Set the compliance status with notes and timestamp
    const complianceData = status + "|" + notes + "|" + this.txn.lastValid;
    this.assetComplianceStatus(assetId).value = complianceData;
  }
  
  /**
   * Gets compliance status for an asset
   */
  getAssetComplianceStatus(
    assetId: AssetID
  ): string {
    // Check if compliance status exists
    if (!this.assetComplianceStatus(assetId).exists) {
      return "unknown";
    }
    
    // Get compliance status
    return this.assetComplianceStatus(assetId).value;
  }
  
  /**
   * Verifies if an account can transact with a specific asset
   */
  verifyTransactionCompliance(
    accountAddress: Address,
    assetId: AssetID,
    assetType: string,
    jurisdictionCode: string
  ): boolean {
    // Check KYC status of account
    const kycStatus = this.getKycStatus(accountAddress);
    
    if (kycStatus !== "approved") {
      return false;
    }
    
    // Check compliance status of asset
    let assetCompliant = true;
    
    if (this.assetComplianceStatus(assetId).exists) {
      const complianceData = this.assetComplianceStatus(assetId).value;
      
      // Extract the status (first part before '|')
      let pipeIndex = 0;
      let i = 0;
      while (i < complianceData.length) {
        if (complianceData.charAt(i) === '|') {
          pipeIndex = i;
          break;
        }
        i++;
      }
      
      const status = complianceData.substring(0, pipeIndex);
      
      if (status === "suspended" || status === "non_compliant") {
        assetCompliant = false;
      }
    }
    
    // All checks passed
    return assetCompliant;
  }
}