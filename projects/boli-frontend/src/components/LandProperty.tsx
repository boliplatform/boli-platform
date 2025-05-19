// src/components/LandProperty.tsx

import React, { useState, useEffect } from 'react';
import { useAlgorand } from '../hooks/useAlgorand';
import { useWallet } from '@txnlab/use-wallet-react';
import styles from '../styles/LandProperty.module.css';

// Property asset interface
interface PropertyAsset {
  id: string;
  name: string;
  type: string;
  location: string;
  legalIdentifier: string;
  value: number;
  created: string;
  fractionalized: boolean;
  fractions?: number;
  metadata: string;
  owner: string;
  imageUrl: string;
}

// Filter options
interface FilterOptions {
  type: string;
  minValue: number | null;
  maxValue: number | null;
  fractionalized: boolean | null;
}

const PropertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'development', label: 'Development Land' },
];

const LandProperty: React.FC = () => {
  const { algodClient, indexerClient } = useAlgorand();
  const { activeAddress } = useWallet();
  
  const [properties, setProperties] = useState<PropertyAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: 'all',
    minValue: null,
    maxValue: null,
    fractionalized: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, we would use the indexer to search for assets
        // of type "land-property" and parse their metadata
        
        // Mock property data for development
        setTimeout(() => {
          const mockProperties: PropertyAsset[] = [
            {
              id: '12345',
              name: 'Beachfront Villa',
              type: 'residential',
              location: 'North Shore, Fiji',
              legalIdentifier: 'DEED-12345',
              value: 1250000,
              created: '2025-02-15',
              fractionalized: true,
              fractions: 100,
              metadata: 'QmXyZ123456789abcdef',
              owner: 'ALGO12345...6789',
              imageUrl: '/api/placeholder/800/500'
            },
            {
              id: '23456',
              name: 'Downtown Commercial Space',
              type: 'commercial',
              location: 'Kingston, Jamaica',
              legalIdentifier: 'COMM-23456',
              value: 3750000,
              created: '2025-01-10',
              fractionalized: false,
              metadata: 'QmAbC123456789defghi',
              owner: 'ALGO23456...7890',
              imageUrl: '/api/placeholder/800/500'
            },
            {
              id: '34567',
              name: 'Coconut Plantation',
              type: 'agricultural',
              location: 'Eastern Province, Seychelles',
              legalIdentifier: 'AGRI-34567',
              value: 980000,
              created: '2025-03-05',
              fractionalized: true,
              fractions: 50,
              metadata: 'QmDeF123456789ghijkl',
              owner: 'ALGO34567...8901',
              imageUrl: '/api/placeholder/800/500'
            },
            {
              id: '45678',
              name: 'Marina Development Land',
              type: 'development',
              location: 'Nassau, Bahamas',
              legalIdentifier: 'DEV-45678',
              value: 5200000,
              created: '2025-02-28',
              fractionalized: false,
              metadata: 'QmGhI123456789jklmno',
              owner: 'ALGO45678...9012',
              imageUrl: '/api/placeholder/800/500'
            },
            {
              id: '56789',
              name: 'Hillside Residence',
              type: 'residential',
              location: 'Roseau, Dominica',
              legalIdentifier: 'DEED-56789',
              value: 875000,
              created: '2025-01-22',
              fractionalized: true,
              fractions: 25,
              metadata: 'QmJkL123456789mnopqr',
              owner: 'ALGO56789...0123',
              imageUrl: '/api/placeholder/800/500'
            },
            {
              id: '67890',
              name: 'Eco-Resort Development',
              type: 'development',
              location: 'Malé, Maldives',
              legalIdentifier: 'DEV-67890',
              value: 7500000,
              created: '2025-03-12',
              fractionalized: true,
              fractions: 150,
              metadata: 'QmMnO123456789pqrstu',
              owner: 'ALGO67890...1234',
              imageUrl: '/api/placeholder/800/500'
            },
          ];
          
          setProperties(mockProperties);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading properties:', error);
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, [algodClient, indexerClient]);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Filter properties based on search and filter options
  const filteredProperties = properties.filter((property) => {
    // Search term filter
    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.legalIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Property type filter
    const matchesType = 
      filterOptions.type === 'all' || 
      property.type === filterOptions.type;
    
    // Value range filter
    const matchesMinValue = 
      filterOptions.minValue === null || 
      property.value >= filterOptions.minValue;
    
    const matchesMaxValue = 
      filterOptions.maxValue === null || 
      property.value <= filterOptions.maxValue;
    
    // Fractionalized filter
    const matchesFractionalized = 
      filterOptions.fractionalized === null || 
      property.fractionalized === filterOptions.fractionalized;
    
    return matchesSearch && matchesType && matchesMinValue && matchesMaxValue && matchesFractionalized;
  });
  
  const resetFilters = () => {
    setFilterOptions({
      type: 'all',
      minValue: null,
      maxValue: null,
      fractionalized: null,
    });
  };
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading properties...</p>
      </div>
    );
  }
  
  return (
    <div className={styles.landProperty}>
      <section className={styles.landPropertyHeader}>
        <h1 className={styles.pageTitle}>Land & Property Assets</h1>
        <p className={styles.pageDescription}>
          Tokenized real estate with integrated legal documentation on the Algorand blockchain.
        </p>
      </section>
      
      <section className={styles.actionBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search properties..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <button 
          className={styles.filterButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Filters</span>
        </button>
        
        {activeAddress && (
          <button className={styles.createButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Create Property</span>
          </button>
        )}
      </section>
      
      {showFilters && (
        <section className={styles.filtersContainer}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Property Type</label>
              <select
                className={styles.filterSelect}
                value={filterOptions.type}
                onChange={(e) => setFilterOptions({...filterOptions, type: e.target.value})}
              >
                {PropertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price Range</label>
              <div className={styles.rangeInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  className={styles.rangeInput}
                  value={filterOptions.minValue || ''}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions, 
                    minValue: e.target.value ? Number(e.target.value) : null
                  })}
                />
                <span className={styles.rangeSeparator}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className={styles.rangeInput}
                  value={filterOptions.maxValue || ''}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions, 
                    maxValue: e.target.value ? Number(e.target.value) : null
                  })}
                />
              </div>
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ownership</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={filterOptions.fractionalized === true}
                    onChange={() => setFilterOptions({
                      ...filterOptions,
                      fractionalized: filterOptions.fractionalized === true ? null : true
                    })}
                  />
                  <span>Fractionalized</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={filterOptions.fractionalized === false}
                    onChange={() => setFilterOptions({
                      ...filterOptions,
                      fractionalized: filterOptions.fractionalized === false ? null : false
                    })}
                  />
                  <span>Whole Ownership</span>
                </label>
              </div>
            </div>
            
            <button 
              className={styles.resetButton}
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </section>
      )}
      
      <section className={styles.propertiesSection}>
        <div className={styles.propertiesCount}>
          {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found
        </div>
        
        {filteredProperties.length > 0 ? (
          <div className={styles.propertiesGrid}>
            {filteredProperties.map((property) => (
              <div key={property.id} className={styles.propertyCard}>
                <div className={styles.propertyImageContainer}>
                  <img 
                    src={property.imageUrl} 
                    alt={property.name} 
                    className={styles.propertyImage}
                  />
                  <div className={styles.propertyBadge}>
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </div>
                </div>
                
                <div className={styles.propertyContent}>
                  <h3 className={styles.propertyTitle}>{property.name}</h3>
                  <p className={styles.propertyLocation}>{property.location}</p>
                  
                  <div className={styles.propertyAttributes}>
                    <div className={styles.propertyAttribute}>
                      <span className={styles.attributeLabel}>Legal ID</span>
                      <span className={styles.attributeValue}>{property.legalIdentifier}</span>
                    </div>
                    
                    <div className={styles.propertyAttribute}>
                      <span className={styles.attributeLabel}>Listed</span>
                      <span className={styles.attributeValue}>{property.created}</span>
                    </div>
                  </div>
                  
                  <div className={styles.propertyValue}>
                    <span className={styles.valueLabel}>Value</span>
                    <span className={styles.valueAmount}>{formatCurrency(property.value)}</span>
                  </div>
                  
                  {property.fractionalized && (
                    <div className={styles.fractionInfo}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.fractionIcon}>
                        <path d="M8 14L12 10M12 10L16 14M12 10V20M20 4H4C4 6.4 5.6 8 8 8H16C18.4 8 20 6.4 20 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>
                        Fractionalized: {property.fractions} tokens @ {formatCurrency(property.value / (property.fractions || 1))} each
                      </span>
                    </div>
                  )}
                  
                  <div className={styles.propertyActions}>
                    <button className={styles.detailsButton}>View Details</button>
                    {property.fractionalized ? (
                      <button className={styles.investButton}>Buy Fractions</button>
                    ) : (
                      <button className={styles.investButton}>Invest</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.noResultsIcon}>
              <path d="M9.172 14.828L12.001 12M14.829 9.172L12.001 12M12.001 12L9.172 9.172M12.001 12L14.829 14.828M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className={styles.noResultsTitle}>No properties found</h3>
            <p className={styles.noResultsText}>
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button 
              className={styles.resetButton}
              onClick={() => {
                setSearchTerm('');
                resetFilters();
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
      
      <section className={styles.createPropertySection}>
        <div className={styles.createPropertyContent}>
          <h2 className={styles.createPropertyTitle}>Tokenize Your Property</h2>
          <p className={styles.createPropertyText}>
            Convert your land or property into a digital asset on the Algorand blockchain. Enable 
            fractional ownership, transparent transactions, and global accessibility.
          </p>
          
          <div className={styles.createPropertyFeatures}>
            <div className={styles.featureItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Secure ownership records</span>
            </div>
            
            <div className={styles.featureItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Optional fractional ownership</span>
            </div>
            
            <div className={styles.featureItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Integrated legal documentation</span>
            </div>
            
            <div className={styles.featureItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Regulatory compliance built-in</span>
            </div>
          </div>
          
          <button className={styles.createButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Tokenize Your Property</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandProperty;