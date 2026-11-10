export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  accountNumber?: string;
  expiryDate?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryBgColor?: string;
  accountId: string;
  accountName?: string;
  date: string; // ISO date YYYY-MM-DD
  note?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  monthYear: string; // YYYY-MM
}

export interface Reminder {
  id: string;
  title: string;
  amount?: number;
  dueDate: string;
  isCompleted: boolean;
}
