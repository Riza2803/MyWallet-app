import { Platform } from 'react-native';
import { Account, Category, Transaction, Budget, TransactionType, Reminder } from '../types';

const isWeb = Platform.OS === 'web';

// -------------------------------------------------------------
// DEFAULT SEED DATA (Used by both Web localStorage & SQLite)
// -------------------------------------------------------------
const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_main',
    name: 'Dompet Utama',
    balance: 0,
    currency: 'IDR',
    color: '#F9D938',
    icon: 'wallet-outline',
    accountNumber: '-',
    expiryDate: '-',
  },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_shopping', name: 'Shopping', type: 'EXPENSE', icon: 'cart-outline', color: '#E84D60', bgColor: '#FCEBE9' },
  { id: 'cat_food', name: 'Makanan & Jajan', type: 'EXPENSE', icon: 'restaurant-outline', color: '#F97316', bgColor: '#FFF7ED' },
  { id: 'cat_transport', name: 'Transportasi', type: 'EXPENSE', icon: 'car-outline', color: '#1AC8DB', bgColor: '#E3F8FB' },
  { id: 'cat_ojol_expense', name: 'Ojek Online / Motor', type: 'EXPENSE', icon: 'motorbike', color: '#2EC4B6', bgColor: '#E6F7F5' },
  { id: 'cat_bills', name: 'Tagihan & Utilitas', type: 'EXPENSE', icon: 'receipt-outline', color: '#F24379', bgColor: '#FDE7EE' },
  { id: 'cat_pet', name: 'Pet & Hewan', type: 'EXPENSE', icon: 'paw-outline', color: '#2EC4B6', bgColor: '#E6F7F5' },
  { id: 'cat_gift', name: 'Hadiah / Gift', type: 'EXPENSE', icon: 'gift-outline', color: '#7B73F6', bgColor: '#EFEBFE' },

  { id: 'cat_salary', name: 'Gaji Bulanan', type: 'INCOME', icon: 'cash-outline', color: '#7B73F6', bgColor: '#EFEBFE' },
  { id: 'cat_freelance', name: 'Side Project / Freelance', type: 'INCOME', icon: 'briefcase-outline', color: '#2EC4B6', bgColor: '#E6F7F5' },
  { id: 'cat_investment', name: 'Investasi & Dividen', type: 'INCOME', icon: 'trending-up-outline', color: '#F9D938', bgColor: '#FDF6D6' },
  { id: 'cat_ojol_income', name: 'Driver Online / Ojol', type: 'INCOME', icon: 'motorbike', color: '#2EC4B6', bgColor: '#E6F7F5' },
];

const DEFAULT_REMINDERS: Reminder[] = [];

const DEFAULT_TRANSACTIONS: Transaction[] = [];

// -------------------------------------------------------------
// WEB LOCALSTORAGE HELPERS
// -------------------------------------------------------------
function getWebItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      window.localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  } catch (e) {
    console.warn('localStorage read error:', e);
  }
  return defaultValue;
}

function setWebItem<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn('localStorage write error:', e);
  }
}

// -------------------------------------------------------------
// NATIVE SQLITE (Android & iOS)
// -------------------------------------------------------------
let nativeDb: any = null;

async function getNativeDb() {
  if (nativeDb) return nativeDb;
  const SQLite = await import('expo-sqlite');
  nativeDb = await SQLite.openDatabaseAsync('wallet_riza.db');

  await nativeDb.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      balance REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'IDR',
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      account_number TEXT,
      expiry_date TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      bg_color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      monthly_limit REAL NOT NULL,
      month_year TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      amount REAL,
      due_date TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Clean Slate Migration: Ensure database starts completely empty (0 dummy transactions, 0 sample reminders)
  const cleanSlateRow = await nativeDb.getFirstAsync(
    "SELECT value FROM settings WHERE key = 'has_cleaned_initial_data_v3';"
  );
  if (!cleanSlateRow) {
    await nativeDb.runAsync('DELETE FROM transactions;');
    await nativeDb.runAsync('DELETE FROM reminders;');
    await nativeDb.runAsync('DELETE FROM accounts;');
    for (const acc of DEFAULT_ACCOUNTS) {
      await nativeDb.runAsync(
        `INSERT INTO accounts (id, name, balance, currency, color, icon, account_number, expiry_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [acc.id, acc.name, acc.balance, acc.currency, acc.color, acc.icon, acc.accountNumber, acc.expiryDate]
      );
    }
    // Clear user name and onboarding status so prompt appears
    await nativeDb.runAsync("DELETE FROM settings WHERE key IN ('user_name', 'is_onboarded');");
    await nativeDb.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('has_cleaned_initial_data_v3', '1');");
  }

  const accountCount = await nativeDb.getFirstAsync(
    'SELECT count(*) as count FROM accounts;'
  );

  if (!accountCount || accountCount.count === 0) {
    for (const acc of DEFAULT_ACCOUNTS) {
      await nativeDb.runAsync(
        `INSERT INTO accounts (id, name, balance, currency, color, icon, account_number, expiry_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [acc.id, acc.name, acc.balance, acc.currency, acc.color, acc.icon, acc.accountNumber, acc.expiryDate]
      );
    }
    for (const cat of DEFAULT_CATEGORIES) {
      await nativeDb.runAsync(
        `INSERT INTO categories (id, name, type, icon, color, bg_color) VALUES (?, ?, ?, ?, ?, ?);`,
        [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.bgColor]
      );
    }
  }

  return nativeDb;
}

// -------------------------------------------------------------
// PUBLIC EXPORTED API (Seamless across Web, Android, and iOS)
// -------------------------------------------------------------
export async function fetchAccounts(): Promise<Account[]> {
  if (isWeb) {
    return getWebItem<Account[]>('wallet_riza_accounts', DEFAULT_ACCOUNTS);
  }
  const db = await getNativeDb();
  const rows = await db.getAllAsync('SELECT * FROM accounts ORDER BY name ASC;');
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    balance: r.balance,
    currency: r.currency,
    color: r.color,
    icon: r.icon,
    accountNumber: r.account_number,
    expiryDate: r.expiry_date,
  }));
}

export async function fetchCategories(): Promise<Category[]> {
  if (isWeb) {
    const cats = getWebItem<Category[]>('wallet_riza_categories', DEFAULT_CATEGORIES);
    const hasOjol = cats.some((c) => c.icon === 'motorbike');
    if (!hasOjol) {
      const merged = [
        ...cats,
        { id: 'cat_ojol_expense', name: 'Ojek Online / Motor', type: 'EXPENSE' as TransactionType, icon: 'motorbike', color: '#2EC4B6', bgColor: '#E6F7F5' },
        { id: 'cat_ojol_income', name: 'Driver Online / Ojol', type: 'INCOME' as TransactionType, icon: 'motorbike', color: '#2EC4B6', bgColor: '#E6F7F5' },
      ];
      setWebItem('wallet_riza_categories', merged);
      return merged;
    }
    return cats;
  }
  const db = await getNativeDb();
  const ojolRow = await db.getFirstAsync("SELECT count(*) as count FROM categories WHERE icon = 'motorbike';");
  if (!ojolRow || ojolRow.count === 0) {
    await db.runAsync(
      `INSERT INTO categories (id, name, type, icon, color, bg_color) VALUES (?, ?, ?, ?, ?, ?);`,
      ['cat_ojol_expense', 'Ojek Online / Motor', 'EXPENSE', 'motorbike', '#2EC4B6', '#E6F7F5']
    );
    await db.runAsync(
      `INSERT INTO categories (id, name, type, icon, color, bg_color) VALUES (?, ?, ?, ?, ?, ?);`,
      ['cat_ojol_income', 'Driver Online / Ojol', 'INCOME', 'motorbike', '#2EC4B6', '#E6F7F5']
    );
  }
  const rows = await db.getAllAsync('SELECT * FROM categories ORDER BY name ASC;');
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    type: r.type as TransactionType,
    icon: r.icon,
    color: r.color,
    bgColor: r.bg_color,
  }));
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (isWeb) {
    const trs = getWebItem<Transaction[]>('wallet_riza_transactions', DEFAULT_TRANSACTIONS);
    const hasHistory = trs.some((t) => t.date.startsWith('2026-10'));
    if (!hasHistory) {
      const merged = [...trs, ...DEFAULT_TRANSACTIONS.filter((t) => t.date.startsWith('2026-10') || t.date.startsWith('2026-09'))];
      setWebItem('wallet_riza_transactions', merged);
      return merged;
    }
    return trs;
  }
  const db = await getNativeDb();
  // Ensure historical records exist in SQLite
  const histRow = await db.getFirstAsync("SELECT count(*) as count FROM transactions WHERE date LIKE '2026-10%';");
  if (!histRow || histRow.count === 0) {
    for (const tr of DEFAULT_TRANSACTIONS.filter((t) => t.date.startsWith('2026-10') || t.date.startsWith('2026-09'))) {
      await db.runAsync(
        `INSERT OR IGNORE INTO transactions (id, type, amount, category_id, account_id, date, note)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [tr.id, tr.type, tr.amount, tr.categoryId, tr.accountId, tr.date, tr.note]
      );
    }
  }
  const query = `
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.bg_color as category_bg_color,
           a.name as account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    ORDER BY t.date DESC, t.rowid DESC;
  `;
  const rows = await db.getAllAsync(query);
  return rows.map((r: any) => ({
    id: r.id,
    type: r.type as TransactionType,
    amount: r.amount,
    categoryId: r.category_id,
    categoryName: r.category_name,
    categoryIcon: r.category_icon,
    categoryColor: r.category_color,
    categoryBgColor: r.category_bg_color,
    accountId: r.account_id,
    accountName: r.account_name,
    date: r.date,
    note: r.note,
  }));
}

export async function addTransaction(
  type: TransactionType,
  amount: number,
  categoryId: string,
  accountId: string,
  date: string,
  note?: string
): Promise<void> {
  if (isWeb) {
    const cats = getWebItem<Category[]>('wallet_riza_categories', DEFAULT_CATEGORIES);
    const accs = getWebItem<Account[]>('wallet_riza_accounts', DEFAULT_ACCOUNTS);
    const trs = getWebItem<Transaction[]>('wallet_riza_transactions', DEFAULT_TRANSACTIONS);

    const cat = cats.find((c) => c.id === categoryId);
    const acc = accs.find((a) => a.id === accountId);

    const newTr: Transaction = {
      id: 'tr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      type,
      amount,
      categoryId,
      categoryName: cat?.name,
      categoryIcon: cat?.icon,
      categoryColor: cat?.color,
      categoryBgColor: cat?.bgColor,
      accountId,
      accountName: acc?.name,
      date,
      note,
    };

    const delta = type === 'INCOME' ? amount : -amount;
    const updatedAccs = accs.map((a) =>
      a.id === accountId ? { ...a, balance: a.balance + delta } : a
    );

    setWebItem('wallet_riza_accounts', updatedAccs);
    setWebItem('wallet_riza_transactions', [newTr, ...trs]);
    return;
  }

  const db = await getNativeDb();
  const id = 'tr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO transactions (id, type, amount, category_id, account_id, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, type, amount, categoryId, accountId, date, note || '']
    );

    const delta = type === 'INCOME' ? amount : -amount;
    await db.runAsync(
      `UPDATE accounts SET balance = balance + ? WHERE id = ?;`,
      [delta, accountId]
    );
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  if (isWeb) {
    const accs = getWebItem<Account[]>('wallet_riza_accounts', DEFAULT_ACCOUNTS);
    const trs = getWebItem<Transaction[]>('wallet_riza_transactions', DEFAULT_TRANSACTIONS);

    const tr = trs.find((t) => t.id === id);
    if (!tr) return;

    const delta = tr.type === 'INCOME' ? -tr.amount : tr.amount;
    const updatedAccs = accs.map((a) =>
      a.id === tr.accountId ? { ...a, balance: a.balance + delta } : a
    );

    setWebItem('wallet_riza_accounts', updatedAccs);
    setWebItem('wallet_riza_transactions', trs.filter((t) => t.id !== id));
    return;
  }

  const db = await getNativeDb();
  const tr = await db.getFirstAsync('SELECT * FROM transactions WHERE id = ?;', [id]);
  if (!tr) return;

  await db.withTransactionAsync(async () => {
    const delta = tr.type === 'INCOME' ? -tr.amount : tr.amount;
    await db.runAsync(
      `UPDATE accounts SET balance = balance + ? WHERE id = ?;`,
      [delta, tr.account_id]
    );
    await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
  });
}

export async function addCategory(
  name: string,
  type: TransactionType,
  icon: string,
  color: string,
  bgColor: string
): Promise<Category> {
  const newCat: Category = {
    id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name,
    type,
    icon,
    color,
    bgColor,
  };

  if (isWeb) {
    const cats = getWebItem<Category[]>('wallet_riza_categories', DEFAULT_CATEGORIES);
    setWebItem('wallet_riza_categories', [...cats, newCat]);
    return newCat;
  }

  const db = await getNativeDb();
  await db.runAsync(
    `INSERT INTO categories (id, name, type, icon, color, bg_color) VALUES (?, ?, ?, ?, ?, ?);`,
    [newCat.id, newCat.name, newCat.type, newCat.icon, newCat.color, newCat.bgColor]
  );
  return newCat;
}

export async function deleteCategory(id: string): Promise<void> {
  if (isWeb) {
    const cats = getWebItem<Category[]>('wallet_riza_categories', DEFAULT_CATEGORIES);
    setWebItem('wallet_riza_categories', cats.filter((c) => c.id !== id));
    return;
  }

  const db = await getNativeDb();
  await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
}

export async function addAccount(
  name: string,
  balance: number,
  currency: string = 'IDR',
  color: string = '#F9D938',
  icon: string = 'card-outline'
): Promise<Account> {
  const newAcc: Account = {
    id: 'acc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name,
    balance,
    currency,
    color,
    icon,
  };

  if (isWeb) {
    const accs = getWebItem<Account[]>('wallet_riza_accounts', DEFAULT_ACCOUNTS);
    setWebItem('wallet_riza_accounts', [...accs, newAcc]);
    return newAcc;
  }

  const db = await getNativeDb();
  await db.runAsync(
    `INSERT INTO accounts (id, name, balance, currency, color, icon) VALUES (?, ?, ?, ?, ?, ?);`,
    [newAcc.id, newAcc.name, newAcc.balance, newAcc.currency, newAcc.color, newAcc.icon]
  );
  return newAcc;
}

export async function updateAccount(
  id: string,
  name: string,
  balance: number,
  color?: string,
  icon?: string
): Promise<void> {
  if (isWeb) {
    const accs = getWebItem<Account[]>('wallet_riza_accounts', DEFAULT_ACCOUNTS);
    const updated = accs.map((a) =>
      a.id === id
        ? {
            ...a,
            name,
            balance,
            ...(color ? { color } : {}),
            ...(icon ? { icon } : {}),
          }
        : a
    );
    setWebItem('wallet_riza_accounts', updated);
    return;
  }

  const db = await getNativeDb();
  await db.runAsync(
    `UPDATE accounts SET name = ?, balance = ? WHERE id = ?;`,
    [name, balance, id]
  );
}

export async function deleteAccount(id: string): Promise<void> {
  if (isWeb) {
    const accs = getWebItem<Account[]>('wallet_riza_accounts', DEFAULT_ACCOUNTS);
    setWebItem('wallet_riza_accounts', accs.filter((a) => a.id !== id));
    return;
  }

  const db = await getNativeDb();
  await db.runAsync('DELETE FROM accounts WHERE id = ?;', [id]);
}

export async function fetchUserName(): Promise<string> {
  if (isWeb) {
    return getWebItem<string>('mywallet_user_name', '');
  }
  const db = await getNativeDb();
  const row = await db.getFirstAsync("SELECT value FROM settings WHERE key = 'user_name';");
  return row?.value || '';
}

export async function saveUserName(name: string): Promise<void> {
  if (isWeb) {
    setWebItem('mywallet_user_name', name);
    setWebItem('mywallet_onboarded', 'true');
    return;
  }
  const db = await getNativeDb();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES ('user_name', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [name]
  );
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES ('is_onboarded', '1')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`
  );
}

export async function fetchIsOnboarded(): Promise<boolean> {
  if (isWeb) {
    return getWebItem<string>('mywallet_onboarded', '') === 'true';
  }
  const db = await getNativeDb();
  const row = await db.getFirstAsync("SELECT value FROM settings WHERE key = 'is_onboarded';");
  return row?.value === '1';
}

export async function fetchReminders(): Promise<Reminder[]> {
  if (isWeb) {
    return getWebItem<Reminder[]>('mywallet_reminders', []);
  }
  const db = await getNativeDb();
  const rows = await db.getAllAsync('SELECT * FROM reminders ORDER BY is_completed ASC, rowid DESC;');
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    amount: r.amount || undefined,
    dueDate: r.due_date,
    isCompleted: Boolean(r.is_completed),
  }));
}

export async function addReminder(
  title: string,
  dueDate: string,
  amount?: number
): Promise<Reminder> {
  const newRem: Reminder = {
    id: 'rem_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title,
    amount,
    dueDate,
    isCompleted: false,
  };

  if (isWeb) {
    const list = getWebItem<Reminder[]>('mywallet_reminders', []);
    setWebItem('mywallet_reminders', [newRem, ...list]);
    return newRem;
  }

  const db = await getNativeDb();
  await db.runAsync(
    `INSERT INTO reminders (id, title, amount, due_date, is_completed) VALUES (?, ?, ?, ?, 0);`,
    [newRem.id, newRem.title, newRem.amount || null, newRem.dueDate]
  );
  return newRem;
}

export async function toggleReminder(id: string): Promise<void> {
  if (isWeb) {
    const list = getWebItem<Reminder[]>('mywallet_reminders', []);
    setWebItem(
      'mywallet_reminders',
      list.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
    return;
  }

  const db = await getNativeDb();
  await db.runAsync(
    `UPDATE reminders SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END WHERE id = ?;`,
    [id]
  );
}

export async function deleteReminder(id: string): Promise<void> {
  if (isWeb) {
    const list = getWebItem<Reminder[]>('mywallet_reminders', []);
    setWebItem('mywallet_reminders', list.filter((r) => r.id !== id));
    return;
  }

  const db = await getNativeDb();
  await db.runAsync('DELETE FROM reminders WHERE id = ?;', [id]);
}
