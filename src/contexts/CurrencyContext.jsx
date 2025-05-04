import React, { createContext, useState, useContext, useEffect } from 'react';
import { usdToInr, formatInr, convertAndFormat, formatUsd, getExchangeRate } from '../utils/currencyConverter';

// Create the Currency context
const CurrencyContext = createContext();

/**
 * Currency Provider Component
 * Provides currency conversion functionality throughout the application
 */
export function CurrencyProvider({ children }) {
  // State for current exchange rate
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the exchange rate when the component mounts
  useEffect(() => {
    async function loadExchangeRate() {
      try {
        const rate = await getExchangeRate();
        setExchangeRate(rate);
      } catch (error) {
        console.error('Failed to load exchange rate:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExchangeRate();
    
    // Refresh the rate every hour
    const intervalId = setInterval(loadExchangeRate, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  /**
   * Format a USD price as INR
   * @param {number} usdPrice - Price in USD
   * @returns {string} Formatted price in INR
   */
  const formatPrice = async (usdPrice) => {
    if (typeof usdPrice !== 'number') {
      // Try to parse it as a number if it's a string
      if (typeof usdPrice === 'string') {
        usdPrice = parseFloat(usdPrice.replace(/[^0-9.-]+/g, ''));
      } else {
        return '₹0.00';
      }
    }
    
    return await convertAndFormat(usdPrice);
  };
  
  /**
   * Synchronously format a USD price as INR using the cached exchange rate
   * This is useful for rendering lists where async operations are difficult
   * @param {number} usdPrice - Price in USD
   * @returns {string} Formatted price in INR
   */
  const formatPriceSync = (usdPrice) => {
    if (typeof usdPrice !== 'number') {
      // Try to parse it as a number if it's a string
      if (typeof usdPrice === 'string') {
        usdPrice = parseFloat(usdPrice.replace(/[^0-9.-]+/g, ''));
      } else {
        return '₹0.00';
      }
    }
    
    if (!exchangeRate) return '₹0.00';
    
    const inrPrice = usdPrice * exchangeRate;
    return formatInr(inrPrice);
  };
  
  /**
   * Convert a USD price to INR without formatting
   * @param {number} usdPrice - Price in USD
   * @returns {number} Price in INR
   */
  const convertPrice = async (usdPrice) => {
    if (typeof usdPrice !== 'number') {
      if (typeof usdPrice === 'string') {
        usdPrice = parseFloat(usdPrice.replace(/[^0-9.-]+/g, ''));
      } else {
        return 0;
      }
    }
    
    return await usdToInr(usdPrice);
  };
  
  // Context value
  const value = {
    exchangeRate,
    isLoading,
    formatPrice,
    formatPriceSync,
    convertPrice,
    formatUsd
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Custom hook to use the currency context
 * @returns {Object} Currency context value
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;