// Financial transaction categories based on Plaid's categorization
export const TRANSACTION_CATEGORIES = {
  // Income
  INCOME: {
    primary: 'Income',
    detailed: [
      'Payroll',
      'Gig Economy',
      'Interest Earned',
      'Refund',
      'Bonus',
      'Cashback',
    ],
  },
  // Food & Dining
  FOOD_AND_DRINK: {
    primary: 'Food and Drink',
    detailed: [
      'Restaurants',
      'Fast Food',
      'Coffee Shop',
      'Bar',
      'Groceries',
    ],
  },
  // Shops
  SHOPS: {
    primary: 'Shops',
    detailed: [
      'Clothing',
      'Electronics',
      'Sporting Goods',
      'Bookstores',
      'General Merchandise',
      'Online Marketplaces',
    ],
  },
  // Recreation
  RECREATION: {
    primary: 'Recreation',
    detailed: [
      'Arts and Entertainment',
      'Gyms and Fitness Centers',
      'Movie Theaters',
      'Music and Video',
      'Sporting Events',
    ],
  },
  // Service (Subscriptions often here)
  SERVICE: {
    primary: 'Service',
    detailed: [
      'Advertising and Marketing',
      'Cable',
      'Internet',
      'Phone',
      'Streaming Services',
      'Subscription',
      'Software',
      'Cloud Storage',
    ],
  },
  // Travel
  TRAVEL: {
    primary: 'Travel',
    detailed: [
      'Airlines and Aviation Services',
      'Lodging',
      'Car and Truck Rental',
      'Taxi',
      'Ride Share',
      'Public Transportation',
      'Gas Stations',
    ],
  },
  // Transfer
  TRANSFER: {
    primary: 'Transfer',
    detailed: [
      'Credit Card Payment',
      'Deposit',
      'Withdrawal',
      'Save',
      'Third Party',
    ],
  },
  // Healthcare
  HEALTHCARE: {
    primary: 'Healthcare',
    detailed: [
      'Dentists',
      'Doctors',
      'Pharmacies',
      'Hospitals',
      'Health Insurance',
    ],
  },
} as const;

// Common subscription merchants for detection
export const COMMON_SUBSCRIPTION_MERCHANTS = [
  'Netflix',
  'Spotify',
  'Apple',
  'Amazon Prime',
  'Hulu',
  'Disney+',
  'HBO Max',
  'YouTube Premium',
  'Adobe',
  'Microsoft 365',
  'Dropbox',
  'iCloud',
  'Google One',
  'Gym',
  'Planet Fitness',
  'LA Fitness',
  'Peloton',
  'Blue Apron',
  'HelloFresh',
  'Audible',
  'Kindle Unlimited',
] as const;

