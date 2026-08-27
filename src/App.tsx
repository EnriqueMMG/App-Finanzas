import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { ScheduledView } from './components/ScheduledView';
import { BudgetsView } from './components/BudgetsView';
import { ReportsView } from './components/ReportsView';

// Modals
import { TransactionModal } from './components/modals/TransactionModal';
import { CardPaymentModal } from './components/modals/CardPaymentModal';
import { CardModal } from './components/modals/CardModal';
import { ScheduledExpenseModal } from './components/modals/ScheduledExpenseModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { ExchangeRateModal } from './components/modals/ExchangeRateModal';
import { AlertsDrawer } from './components/modals/AlertsDrawer';
import { CreditCard, ScheduledExpense, Category, Transaction, TransactionType } from './types';

const MainApp: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('EXPENSE');

  const [isCardPayModalOpen, setIsCardPayModalOpen] = useState(false);
  const [payingCard, setPayingCard] = useState<CreditCard | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [isSchedModalOpen, setIsSchedModalOpen] = useState(false);
  const [editingSched, setEditingSched] = useState<ScheduledExpense | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isFxModalOpen, setIsFxModalOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Modal Triggers
  const handleOpenNewTx = (type: TransactionType = 'EXPENSE') => {
    setEditingTx(null);
    setTxInitialType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenCardPay = (card: CreditCard) => {
    setPayingCard(card);
    setIsCardPayModalOpen(true);
  };

  const handleOpenAddCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleOpenNewScheduled = () => {
    setEditingSched(null);
    setIsSchedModalOpen(true);
  };

  const handleEditScheduled = (item: ScheduledExpense) => {
    setEditingSched(item);
    setIsSchedModalOpen(true);
  };

  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        onOpenNewTx={() => handleOpenNewTx('EXPENSE')}
        onOpenFxModal={() => setIsFxModalOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenNewTx={() => handleOpenNewTx('EXPENSE')}
              onOpenCardPay={handleOpenCardPay}
              onOpenAddCard={handleOpenAddCard}
              onOpenNewScheduled={handleOpenNewScheduled}
              onEditTx={handleEditTx}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenNewTx={() => handleOpenNewTx('EXPENSE')}
              onEditTx={handleEditTx}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              onOpenAddCard={handleOpenAddCard}
              onEditCard={handleEditCard}
              onOpenCardPay={handleOpenCardPay}
              onOpenNewTx={() => handleOpenNewTx('EXPENSE')}
            />
          )}

          {activeTab === 'scheduled' && (
            <ScheduledView
              onOpenNewScheduled={handleOpenNewScheduled}
              onEditScheduled={handleEditScheduled}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              onOpenNewCategory={handleOpenNewCategory}
              onEditCategory={handleEditCategory}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Drawers */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txInitialType}
        editingTransaction={editingTx}
      />

      <CardPaymentModal
        isOpen={isCardPayModalOpen}
        onClose={() => setIsCardPayModalOpen(false)}
        card={payingCard}
      />

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        editingCard={editingCard}
      />

      <ScheduledExpenseModal
        isOpen={isSchedModalOpen}
        onClose={() => setIsSchedModalOpen(false)}
        editingScheduled={editingSched}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editingCategory={editingCategory}
      />

      <ExchangeRateModal
        isOpen={isFxModalOpen}
        onClose={() => setIsFxModalOpen(false)}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
