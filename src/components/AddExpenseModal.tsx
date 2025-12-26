/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useCreateExpense } from "../hooks/useCreateExpense";
import { ExpensesType } from "../constants/expensesType";

const defaultForm = {
  amount: "",
  date: new Date().toISOString().split("T")[0],
  type: ExpensesType.OTHER,
  note: "",
  propertyIds: [] as number[],
};

export function AddExpenseModal({
  open,
  onClose,
  properties,
}: {
  open: boolean;
  onClose: () => void;
  properties: any[];
}) {
  const { mutate, isPending } = useCreateExpense();
  const [form, setForm] = useState(defaultForm);

  const resetForm = () => setForm(defaultForm);

  if (!open) return null;

  const toggleProperty = (id: number) => {
    setForm((prev) => ({
      ...prev,
      propertyIds: prev.propertyIds.includes(id)
        ? prev.propertyIds.filter((p) => p !== id)
        : [...prev.propertyIds, id],
    }));
  };

  const handleSave = () => {
    if (!form.amount) return;

    mutate(
      {
        ...form,
        amount: Number(form.amount),
      },
      {
        onSuccess: () => {
          resetForm(); // ✅ clear form
          onClose(); // ✅ close modal
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-lg">Add Expense</h3>

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
        />

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
        />

        {/* Type */}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          className="w-full rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
        >
          {Object.values(ExpensesType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Note */}
        <textarea
          placeholder="Note (optional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="w-full rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
        />

        {/* Property Selector (User Friendly) */}
        <div>
          <p className="text-sm font-medium mb-2 text-gray-600">
            Properties (optional)
          </p>

          <div className="max-h-40 overflow-y-auto rounded-xl border bg-gray-50 p-2 space-y-2">
            {properties.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.propertyIds.includes(p.id)}
                  onChange={() => toggleProperty(p.id)}
                  className="rounded text-red-600"
                />
                {p.name}
              </label>
            ))}

            {properties.length === 0 && (
              <p className="text-xs text-gray-400">No properties found</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            disabled={isPending || !form.amount}
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
