// boli/boli-contracts/smart_contracts/heritage_assets/contract.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Heritage Asset Contract for Boli platform
 * Manages tokenization, restoration funding, and cultural stewardship of heritage sites and artifacts
 */
export class HeritageAssetContract extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  // Heritage specific state variables
  heritageType = GlobalStateKey<string>();  // "archaeological", "architectural", "cultural", "indigenous"
  culturalSignificance = GlobalStateKey<string>();
  legalStatus = GlobalStateKey<string>();  // "protected", "endangered", "unesco", etc.
  communityIdentifier = GlobalStateKey<Address>(); // Community/indigenous group with stewardship
  stewardshipModel = GlobalStateKey<string>(); // "community", "split", "custodial", etc.
  restorationRequired = GlobalStateKey<boolean>();
  conservationStatus = GlobalStateKey<string>();
  
  // Project funding variables
  fundingPool = GlobalStateKey<uint64>();
  fundingTarget = GlobalStateKey<uint64>();
  projectDeadline = GlobalStateKey<uint64>();
  projectPhases = GlobalStateKey<uint64>(); // Number of project phases
  currentPhase = GlobalStateKey<uint64>();
  projectVerifier = GlobalStateKey<Address>(); // Expert who verifies completion
  
  // Project phases and milestones tracking
  phases = BoxMap<uint64, string>({ prefix: "phases" });  // Detailed phase descriptions
  milestones = BoxMap<uint64, string>({ prefix: "milestones" }); // Milestone completion criteria
  phasesFunding = BoxMap<uint64, uint64>({ prefix: "funding" }); // Funding allocation per phase
  phasesStatus = BoxMap<uint64, string>({ prefix: "status" }); // Status of each phase
  
  // Contributor tracking
  contributors = BoxMap<Address, uint64>({ prefix: "contributors" }); // Map of contributors and amounts
  
  // Fractional ownership tracking
  ownershipTokenId = GlobalStateKey<AssetID>(); // ID of token representing fractional ownership
  hasOwnershipTokens = GlobalStateKey<boolean>(); // Whether the asset has ownership tokens
  
  // Revenue distribution variables
  communityShare = GlobalStateKey<uint64>(); // Percentage (in basis points) for community
  investorShare = GlobalStateKey<uint64>(); // Percentage (in basis points) for investors
  conservationShare = GlobalStateKey<uint64>(); // Percentage (in basis points) for ongoing conservation
  
  // Helper method to assert that sender is the app creator
  protected assertSenderIsCreator(): void {
    assert(this.txn.sender === this.app.creator, "Only the creator can perform this action");
  }
  
  // Helper method to assert that sender is the project verifier
  protected assertSenderIsVerifier(): void {
    assert(this.txn.sender === this.projectVerifier.value, "Only the project verifier can perform this action");
  }
  
  // Helper to assert sender has community rights
  protected assertSenderIsCommunity(): void {
    assert(this.txn.sender === this.communityIdentifier.value, "Only the community steward can perform this action");
  }
  
  /**
   * Creates a new heritage asset
   */
  createHeritageAsset(
    name: string,
    unitName: string,
    heritageType: string,
    culturalSignificance: string,
    legalStatus: string,
    jurisdictionCode: string,
    geolocation: string,
    communityIdentifier: Address,
    stewardshipModel: string,
    documentationHash: string
  ): AssetID {
    // Only allow the creator to create heritage assets
    this.assertSenderIsCreator();
    
    // Prepare extended note with heritage details
    const note = "Boli Heritage Asset: " + heritageType + " | Significance: " + culturalSignificance + " | Status: " + legalStatus;
    
    // Create the heritage asset as a non-fungible token (single unit)
    const assetId = sendAssetCreation({
      configAssetTotal: 1,                          // NFT representing the heritage asset
      configAssetDecimals: 0,
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.txn.sender,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: unitName,
      configAssetName: name,
      configAssetURL: "ipfs://" + documentationHash,
      note: note
    });
    
    // Store base asset information
    this.assetId.value = assetId;
    this.assetCreator.value = this.txn.sender;
    this.assetType.value = "heritage-asset";
    this.geolocation.value = geolocation;
    this.metadata.value = documentationHash;
    this.jurisdictionCode.value = jurisdictionCode;
    this.complianceStatus.value = "registered";
    this.lastUpdated.value = globals.latestTimestamp;
    
    // Store heritage-specific information
    this.heritageType.value = heritageType;
    this.culturalSignificance.value = culturalSignificance;
    this.legalStatus.value = legalStatus;
    this.communityIdentifier.value = communityIdentifier;
    this.stewardshipModel.value = stewardshipModel;
    this.restorationRequired.value = false;
    this.conservationStatus.value = "documented";
    
    // Initialize funding variables
    this.fundingPool.value = 0;
    this.fundingTarget.value = 0;
    this.projectPhases.value = 0;
    this.currentPhase.value = 0;
    
    // Initialize revenue sharing model
    // Default: 60% community, 30% investors, 10% conservation
    this.communityShare.value = 6000; // 60.00% (stored as basis points)
    this.investorShare.value = 3000;  // 30.00%
    this.conservationShare.value = 1000; // 10.00%
    
    // Initialize ownership token status
    this.hasOwnershipTokens.value = false;
    
    return assetId;
  }
  
  /**
   * Update heritage asset documentation and status
   */
  updateHeritageDocumentation(
    assetId: AssetID,
    newDocumentationHash: string,
    documentType: string,
    newConservationStatus: string
  ): void {
    // Ensure the heritage asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Check authorization - only creator or community can update
    assert(
      this.txn.sender === this.app.creator || this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can update documentation"
    );
    
    // Update document reference
    const updatedMetadata = this.metadata.value + "|" + documentType + ":" + newDocumentationHash;
    this.metadata.value = updatedMetadata;
    
    // Update conservation status if provided
    if (newConservationStatus.length > 0) {
      this.conservationStatus.value = newConservationStatus;
    }
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Create a restoration/conservation project for the heritage asset
   */
  createRestorationProject(
    assetId: AssetID,
    fundingTarget: uint64,
    projectDeadline: uint64,
    projectPhasesCount: uint64,
    projectVerifier: Address,
    projectDetailsHash: string
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only allow the creator or community to create projects
    assert(
      this.txn.sender === this.app.creator || this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can create restoration projects"
    );
    
    // Verify parameters
    assert(projectPhasesCount > 0, "Project must have at least one phase");
    assert(projectDeadline > globals.latestTimestamp, "Project deadline must be in the future");
    assert(fundingTarget > 0, "Funding target must be positive");
    
    // Set project parameters
    this.fundingTarget.value = fundingTarget;
    this.projectDeadline.value = projectDeadline;
    this.projectPhases.value = projectPhasesCount;
    this.currentPhase.value = 1; // Start at phase 1
    this.projectVerifier.value = projectVerifier;
    this.restorationRequired.value = true;
    
    // Update metadata with project details
    const updatedMetadata = this.metadata.value + "|project:" + projectDetailsHash;
    this.metadata.value = updatedMetadata;
    
    // Initialize phase status
    for (let i = 1; i <= projectPhasesCount; i++) {
      this.phasesStatus(i).value = i === 1 ? "active" : "pending";
    }
    
    // Set conservation status to "restoration-planned"
    this.conservationStatus.value = "restoration-planned";
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Define a specific phase for a restoration project
   */
  defineProjectPhase(
    assetId: AssetID,
    phaseNumber: uint64,
    phaseDescription: string,
    milestoneCriteria: string,
    phaseFunding: uint64
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only creator, community steward or project verifier can define phases
    assert(
      this.txn.sender === this.app.creator || 
      this.txn.sender === this.communityIdentifier.value ||
      this.txn.sender === this.projectVerifier.value,
      "Only the creator, community steward, or project verifier can define phases"
    );
    
    // Check phase number is valid
    assert(phaseNumber > 0 && phaseNumber <= this.projectPhases.value, "Invalid phase number");
    
    // Check funding allocation is reasonable
    assert(phaseFunding > 0, "Phase funding must be positive");
    
    // Validate total funding doesn't exceed target
    let totalAllocated = phaseFunding;
    for (let i = 1; i <= this.projectPhases.value; i++) {
      if (i !== phaseNumber && this.phasesFunding(i).exists) {
        totalAllocated += this.phasesFunding(i).value;
      }
    }
    assert(totalAllocated <= this.fundingTarget.value, "Total funding allocation exceeds target");
    
    // Store phase information
    this.phases(phaseNumber).value = phaseDescription;
    this.milestones(phaseNumber).value = milestoneCriteria;
    this.phasesFunding(phaseNumber).value = phaseFunding;
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Contribute funds to a heritage restoration project
   */
  contributeToProject(
    assetId: AssetID,
    contributionAmount: uint64
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Verify the project is active
    assert(this.restorationRequired.value, "No active restoration project");
    assert(globals.latestTimestamp < this.projectDeadline.value, "Project deadline has passed");
    
    // Check contribution amount
    assert(contributionAmount > 0, "Contribution must be positive");
    
    // Track contribution from sender
    const currentContribution = this.contributors(this.txn.sender).exists ? 
      this.contributors(this.txn.sender).value : 0;
    
    this.contributors(this.txn.sender).value = currentContribution + contributionAmount;
    
    // Update funding pool
    this.fundingPool.value = this.fundingPool.value + contributionAmount;
    
    // If this is the first contribution from this address, we could mint a contributor token
    // But that would be implemented in a separate method for clarity
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Issue ownership tokens to contributors based on their contribution percentage
   */
  issueOwnershipTokens(
    assetId: AssetID,
    tokenName: string,
    tokenUnitName: string
  ): AssetID {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only creator or community steward can issue tokens
    assert(
      this.txn.sender === this.app.creator || this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can issue ownership tokens"
    );
    
    // Check that tokens haven't already been issued
    assert(!this.hasOwnershipTokens.value, "Ownership tokens already issued");
    
    // Check that funding reached the target
    assert(this.fundingPool.value >= this.fundingTarget.value, "Funding target not reached");
    
    // Create 1 million tokens for fine-grained ownership distribution
    const totalTokens = 1000000;
    
    // Create the ownership tokens
    const ownershipTokenId = sendAssetCreation({
      configAssetTotal: totalTokens,
      configAssetDecimals: 0,
      configAssetDefaultFrozen: 0,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address, // Contract holds the tokens initially
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetUnitName: tokenUnitName,
      configAssetName: tokenName,
      configAssetURL: "ipfs://" + this.metadata.value,
      note: "Boli Heritage Ownership Token for asset: " + assetId
    });
    
    // Store token ID
    this.ownershipTokenId.value = ownershipTokenId;
    this.hasOwnershipTokens.value = true;
    
    return ownershipTokenId;
  }
  
  /**
   * Distribute ownership tokens to contributors
   */
  distributeOwnershipTokens(
    assetId: AssetID
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only creator or community steward can distribute tokens
    assert(
      this.txn.sender === this.app.creator || this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can distribute tokens"
    );
    
    // Check that tokens have been issued
    assert(this.hasOwnershipTokens.value, "Ownership tokens not yet issued");
    
    // Calculate community's reserved portion (stored in basis points)
    const communityPortion = (this.communityShare.value * 1000000) / 10000;
    
    // First, allocate community portion
    sendAssetTransfer({
      xferAsset: this.ownershipTokenId.value,
      assetAmount: communityPortion,
      assetReceiver: this.communityIdentifier.value,
      assetSender: this.app.address
    });
    
    // Calculate investor portion (remaining tokens after community share)
    const investorTokens = 1000000 - communityPortion;
    
    // For each contributor, calculate their share of investor tokens
    // Note: In a real implementation, we would need pagination or a separate method
    // to iterate through all contributors due to transaction size limits
    
    // This is a simplified implementation that would need refinement for production
    
    // Update status
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Verify completion of a project phase
   */
  verifyPhaseCompletion(
    assetId: AssetID,
    phaseNumber: uint64,
    verificationDocumentation: string
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only the designated verifier can verify phase completion
    this.assertSenderIsVerifier();
    
    // Verify phase is valid and active
    assert(phaseNumber > 0 && phaseNumber <= this.projectPhases.value, "Invalid phase number");
    assert(this.phasesStatus(phaseNumber).value === "active", "Phase is not active");
    
    // Mark phase as completed
    this.phasesStatus(phaseNumber).value = "completed";
    
    // Update metadata with verification documentation
    const updatedMetadata = this.metadata.value + "|phase" + phaseNumber + ":" + verificationDocumentation;
    this.metadata.value = updatedMetadata;
    
    // If there are more phases, activate the next one
    if (phaseNumber < this.projectPhases.value) {
      const nextPhase = phaseNumber + 1;
      this.phasesStatus(nextPhase).value = "active";
      this.currentPhase.value = nextPhase;
    } else {
      // This was the final phase, mark project as completed
      this.restorationRequired.value = false;
      this.conservationStatus.value = "restored";
    }
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Release funding for a completed phase
   */
  releasePhaseFunding(
    assetId: AssetID,
    phaseNumber: uint64,
    recipient: Address
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only creator, community steward or verifier can release funding
    assert(
      this.txn.sender === this.app.creator || 
      this.txn.sender === this.communityIdentifier.value ||
      this.txn.sender === this.projectVerifier.value,
      "Only the creator, community steward, or project verifier can release funding"
    );
    
    // Verify phase is valid and completed
    assert(phaseNumber > 0 && phaseNumber <= this.projectPhases.value, "Invalid phase number");
    assert(this.phasesStatus(phaseNumber).value === "completed", "Phase is not completed");
    assert(this.phasesFunding(phaseNumber).exists, "Phase funding not defined");
    
    // Get the funding amount for this phase
    const fundingAmount = this.phasesFunding(phaseNumber).value;
    
    // Send payment to the recipient
    sendPayment({
      amount: fundingAmount,
      receiver: recipient,
      sender: this.app.address
    });
    
    // Mark phase as paid
    this.phasesStatus(phaseNumber).value = "paid";
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Register revenue generated by the heritage asset
   */
  registerAssetRevenue(
    assetId: AssetID,
    revenueAmount: uint64,
    revenueSource: string
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Verify the sender is authorized
    assert(
      this.txn.sender === this.app.creator || 
      this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can register revenue"
    );
    
    // Update metadata with revenue information
    const updatedMetadata = this.metadata.value + "|revenue:" + revenueAmount + ":" + revenueSource + ":" + globals.latestTimestamp;
    this.metadata.value = updatedMetadata;
    
    this.lastUpdated.value = globals.latestTimestamp;
    
    // Note: Actual revenue distribution would be implemented in a separate method
  }
  
  /**
   * Distribute revenue from the heritage asset according to shares
   */
  distributeRevenue(
    assetId: AssetID,
    totalRevenue: uint64
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only creator or community steward can distribute revenue
    assert(
      this.txn.sender === this.app.creator || this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can distribute revenue"
    );
    
    // Calculate shares (in basis points - 10000 = 100%)
    const communityAmount = (totalRevenue * this.communityShare.value) / 10000;
    const conservationAmount = (totalRevenue * this.conservationShare.value) / 10000;
    // Investor amount is the remainder
    const investorAmount = totalRevenue - communityAmount - conservationAmount;
    
    // Send community share
    if (communityAmount > 0) {
      sendPayment({
        amount: communityAmount,
        receiver: this.communityIdentifier.value,
        sender: this.app.address
      });
    }
    
    // Set aside conservation share (kept in contract)
    
    // Investor shares would need to be distributed based on token ownership
    // This would be complex to implement in a single transaction due to gas limits
    // In practice, this would be a separate method or batch process
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Update revenue distribution shares
   */
  updateRevenueShares(
    assetId: AssetID,
    newCommunityShare: uint64,
    newInvestorShare: uint64,
    newConservationShare: uint64
  ): void {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Only creator or community steward can update shares
    assert(
      this.txn.sender === this.app.creator || this.txn.sender === this.communityIdentifier.value,
      "Only the creator or community steward can update shares"
    );
    
    // Verify total is 100% (10000 basis points)
    assert(
      newCommunityShare + newInvestorShare + newConservationShare == 10000,
      "Shares must total 100% (10000 basis points)"
    );
    
    // Update shares
    this.communityShare.value = newCommunityShare;
    this.investorShare.value = newInvestorShare;
    this.conservationShare.value = newConservationShare;
    
    this.lastUpdated.value = globals.latestTimestamp;
  }
  
  /**
   * Get detailed heritage asset information
   */
  getHeritageAssetDetails(
    assetId: AssetID
  ): string {
    // Ensure the asset exists and matches our records
    assert(this.assetId.value == assetId, "Asset ID mismatch");
    
    // Build the heritage asset information string
    let details = "Heritage Asset ID: " + this.assetId.value;
    details += " | Type: " + this.heritageType.value;
    details += " | Significance: " + this.culturalSignificance.value;
    details += " | Legal Status: " + this.legalStatus.value;
    details += " | Conservation: " + this.conservationStatus.value;
    details += " | Jurisdiction: " + this.jurisdictionCode.value;
    details += " | Stewardship: " + this.stewardshipModel.value;
    
    if (this.restorationRequired.value) {
      details += " | Restoration: Active (Phase " + this.currentPhase.value + " of " + this.projectPhases.value + ")";
      details += " | Funding: " + this.fundingPool.value + " / " + this.fundingTarget.value;
    }
    
    if (this.hasOwnershipTokens.value) {
      details += " | Ownership Token: " + this.ownershipTokenId.value;
    }
    
    return details;
  }
}