// src/components/RenewableEnergy.tsx

import React from 'react';
import styles from '../styles/RenewableEnergy.module.css';

const RenewableEnergy: React.FC = () => {
  return (
    <div className={styles.renewableEnergy}>
      <section className={styles.renewableEnergyHeader}>
        <h1 className={styles.pageTitle}>Renewable Energy Assets</h1>
        <p className={styles.pageDescription}>
          Clean energy infrastructure projects tokenized on the Algorand blockchain.
        </p>
      </section>
      
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>☀️</div>
        <h2 className={styles.comingSoonTitle}>Coming Soon</h2>
        <p className={styles.comingSoonText}>
          We're currently developing this section of the platform. Check back soon to explore our Renewable Energy assets.
        </p>
        
        <div className={styles.assetPreview}>
          <h3 className={styles.previewTitle}>Asset Categories</h3>
          <div className={styles.previewGrid}>
            <div className={styles.previewItem}>
              <h4>Solar Microgrids</h4>
              <p>Community-owned solar generation and distribution networks</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Wind Farms</h4>
              <p>Utility-scale wind energy projects with fractional ownership</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Tidal Energy</h4>
              <p>Ocean energy capturing systems designed for island environments</p>
            </div>
            <div className={styles.previewItem}>
              <h4>Geothermal Projects</h4>
              <p>Thermal energy extraction from volcanic island regions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewableEnergy;