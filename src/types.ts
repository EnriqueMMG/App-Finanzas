export type Currency = 'CRC' | 'USD';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'CARD_PAYMENT';

export type PaymentMethodType = 'MAIN_ACCOUNT' | 'CREDIT_CARD';

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon identifier
  color: string; // hex color or tailwind color class
  isDefault?: boolean;
}

export interface Budget {
  categoryId: string;
  monthlyLimitCRC: number;
}

export interface CreditCard {
  id: string;
  name: string; // e.g., "BAC Credomatic Visa Infinite", "BN Débito/Crédito"
  bank: string; // e.g., "BAC", "BNCR", "Promerica", "Scotiabank", "Banco Popular"
  cardLast4: string;
  currency: Currency;
  creditLimit: number; // Límite de crédito en su moneda
  cutoffDay: number; // Día del mes para corte (1..31)
  paymentDueDay: number; // Día del mes límite de pago (1..31)
  currentBalanceUsed: number; // Saldo actual utilizado
  colorTheme: string; // gradient / color identifier for UI representation
}

export interface MainAccount {
  name: string;
  balanceCRC: number;
  balanceUSD: number;
}

export type ScheduledType = 'TASA_CERO' | 'FIXED_MONTHLY' | 'LOAN';

export interface ScheduledExpense {
  id: string;
  title: string;
  type: ScheduledType;
  currency: Currency;
  monthlyAmount: number; // Monto por cuota mensual o cobro fijo
  totalAmount?: number; // Para préstamos o compras grandes
  totalInstallments?: number; // Total de cuotas (ej. 12 para Tasa Cero)
  paidInstallments?: number; // Cuotas ya pagadas (ej. 4)
  remainingInstallments?: number; // Cuotas restantes
  startDate: string; // YYYY-MM-DD
  dueDay: number; // Día de cobro del mes (1..31)
  sourceAccountId: string; // 'main' or credit card id
  categoryId: string;
  notes?: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  date: string; // YYYY-MM-DD
  categoryId?: string; // For EXPENSE
  sourceType: PaymentMethodType; // 'MAIN_ACCOUNT' or 'CREDIT_CARD'
  sourceId: string; // 'main' or credit card ID
  targetCardId?: string; // For CARD_PAYMENT (the credit card being paid)
  description: string;
  sourceAccountLabel?: string; // e.g. "Cuenta Principal (SINPE)" or "BAC Visa #4512"
  scheduledExpenseId?: string; // If auto-generated or tied to a scheduled expense
}

export interface ExchangeRateConfig {
  usdToCrc: number; // e.g. 520 colones per 1 USD
  lastUpdated: string;
  isAutomatic?: boolean;
}

export interface FinancialSummary {
  mainAccountCRC: number;
  mainAccountUSD: number;
  totalCardsDebtCRC: number;
  totalCardsDebtUSD: number;
  monthlyIncomeCRC: number;
  monthlyExpensesCRC: number;
  monthlyBalanceCRC: number;
  projectedNextMonthAvailableCRC: number;
  projectedBreakdown: {
    expectedIncome: number;
    fixedExpenses: number;
    scheduledInstallments: number;
    estimatedCardPayments: number;
    projectedSurplus: number;
  };
}

export interface AlertItem {
  id: string;
  type: 'CARD_CUTOFF' | 'CARD_PAYMENT_DUE' | 'SCHEDULED_DUE' | 'BUDGET_WARNING' | 'BUDGET_EXCEEDED';
  title: string;
  message: string;
  dueDate?: string;
  severity: 'info' | 'warning' | 'danger';
  linkTab?: string;
}
