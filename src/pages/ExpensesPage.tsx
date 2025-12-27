import { useMemo, useState } from "react";
import { Plus, Receipt, RefreshCw } from "lucide-react";

import { useExpenses } from "../hooks/useExpenses";
import { useProperties } from "../hooks/useProperties";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { ExpensesType } from "../constants/expensesType";
import { useDeleteExpense } from "../hooks/useDeleteExpense";

export default function ExpensesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<"all" | string>("all");

  // --- Date Defaults (Current Month) ---
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [fromDate, setFromDate] = useState(
    firstDayOfMonth.toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(
    lastDayOfMonth.toISOString().split("T")[0]
  );

  const { data: properties = [] } = useProperties();
  const { data: expenses = [], isPending: isLoading } = useExpenses();
  const { mutate: deleteExpense, isPending: isDeletingExpense } =
    useDeleteExpense();

  // --- FILTERED EXPENSES ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return (
        expenseDate >= from &&
        expenseDate <= to &&
        (type === "all" || e.type === type)
      );
    });
  }, [expenses, fromDate, toDate, type]);

  // --- TOTAL ---
  const totalAllExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // --- GROUP BY PROPERTY ---
  const expensesByProperty = useMemo(() => {
    const grouped: Record<
      number,
      { propertyName: string; byType: Record<string, number> }
    > = {};

    filteredExpenses.forEach((e) => {
      if (e.propertyLinks) {
        e.propertyLinks.forEach((link) => {
          const propId = link.property.id;
          const propName = link.property.name;

          if (!grouped[propId]) {
            grouped[propId] = { propertyName: propName, byType: {} };
          }

          grouped[propId].byType[e.type] =
            (grouped[propId].byType[e.type] || 0) + e.amount;
        });
      }
    });

    return grouped;
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* ================= FILTERS ================= */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => {
              setType("all");
              setFromDate(firstDayOfMonth.toISOString().split("T")[0]);
              setToDate(lastDayOfMonth.toISOString().split("T")[0]);
            }}
            className="text-sm text-gray-500 hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl px-3 py-2 bg-gray-50 border w-full sm:w-auto"
          >
            <option value="all">All Types</option>
            {Object.values(ExpensesType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-xl px-3 py-2 bg-gray-50 border w-full sm:w-auto"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-xl px-3 py-2 bg-gray-50 border w-full sm:w-auto"
          />

          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto px-4 py-2 rounded-xl bg-red-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* ================= LOADING ================= */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-10 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          Loading expenses...
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!isLoading && filteredExpenses.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center space-y-4">
          <Receipt className="w-10 h-10 mx-auto text-gray-400" />
          <h3 className="text-lg font-semibold">No expenses found</h3>
          <p className="text-sm text-gray-500">
            Add expenses to see analytics and breakdowns.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white"
          >
            Add Expense
          </button>
        </div>
      )}

      {/* ================= KPI SUMMARY ================= */}
      {!isLoading && filteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-semibold text-red-600">
              AED {totalAllExpenses.toFixed(2)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-sm text-gray-500">Properties</p>
            <p className="text-2xl font-semibold">
              {Object.keys(expensesByProperty).length}
            </p>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-sm text-gray-500">Records</p>
            <p className="text-2xl font-semibold">{filteredExpenses.length}</p>
          </div>
        </div>
      )}

      {/* ================= PROPERTY BREAKDOWN ================= */}
      {!isLoading &&
        Object.entries(expensesByProperty).map(
          ([propId, { propertyName, byType }]) => {
            const total = Object.values(byType).reduce(
              (sum, amt) => sum + amt,
              0
            );

            return (
              <div key={propId} className="space-y-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-4">
                  <h2 className="text-lg font-semibold">{propertyName}</h2>
                  <p>Total: AED {total.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                  {Object.entries(byType).map(([t, amount]) => {
                    const percent = (amount / total) * 100;
                    return (
                      <div key={t} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{t}</span>
                          <span className="font-semibold">
                            AED {amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        )}

      {/* ================= DETAILED RECORDS ================= */}
      {!isLoading && filteredExpenses.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <h3 className="font-semibold mb-3">Expense Records</h3>

          {/* TABLE HEADER for large screens */}
          <div className="hidden sm:grid grid-cols-5 text-sm text-gray-500 mb-2">
            <span>Date</span>
            <span>Type</span>
            <span className="text-right">Note</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Action</span>
          </div>

          {filteredExpenses
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((e) => (
              <div
                key={e.id}
                className="grid sm:grid-cols-5 items-center text-sm bg-gray-50 rounded-xl p-3 sm:p-2 mb-2 gap-2 sm:gap-0"
              >
                <span>{new Date(e.date).toLocaleDateString()}</span>
                <span className="font-medium">{e.type}</span>
                <span className="font-medium truncate text-right sm:text-left">
                  {e.note}
                </span>
                <span className="text-right font-semibold">
                  AED {e.amount.toFixed(2)}
                </span>
                <div className="text-right">
                  <button
                    onClick={() => deleteExpense(e.id)}
                    disabled={isDeletingExpense}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <AddExpenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        properties={properties}
      />
    </div>
  );
}
