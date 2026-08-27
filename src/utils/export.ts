import { Transaction, Category, CreditCard, MainAccount, Currency } from '../types';
import { formatCurrency } from './currency';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  creditCards: CreditCard[],
  mainAccount: MainAccount,
  filename: string = 'movimientos_finanzo.csv'
) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const cardMap = new Map(creditCards.map(c => [c.id, `${c.bank} - ${c.name}`]));

  const headers = [
    'ID',
    'Fecha',
    'Tipo',
    'Monto',
    'Moneda',
    'Monto Formateado',
    'Categoría',
    'Cuenta/Tarjeta Origen',
    'Descripción / Detalle',
  ];

  const rows = transactions.map(t => {
    let typeLabel = 'Gasto';
    if (t.type === 'INCOME') typeLabel = 'Ingreso';
    if (t.type === 'CARD_PAYMENT') typeLabel = 'Pago de Tarjeta';

    let categoryLabel = t.categoryId ? (categoryMap.get(t.categoryId) || 'Sin categoría') : '-';
    if (t.type === 'INCOME') categoryLabel = 'Ingreso / Entrada';
    if (t.type === 'CARD_PAYMENT') categoryLabel = 'Pago de Tarjeta';

    let accountLabel = mainAccount.name + ' (SINPE/Efectivo)';
    if (t.sourceType === 'CREDIT_CARD') {
      accountLabel = cardMap.get(t.sourceId) || 'Tarjeta de Crédito';
    }

    if (t.type === 'CARD_PAYMENT' && t.targetCardId) {
      const targetCard = cardMap.get(t.targetCardId) || 'Tarjeta';
      accountLabel = `${mainAccount.name} → ${targetCard}`;
    }

    const safeDescription = (t.description || '').replace(/"/g, '""');

    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${typeLabel}"`,
      t.amount,
      `"${t.currency}"`,
      `"${formatCurrency(t.amount, t.currency)}"`,
      `"${categoryLabel}"`,
      `"${accountLabel}"`,
      `"${safeDescription}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
