/**
 * Core type definitions for the SMP Civic platform
 */

import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
  phoneNumber?: string;
  organization?: string;
  subscriptionActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: ContentStatus;
  publishedAt?: string;
  author: User;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum UserRole {
  JOURNALIST = 'journalist',
  EDITOR = 'editor',
  LEGAL = 'legal',
  ADMIN = 'admin',
  SUBSCRIBER = 'subscriber',
}

export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  LEGAL_REVIEW = 'legal_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  bio?: string;
  acceptTerms: boolean;
}

// UI types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  title: string;
  content: ReactNode;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Store types
export interface RootState {
  auth: AuthState;
  articles: ArticlesState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface UIState {
  toasts: Toast[];
  modals: Modal[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}