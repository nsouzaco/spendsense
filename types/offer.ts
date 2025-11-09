/**
 * Offer Type Definition
 * 
 * Represents financial product offers sent by operators to users
 */

export interface Offer {
  id: string;
  userId: string;
  offerId: string; // Unique identifier for the offer template
  title: string;
  description: string;
  category: string; // e.g., 'credit', 'savings', 'loan', 'subscription'
  sentBy: string; // operator ID
  sentAt: string; // ISO timestamp
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  viewedAt?: string;
  respondedAt?: string;
}

export type OfferCategory = 'credit' | 'savings' | 'loan' | 'subscription' | 'assistance' | 'tool';

export interface OfferTemplate {
  id: string;
  title: string;
  description: string;
  category: OfferCategory;
  persona: string; // Which persona this offer is for
  icon: string;
  colorClass: string; // Tailwind color class
}

