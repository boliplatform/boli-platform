// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletManager, WalletProvider, SupportedWallet, WalletId } from '@txnlab/use-wallet-react';
import { SnackbarProvider } from 'notistack';
import Dashboard from './components/Dashboard';
import ConnectWallet from './components/ConnectWallet';
import ErrorBoundary from './components/ErrorBoundary';
import LandProperty from './components/LandProperty';
import BlueEconomy from './components/BlueEconomy';
import CarbonCredits from './components/CarbonCredits';
import RenewableEnergy from './components/RenewableEnergy';
import DisasterRecovery from './components/DisasterRecovery';
import HeritageAssets from './components/HeritageAssets';
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs';
import { useWalletContext, WalletContextProvider } from './contexts/WalletContext';

// Import global CSS
import './styles/globals.css';
import styles from './styles/App.module.css';

// Setup supported wallets based on environment
let supportedWallets: SupportedWallet[];
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment();
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ];
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
  ];
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const [scrolled, setScrolled] = useState(false);
  
  // Create a wallet manager instance with configuration
  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  });
  
  // Add scroll event listener to apply header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ErrorBoundary>
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: 'right'
        }}
      >
        <WalletProvider manager={walletManager}>
          <WalletContextProvider walletManager={walletManager}>
            <Router>
              <div className={styles.app}>
                <Header scrolled={scrolled} />
                
                <main className={styles.main}>
                  <div className="container">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/land-property" element={<LandProperty />} />
                      <Route path="/blue-economy" element={<BlueEconomy />} />
                      <Route path="/carbon-credits" element={<CarbonCredits />} />
                      <Route path="/renewable-energy" element={<RenewableEnergy />} />
                      <Route path="/disaster-recovery" element={<DisasterRecovery />} />
                      <Route path="/heritage-assets" element={<HeritageAssets />} />
                    </Routes>
                  </div>
                </main>
                
                <Footer />
              </div>
              
              <ConnectWallet />
            </Router>
          </WalletContextProvider>
        </WalletProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

// Header component extracted for clarity
const Header = ({ scrolled }: { scrolled: boolean }) => {
  const { isConnected, toggleWalletModal } = useWalletContext();
  
  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={`container ${styles.headerContent}`}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoText}>boli</span>
        </a>
        
        <nav className={styles.mainNav}>
          <a href="/" className={styles.navLink}>Dashboard</a>
          <a href="/land-property" className={styles.navLink}>Land & Property</a>
          <a href="/blue-economy" className={styles.navLink}>Blue Economy</a>
          <a href="/carbon-credits" className={styles.navLink}>Carbon Credits</a>
          <a href="/renewable-energy" className={styles.navLink}>Renewable Energy</a>
          <a href="/disaster-recovery" className={styles.navLink}>Disaster Recovery</a>
          <a href="/heritage-assets" className={styles.navLink}>Heritage Assets</a>
        </nav>
        
        <button
          onClick={toggleWalletModal}
          className={styles.connectButton}
        >
          {isConnected ? 'Account' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

// Footer component extracted for clarity
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerLeft}>
          <a href="/" className={styles.footerLogo}>
            <span className={styles.footerLogoText}>boli</span>
          </a>
          <p className={styles.footerTagline}>
            Empowering unique locations through blockchain tokenization
          </p>
        </div>
        
        <div className={styles.footerLinks}>
          <div className={styles.footerLinkGroup}>
            <h3 className={styles.footerLinkGroupTitle}>Platform</h3>
            <a href="/" className={styles.footerLink}>Dashboard</a>
            <a href="/land-property" className={styles.footerLink}>Land & Property</a>
            <a href="/blue-economy" className={styles.footerLink}>Blue Economy</a>
          </div>
          
          <div className={styles.footerLinkGroup}>
            <h3 className={styles.footerLinkGroupTitle}>Resources</h3>
            <a href="#" className={styles.footerLink}>Documentation</a>
            <a href="#" className={styles.footerLink}>API</a>
            <a href="#" className={styles.footerLink}>Legal</a>
          </div>
          
          <div className={styles.footerLinkGroup}>
            <h3 className={styles.footerLinkGroupTitle}>Company</h3>
            <a href="#" className={styles.footerLink}>About</a>
            <a href="#" className={styles.footerLink}>Contact</a>
            <a href="#" className={styles.footerLink}>Careers</a>
          </div>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.footerBottomContent}>
            <p className={styles.copyright}>
              © 2025 Boli. All rights reserved.
            </p>
            <div className={styles.legalLinks}>
              <a href="#" className={styles.legalLink}>Terms</a>
              <a href="#" className={styles.legalLink}>Privacy</a>
              <a href="#" className={styles.legalLink}>Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};