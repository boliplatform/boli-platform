// src/components/ConnectWallet.tsx
import React from 'react';
import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react';
import Account from './Account';
import styles from '../styles/ConnectWallet.module.css';
import { useWalletContext } from '../contexts/WalletContext';
import { useSnackbar } from 'notistack';

const ConnectWallet: React.FC = () => {
  const { wallets, activeAddress } = useWallet();
  const { isWalletModalOpen, closeWalletModal, disconnect } = useWalletContext();
  const { enqueueSnackbar } = useSnackbar();

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD;

  // Handle copy address to clipboard
  const handleCopyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress)
        .then(() => {
          enqueueSnackbar('Address copied to clipboard', { variant: 'success' });
        })
        .catch(err => {
          console.error('Failed to copy address:', err);
          enqueueSnackbar('Failed to copy address', { variant: 'error' });
        });
    }
  };

  // Handle view assets
  const handleViewAssets = () => {
    if (activeAddress) {
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
      
      enqueueSnackbar('View Assets functionality coming soon', { 
        variant: 'info'
      });
    }
  };

  // Handle view transactions
  const handleViewTransactions = () => {
    if (activeAddress) {
      enqueueSnackbar('View Transactions functionality coming soon', { 
        variant: 'info'
      });
    }
  };

  return (
    <div 
      className={`${styles.modal} ${isWalletModalOpen ? styles.modalOpen : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWalletModal();
      }}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {activeAddress ? 'Your Wallet' : 'Connect Wallet'}
          </h3>
          <button 
            className={styles.closeButton}
            onClick={closeWalletModal}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {activeAddress && (
          <div className={styles.accountInfo}>
            <Account />
          </div>
        )}

        <div className={styles.modalBody}>
          {!activeAddress ? (
            <>
              <p className={styles.walletDescription}>
                Connect your Algorand wallet to interact with tokenized assets and smart contracts.
              </p>
              
              {wallets?.length > 0 && (
                <div className={styles.walletList}>
                  {wallets.map((wallet) => (
                    <button
                      className={styles.walletButton}
                      key={`wallet-${wallet.id}`}
                      onClick={() => wallet.connect()}
                    >
                      <div className={styles.walletButtonLeft}>
                        {!isKmd(wallet) && (
                          <img
                            src={wallet.metadata.icon}
                            alt={`${wallet.metadata.name} icon`}
                            className={styles.walletIcon}
                          />
                        )}
                        {isKmd(wallet) ? (
                          <div className={styles.kmdIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="24" height="24" rx="12" fill="#4D6A92" />
                              <path d="M7 8.5C7 7.67157 7.67157 7 8.5 7H15.5C16.3284 7 17 7.67157 17 8.5V15.5C17 16.3284 16.3284 17 15.5 17H8.5C7.67157 17 7 16.3284 7 15.5V8.5Z" stroke="white" strokeWidth="2" />
                              <path d="M10 12C10 10.8954 10.8954 10 12 10V10C13.1046 10 14 10.8954 14 12V12C14 13.1046 13.1046 14 12 14V14C10.8954 14 10 13.1046 10 12V12Z" stroke="white" strokeWidth="2" />
                            </svg>
                          </div>
                        ) : null}
                        <span className={styles.walletName}>
                          {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                        </span>
                      </div>
                      <span className={styles.walletConnectText}>Connect</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className={styles.walletHelp}>
                <p>Don't have a wallet?</p>
                <a 
                  href="https://www.algorand.foundation/wallets" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.walletHelpLink}
                >
                  Get an Algorand wallet
                </a>
              </div>
              
              <div className={styles.walletInfo}>
                <h4 className={styles.walletInfoTitle}>What is an Algorand wallet?</h4>
                <p className={styles.walletInfoText}>
                  An Algorand wallet is a secure digital tool that allows you to store, send, and receive 
                  Algos and other Algorand Standard Assets. It's your gateway to interacting with the 
                  Algorand blockchain and tokenized assets.
                </p>
              </div>
            </>
          ) : (
            <div className={styles.connectedContainer}>
              <div className={styles.connectedStatus}>
                <svg className={styles.connectedIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.75 12.75L10 15.25L16.25 8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <p>Successfully connected</p>
              </div>
              
              <div className={styles.walletActions}>
                <button 
                  className={styles.viewAssetsButton}
                  onClick={handleViewAssets}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  View Assets
                </button>
                
                <button 
                  className={styles.viewTransactionsButton}
                  onClick={handleViewTransactions}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  View Transactions
                </button>
              </div>
              
              <div className={styles.accountSecurity}>
                <h4 className={styles.accountSecurityTitle}>Account Security</h4>
                <p className={styles.accountSecurityText}>
                  Remember to keep your recovery phrase secure and never share it with anyone. 
                  Boli will never ask for your private keys or recovery phrase.
                </p>
              </div>
              
              <button
                className={styles.disconnectButton}
                onClick={disconnect}
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;