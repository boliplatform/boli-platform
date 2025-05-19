// boli/boli-contracts/smart_contracts/carbon_credits/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Carbon Credit Generation Contract for Boli platform
 * Implements the Verified Carbon Unit (VCU) Framework for climate initiatives
 */
export class CarbonCreditContract extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  // Carbon credit specific state variables
  creditType = GlobalStateKey<string>();
  carbonRegistry = GlobalStateKey<string>();
  registryProjectId = GlobalStateKey<string>();
  vintageStart = GlobalStateKey<uint64>();
  vintageEnd = GlobalStateKey<uint64>();
  totalCarbonOffset = GlobalStateKey<uint64>();  // in tonnes CO2
  remainingOffset = GlobalStateKey<uint64>();
  verificationMethodology = GlobalStateKey<string>();
  verifier = GlobalStateKey<string>();
  
  // Helper method to assert that sender is the app creator
  protected assertSenderIsCreator(): void {
    assert(this.txn.sender === this.app.creator, "Only the creator can perform this action");
  }
  
  /**
   * Creates a new carbon credit project
   */
  createCarbonProject(
    name: string,
    unitName: string,
    creditType: string,
    carbonRegistry: string,
    registryProjectId: string,
    jurisdictionCode: string,
    geolocation: string,
    vintageStart: uint64,
    vintageEnd: uint64,
    totalOffset: uint64,
    verificationMethodology: string,
    monitoringReportHash: string,
    verifier: string
  ): AssetID {
    // Only allow the creator to create carbon credit projects
    this.assertSenderIsCreator();
    
    // Validate inputs
    assert(vintageStart < vintageEnd, "Invalid vintage period");
    assert(totalOffset > 0, "Total offset must be positive");
    
    // Prepare note with carbon credit details
    const note = "Boli Carbon Credit: " + creditType + " | Registry: " + carbonRegistry + " | Project ID: " + registryProjectId + " | Verified by: " + verifier;
    
    // Create the carbon credit tokens (1 token = 1 tonne of CO2)
    const assetId = sendAssetCreation({
      configAssetTotal: totalOffset,
      configAssetDecimals: 0,  // Non-divisible carbon credits
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: name,
      configAssetURL: "ipfs://" + monitoringReportHash,
      note: note
    });
    
    // Store base asset information
    this.assetId.value = assetId;
    this.assetCreator.value = this.txn.sender;
    this.assetType.value = "carbon-credit";
    this.geolocation.value = geolocation;
    this.metadata.value = monitoringReportHash;
    this.jurisdictionCode.value = jurisdictionCode;
    this.complianceStatus.value = "verified";
    this.lastUpdated.value = globals.latestTimestamp;
    
    // Store carbon credit specific information
    this.creditType.value = creditType;
    this.carbonRegistry.value = carbonRegistry;
    this.registryProjectId.value = registryProjectId;
    this.vintageStart.value = vintageStart;
    this.vintageEnd.value = vintageEnd;
    this.totalCarbonOffset.value = totalOffset;
    this.remainingOffset.value = totalOffset;  // Initially all credits are available
    this.verificationMethodology.value = verificationMethodology;
    this.verifier.value = verifier;
    
    return assetId;
  }
  
  /**
   * Issues carbon credits to a recipient
   */
  issueCredits(
    creditAssetId: AssetID,
    recipient: Address,
    amount: uint64
  ): void {
    // Ensure the carbon credit exists and matches our records
    assert(this.assetId.value == creditAssetId, "Credit ID mismatch");
    
    // Only allow the contract creator or authorized issuer to issue credits
    this.assertSenderIsCreator();
    
    // Check available credits
    assert(this.remainingOffset.value >= amount, "Insufficient credits remaining");
    
    // Execute the transfer from reserve
    sendAssetTransfer({
      xferAsset: creditAssetId,
      assetAmount: amount,
      assetReceiver: recipient,
      assetSender: this.assetCreator.value
    });
    
    // Update remaining credits
    this.remainingOffset.value = this.remainingOffset.value - amount;
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Retires carbon credits (permanently removing them from circulation)
   */
  retireCredits(
    creditAssetId: AssetID,
    amount: uint64,
    retirementBeneficiary: string,
    retirementReason: string
  ): void {
    // Ensure the carbon credit exists and matches our records
    assert(this.assetId.value == creditAssetId, "Credit ID mismatch");
    
    // Create retirement note
    const retirementNote = "Retired: " + retirementReason + " | Beneficiary: " + retirementBeneficiary + " | Date: " + globals.latestTimestamp;
    
    // Execute the retirement by transferring to the contract address (used as retirement address)
    sendAssetTransfer({
      xferAsset: creditAssetId,
      assetAmount: amount,
      assetReceiver: this.app.address,
      assetSender: this.txn.sender,
      note: retirementNote
    });
    
    // Update metadata with retirement information
    const updatedMetadata = this.metadata.value + "|retirement:" + retirementBeneficiary + ":" + amount + ":" + globals.latestTimestamp;
    this.metadata.value = updatedMetadata;
  }
  
  /**
   * Adds verification document to existing carbon credits
   */
  addVerificationDocument(
    creditAssetId: AssetID,
    verifierName: string,
    verificationDate: uint64,
    documentHash: string
  ): void {
    // Ensure the carbon credit exists and matches our records
    assert(this.assetId.value == creditAssetId, "Credit ID mismatch");
    
    // Only allow the contract creator or authorized verifier to add documents
    this.assertSenderIsCreator();
    
    // Update verifier information
    this.verifier.value = verifierName;
    
    // Update document reference
    const updatedMetadata = this.metadata.value + "|verification:" + documentHash + ":" + verificationDate;
    this.metadata.value = updatedMetadata;
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Get detailed carbon credit information
   */
  getCarbonCreditDetails(
    creditAssetId: AssetID
  ): string {
    // Ensure the carbon credit exists and matches our records
    assert(this.assetId.value == creditAssetId, "Credit ID mismatch");
    
    // Build the carbon credit information string
    let details = "Carbon Credit ID: " + this.assetId.value;
    details += " | Type: " + this.creditType.value;
    details += " | Registry: " + this.carbonRegistry.value;
    details += " | Project ID: " + this.registryProjectId.value;
    details += " | Vintage: " + this.vintageStart.value + "-" + this.vintageEnd.value;
    details += " | Total Offset: " + this.totalCarbonOffset.value;
    details += " | Remaining: " + this.remainingOffset.value;
    details += " | Verified by: " + this.verifier.value;
    details += " | Jurisdiction: " + this.jurisdictionCode.value;
    
    return details;
  }
  
  /**
   * Verify the authenticity of carbon credit
   */
  verifyCarbonCredit(
    creditAssetId: AssetID
  ): boolean {
    // Ensure the carbon credit exists and matches our records
    assert(this.assetId.value == creditAssetId, "Credit ID mismatch");
    
    // Check if the compliance status is verified
    return this.complianceStatus.value === "verified";
  }
  
  /**
   * Transfer carbon credits between accounts
   */
  transferCredits(
    creditAssetId: AssetID,
    from: Address,
    to: Address,
    amount: uint64
  ): void {
    // Ensure the carbon credit exists and matches our records
    assert(this.assetId.value == creditAssetId, "Credit ID mismatch");
    
    // Check compliance status - only allow transfers for verified credits
    assert(this.complianceStatus.value === "verified", "Credits are not verified");
    
    // Check authorization - caller must be the credit owner
    assert(this.txn.sender == from, "Sender must be the credit owner");
    
    // Execute the transfer
    sendAssetTransfer({
      xferAsset: creditAssetId,
      assetAmount: amount,
      assetReceiver: to,
      assetSender: from
    });
    
    // Update timestamp
    this.lastUpdated.value = globals.latestTimestamp;
  }
}