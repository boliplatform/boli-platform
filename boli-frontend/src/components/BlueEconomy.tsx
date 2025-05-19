// src/components/BlueEconomy.tsx

import React from 'react';
import styles from '../styles/BlueEconomy.module.css';

const BlueEconomy: React.FC = () => {
  return (
    <div className={styles.blueEconomy}>
      <section className={styles.blueEconomyHeader}>
        <h1 className={styles.pageTitle}>Blue Economy Assets</h1>
        <p className={styles.pageDescription}>
          Sustainable marine resources and coastal ecosystem conservation projects tokenized on the Algorand blockchain.
        </p>
      </section>
      
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>🌊</div>
        <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
        <p className={styles.comingSoonText}>
          We're currently developing this section of the platform. Check back soon to explore our Blue Economy assets.
        </p>
        
        <div className={styles.assetPreview}>
          <h3 className={styles.previewTitle}>Asset Categories</h3>
          <div className={styles.previewGrid}>
            <div className={styles.previewItem}>
              <h4>Coral Reef Conservation</h4>
              <p>Tokenized conservation efforts for threatened coral reef ecosystems</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Sustainable Fisheries</h4>
              <p>Community-managed fisheries with science-based harvesting quotas</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Marine Protected Areas</h4>
              <p>Conservation zones that generate economic benefits through eco-tourism</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Mangrove Restoration</h4>
              <p>Projects that restore coastal mangroves for carbon sequestration and storm protection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueEconomy;