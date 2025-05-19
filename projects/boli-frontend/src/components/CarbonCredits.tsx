// src/components/CarbonCredits.tsx

import React from 'react';
import styles from '../styles/CarbonCredits.module.css';

const CarbonCredits: React.FC = () => {
  return (
    <div className={styles.carbonCredits}>
      <section className={styles.carbonCreditsHeader}>
        <h1 className={styles.pageTitle}>Carbon Credits</h1>
        <p className={styles.pageDescription}>
          Verified carbon units for climate initiatives tokenized on the Algorand blockchain.
        </p>
      </section>
      
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>🌿</div>
        <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
        <p className={styles.comingSoonText}>
          We're currently developing this section of the platform. Check back soon to explore our Carbon Credit assets.
        </p>
        
        <div className={styles.assetPreview}>
          <h3 className={styles.previewTitle}>Asset Categories</h3>
          <div className={styles.previewGrid}>
            <div className={styles.previewItem}>
              <h4>Reforestation Credits</h4>
              <p>Credits generated through native species reforestation projects</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Mangrove Carbon</h4>
              <p>Blue carbon credits from mangrove conservation and restoration</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Renewable Energy Offsets</h4>
              <p>Carbon offsets from solar, wind, and other renewable energy projects</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Avoided Deforestation</h4>
              <p>REDD+ credits from projects that prevent forest destruction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCredits;