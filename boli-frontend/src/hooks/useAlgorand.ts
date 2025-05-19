// src/hooks/useAlgorand.ts

import { useState, useEffect } from 'react';
import { Algodv2, Indexer } from 'algosdk';

/**
 * Configuration for Algorand connections
 */
interface AlgorandConfig {
  algodServer: string;
  algodPort: string;
  algodToken: string;
  indexerServer: string;
  indexerPort: string;
  indexerToken: string;
  network: 'mainnet' | 'testnet' | 'localnet';
}

/**
 * Default configuration based on environment variables
 */
const getDefaultConfig = (): AlgorandConfig => {
  return {
    algodServer: import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    algodPort: import.meta.env.VITE_ALGOD_PORT || '',
    algodToken: import.meta.env.VITE_ALGOD_TOKEN || '',
    indexerServer: import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud',
    indexerPort: import.meta.env.VITE_INDEXER_PORT || '',
    indexerToken: import.meta.env.VITE_INDEXER_TOKEN || '',
    network: (import.meta.env.VITE_ALGOD_NETWORK || 'testnet') as 'mainnet' | 'testnet' | 'localnet',
  };
};

/**
 * Hook for connecting to Algorand blockchain
 */
export function useAlgorand(config?: Partial<AlgorandConfig>) {
  const [algodClient, setAlgodClient] = useState<Algodv2 | null>(null);
  const [indexerClient, setIndexerClient] = useState<Indexer | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [network, setNetwork] = useState<'mainnet' | 'testnet' | 'localnet'>('testnet');

  useEffect(() => {
    const initialize = async () => {
      try {
        // Merge default config with provided config
        const defaultConfig = getDefaultConfig();
        const finalConfig = { ...defaultConfig, ...config };
        
        // Create Algod client
        const algod = new Algodv2(
          finalConfig.algodToken,
          finalConfig.algodServer,
          finalConfig.algodPort
        );
        
        // Create Indexer client
        const indexer = new Indexer(
          finalConfig.indexerToken,
          finalConfig.indexerServer,
          finalConfig.indexerPort
        );
        
        // Test the connection
        await algod.status().do();
        
        // Set state with clients
        setAlgodClient(algod);
        setIndexerClient(indexer);
        setIsConnected(true);
        setNetwork(finalConfig.network);
        setError(null);
      } catch (err) {
        console.error('Failed to connect to Algorand network:', err);
        setError(err instanceof Error ? err : new Error('Unknown error connecting to Algorand'));
        setIsConnected(false);
      }
    };
    
    initialize();
  }, [config]);

  /**
   * Get asset information
   * @param assetId Algorand Asset ID
   */
  const getAssetInfo = async (assetId: number) => {
    if (!indexerClient) throw new Error('Indexer client not initialized');
    
    try {
      const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
      return assetInfo;
    } catch (err) {
      console.error(`Error fetching asset info for asset ID ${assetId}:`, err);
      throw err;
    }
  };
  
  /**
   * Get account information and assets
   * @param address Algorand account address
   */
  const getAccountInfo = async (address: string) => {
    if (!indexerClient) throw new Error('Indexer client not initialized');
    
    try {
      const accountInfo = await indexerClient.lookupAccountByID(address).do();
      return accountInfo;
    } catch (err) {
      console.error(`Error fetching account info for address ${address}:`, err);
      throw err;
    }
  };
  
  /**
   * Search for assets by name or unit name
   * @param searchTerm Search term
   * @param limit Maximum number of results
   */
  const searchAssets = async (searchTerm: string, limit: number = 10) => {
    if (!indexerClient) throw new Error('Indexer client not initialized');
    
    try {
      const assetResults = await indexerClient.searchForAssets()
        .name(searchTerm)
        .limit(limit)
        .do();
      
      return assetResults;
    } catch (err) {
      console.error(`Error searching assets with term ${searchTerm}:`, err);
      throw err;
    }
  };
  
  /**
   * Search for transactions by note prefix
   * @param notePrefix Prefix for transaction note
   * @param limit Maximum number of results
   */
  const searchTransactionsByNotePrefix = async (notePrefix: string, limit: number = 10) => {
    if (!indexerClient) throw new Error('Indexer client not initialized');
    
    try {
      const txnResults = await indexerClient.searchForTransactions()
        .notePrefix(Buffer.from(notePrefix).toString('base64'))
        .limit(limit)
        .do();
      
      return txnResults;
    } catch (err) {
      console.error(`Error searching transactions with note prefix ${notePrefix}:`, err);
      throw err;
    }
  };

  return {
    algodClient,
    indexerClient,
    isConnected,
    error,
    network,
    getAssetInfo,
    getAccountInfo,
    searchAssets,
    searchTransactionsByNotePrefix
  };
}