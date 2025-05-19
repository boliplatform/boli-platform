// src/components/HeritageAssets.tsx

import React from 'react';
import styles from '../styles/HeritageAssets.module.css';

const HeritageAssets: React.FC = () => {
  return (
    <div className={styles.heritageAssets}>
      <section className={styles.heritageAssetsHeader}>
        <h1 className={styles.pageTitle}>Heritage Assets</h1>
        <p className={styles.pageDescription}>
          Cultural and historical preservation projects tokenized on the Algorand blockchain.
        </p>
      </section>
      
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>🏛️</div>
        <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
        <p className={styles.comingSoonText}>
          We're currently developing this section of the platform. Check back soon to explore our Heritage Asset tokens.
        </p>
        
        <div className={styles.assetPreview}>
          <h3 className={styles.previewTitle}>Asset Categories</h3>
          <div className={styles.previewGrid}>
            <div className={styles.previewItem}>
              <h4>Indigenous Heritage Sites</h4>
              <p>Traditional cultural locations with community stewardship models</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Historical Buildings</h4>
              <p>Colonial and pre-colonial architecture with restoration funding</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Cultural Practices</h4>
              <p>Living heritage traditions with community-based preservation</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Archaeological Sites</h4>
              <p>Ancient settlements and artifacts with conservation plans</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageAssets;