// boli/boli-contracts/smart_contracts/shared/contract_base.algo.ts

import { Contract } from '@algorandfoundation/tealscript';

/**
 * Base Contract for all Boli Real World Asset tokenization contracts
 * Implements common functionality for all asset types
 */
export abstract class ContractBase extends Contract {
  // Base asset state
  assetId = GlobalStateKey<AssetID>();
  assetCreator = GlobalStateKey<Address>();
  assetType = GlobalStateKey<string>();
  geolocation = GlobalStateKey<string>();
  metadata = GlobalStateKey<string>();
  jurisdictionCode = GlobalStateKey<string>();
  complianceStatus = GlobalStateKey<string>();
  lastUpdated = GlobalStateKey<uint64>();
  
  /**
   * Helper method to assert that sender is the app creator
   */
  protected assertSenderIsCreator(): void {
    assert(this.txn.sender === this.app.creator, "Only the creator can perform this action");
  }
}