export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  amount: number;
  note?: string;
  transactionDate: string;
  createdAt: string;
}

export interface Paginated<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
