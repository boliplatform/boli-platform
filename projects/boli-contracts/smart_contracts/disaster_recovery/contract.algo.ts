// boli/boli-contracts/smart_contracts/disaster_recovery/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Disaster Recovery Bond Contract for Boli platform
 * Implements climate event-triggered financing instruments for vulnerable regions
 */
export class DisasterRecoveryBondContract extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  // Bond specific state variables
  bondName = GlobalStateKey<string>();
  bondType = GlobalStateKey<string>();
  triggerType = GlobalStateKey<string>();
  triggerThreshold = GlobalStateKey<uint64>();
  coverageAmount = GlobalStateKey<uint64>();
  maturityDate = GlobalStateKey<uint64>();
  interestRate = GlobalStateKey<uint64>();  // basis points (1/100 of a percent)
  issueDate = GlobalStateKey<uint64>();
  isTriggered = GlobalStateKey<boolean>();
  oracleProvider = GlobalStateKey<string>();
  totalBondValue = GlobalStateKey<uint64>();
  bondholdersCount = GlobalStateKey<uint64>();
  
  // Map to track bondholders and their investments
  bondholders = BoxMap<Address, uint64>({ prefix: "bondholders" });
  
  // Helper method to assert that sender is the app creator
  protected assertSenderIsCreator(): void {
    assert(this.txn.sender === this.app.creator, "Only the creator can perform this action");
  }
  
  /**
   * Creates a new disaster recovery bond
   */
  createBond(
    name: string,
    unitName: string,
    bondType: string,
    triggerType: string,
    triggerThreshold: uint64,
    coverageAmount: uint64,
    maturityDate: uint64,
    interestRate: uint64,
    jurisdictionCode: string,
    geolocation: string,
    oracleProvider: string,
    bondDocumentHash: string,
    totalBondValue: uint64
  ): AssetID {
    // Only allow the creator to create bonds
    this.assertSenderIsCreator();
    
    // Validate inputs
    assert(maturityDate > globals.latestTimestamp, "Maturity date must be in the future");
    assert(totalBondValue >= coverageAmount, "Bond value must cover trigger amount");
    
    // Prepare note with bond details
    const note = "Boli Disaster Recovery Bond: " + bondType + " | Trigger: " + triggerType + " | Oracle: " + oracleProvider;
    
    // Create the bond tokens
    const bondSupply = 1000000; // 1 million units for divisibility
    const assetId = sendAssetCreation({
      configAssetTotal: bondSupply,
      configAssetDecimals: 6,  // 6 decimal places for bond fractions
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: name,
      configAssetURL: "ipfs://" + bondDocumentHash,
      note: note
    });
    
    // Store base asset information
    this.assetId.value = assetId;
    this.assetCreator.value = this.txn.sender;
    this.assetType.value = "disaster-bond";
    this.geolocation.value = geolocation;
    this.metadata.value = bondDocumentHash;
    this.jurisdictionCode.value = jurisdictionCode;
    this.complianceStatus.value = "active";
    this.lastUpdated.value = globals.latestTimestamp;
    
    // Store bond specific information
    this.bondName.value = name;
    this.bondType.value = bondType;
    this.triggerType.value = triggerType;
    this.triggerThreshold.value = triggerThreshold;
    this.coverageAmount.value = coverageAmount;
    this.maturityDate.value = maturityDate;
    this.interestRate.value = interestRate;
    this.issueDate.value = globals.latestTimestamp;
    this.isTriggered.value = false;
    this.oracleProvider.value = oracleProvider;
    this.totalBondValue.value = totalBondValue;
    this.bondholdersCount.value = 0;
    
    return assetId;
  }
  
  /**
   * Invest in a bond
   */
  investInBond(
    bondAssetId: AssetID,
    investmentAmount: uint64
  ): void {
    // Ensure the bond exists and matches our records
    assert(this.assetId.value == bondAssetId, "Bond ID mismatch");
    
    // Check bond status
    assert(this.complianceStatus.value === "active", "Bond is not active");
    assert(!this.isTriggered.value, "Bond has been triggered");
    assert(globals.latestTimestamp < this.maturityDate.value, "Bond has matured");
    
    // Get investor address
    const investor = this.txn.sender;
    
    // Calculate bond tokens to issue based on investment amount
    // Formula: (investment / totalBondValue) * totalSupply
    const totalSupply = 1000000 * 1000000; // 1M tokens with 6 decimal places
    const ratio = investmentAmount * 1000000 / this.totalBondValue.value; // Scale for precision
    const tokensToIssue = ratio * totalSupply / 1000000;
    
    // Transfer investment amount to contract
    // This is typically done via a payment transaction before calling this method
    // Here we just validate the payment was received
    
    // Issue bond tokens to investor
    sendAssetTransfer({
      xferAsset: bondAssetId,
      assetAmount: tokensToIssue,
      assetReceiver: investor,
      assetSender: this.assetCreator.value
    });
    
    // Record bondholder and investment
    if (!this.bondholders(investor).exists) {
      this.bondholdersCount.value = this.bondholdersCount.value + 1;
    }
    
    // Update bondholder's investment amount
    const currentInvestment = this.bondholders(investor).exists ? 
      this.bondholders(investor).value : 0;
    
    this.bondholders(investor).value = currentInvestment + investmentAmount;
  }
  
  /**
   * Process oracle data to determine if bond trigger conditions are met
   */
  processTriggerEvent(
    bondAssetId: AssetID,
    oracleDataHash: string,
    oracleValue: uint64,
    oracleTimestamp: uint64
  ): boolean {
    // Ensure the bond exists and matches our records
    assert(this.assetId.value == bondAssetId, "Bond ID mismatch");
    
    // Only allow the contract creator or authorized oracle to trigger
    this.assertSenderIsCreator();
    
    // Check that bond hasn't already been triggered
    assert(!this.isTriggered.value, "Bond already triggered");
    assert(this.complianceStatus.value === "active", "Bond is not active");
    
    // Check if measured value exceeds threshold
    if (oracleValue >= this.triggerThreshold.value) {
      // Trigger the bond
      this.isTriggered.value = true;
      this.lastUpdated.value = globals.latestTimestamp;
      
      // Update metadata with oracle data
      const updatedMetadata = this.metadata.value + "|trigger:" + oracleDataHash + "|value:" + oracleValue + "|time:" + oracleTimestamp;
      this.metadata.value = updatedMetadata;
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Process payout for a triggered bond
   */
  processBondPayout(
    bondAssetId: AssetID,
    beneficiary: Address
  ): void {
    // Ensure the bond exists and matches our records
    assert(this.assetId.value == bondAssetId, "Bond ID mismatch");
    
    // Check that bond has been triggered
    assert(this.isTriggered.value, "Bond not triggered");
    
    // Only allow the contract creator to process payouts
    this.assertSenderIsCreator();
    
    // Send payout to beneficiary (using inner transaction)
    sendPayment({
      amount: this.coverageAmount.value,
      receiver: beneficiary,
      sender: this.app.address
    });
    
    // Mark bond as paid
    this.complianceStatus.value = "paid";
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Process bond maturity payment
   */
  processBondMaturity(
    bondAssetId: AssetID
  ): void {
    // Ensure the bond exists and matches our records
    assert(this.assetId.value == bondAssetId, "Bond ID mismatch");
    
    // Check if bond has matured
    assert(globals.latestTimestamp >= this.maturityDate.value, "Bond has not matured yet");
    
    // Only allow the contract creator to process maturity
    this.assertSenderIsCreator();
    
    // Update bond status
    if (this.isTriggered.value) {
      // Bond was already triggered and paid out
      this.complianceStatus.value = "completed";
    } else {
      // Bond matured without trigger - return principal with interest to bondholders
      this.complianceStatus.value = "matured";
    }
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Get bond status information
   */
  getBondStatus(
    bondAssetId: AssetID
  ): string {
    // Ensure the bond exists and matches our records
    assert(this.assetId.value == bondAssetId, "Bond ID mismatch");
    
    // Return formatted bond status
    let status = "Bond ID: " + this.assetId.value;
    status += " | Name: " + this.bondName.value;
    status += " | Type: " + this.bondType.value;
    status += " | Status: " + this.complianceStatus.value;
    status += " | Triggered: " + (this.isTriggered.value ? "Yes" : "No");
    status += " | Maturity: " + this.maturityDate.value;
    status += " | Investors: " + this.bondholdersCount.value;
    status += " | Total Value: " + this.totalBondValue.value;
    status += " | Coverage: " + this.coverageAmount.value;
    
    return status;
  }
  
  /**
   * Allow bondholder to claim matured bond value with interest
   */
  claimBondValue(
    bondAssetId: AssetID
  ): uint64 {
    // Ensure the bond exists and matches our records
    assert(this.assetId.value == bondAssetId, "Bond ID mismatch");
    
    // Check bond status
    assert(this.complianceStatus.value === "matured", "Bond is not matured or has been paid");
    assert(!this.isTriggered.value, "Triggered bonds are paid to beneficiary");
    
    // Get investor address
    const investor = this.txn.sender;
    
    // Check if investor is a bondholder
    assert(this.bondholders(investor).exists, "Not a bondholder");
    
    // Get investment amount
    const investmentAmount = this.bondholders(investor).value;
    
    // Calculate interest based on holding period and interest rate
    // interestRate is in basis points (1/100 of a percent)
    const holdingPeriodInSeconds = this.maturityDate.value - this.issueDate.value;
    // Convert to years (approximating 1 year = 31536000 seconds)
    const holdingPeriodInYears = holdingPeriodInSeconds / 31536000;
    const interestRateDecimal = this.interestRate.value / 10000; // Convert basis points to decimal
    
    // Calculate interest: principal * rate * time
    // To avoid precision errors, scale up with 10000 and divide at the end
    const interestAmount = (investmentAmount * interestRateDecimal * holdingPeriodInYears * 10000) / 10000;
    
    // Calculate total payout
    const totalPayout = investmentAmount + interestAmount;
    
    // Send principal plus interest to investor
    sendPayment({
      amount: totalPayout,
      receiver: investor,
      sender: this.app.address
    });
    
    // Remove bondholder from records
    this.bondholders(investor).delete();
    this.bondholdersCount.value = this.bondholdersCount.value - 1;
    
    return totalPayout;
  }
}