// src/contexts/WalletContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useWallet, WalletManager } from '@txnlab/use-wallet-react';

// Custom interface for wallet account
export interface WalletAccount {
  address: string;
  amount?: number;
  assets?: any[];
  network?: string;
  // Add other properties as needed
}

interface WalletContextType {
  isWalletModalOpen: boolean;
  toggleWalletModal: () => void;
  closeWalletModal: () => void;
  activeAddress: string | null; // Changed from string | undefined
  activeAccount: WalletAccount | null; // More specific type
  isConnected: boolean;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
  walletManager: WalletManager;
}

export const WalletContextProvider: React.FC<WalletProviderProps> = ({ children, walletManager }) => {
  const { activeAddress, activeAccount, wallets } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Update connection status whenever activeAddress changes
    setIsConnected(!!activeAddress);
  }, [activeAddress]);
  
  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };
  
  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };
  
  const disconnect = async () => {
    if (wallets) {
      const activeWallet = wallets.find((w) => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
      } else {
        localStorage.removeItem('@txnlab/use-wallet:v3');
        window.location.reload();
      }
    }
    setIsWalletModalOpen(false);
  };
  
  return (
    <WalletContext.Provider value={{ 
      isWalletModalOpen, 
      toggleWalletModal,
      closeWalletModal,
      activeAddress,
      activeAccount: activeAccount as unknown as WalletAccount | null,
      isConnected,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === null) {
    throw new Error('useWalletContext must be used within a WalletContextProvider');
  }
  return context;
};