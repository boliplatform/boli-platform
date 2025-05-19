// boli/boli-contracts/smart_contracts/renewable_energy/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Renewable Energy Infrastructure Contract for Boli platform
 * Handles tokenization of renewable energy projects and their output
 */
export class RenewableEnergyContract extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  // Energy project specific state
  energyType = GlobalStateKey<string>();
  installedCapacity = GlobalStateKey<uint64>();  // in watts
  estimatedAnnualOutput = GlobalStateKey<uint64>();  // in kilowatt-hours
  projectLifespan = GlobalStateKey<uint64>();  // in seconds
  installationDate = GlobalStateKey<uint64>();
  
  // Helper method to assert that sender is the app creator
  protected assertSenderIsCreator(): void {
    assert(this.txn.sender === this.app.creator, "Only the creator can perform this action");
  }
  
  /**
   * Creates a renewable energy infrastructure asset
   */
  createEnergyProject(
    projectName: string,
    energyType: string,
    installedCapacity: uint64,
    estimatedAnnualOutput: uint64,
    projectLifespan: uint64,
    location: string,
    fractionalize: boolean,
    fractionCount: uint64,
    technicalSpecsHash: string,
    jurisdictionCode: string
  ): AssetID {
    // Only allow the creator to create energy projects
    this.assertSenderIsCreator();
    
    // Store renewable energy project information
    this.energyType.value = energyType;
    this.installedCapacity.value = installedCapacity;
    this.estimatedAnnualOutput.value = estimatedAnnualOutput;
    this.projectLifespan.value = projectLifespan;
    this.installationDate.value = globals.latestTimestamp;
    
    // Generate asset name and unit
    const assetName = "ENERGY-" + projectName;
    const unitName = "ENRG";
    
    // Prepare note with additional metadata
    const note = "Boli Renewable Energy Project: " + energyType + " | Capacity: " + installedCapacity + "W | Est. Output: " + estimatedAnnualOutput + "kWh";
    
    // Determine token supply based on fractionalization choice
    const totalSupply = fractionalize ? fractionCount : 1;
    const decimals = fractionalize ? 6 : 0;
    
    // Create the energy infrastructure token
    const assetId = sendAssetCreation({
      configAssetTotal: totalSupply,
      configAssetDecimals: decimals,
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: assetName,
      configAssetURL: "ipfs://" + technicalSpecsHash,
      note: note
    });
    
    // Store base asset information
    this.assetId.value = assetId;
    this.assetCreator.value = this.txn.sender;
    this.assetType.value = "renewable-energy";
    this.geolocation.value = location;
    this.metadata.value = technicalSpecsHash;
    this.jurisdictionCode.value = jurisdictionCode;
    this.complianceStatus.value = "authorized";
    this.lastUpdated.value = globals.latestTimestamp;
    
    return assetId;
  }
  
  /**
   * Creates energy production certificates (similar to RECs)
   */
  createEnergyProductionCertificates(
    projectAssetID: AssetID,
    productionPeriodStart: uint64,
    productionPeriodEnd: uint64,
    energyProduced: uint64,
    meterReadingHash: string
  ): AssetID {
    // Ensure the project asset exists and matches our records
    assert(this.assetId.value == projectAssetID, "Project Asset ID mismatch");
    
    // Only allow the creator to issue certificates
    this.assertSenderIsCreator();
    
    // Validate time period
    assert(productionPeriodStart < productionPeriodEnd, "Invalid production period");
    
    // Get project details
    const energyType = this.energyType.value;
    
    // Format period end date for certificate name
    // Note: In a real implementation, you would need to convert timestamp to date string
    const endDateString = productionPeriodEnd.toString();
    
    // Generate certificate name
    const assetName = "REC-" + energyType + "-" + projectAssetID + "-" + endDateString;
    const unitName = "REC";
    
    // Prepare note with additional metadata
    const note = "Renewable Energy Certificate | Project: " + projectAssetID + " | Period: " + productionPeriodStart + "-" + productionPeriodEnd + " | Energy: " + energyProduced + "kWh";
    
    // Create one certificate per megawatt-hour of renewable energy
    const totalCertificates = energyProduced / 1000; // Convert kWh to MWh
    
    // Create the certificate tokens
    const certificateAssetID = sendAssetCreation({
      configAssetTotal: totalCertificates,
      configAssetDecimals: 0, // Non-divisible certificates
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: assetName,
      configAssetURL: "ipfs://" + meterReadingHash,
      note: note
    });
    
    return certificateAssetID;
  }
  
  /**
   * Updates project performance metrics
   */
  updateProjectPerformance(
    projectAssetID: AssetID,
    actualOutput: uint64,
    performanceRating: uint64,
    maintenanceStatus: string
  ): boolean {
    // Ensure the project asset exists and matches our records
    assert(this.assetId.value == projectAssetID, "Project Asset ID mismatch");
    
    // Only allow the creator to update project performance
    this.assertSenderIsCreator();
    
    // Validate performance rating (1-100)
    assert(performanceRating >= 1 && performanceRating <= 100, 
      "Performance rating must be between 1 and 100");
    
    // Update project metrics in additional metadata
    const updatedMetadata = this.metadata.value + "|performance:" + performanceRating + "|maintenance:" + maintenanceStatus + "|actualOutput:" + actualOutput;
    this.metadata.value = updatedMetadata;
    this.lastUpdated.value = globals.latestTimestamp;
    
    return true;
  }
  
  /**
   * Get detailed energy project information
   */
  getEnergyProjectDetails(
    projectAssetID: AssetID
  ): string {
    // Ensure the project asset exists and matches our records
    assert(this.assetId.value == projectAssetID, "Project Asset ID mismatch");
    
    // Build the project information string
    let details = "Energy Project ID: " + this.assetId.value;
    details += " | Type: " + this.energyType.value;
    details += " | Capacity: " + this.installedCapacity.value + "W";
    details += " | Est. Annual Output: " + this.estimatedAnnualOutput.value + "kWh";
    details += " | Installation Date: " + this.installationDate.value;
    details += " | Project Lifespan: " + this.projectLifespan.value + " seconds";
    details += " | Jurisdiction: " + this.jurisdictionCode.value;
    details += " | Location: " + this.geolocation.value;
    
    return details;
  }
  
  /**
   * Transfer ownership of the energy project
   */
  transferEnergyProject(
    projectAssetID: AssetID,
    from: Address,
    to: Address,
    amount: uint64
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == projectAssetID, "Project Asset ID mismatch");
    
    // Check compliance status
    assert(this.complianceStatus.value !== "suspended", "Project transfers suspended");
    
    // Check authorization - caller must be the sender
    assert(this.txn.sender == from, "Sender must be the asset owner");
    
    // Execute the transfer
    sendAssetTransfer({
      xferAsset: projectAssetID,
      assetAmount: amount,
      assetReceiver: to,
      assetSender: from
    });
    
    // Update records
    this.lastUpdated.value = globals.latestTimestamp;
  }
}