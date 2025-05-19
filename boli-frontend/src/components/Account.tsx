// src/components/Account.tsx
import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { ellipseAddress } from '../utils/ellipseAddress';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';
import styles from '../styles/Account.module.css';
import { useSnackbar } from 'notistack';
import { WalletAccount } from '../contexts/WalletContext';

const Account: React.FC = () => {
  const { activeAddress, activeAccount } = useWallet();
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const [copied, setCopied] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const networkName = algodConfig.network === '' ? 'localnet' : algodConfig.network.toLowerCase();
  
  if (!activeAddress) {
    return null;
  }

  // Generate explorer URL based on network
  const generateExplorerUrl = (address: string, network: string) => {
    // For local development or testing, use a fallback
    const isLocalDev = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const isLocalNet = network === 'localnet';
    
    if (isLocalNet || isLocalDev) {
      // For testing, we'll use bitquery as a fallback explorer
      return `https://explorer.bitquery.io/algorand_testnet/address/${address}`;
    }
    
    switch(network.toLowerCase()) {
      case 'mainnet':
        return `https://explorer.perawallet.app/address/${address}`;
      case 'testnet':
        return `https://testnet.explorer.perawallet.app/address/${address}`;
      default:
        return `https://explorer.bitquery.io/algorand_testnet/address/${address}`;
    }
  };
  
  const accountExplorerUrl = generateExplorerUrl(activeAddress, networkName);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeAddress).then(() => {
      setCopied(true);
      enqueueSnackbar('Address copied to clipboard', { variant: 'success' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Placeholder functions that would be implemented in a real app
  const handleReceive = () => {
    enqueueSnackbar('Receive functionality coming soon', { variant: 'info' });
  };

  const handleSend = () => {
    enqueueSnackbar('Send functionality coming soon', { variant: 'info' });
  };

  const handleStake = () => {
    enqueueSnackbar('Stake functionality coming soon', { variant: 'info' });
  };

  // Handle explorer
  const handleExplorer = () => {
    window.open(accountExplorerUrl, '_blank');
  };

  // Cast activeAccount to our custom type
  const typedAccount = activeAccount as unknown as WalletAccount;

  return (
    <div className={styles.account}>
      <div className={styles.accountMain}>
        <div className={styles.accountIcon}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.accountIconSvg}>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.accountInfo}>
          <div className={styles.accountAddress}>
            <span className={styles.accountAddressDisplay}>
              {ellipseAddress(activeAddress, 8)}
            </span>
            
            <button 
              className={styles.copyButton} 
              onClick={copyToClipboard}
              aria-label="Copy address to clipboard"
            >
              {copied ? (
                <svg className={styles.copyIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className={styles.copyIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8V5C8 4.44772 8.44772 4 9 4H19C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H16M15 20H5C4.44772 20 4 19.5523 4 19V9C4 8.44772 4.44772 8 5 8H15C15.5523 8 16 8.44772 16 9V19C16 19.5523 15.5523 20 15 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleExplorer();
              }}
              className={styles.accountExplorer}
              aria-label="View account on Explorer"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.externalLinkIcon}>
                <path d="M10 5H5V19H19V14M14 5H19M19 5V10M19 5L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className={styles.accountMeta}>
            <div className={styles.networkBadge}>
              <span className={styles.networkDot}></span>
              <span className={styles.networkName}>{networkName}</span>
            </div>
            
            {typedAccount?.assets && (
              <div className={styles.assetCount}>
                {typedAccount.assets.length} asset{typedAccount.assets.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.accountBalance}>
        <div className={styles.balanceLabel}>Balance</div>
        <div className={styles.balanceValue}>
          {typedAccount?.amount !== undefined 
            ? (typedAccount.amount / 1000000).toFixed(4)
            : '0.0000'} ALGO
        </div>
      </div>
      
      <div className={styles.accountActions}>
        <button className={styles.accountAction} onClick={handleReceive}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 12L12 17L17 12M12 17V3M3 17V21H21V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Receive</span>
        </button>
        
        <button className={styles.accountAction} onClick={handleSend}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 12L12 7L7 12M12 7V21M21 7V3H3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Send</span>
        </button>
        
        <button className={styles.accountAction} onClick={handleStake}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 14L13 14M13 14L16.5 17.5M13 14L16.5 10.5M3 16.8V9.2C3 8.88174 3 8.72262 3.05465 8.58517C3.10243 8.46497 3.17384 8.35788 3.26463 8.26944C3.36679 8.17003 3.50814 8.10831 3.79086 7.98487L11.1909 4.16795C11.4247 4.05643 11.5416 4.00067 11.6635 3.98062C11.7716 3.96279 11.8824 3.96279 11.9904 3.98062C12.1124 4.00067 12.2293 4.05643 12.4631 4.16795L19.8631 7.98487C20.1458 8.10831 20.2872 8.17003 20.3893 8.26944C20.4801 8.35788 20.5515 8.46497 20.5993 8.58517C20.654 8.72262 20.654 8.88174 20.654 9.2V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Stake</span>
        </button>
      </div>
    </div>
  );
};

export default Account;