import { Currency, ExchangeRateConfig, CreditCard, ScheduledExpense, Transaction, Budget, Category, AlertItem } from '../types';

/**
 * Format currency with Costa Rican standard conventions:
 * CRC: ₡150,000 or ₡150.000 (usually ₡150,000)
 * USD: $1,250.00
 */
export function formatCurrency(amount: number, currency: Currency = 'CRC', forceDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  if (currency === 'CRC') {
    return `₡${Math.round(amount).toLocaleString('es-CR')}`;
  } else {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: forceDecimals || amount % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Convert an amount from one currency to another using exchange rate
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'USD' && toCurrency === 'CRC') {
    return amount * exchangeRate;
  }
  if (fromCurrency === 'CRC' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  return amount;
}

/**
 * Helper to get current year-month YYYY-MM
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthName(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });
}

export function getShortMonthName(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const name = date.toLocaleDateString('es-CR', { month: 'short' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Calculate the projected available money for next month
 * Formula: Ingresos esperados - Gastos fijos - Cuotas/pagos programados - Pago estimado/usado de tarjetas
 */
export function calculateNextMonthProjection(
  expectedMonthlyIncomeCRC: number,
  scheduledExpenses: ScheduledExpense[],
  creditCards: CreditCard[],
  exchangeRate: number
) {
  let fixedExpensesCRC = 0;
  let scheduledInstallmentsCRC = 0;
  let loansCRC = 0;

  scheduledExpenses.filter(s => s.isActive).forEach(item => {
    const amountInCRC = item.currency === 'CRC' 
      ? item.monthlyAmount 
      : item.monthlyAmount * exchangeRate;

    if (item.type === 'FIXED_MONTHLY') {
      fixedExpensesCRC += amountInCRC;
    } else if (item.type === 'TASA_CERO') {
      // Check if it still has installments for next month
      if (item.remainingInstallments === undefined || item.remainingInstallments > 0) {
        scheduledInstallmentsCRC += amountInCRC;
      }
    } else if (item.type === 'LOAN') {
      if (item.remainingInstallments === undefined || item.remainingInstallments > 0) {
        loansCRC += amountInCRC;
      }
    }
  });

  // Estimated credit card payment: full used balance of credit cards
  let estimatedCardPaymentsCRC = 0;
  creditCards.forEach(card => {
    const cardDebtCRC = card.currency === 'CRC' 
      ? card.currentBalanceUsed 
      : card.currentBalanceUsed * exchangeRate;
    estimatedCardPaymentsCRC += cardDebtCRC;
  });

  const totalCommittedCRC = fixedExpensesCRC + scheduledInstallmentsCRC + loansCRC + estimatedCardPaymentsCRC;
  const projectedSurplusCRC = expectedMonthlyIncomeCRC - totalCommittedCRC;

  return {
    expectedIncomeCRC: expectedMonthlyIncomeCRC,
    fixedExpensesCRC,
    scheduledInstallmentsCRC,
    loansCRC,
    estimatedCardPaymentsCRC,
    totalCommittedCRC,
    projectedSurplusCRC,
  };
}

/**
 * Generate smart alerts based on dates and balances
 */
export function generateAlerts(
  creditCards: CreditCard[],
  scheduledExpenses: ScheduledExpense[],
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  exchangeRate: number
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const today = new Date();
  const currentDay = today.getDate();
  const currentYM = getCurrentYearMonth();

  // 1. Credit card cut-off and payment due date alerts
  creditCards.forEach(card => {
    // Cut-off alert (if within 4 days before cut-off)
    let daysToCutoff = card.cutoffDay - currentDay;
    if (daysToCutoff < 0) daysToCutoff += 30; // Approx next month
    if (daysToCutoff >= 0 && daysToCutoff <= 3) {
      alerts.push({
        id: `cutoff-${card.id}`,
        type: 'CARD_CUTOFF',
        title: `Corte próximo: ${card.name}`,
        message: `El corte de tu tarjeta es el día ${card.cutoffDay} (en ${daysToCutoff === 0 ? 'hoy' : `${daysToCutoff} días`}). Saldo al corte: ${formatCurrency(card.currentBalanceUsed, card.currency)}.`,
        severity: 'info',
        linkTab: 'accounts',
      });
    }

    // Payment due date alert (if balance > 0 and within 5 days before payment date)
    if (card.currentBalanceUsed > 0) {
      let daysToDue = card.paymentDueDay - currentDay;
      if (daysToDue < 0) daysToDue += 30;
      if (daysToDue >= 0 && daysToDue <= 5) {
        alerts.push({
          id: `due-${card.id}`,
          type: 'CARD_PAYMENT_DUE',
          title: `Fecha límite de pago: ${card.name}`,
          message: `Vence el día ${card.paymentDueDay} (${daysToDue === 0 ? '¡Hoy es el último día!' : `en ${daysToDue} días`}). Saldo pendiente: ${formatCurrency(card.currentBalanceUsed, card.currency)}.`,
          severity: daysToDue <= 2 ? 'danger' : 'warning',
          linkTab: 'accounts',
        });
      }
    }
  });

  // 2. Scheduled expense upcoming due dates (within 3 days)
  scheduledExpenses.filter(s => s.isActive).forEach(item => {
    let daysToDue = item.dueDay - currentDay;
    if (daysToDue < 0) daysToDue += 30;
    if (daysToDue >= 0 && daysToDue <= 3) {
      alerts.push({
        id: `sched-${item.id}`,
        type: 'SCHEDULED_DUE',
        title: `Cobro programado: ${item.title}`,
        message: `Se cobrará ${formatCurrency(item.monthlyAmount, item.currency)} el día ${item.dueDay} (${daysToDue === 0 ? 'hoy' : `en ${daysToDue} días`}).`,
        severity: 'info',
        linkTab: 'scheduled',
      });
    }
  });

  // 3. Budget warnings (calculate current month expenses per category)
  const currentMonthExpenses = transactions.filter(t => 
    t.type === 'EXPENSE' && t.date.startsWith(currentYM) && t.categoryId
  );

  const categorySpentMap: Record<string, number> = {};
  currentMonthExpenses.forEach(t => {
    if (!t.categoryId) return;
    const amountCRC = t.currency === 'CRC' ? t.amount : t.amount * exchangeRate;
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + amountCRC;
  });

  budgets.forEach(b => {
    if (b.monthlyLimitCRC <= 0) return;
    const spent = categorySpentMap[b.categoryId] || 0;
    const percent = (spent / b.monthlyLimitCRC) * 100;
    const cat = categories.find(c => c.id === b.categoryId);
    const catName = cat ? cat.name : 'Categoría';

    if (percent >= 100) {
      alerts.push({
        id: `budget-over-${b.categoryId}`,
        type: 'BUDGET_EXCEEDED',
        title: `Presupuesto excedido: ${catName}`,
        message: `Has gastado ${formatCurrency(spent, 'CRC')} de tu límite mensual de ${formatCurrency(b.monthlyLimitCRC, 'CRC')} (${Math.round(percent)}%).`,
        severity: 'danger',
        linkTab: 'budgets',
      });
    } else if (percent >= 80) {
      alerts.push({
        id: `budget-warn-${b.categoryId}`,
        type: 'BUDGET_WARNING',
        title: `Cerca del límite: ${catName}`,
        message: `Has gastado el ${Math.round(percent)}% (${formatCurrency(spent, 'CRC')} de ${formatCurrency(b.monthlyLimitCRC, 'CRC')}).`,
        severity: 'warning',
        linkTab: 'budgets',
      });
    }
  });

  return alerts;
}
