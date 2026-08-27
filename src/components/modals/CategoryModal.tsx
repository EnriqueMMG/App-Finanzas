import React, { useState, useEffect } from 'react';
import { X, Tag, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { AVAILABLE_ICONS, CategoryIcon } from '../CategoryIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: Category | null;
}

const PALETTE = [
  '#10b981', // Emerald
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#64748b', // Slate
  '#0f172a', // Dark
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory = null,
}) => {
  const { addCategory, updateCategory, deleteCategory, budgets, updateBudget } = useFinance();

  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('Tag');
  const [color, setColor] = useState<string>('#10b981');
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon);
      setColor(editingCategory.color);
      const existingBudget = budgets.find((b) => b.categoryId === editingCategory.id);
      setBudgetLimit(existingBudget ? existingBudget.monthlyLimitCRC.toString() : '');
    } else {
      setName('');
      setIcon('Tag');
      setColor('#10b981');
      setBudgetLimit('100000');
    }
    setError('');
  }, [isOpen, editingCategory, budgets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre de la categoría');
      return;
    }

    const catData = {
      name: name.trim(),
      icon,
      color,
    };

    let targetId = editingCategory?.id;

    if (editingCategory) {
      updateCategory(editingCategory.id, catData);
    } else {
      const newId = 'cat-' + Date.now();
      addCategory({ ...catData });
      targetId = newId;
    }

    const limitNum = parseFloat(budgetLimit);
    if (!isNaN(limitNum) && limitNum >= 0 && targetId) {
      updateBudget(targetId, limitNum);
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingCategory && confirm(`¿Deseas eliminar la categoría "${editingCategory.name}"?`)) {
      deleteCategory(editingCategory.id);
      onClose();
    }
  };

  return (
    <div id="modal-backdrop-category" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="modal-category"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={icon} className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="text-xs text-slate-500">Personaliza nombre, ícono y presupuesto mensual</p>
            </div>
          </div>
          <button
            id="btn-close-cat-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              id="input-cat-name"
              placeholder="Ej. Gimnasio, Mascotas, Cursos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-emerald-500 focus:bg-white outline-hidden"
            />
          </div>

          {/* Monthly Budget Limit (CRC) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Límite Mensual de Presupuesto (₡ Colones)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                ₡
              </span>
              <input
                type="number"
                step="any"
                id="input-cat-budget"
                placeholder="Ej. 100000 (0 para sin límite)"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Color palette */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Color de Identificación
            </label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-120 ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ícono
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  title={item.label}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    icon === item.name
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {editingCategory ? (
              <button
                type="button"
                id="btn-delete-cat"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-cancel-cat"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-cat"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-xl shadow-md transition-all"
              >
                {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
