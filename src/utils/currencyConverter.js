/**
 * Currency Converter Utility
 * Provides functions to convert between USD and INR using real-time exchange rates
 */

// Cache the exchange rate to avoid excessive API calls
let cachedRate = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetches the current USD to INR exchange rate from a public API
 * @returns {Promise<number>} The current exchange rate
 */
async function fetchExchangeRate() {
  try {
    // Using a free, public API for exchange rates
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    if (data && data.rates && data.rates.INR) {
      // Update cache
      cachedRate = data.rates.INR;
      cacheTimestamp = Date.now();
      return cachedRate;
    } else {
      console.error('Invalid response format from exchange rate API');
      return getFallbackRate();
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return getFallbackRate();
  }
}

/**
 * Returns a fallback exchange rate when API fails
 * @returns {number} Fallback exchange rate
 */
function getFallbackRate() {
  // Current approximate rate as fallback (as of May 2024)
  return 83.5;
}

/**
 * Gets the current exchange rate, using cache if available and not expired
 * @returns {Promise<number>} The current exchange rate
 */
async function getExchangeRate() {
  // Use cached rate if available and not expired
  if (cachedRate && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return cachedRate;
  }
  
  // Otherwise fetch a new rate
  return await fetchExchangeRate();
}

/**
 * Converts USD to INR
 * @param {number} usdAmount - Amount in USD
 * @returns {Promise<number>} Amount in INR
 */
async function usdToInr(usdAmount) {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount)) {
    return 0;
  }
  
  const rate = await getExchangeRate();
  return usdAmount * rate;
}

/**
 * Formats a number as INR currency string
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to include the ₹ symbol
 * @returns {string} Formatted INR amount
 */
function formatInr(amount, showSymbol = true) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }
  
  // Format with Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Converts USD amount to INR and formats it as a string
 * @param {number} usdAmount - Amount in USD
 * @param {boolean} showSymbol - Whether to include the ₹ symbol
 * @returns {Promise<string>} Formatted INR amount
 */
async function convertAndFormat(usdAmount, showSymbol = true) {
  const inrAmount = await usdToInr(usdAmount);
  return formatInr(inrAmount, showSymbol);
}

/**
 * Formats a USD amount as a string (for display before conversion)
 * @param {number} amount - Amount in USD
 * @returns {string} Formatted USD amount
 */
function formatUsd(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export { usdToInr, formatInr, convertAndFormat, formatUsd, getExchangeRate };