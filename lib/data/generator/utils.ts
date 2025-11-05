// Seeded random number generator for reproducibility
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  sample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, count);
  }
}

// Generate ID
export function generateId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(6, '0')}`;
}

// Date utilities
export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Realistic names
const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Samuel', 'Avery',
  'Jackson', 'Ella', 'Sebastian', 'Scarlett', 'David', 'Grace', 'Joseph',
  'Chloe', 'Carter', 'Victoria', 'Owen', 'Riley', 'Wyatt', 'Aria', 'John',
  'Lily', 'Jack', 'Aubrey', 'Luke', 'Zoey', 'Jayden', 'Hannah', 'Dylan',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
];

export function generateName(random: SeededRandom): { firstName: string; lastName: string } {
  return {
    firstName: random.choice(FIRST_NAMES),
    lastName: random.choice(LAST_NAMES),
  };
}

// Email generation
export function generateEmail(firstName: string, lastName: string, index: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = domains[index % domains.length];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
}

// Phone generation
export function generatePhone(random: SeededRandom): string {
  const area = random.nextInt(200, 999);
  const prefix = random.nextInt(200, 999);
  const line = random.nextInt(1000, 9999);
  return `+1${area}${prefix}${line}`;
}

// Address generation
const STREETS = ['Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln', 'Elm St', 'Park Ave', 'Washington Blvd'];
const CITIES = ['Springfield', 'Franklin', 'Clinton', 'Madison', 'Georgetown', 'Salem', 'Fairview', 'Bristol'];
const STATES = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];

export function generateAddress(random: SeededRandom) {
  return {
    street: `${random.nextInt(100, 9999)} ${random.choice(STREETS)}`,
    city: random.choice(CITIES),
    state: random.choice(STATES),
    zipCode: String(random.nextInt(10000, 99999)),
    country: 'US',
  };
}

