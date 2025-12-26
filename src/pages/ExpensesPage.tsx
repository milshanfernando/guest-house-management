import { useMemo, useState } from "react";
import { Plus, Receipt, RefreshCw } from "lucide-react";

import { useProperties } from "../hooks/useProperties";
import { useExpenses, type Expense } from "../hooks/useExpenses";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { ExpensesType } from "../constants/expensesType";
// import { useDeleteExpense } from "../hooks/useDeleteExpense";

export default function ExpensesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<"all" | string>("all");

  const { data: properties = [] } = useProperties();

  const { data: expenses = [], isPending: isLoading } = useExpenses();

  const totalExpense = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const expenseByType = useMemo(() => {
    return expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {});
  }, [expenses]);
  // const { mutate: deleteExpense, isPending: isDeletingExpense } =
  //   useDeleteExpense();

  return (
    <div className="space-y-6">
      {/* FILTERS */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl px-3 py-2 bg-gray-50 border"
        >
          <option value="all">All Types</option>
          {Object.values(ExpensesType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl bg-red-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="text-center py-10 bg-white rounded-xl border">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-2" />
          Loading expenses...
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && expenses.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center space-y-4">
          <div className="flex justify-center">
            <Receipt className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold">No expenses recorded yet</h3>
          <p className="text-sm text-gray-500">
            Start by adding your first expense to see totals and insights.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      )}

      {/* CONTENT */}
      {!isLoading && expenses.length > 0 && (
        <>
          {/* TOTAL */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6">
            <p className="text-sm opacity-80">Total Expenses</p>
            <p className="text-4xl font-semibold">
              AED {totalExpense.toFixed(2)}
            </p>
          </div>

          {/* BY TYPE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Expenses by Type</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(expenseByType).map(([t, amount]) => (
                <div key={t} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">{t}</p>
                  <p className="text-xl font-semibold">
                    AED {amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* LIST */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            {expenses?.map((e: Expense) => (
              <div
                key={e.id}
                className="rounded-xl bg-gray-50 p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">
                    AED {e.amount.toFixed(2)} • {e.type}
                  </p>
                  <p className="text-sm text-gray-500">{e.note}</p>
                </div>

                <span className="text-xs text-gray-400">
                  {new Date(e.date).toLocaleDateString()}
                </span>
                {/* <button
                  onClick={() => deleteExpense(e.id)}
                  disabled={isDeletingExpense}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button> */}
              </div>
            ))}
          </div>
        </>
      )}

      <AddExpenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        properties={properties}
      />
    </div>
  );
}
