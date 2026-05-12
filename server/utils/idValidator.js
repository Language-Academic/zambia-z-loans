/**
 * Professional Identity Validation Utility
 * Standardizes ID checks for Zambia Z Digital/Jamii Loan
 */

/**
 * Validates the format of a Kenyan National ID
 * @param {string|number} id - The National ID to validate
 * @returns {boolean} - True if format is valid (7-8 digits)
 */
const validateKenyanIDFormat = (id) => {
  if (!id) return false;
  
  // Convert to string and remove any whitespace
  const idStr = id.toString().trim();

  // Professional Check: Kenyan IDs are currently 7 or 8 digits
  // We use a regex to ensure it's only numbers and the correct length
  const idRegex = /^\d{7,8}$/;
  
  return idRegex.test(idStr);
};

/**
 * Verifies ID against Official Records (Mock for IPRS API)
 * In production, use a service like Metamap, SmileID, or a direct IPRS bridge
 */
const verifyIdentityWithIPRS = async (id, fullName) => {
  try {
    if (!validateKenyanIDFormat(id)) {
      throw new Error('Invalid ID format');
    }

    // Pro Level: Real fintechs verify the name matches the ID
    console.log(`[KYC] Verifying ID ${id} for ${fullName}...`);
    
    // This is where you would call your KYC provider's API
    // const response = await kycProvider.verify(id, fullName);
    
    return {
      verified: true,
      provider: 'IPRS_MOCK',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[KYC ERROR]:', error.message);
    return { verified: false, error: error.message };
  }
};

module.exports = {
  validateKenyanIDFormat,
  verifyIdentityWithIPRS
};
