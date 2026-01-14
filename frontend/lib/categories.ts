// lib/categories.ts

export const SPENDING_CATEGORIES: string[] = [
  // Auto/Car
  "Auto",
  // Housing
  "Housing",
  "Rent / Mortgage",
  "Home Maintenance",
  "Property Taxes",

  // Food
  "Groceries",
  "Dining Out",
  "Coffee / Snacks",

  // Shopping
  "Shopping",
  "Clothing",
  "Electronics",
  "Home Goods",

  // Transportation
  "Transportation",
  "Fuel",
  "Public Transit",
  "Car Maintenance",
  "Parking",

  // Lifestyle
  "Entertainment",
  "Subscriptions",
  "Hobbies",
  "Travel",
  "Vacations",

  // Health
  "Healthcare",
  "Fitness",
  "Pharmacy",

  // Personal
  "Personal Care",
  "Education",
  "Childcare",
  "Gifts / Donations",

  // Financial
  "Insurance",
  "Taxes",
  "Fees",
  "Interest",
  "Credit Card Payment",

  // Cash
  "Cash Withdrawal",

  // Other
  "Miscellaneous",
  "Utilities",
  "Phone & Internet"
];

export const INCOME_CATEGORIES: string[] = [
  // Primary income
  "Salary",
  "Wages",
  "Bonus",
  "Commission",

  // Self-employed / business
  "Freelance",
  "Contract Work",
  "Business Income",
  "Side Hustle",

  // Passive / investment
  "Interest Income",
  "Dividends",
  "Capital Gains",
  "Rental Income",

  // Transfers
  "Refunds",
  "Reimbursements",
  "Cashback",
  "Gifts Received",
  "Internal Transfer",

  // Government / support
  "Tax Refund",
  "Benefits",
  "Pension",
  "Social Security",

  // Other
  "Other Income"
];

// lib/suggestCategory.ts
// Rule-based category suggestion (no AI). Returns a category string from your lists (or "" if unknown).
// You can expand the RULES over time as you see more bank descriptions.

type Rule = {
  // match against normalized description (uppercase)
  re: RegExp;
  // return a specific category from your lists
  category: string;
};

const ALL_CATEGORIES = new Set([...SPENDING_CATEGORIES, ...INCOME_CATEGORIES]);

function pick(category: string): string {
  return ALL_CATEGORIES.has(category) ? category : "";
}

const RULES: Rule[] = [
  // ===== INCOME =====
  { re: /\bPAYROLL\b|\bGUSTO\b|\bADP\b|\bPAYCHEX\b/, category: "Salary" },
  {
    re: /\bUI BENEFIT\b|\bUNEMPLOY\b|\bEMPLOY SEC\b|\bBENEFIT\b/,
    category: "Benefits"
  },
  { re: /\bINTEREST PAYMENT\b|\bINTEREST\b/, category: "Interest Income" },
  {
    re: /\bREMOTE ONLINE DEPOSIT\b|\bMOBILE DEPOSIT\b|\bDEPOSIT\b/,
    category: "Other Income"
  },
  { re: /\bZELLE PAYMENT FROM\b|\bZELLE FROM\b/, category: "Other Income" },

  // ===== TRANSFERS / INTERNAL MOVES =====

  {
    re: /\bONLINE TRANSFER\b|\bONLINE REALTIME TRANSFER\b|\bBOOK TRANSFER\b|\bTRANSFER\b/,
    category: "Internal Transfer"
  },
  { re: /\bZELLE PAYMENT TO\b|\bZELLE TO\b/, category: "Miscellaneous" },
  { re: /\bVENMO\b/, category: "Miscellaneous" },

  // ===== HOUSING =====
  { re: /\bROCKET MORTGAGE\b|\bMORTGAGE\b/, category: "Rent / Mortgage" },

  // ===== TAXES =====
  { re: /\bIRS\b|\bTAX\b|\bUSATAXPYMT\b/, category: "Taxes" },
  { re: /\bWA STATE DOL\b|\bDMV\b|\bDEPT OF LICEN(S|C)E\b/, category: "Fees" },

  // ===== AUTO =====
  {
    re: /\bTESLA\b|\bAUTO\b|\bCAR\b|\bSANTANDER\b|\bJEEP\b|\bStellantis\b/,
    category: "Auto"
  },

  // ===== UTILITIES / SUBSCRIPTIONS =====
  { re: /\bT-?MOBILE\b/, category: "Phone & Internet" },

  // ===== BANKING / CARDS / FEES =====
  {
    re: /\bCHASE CREDIT CRD\b|\bPAYMENT TO CHASE\b|\bAPPLECARD GSBANK PAYMENT\b|\bCITI AUTOPAY\b|\bCITI CARD ONLINE PAYMENT\b|\bAMERICAN EXPRESS ACH PMT\b/,
    category: "Credit Card Payment"
  },
  // ===== CASH / ATM =====
  { re: /\bATM WITHDRAWAL\b|\bWITHDRAWAL\b/, category: "Cash Withdrawal" }
];

function normalizeDescription(desc: string): string {
  return (desc || "").replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * Suggest a category for a bank statement description.
 * @param description raw bank description
 * @returns a category from your lists, or "" if no confident match
 */
export function suggestCategoryFromRules(description: string): string  |undefined{
  const d = normalizeDescription(description);
  console.log(d)
  if (!d) return "";

  for (const rule of RULES) {
    if (rule.re.test(d)) return pick(rule.category);
  }

  return undefined;
}

