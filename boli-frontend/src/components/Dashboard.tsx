// src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlgorand } from '../hooks/useAlgorand';
import { useWallet } from '@txnlab/use-wallet-react';
import { ellipseAddress } from '../utils/ellipseAddress';
import { useWalletContext } from '../contexts/WalletContext';
import styles from '../styles/Dashboard.module.css';

// Asset category interface
interface AssetCategory {
  name: string;
  description: string;
  count: number;
  value: number;
  route: string;
  icon: React.ReactNode;
  bgImage: string;
  tag: string;
}

// Featured project interface
interface FeaturedProject {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  value: number;
  investors: number;
  progress: number;
  imageUrl: string;
}

const Dashboard: React.FC = () => {
  const { algodClient, indexerClient } = useAlgorand();
  const { activeAddress } = useWallet();
  const { toggleWalletModal } = useWalletContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalAssets: 0,
    activeInvestors: 0,
    locations: 0,
  });
  
  useEffect(() => {
    // In a real implementation, we would fetch data from the blockchain
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Mock data for development
        setTimeout(() => {
          // Asset categories based on our smart contract structure
          const categories: AssetCategory[] = [
            {
              name: 'Land & Property',
              description: 'Tokenized real estate with legal document integration',
              count: 28,
              value: 12500000,
              route: '/land-property',
              icon: '🏠',
              bgImage: '/land_property.jpg',
              tag: 'LAND'
            },
            {
              name: 'Blue Economy',
              description: 'Sustainable marine resources and coastal ecosystems',
              count: 42,
              value: 8750000,
              route: '/blue-economy',
              icon: '🌊',
              bgImage: '/blue_economy.jpg',
              tag: 'OCEAN'
            },
            {
              name: 'Carbon Credits',
              description: 'Verified carbon units for climate initiatives',
              count: 15,
              value: 3200000,
              route: '/carbon-credits',
              icon: '🌿',
              bgImage: '/carbon_credits.jpg',
              tag: 'CLIMATE'
            },
            {
              name: 'Renewable Energy',
              description: 'Clean energy infrastructure projects',
              count: 7, 
              value: 6800000,
              route: '/renewable-energy',
              icon: '☀️',
              bgImage: '/renewable_energy.jpg',
              tag: 'ENERGY'
            },
            {
              name: 'Disaster Recovery',
              description: 'Climate event-triggered financing instruments',
              count: 4,
              value: 5000000,
              route: '/disaster-recovery',
              icon: '🛡️',
              bgImage: '/disaster_recovery.jpg',
              tag: 'RECOVERY'
            },
            {
              name: 'Heritage Assets',
              description: 'Cultural and historical preservation projects',
              count: 6,
              value: 2800000,
              route: '/heritage-assets',
              icon: '🏛️',
              bgImage: '/heritage_assets.jpg',
              tag: 'HERITAGE'
            }
          ];
          
          // Calculate total value and count
          const totalAssets = categories.reduce((sum, cat) => sum + cat.count, 0);
          const totalValue = categories.reduce((sum, cat) => sum + cat.value, 0);
          
          // Featured projects
          const projects: FeaturedProject[] = [
            {
              id: '12345',
              name: 'Coral Reef Conservation',
              category: 'Blue Economy',
              description: 'Tokenizing conservation efforts for the Blue Bay coral reef ecosystem, enabling sustainable tourism revenue while ensuring protection of marine biodiversity.',
              location: 'Caribbean',
              value: 1250000,
              investors: 128,
              progress: 68,
              imageUrl: '/reef_conservation.jpg'
            },
            {
              id: '23456',
              name: 'Solar Microgrid',
              category: 'Renewable Energy',
              description: 'Community-owned solar power generation and distribution network providing clean energy independence for coastal communities.',
              location: 'Pacific Islands',
              value: 750000,
              investors: 93,
              progress: 42,
              imageUrl: '/solar_microgrid.jpg'
            },
            {
              id: '34567',
              name: 'Cyclone Protection Bond',
              category: 'Disaster Recovery',
              description: 'Parametric insurance bond that automatically releases funds when wind speeds exceed predefined thresholds during cyclone events.',
              location: 'Fiji',
              value: 2500000,
              investors: 214,
              progress: 85,
              imageUrl: '/cyclone_protection_bond.jpg'
            }
          ];
          
          setAssetCategories(categories);
          setFeaturedProjects(projects);
          setStats({
            totalValue,
            totalAssets,
            activeInvestors: 1458,
            locations: 32
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [algodClient, activeAddress]);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboard}>
      {/* Hero section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroTag}>OPPORTUNITIES</div>
          <h1 className={styles.heroTitle}>Unlock Value in Unique Locations</h1>
          <p className={styles.heroSubtitle}>
            Tokenize real-world assets on the Algorand blockchain to enable sustainable 
            investment in unique and vulnerable destinations worldwide.
          </p>
          
          <div className={styles.heroMeta}>
            <span className={styles.heroDate}>May 19, 2025</span>
            <span className={styles.heroDivider}>•</span>
            <span className={styles.heroReadTime}>Blockchain Assets</span>
          </div>
          
          {!activeAddress ? (
            <button 
              className={styles.heroCta}
              onClick={toggleWalletModal}
            >
              Connect Wallet to Start
            </button>
          ) : (
            <div className={styles.connectedInfo}>
              <p>Connected: {ellipseAddress(activeAddress)}</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Stats overview */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatCurrency(stats.totalValue)}</div>
            <div className={styles.statLabel}>Total Value Tokenized</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalAssets}</div>
            <div className={styles.statLabel}>Total Assets</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.activeInvestors}</div>
            <div className={styles.statLabel}>Active Investors</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.locations}</div>
            <div className={styles.statLabel}>Unique Locations</div>
          </div>
        </div>
      </section>
      
      {/* Asset Categories */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Asset Categories</h2>
        <div className={styles.categoriesMenu}>
          {assetCategories.map((category, index) => (
            <Link to={category.route} key={index} className={styles.categoryCard}>
              <div 
                className={styles.categoryBackground}
                style={{ backgroundImage: `url(${category.bgImage})` }}
              ></div>
              <div className={styles.categoryOverlay}>
                <div className={styles.categoryTag}>{category.tag}</div>
                <h3 className={styles.categoryTitle}>{category.name}</h3>
                <div className={styles.categoryMeta}>
                  <div className={styles.categoryValue}>{formatCurrency(category.value)}</div>
                  <div className={styles.categoryCount}>{category.count} assets</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Featured Projects */}
      <section className={styles.projectsSection}>
        <h2 className={styles.sectionTitle}>Featured Projects</h2>
        <div className={styles.projectsGrid}>
          {featuredProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectImageContainer}>
                <img 
                  src={project.imageUrl} 
                  alt={project.name} 
                  className={styles.projectImage}
                />
                <div className={styles.projectCategory}>{project.category}</div>
              </div>
              
              <div className={styles.projectContent}>
                <h3 className={styles.projectTitle}>{project.name}</h3>
                <p className={styles.projectLocation}>{project.location}</p>
                <p className={styles.projectDescription}>{project.description}</p>
                
                <div className={styles.projectProgress}>
                  <div className={styles.progressLabel}>
                    <span>Funding progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={styles.projectMeta}>
                  <div className={styles.projectMetaItem}>
                    <span className={styles.metaLabel}>Value</span>
                    <span className={styles.metaValue}>{formatCurrency(project.value)}</span>
                  </div>
                  <div className={styles.projectMetaItem}>
                    <span className={styles.metaLabel}>Investors</span>
                    <span className={styles.metaValue}>{project.investors}</span>
                  </div>
                </div>
                
                <div className={styles.projectActions}>
                  <button className={styles.primaryButton}>View Details</button>
                  <button className={styles.secondaryButton}>Invest</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* How it Works */}
      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Asset Identification</h3>
            <p className={styles.stepDescription}>
              We identify real-world assets with potential for tokenization, 
              from land parcels to renewable energy infrastructure in unique locations worldwide.
            </p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Smart Contract Deployment</h3>
            <p className={styles.stepDescription}>
              Assets are digitized through our specialized Algorand smart contracts 
              with built-in compliance, legal frameworks, and verification.
            </p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Tokenization</h3>
            <p className={styles.stepDescription}>
              The asset is converted into fungible or non-fungible tokens that 
              represent ownership shares, with options for fractionalization.
            </p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>Investment & Trading</h3>
            <p className={styles.stepDescription}>
              Investors can purchase tokens, providing liquidity to asset owners 
              while gaining exposure to previously inaccessible opportunities.
            </p>
          </div>
        </div>
      </section>
      
      {/* Call To Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Participate?</h2>
          <p className={styles.ctaDescription}>
            Join the growing ecosystem of global investors using blockchain 
            technology to create sustainable economic opportunities in unique destinations.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimaryButton}>List an Asset</button>
            <button className={styles.ctaSecondaryButton}>Start Investing</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;