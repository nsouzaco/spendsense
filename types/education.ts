import type { PersonaType } from './persona';

export type ArticleCategory =
  | 'credit_management'
  | 'debt_payoff'
  | 'budgeting'
  | 'saving'
  | 'investing'
  | 'income'
  | 'subscriptions'
  | 'emergency_fund'
  | 'retirement'
  | 'home_buying';

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface EducationArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ArticleCategory;
  difficulty: ArticleDifficulty;
  readTime: number; // minutes
  icon: string;
  bgColor: string;
  
  // Matching criteria
  recommendedFor: PersonaType[];
  requiredSignals?: {
    minCreditUtilization?: number;
    maxCreditUtilization?: number;
    hasSubscriptions?: boolean;
    hasSavings?: boolean;
    hasVariableIncome?: boolean;
    maxIncome?: number;
  };
  
  // Content
  summary: string;
  content: ArticleContent;
  
  // Metadata
  author?: string;
  publishedDate?: string;
  tags?: string[];
}

export interface ArticleContent {
  introduction: string;
  sections: ArticleSection[];
  keyTakeaways: string[];
  nextSteps?: string[];
}

export interface ArticleSection {
  heading: string;
  content: string;
  subsections?: {
    heading: string;
    content: string;
  }[];
}

export interface UserArticleRecommendation {
  article: EducationArticle;
  relevanceScore: number;
  reason: string;
}

