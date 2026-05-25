// ─── BimaKavach RM Copilot — Coverage Matrix & Gap Analysis ──────────────────

/**
 * Coverage matrix mapping each industry to essential, recommended, and optional
 * insurance product types for Indian commercial clients.
 */
export const coverageMatrix = {
  manufacturing: {
    essential: [
      'Fire & Perils',
      'Marine Cargo',
      'Workmen Compensation',
      'Group Health',
    ],
    recommended: [
      'Product Liability',
      'Commercial Vehicle',
      'Engineering (CAR/EAR)',
      'Burglary',
    ],
    optional: [
      'Cyber Insurance',
      'Key Man Insurance',
      'Directors & Officers (D&O)',
      'Public Liability',
      'Money Insurance',
    ],
  },

  retail: {
    essential: [
      'Fire & Perils',
      'Burglary',
      'Group Health',
      'Public Liability',
    ],
    recommended: [
      'Marine Cargo',
      'Money Insurance',
      'Commercial Vehicle',
      'Workmen Compensation',
    ],
    optional: [
      'Cyber Insurance',
      'Fidelity Guarantee',
      'Key Man Insurance',
      'Directors & Officers (D&O)',
    ],
  },

  logistics: {
    essential: [
      'Marine Cargo',
      'Commercial Vehicle',
      'Group Health',
      'Workmen Compensation',
    ],
    recommended: [
      'Fire & Perils',
      'Marine Hull',
      'Public Liability',
      'Money Insurance',
    ],
    optional: [
      'Cyber Insurance',
      'Key Man Insurance',
      'Directors & Officers (D&O)',
      'Fidelity Guarantee',
    ],
  },

  IT: {
    essential: [
      'Group Health',
      'Cyber Insurance',
      'Professional Indemnity (E&O)',
      'Directors & Officers (D&O)',
    ],
    recommended: [
      'Fire & Perils',
      'Group Personal Accident',
      'Key Man Insurance',
      'Fidelity Guarantee',
    ],
    optional: [
      'Commercial Vehicle',
      'Burglary',
      'Public Liability',
      'Money Insurance',
    ],
  },

  pharma: {
    essential: [
      'Fire & Perils',
      'Product Liability',
      'Group Health',
      'Workmen Compensation',
    ],
    recommended: [
      'Clinical Trial Liability',
      'Marine Cargo',
      'Professional Indemnity (E&O)',
      'Directors & Officers (D&O)',
    ],
    optional: [
      'Cyber Insurance',
      'Key Man Insurance',
      'Commercial Vehicle',
      'Burglary',
      'Public Liability',
    ],
  },

  construction: {
    essential: [
      'Engineering (CAR/EAR)',
      'Workmen Compensation',
      'Group Health',
      'Fire & Perils',
    ],
    recommended: [
      'Commercial Vehicle',
      'Public Liability',
      'Marine Cargo',
      'Group Personal Accident',
    ],
    optional: [
      'Directors & Officers (D&O)',
      'Professional Indemnity (E&O)',
      'Key Man Insurance',
      'Cyber Insurance',
      'Money Insurance',
    ],
  },

  hospitality: {
    essential: [
      'Fire & Perils',
      'Public Liability',
      'Group Health',
      'Workmen Compensation',
    ],
    recommended: [
      'Burglary',
      'Money Insurance',
      'Group Personal Accident',
      'Fidelity Guarantee',
    ],
    optional: [
      'Cyber Insurance',
      'Commercial Vehicle',
      'Directors & Officers (D&O)',
      'Key Man Insurance',
      'Marine Cargo',
    ],
  },
};

/**
 * Weights used to calculate the coverage score.
 */
const TIER_WEIGHTS = {
  essential: 3,
  recommended: 2,
  optional: 1,
};

/**
 * Normalise a product-type string for comparison (lowercase, trimmed, collapsed whitespace).
 */
function normaliseProduct(name) {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Determine which insurance products a client is missing based on their industry.
 *
 * @param {string} clientIndustry — one of the keys in coverageMatrix
 * @param {Array<{ productType: string }>} existingPolicies — the client's current policies
 * @returns {{ essential: string[], recommended: string[], optional: string[] }}
 */
export function getPortfolioGaps(clientIndustry, existingPolicies) {
  const industry = (clientIndustry || '').toLowerCase();
  const matrix = coverageMatrix[industry];

  if (!matrix) {
    return { essential: [], recommended: [], optional: [] };
  }

  const ownedSet = new Set(
    (existingPolicies || []).map((p) => normaliseProduct(p.productType))
  );

  const gaps = {
    essential: matrix.essential.filter((p) => !ownedSet.has(normaliseProduct(p))),
    recommended: matrix.recommended.filter((p) => !ownedSet.has(normaliseProduct(p))),
    optional: matrix.optional.filter((p) => !ownedSet.has(normaliseProduct(p))),
  };

  return gaps;
}

/**
 * Compute a 0 – 100 coverage score reflecting how well a client is covered
 * relative to their industry's ideal portfolio.
 *
 * Essential products contribute more than recommended, which contribute more
 * than optional. A score of 100 means every product in the matrix is covered.
 *
 * @param {string} clientIndustry
 * @param {Array<{ productType: string }>} existingPolicies
 * @returns {number} score 0 – 100
 */
export function getCoverageScore(clientIndustry, existingPolicies) {
  const industry = (clientIndustry || '').toLowerCase();
  const matrix = coverageMatrix[industry];

  if (!matrix) return 0;

  const ownedSet = new Set(
    (existingPolicies || []).map((p) => normaliseProduct(p.productType))
  );

  let totalWeight = 0;
  let coveredWeight = 0;

  for (const tier of ['essential', 'recommended', 'optional']) {
    const products = matrix[tier];
    const weight = TIER_WEIGHTS[tier];
    for (const product of products) {
      totalWeight += weight;
      if (ownedSet.has(normaliseProduct(product))) {
        coveredWeight += weight;
      }
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((coveredWeight / totalWeight) * 100);
}
