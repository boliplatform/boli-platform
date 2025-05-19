// boli/boli-contracts/smart_contracts/land_property/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Land & Property Tokenization Contract for Boli platform
 * Handles tokenization of real estate with legal document integration
 */
export class LandPropertyContract extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  // Land property specific state variables
  propertyType = GlobalStateKey<string>();
  legalIdentifier = GlobalStateKey<string>();
  valuationAmount = GlobalStateKey<uint64>();
  valuationDate = GlobalStateKey<uint64>();
  fractionalAssetId = GlobalStateKey<AssetID>();
  fractionalizedStatus = GlobalStateKey<boolean>();
  
  // Helper method to assert that sender is the app creator
  protected assertSenderIsCreator(): void {
    assert(this.txn.sender === this.app.creator, "Only the creator can perform this action");
  }
  
  /**
   * Creates a new tokenized property
   */
  createProperty(
    name: string,
    unitName: string,
    propertyType: string,
    legalIdentifier: string,
    jurisdictionCode: string,
    geolocation: string,
    valuationAmount: uint64,
    legalDocumentHash: string
  ): AssetID {
    // Only allow the creator to create properties
    this.assertSenderIsCreator();
    
    // Prepare extended note with property details
    const note = "Boli Property: " + propertyType + " | Legal ID: " + legalIdentifier + " | Jurisdiction: " + jurisdictionCode;
    
    // Create the property as a non-fungible token (single unit)
    const assetId = sendAssetCreation({
      configAssetTotal: 1,                          // NFT representing the property
      configAssetDecimals: 0,
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: name,
      configAssetURL: "ipfs://" + legalDocumentHash,
      note: note
    });
    
    // Store base asset information
    this.assetId.value = assetId;
    this.assetCreator.value = this.txn.sender;
    this.assetType.value = "land-property";
    this.geolocation.value = geolocation;
    this.metadata.value = legalDocumentHash;
    this.jurisdictionCode.value = jurisdictionCode;
    this.complianceStatus.value = "created";
    this.lastUpdated.value = globals.latestTimestamp;
    
    // Store property-specific information
    this.propertyType.value = propertyType;
    this.legalIdentifier.value = legalIdentifier;
    this.valuationAmount.value = valuationAmount;
    this.valuationDate.value = globals.latestTimestamp;
    this.fractionalizedStatus.value = false;
    
    return assetId;
  }
  
  /**
   * Fractionalize a property into multiple tokens for shared ownership
   */
  fractionalizeProperty(
    propertyAssetId: AssetID,
    fractionName: string,
    fractionUnitName: string,
    fractionCount: uint64,
    fractionDecimals: uint64
  ): AssetID {
    // Ensure the property exists and matches our records
    assert(this.assetId.value == propertyAssetId, "Property ID mismatch");
    
    // Only allow the contract creator or property owner to fractionalize
    this.assertSenderIsCreator();
    
    // Check that property isn't already fractionalized
    assert(!this.fractionalizedStatus.value, "Property is already fractionalized");
    
    // Prepare note for fractional tokens
    const note = "Boli Fractionalized Property: " + this.propertyType.value + " | Original Asset ID: " + propertyAssetId + " | Legal ID: " + this.legalIdentifier.value;
    
    // Create fractional tokens
    const fractionAssetId = sendAssetCreation({
      configAssetTotal: fractionCount,
      configAssetDecimals: fractionDecimals,
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: fractionUnitName,
      configAssetName: fractionName,
      configAssetURL: "ipfs://" + this.metadata.value,
      note: note
    });
    
    // Update property status to fractionalized
    this.fractionalizedStatus.value = true;
    this.fractionalAssetId.value = fractionAssetId;
    this.lastUpdated.value = globals.latestTimestamp;
    
    return fractionAssetId;
  }
  
  /**
   * Updates property valuation
   */
  updateValuation(
    propertyAssetId: AssetID,
    newValuation: uint64,
    appraisalDocumentHash: string
  ): void {
    // Ensure the property exists and matches our records
    assert(this.assetId.value == propertyAssetId, "Property ID mismatch");
    
    // Only allow the contract creator or authorized appraiser to update valuation
    this.assertSenderIsCreator();
    
    // Update valuation information
    this.valuationAmount.value = newValuation;
    this.valuationDate.value = globals.latestTimestamp;
    
    // Store appraisal document reference
    const updatedMetadata = this.metadata.value + "|appraisal:" + appraisalDocumentHash;
    this.metadata.value = updatedMetadata;
  }
  
  /**
   * Updates property legal documentation
   */
  updateLegalDocumentation(
    propertyAssetId: AssetID,
    newLegalDocumentHash: string,
    documentType: string
  ): void {
    // Ensure the property exists and matches our records
    assert(this.assetId.value == propertyAssetId, "Property ID mismatch");
    
    // Only allow the contract creator or property owner to update documents
    this.assertSenderIsCreator();
    
    // Update document reference
    const updatedMetadata = this.metadata.value + "|" + documentType + ":" + newLegalDocumentHash;
    this.metadata.value = updatedMetadata;
    this.lastUpdated.value = globals.latestTimestamp;
    
    // If this property is fractionalized, update the fractional asset configuration
    // Note: We can't update the URL directly in asset config
    if (this.fractionalizedStatus.value) {
      // Only update the other config parameters
      sendAssetConfig({
        configAsset: this.fractionalAssetId.value,
        configAssetManager: this.app.address,
        configAssetReserve: this.txn.sender,
        configAssetFreeze: this.app.address,
        configAssetClawback: this.app.address
      });
      
      // To update the URL, we would need to implement a more complex pattern
      // either through a separate asset config transaction with metadata
      // or by storing the URL in contract state for reference
    }
  }
  
  /**
   * Get detailed property information
   */
  getPropertyDetails(
    propertyAssetId: AssetID
  ): string {
    // Ensure the property exists and matches our records
    assert(this.assetId.value == propertyAssetId, "Property ID mismatch");
    
    // Build the property information string
    let details = "Property ID: " + this.assetId.value;
    details += " | Type: " + this.propertyType.value;
    details += " | Legal ID: " + this.legalIdentifier.value;
    details += " | Jurisdiction: " + this.jurisdictionCode.value;
    details += " | Valuation: " + this.valuationAmount.value;
    details += " | Fractionalized: " + (this.fractionalizedStatus.value ? "Yes" : "No");
    
    if (this.fractionalizedStatus.value) {
      details += " | Fraction Asset ID: " + this.fractionalAssetId.value;
    }
    
    return details;
  }
  
  /**
   * Transfer ownership of the property
   */
  transferProperty(
    propertyAssetId: AssetID,
    from: Address,
    to: Address
  ): void {
    // Ensure the property exists and matches our records
    assert(this.assetId.value == propertyAssetId, "Property ID mismatch");
    
    // Check compliance status - only allow transfers for compliant properties
    assert(this.complianceStatus.value !== "suspended", "Property transfers suspended");
    
    // Check that property isn't fractionalized (fractionalized properties are transferred via fractional tokens)
    assert(!this.fractionalizedStatus.value, "Property is fractionalized, transfer fractional tokens instead");
    
    // Check authorization - caller must be the property owner
    assert(this.txn.sender == from, "Sender must be the property owner");
    
    // Execute the transfer (NFT - amount is always 1)
    sendAssetTransfer({
      xferAsset: propertyAssetId,
      assetAmount: 1,
      assetReceiver: to
    });
    
    // Update ownership records
    this.lastUpdated.value = globals.latestTimestamp;
  }
}