import type { User } from '@/types';
import { SeededRandom, generateId, generateName, generateEmail, generatePhone, generateAddress, daysAgo } from './utils';

export function generateUser(index: number, random: SeededRandom): User {
  const { firstName, lastName } = generateName(random);
  const email = generateEmail(firstName, lastName, index);
  
  // Generate date of birth (21-70 years old)
  const age = random.nextInt(21, 70);
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = random.nextInt(1, 12);
  const birthDay = random.nextInt(1, 28);
  const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

  // Most users have consented (90%)
  const hasConsent = random.boolean(0.9);
  
  return {
    id: generateId('user', index),
    email,
    firstName,
    lastName,
    dateOfBirth,
    phone: generatePhone(random),
    address: generateAddress(random),
    createdAt: daysAgo(random.nextInt(30, 365)),
    consentStatus: {
      active: hasConsent,
      grantedAt: hasConsent ? daysAgo(random.nextInt(1, 30)) : undefined,
    },
  };
}

