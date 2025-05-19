// boli/boli-contracts/smart_contracts/blue_economy/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Blue Economy Asset Contract for Boli platform
 * Handles tokenization of sustainable marine resources, fishing rights, 
 * and coastal tourism concessions
 */
export class BlueEconomyContract extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  // Marine-specific state
  resourceType = GlobalStateKey<string>();
  marineZone = GlobalStateKey<string>();
  sustainabilityRating = GlobalStateKey<uint64>();
  expirationDate = GlobalStateKey<uint64>();
  
  /**
   * Creates a tokenized marine resource or right
   */
  createMarineAsset(
    resourceName: string,
    resourceType: string,
    marineZone: string,
    sustainabilityRating: uint64,
    validityPeriod: uint64,
    documentsHash: string,
    geoBoundary: string,
    jurisdictionCode: string
  ): AssetID {
    // Only allow the creator to create marine assets
    assert(this.txn.sender === this.app.creator, "Only the creator can create marine assets");
    
    // Validate sustainability rating (1-100)
    assert(sustainabilityRating >= 1 && sustainabilityRating <= 100, 
      "Sustainability rating must be between 1 and 100");
    
    // Store marine resource information
    this.resourceType.value = resourceType;
    this.marineZone.value = marineZone;
    this.sustainabilityRating.value = sustainabilityRating;
    
    // Calculate expiration date (0 means perpetual)
    const currentTime = globals.latestTimestamp;
    if (validityPeriod > 0) {
      this.expirationDate.value = currentTime + validityPeriod;
    } else {
      this.expirationDate.value = 0;
    }
    
    // Generate asset name and unit
    const assetName = "BLUE-" + resourceName;
    const unitName = "BLUE";
    
    // Prepare note with additional metadata
    const note = "Boli Blue Economy Asset: " + resourceType + " | Marine Zone: " + marineZone + " | Sustainability: " + sustainabilityRating + "/100";
    
    // Create marine resource token with appropriate fractionalization
    // Most marine rights are fractionalized for shared access
    const assetId = sendAssetCreation({
      configAssetTotal: 1000000,     // Default fractionalization amount
      configAssetDecimals: 3,        // 3 decimal places
      configAssetDefaultFrozen: 0,   // False = 0, True = 1
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: assetName,
      configAssetURL: "ipfs://" + documentsHash + "",
      note: note
    });
    
    // Store base asset information
    this.assetId.value = assetId;
    this.assetCreator.value = this.txn.sender;
    this.assetType.value = "blue-economy";
    this.geolocation.value = geoBoundary;
    this.metadata.value = documentsHash;
    this.jurisdictionCode.value = jurisdictionCode;
    this.complianceStatus.value = "authorized";
    this.lastUpdated.value = globals.latestTimestamp;
    
    return assetId;
  }
  
  /**
   * Check if a marine right is still valid (not expired)
   */
  isMarineRightValid(
    assetId: AssetID
  ): boolean {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    const expirationTimestamp = this.expirationDate.value;
    
    // If expiration is 0, it's perpetual
    if (expirationTimestamp === 0) {
      return true;
    }
    
    // Check against current time
    const currentTime = globals.latestTimestamp;
    return currentTime < expirationTimestamp;
  }
  
  /**
   * Update sustainability rating based on environmental assessment
   */
  updateSustainabilityRating(
    assetId: AssetID,
    newRating: uint64,
    assessmentHash: string
  ): boolean {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only allow the creator to update ratings
    assert(this.txn.sender === this.app.creator, "Only the creator can update ratings");
    
    // Validate rating is within accepted range
    assert(newRating >= 1 && newRating <= 100, "Rating must be between 1 and 100");
    
    // Update sustainability rating
    this.sustainabilityRating.value = newRating;
    
    // Update metadata with assessment document
    const updatedMetadata = "" + this.metadata.value + "|assessment:" + assessmentHash + "";
    this.metadata.value = updatedMetadata;
    this.lastUpdated.value = globals.latestTimestamp;
    
    return true;
  }
  
  /**
   * Extend the validity period of a marine right
   */
  extendValidityPeriod(
    assetId: AssetID,
    extensionPeriod: uint64
  ): boolean {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only allow the creator to extend validity
    assert(this.txn.sender === this.app.creator, "Only the creator can extend validity");
    
    // Get current expiration
    const currentExpiration = this.expirationDate.value;
    
    // If perpetual, remain perpetual
    if (currentExpiration === 0) {
      return true;
    }
    
    // Extend period
    this.expirationDate.value = currentExpiration + extensionPeriod;
    this.lastUpdated.value = globals.latestTimestamp;
    
    return true;
  }
  
  /**
   * Get detailed marine asset information
   */
  getMarineAssetDetails(
    assetId: AssetID
  ): string {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Check if expired
    const isValid = this.isMarineRightValid(assetId);
    
    // Build the asset information string
    let details = "Marine Asset ID: " + this.assetId.value + "";
    details += " | Type: " + this.resourceType.value + "";
    details += " | Marine Zone: " + this.marineZone.value + "";
    details += " | Jurisdiction: " + this.jurisdictionCode.value + "";
    details += " | Sustainability Rating: " + this.sustainabilityRating.value + "/100";
    
    if (this.expirationDate.value === 0) {
      details += " | Validity: Perpetual";
    } else {
      details += " | Expires: " + this.expirationDate.value + "";
      details += " | Status: " + (isValid ? "Valid" : "Expired" )+ "";
    }
    
    return details;
  }
  
  /**
   * Transfer rights to the marine asset
   */
  transferMarineAsset(
    assetId: AssetID,
    from: Address,
    to: Address,
    amount: uint64
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Check that asset is valid
    const isValid = this.isMarineRightValid(assetId);
    assert(isValid, "Cannot transfer expired marine rights");
    
    // Check compliance status
    assert(this.complianceStatus.value === "authorized", "Asset is not authorized for transfer");
    
    // Check authorization - caller must be the sender
    assert(this.txn.sender == from, "Sender must be the asset owner");
    
    // Execute the transfer via an inner transaction
    sendAssetTransfer({
      xferAsset: assetId,
      assetAmount: amount,
      assetReceiver: to,
      assetSender: from
    });
    
    // Update records
    this.lastUpdated.value = globals.latestTimestamp;
  }
}