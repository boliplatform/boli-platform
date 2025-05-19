// src/components/DisasterRecovery.tsx

import React from 'react';
import styles from '../styles/DisasterRecovery.module.css';

const DisasterRecovery: React.FC = () => {
  return (
    <div className={styles.disasterRecovery}>
      <section className={styles.disasterRecoveryHeader}>
        <h1 className={styles.pageTitle}>Disaster Recovery Bonds</h1>
        <p className={styles.pageDescription}>
          Climate event-triggered financing instruments for vulnerable regions tokenized on the Algorand blockchain.
        </p>
      </section>
      
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>🛡️</div>
        <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
        <p className={styles.comingSoonText}>
          We're currently developing this section of the platform. Check back soon to explore our Disaster Recovery bonds.
        </p>
        
        <div className={styles.assetPreview}>
          <h3 className={styles.previewTitle}>Asset Categories</h3>
          <div className={styles.previewGrid}>
            <div className={styles.previewItem}>
              <h4>Cyclone Protection Bonds</h4>
              <p>Parametric insurance bonds triggered by cyclone wind speed thresholds</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Flood Risk Bonds</h4>
              <p>Financial instruments that release funds based on extreme rainfall or sea level rise</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Drought Response Bonds</h4>
              <p>Financing tied to precipitation deficits and agricultural impacts</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Multi-Hazard Resilience Bonds</h4>
              <p>Comprehensive coverage for multiple climate and natural hazards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterRecovery;