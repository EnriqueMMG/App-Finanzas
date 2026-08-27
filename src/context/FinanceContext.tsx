import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Currency,
  Category,
  Budget,
  CreditCard,
  MainAccount,
  ScheduledExpense,
  Transaction,
  ExchangeRateConfig,
  AlertItem,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_BUDGETS,
  INITIAL_MAIN_ACCOUNT,
  INITIAL_CREDIT_CARDS,
  INITIAL_SCHEDULED_EXPENSES,
  INITIAL_EXCHANGE_RATE,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import {
  calculateNextMonthProjection,
  generateAlerts,
  getCurrentYearMonth,
  convertCurrency,
} from '../utils/currency';

interface FinanceContextType {
  // State
  categories: Category[];
  budgets: Budget[];
  mainAccount: MainAccount;
  creditCards: CreditCard[];
  scheduledExpenses: ScheduledExpense[];
  transactions: Transaction[];
  exchangeRate: ExchangeRateConfig;
  displayCurrency: Currency;
  expectedMonthlyIncomeCRC: number;
  activeTab: string;
  alerts: AlertItem[];

  // Setters & Actions
  setDisplayCurrency: (c: Currency) => void;
  setActiveTab: (tab: string) => void;
  setExpectedMonthlyIncomeCRC: (amount: number) => void;
  updateExchangeRate: (rate: number) => void;
  updateMainAccount: (account: Partial<MainAccount>) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Credit Cards
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  payCreditCard: (cardId: string, amount: number, currency: Currency, date?: string, note?: string) => void;

  // Scheduled Expenses
  addScheduledExpense: (expense: Omit<ScheduledExpense, 'id'>) => void;
  updateScheduledExpense: (id: string, expense: Partial<ScheduledExpense>) => void;
  deleteScheduledExpense: (id: string) => void;
  payScheduledInstallment: (id: string) => void;

  // Categories & Budgets
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateBudget: (categoryId: string, limitCRC: number) => void;

  // Projection Calculations
  projection: ReturnType<typeof calculateNextMonthProjection>;

  // Reset
  resetToDefaultData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CATEGORIES: 'finanzo_categories_v1',
  BUDGETS: 'finanzo_budgets_v1',
  MAIN_ACCOUNT: 'finanzo_main_account_v1',
  CREDIT_CARDS: 'finanzo_credit_cards_v1',
  SCHEDULED_EXPENSES: 'finanzo_scheduled_v1',
  TRANSACTIONS: 'finanzo_transactions_v1',
  EXCHANGE_RATE: 'finanzo_exchange_rate_v1',
  DISPLAY_CURRENCY: 'finanzo_display_currency_v1',
  EXPECTED_INCOME: 'finanzo_expected_income_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() =>
    loadStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );

  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadStored(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS)
  );

  const [mainAccount, setMainAccount] = useState<MainAccount>(() =>
    loadStored(STORAGE_KEYS.MAIN_ACCOUNT, INITIAL_MAIN_ACCOUNT)
  );

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() =>
    loadStored(STORAGE_KEYS.CREDIT_CARDS, INITIAL_CREDIT_CARDS)
  );

  const [scheduledExpenses, setScheduledExpenses] = useState<ScheduledExpense[]>(() =>
    loadStored(STORAGE_KEYS.SCHEDULED_EXPENSES, INITIAL_SCHEDULED_EXPENSES)
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );

  const [exchangeRate, setExchangeRateState] = useState<ExchangeRateConfig>(() =>
    loadStored(STORAGE_KEYS.EXCHANGE_RATE, INITIAL_EXCHANGE_RATE)
  );

  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>(() =>
    loadStored(STORAGE_KEYS.DISPLAY_CURRENCY, 'CRC')
  );

  const [expectedMonthlyIncomeCRC, setExpectedMonthlyIncomeCRCState] = useState<number>(() =>
    loadStored(STORAGE_KEYS.EXPECTED_INCOME, 1250000)
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAIN_ACCOUNT, JSON.stringify(mainAccount));
  }, [mainAccount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_EXPENSES, JSON.stringify(scheduledExpenses));
  }, [scheduledExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, JSON.stringify(exchangeRate));
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPLAY_CURRENCY, JSON.stringify(displayCurrency));
  }, [displayCurrency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPECTED_INCOME, JSON.stringify(expectedMonthlyIncomeCRC));
  }, [expectedMonthlyIncomeCRC]);

  const setDisplayCurrency = (c: Currency) => setDisplayCurrencyState(c);
  const setExpectedMonthlyIncomeCRC = (amount: number) => setExpectedMonthlyIncomeCRCState(amount);

  const updateExchangeRate = (rate: number) => {
    setExchangeRateState({
      usdToCrc: rate,
      lastUpdated: new Date().toISOString(),
      isAutomatic: false,
    });
  };

  const updateMainAccount = (updated: Partial<MainAccount>) => {
    setMainAccount(prev => ({ ...prev, ...updated }));
  };

  // Helper to apply or revert a transaction on balances
  const applyTxToBalances = (tx: Transaction, direction: 'APPLY' | 'REVERT') => {
    const factor = direction === 'APPLY' ? 1 : -1;

    if (tx.type === 'INCOME') {
      if (tx.sourceType === 'MAIN_ACCOUNT') {
        setMainAccount(prev => ({
          ...prev,
          balanceCRC: tx.currency === 'CRC' ? prev.balanceCRC + tx.amount * factor : prev.balanceCRC,
          balanceUSD: tx.currency === 'USD' ? prev.balanceUSD + tx.amount * factor : prev.balanceUSD,
        }));
      }
    } else if (tx.type === 'EXPENSE') {
      if (tx.sourceType === 'MAIN_ACCOUNT') {
        setMainAccount(prev => ({
          ...prev,
          balanceCRC: tx.currency === 'CRC' ? prev.balanceCRC - tx.amount * factor : prev.balanceCRC,
          balanceUSD: tx.currency === 'USD' ? prev.balanceUSD - tx.amount * factor : prev.balanceUSD,
        }));
      } else if (tx.sourceType === 'CREDIT_CARD') {
        setCreditCards(cards =>
          cards.map(c => {
            if (c.id === tx.sourceId) {
              const newBalance = c.currentBalanceUsed + tx.amount * factor;
              return { ...c, currentBalanceUsed: Math.max(0, newBalance) };
            }
            return c;
          })
        );
      }
    } else if (tx.type === 'CARD_PAYMENT') {
      // Deduct from main account
      setMainAccount(prev => ({
        ...prev,
        balanceCRC: tx.currency === 'CRC' ? prev.balanceCRC - tx.amount * factor : prev.balanceCRC,
        balanceUSD: tx.currency === 'USD' ? prev.balanceUSD - tx.amount * factor : prev.balanceUSD,
      }));

      // Reduce card balance used
      if (tx.targetCardId) {
        setCreditCards(cards =>
          cards.map(c => {
            if (c.id === tx.targetCardId) {
              const newBalance = c.currentBalanceUsed - tx.amount * factor;
              return { ...c, currentBalanceUsed: Math.max(0, newBalance) };
            }
            return c;
          })
        );
      }
    }
  };

  const addTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newTx: Transaction = { ...newTxData, id };

    setTransactions(prev => [newTx, ...prev]);
    applyTxToBalances(newTx, 'APPLY');
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    // Revert old effect
    applyTxToBalances(oldTx, 'REVERT');

    const newTx = { ...oldTx, ...updated };
    setTransactions(prev => prev.map(t => (t.id === id ? newTx : t)));

    // Apply new effect
    applyTxToBalances(newTx, 'APPLY');
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    applyTxToBalances(tx, 'REVERT');
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const payCreditCard = (
    cardId: string,
    amount: number,
    currency: Currency,
    date?: string,
    note?: string
  ) => {
    const card = creditCards.find(c => c.id === cardId);
    const cardName = card ? `${card.bank} (${card.name})` : 'Tarjeta';
    const txDate = date || new Date().toISOString().split('T')[0];

    const newTxData: Omit<Transaction, 'id'> = {
      type: 'CARD_PAYMENT',
      amount,
      currency,
      date: txDate,
      sourceType: 'MAIN_ACCOUNT',
      sourceId: 'main',
      targetCardId: cardId,
      description: note || `Pago de tarjeta ${cardName} desde Cuenta Principal`,
    };

    addTransaction(newTxData);
  };

  // Credit Card operations
  const addCreditCard = (cardData: Omit<CreditCard, 'id'>) => {
    const id = 'card-' + Date.now();
    const newCard: CreditCard = { ...cardData, id };
    setCreditCards(prev => [...prev, newCard]);
  };

  const updateCreditCard = (id: string, cardUpdate: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => (c.id === id ? { ...c, ...cardUpdate } : c)));
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
  };

  // Scheduled Expenses operations
  const addScheduledExpense = (expenseData: Omit<ScheduledExpense, 'id'>) => {
    const id = 'sched-' + Date.now();
    const newExpense: ScheduledExpense = { ...expenseData, id };
    setScheduledExpenses(prev => [...prev, newExpense]);
  };

  const updateScheduledExpense = (id: string, expenseUpdate: Partial<ScheduledExpense>) => {
    setScheduledExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...expenseUpdate } : e))
    );
  };

  const deleteScheduledExpense = (id: string) => {
    setScheduledExpenses(prev => prev.filter(e => e.id !== id));
  };

  const payScheduledInstallment = (id: string) => {
    const expense = scheduledExpenses.find(e => e.id === id);
    if (!expense) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isCard = expense.sourceAccountId !== 'main';

    // Register transaction
    addTransaction({
      type: 'EXPENSE',
      amount: expense.monthlyAmount,
      currency: expense.currency,
      date: todayStr,
      categoryId: expense.categoryId,
      sourceType: isCard ? 'CREDIT_CARD' : 'MAIN_ACCOUNT',
      sourceId: expense.sourceAccountId,
      description: `Cobro cuota: ${expense.title}`,
      scheduledExpenseId: expense.id,
    });

    // Update installments if applicable
    if (expense.totalInstallments && expense.remainingInstallments !== undefined) {
      const nextPaid = (expense.paidInstallments || 0) + 1;
      const nextRemaining = Math.max(0, (expense.remainingInstallments || 1) - 1);
      const isComplete = nextRemaining === 0;

      updateScheduledExpense(id, {
        paidInstallments: nextPaid,
        remainingInstallments: nextRemaining,
        isActive: !isComplete,
      });
    }
  };

  // Category & Budget operations
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    const newCat: Category = { ...catData, id };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, catUpdate: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...catUpdate } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setBudgets(prev => prev.filter(b => b.categoryId !== id));
  };

  const updateBudget = (categoryId: string, limitCRC: number) => {
    setBudgets(prev => {
      const exists = prev.some(b => b.categoryId === categoryId);
      if (exists) {
        return prev.map(b => (b.categoryId === categoryId ? { ...b, monthlyLimitCRC: limitCRC } : b));
      }
      return [...prev, { categoryId, monthlyLimitCRC: limitCRC }];
    });
  };

  // Projection
  const projection = useMemo(() => {
    return calculateNextMonthProjection(
      expectedMonthlyIncomeCRC,
      scheduledExpenses,
      creditCards,
      exchangeRate.usdToCrc
    );
  }, [expectedMonthlyIncomeCRC, scheduledExpenses, creditCards, exchangeRate.usdToCrc]);

  // Alerts
  const alerts = useMemo(() => {
    return generateAlerts(
      creditCards,
      scheduledExpenses,
      transactions,
      budgets,
      categories,
      exchangeRate.usdToCrc
    );
  }, [creditCards, scheduledExpenses, transactions, budgets, categories, exchangeRate.usdToCrc]);

  const resetToDefaultData = () => {
    setCategories(INITIAL_CATEGORIES);
    setBudgets(INITIAL_BUDGETS);
    setMainAccount(INITIAL_MAIN_ACCOUNT);
    setCreditCards(INITIAL_CREDIT_CARDS);
    setScheduledExpenses(INITIAL_SCHEDULED_EXPENSES);
    setTransactions(INITIAL_TRANSACTIONS);
    setExchangeRateState(INITIAL_EXCHANGE_RATE);
    setDisplayCurrencyState('CRC');
    setExpectedMonthlyIncomeCRCState(1250000);
    localStorage.clear();
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        budgets,
        mainAccount,
        creditCards,
        scheduledExpenses,
        transactions,
        exchangeRate,
        displayCurrency,
        expectedMonthlyIncomeCRC,
        activeTab,
        alerts,
        setDisplayCurrency,
        setActiveTab,
        setExpectedMonthlyIncomeCRC,
        updateExchangeRate,
        updateMainAccount,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        payCreditCard,
        addScheduledExpense,
        updateScheduledExpense,
        deleteScheduledExpense,
        payScheduledInstallment,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBudget,
        projection,
        resetToDefaultData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
