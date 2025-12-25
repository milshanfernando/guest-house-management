import { useMemo, useState } from "react";
import { DollarSign, Plus, RefreshCw } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { useIncomes } from "../hooks/useIncomes";
import { AddIncomeModal } from "../components/AddIncomeModal";

type ViewType = "monthly" | "daily" | "range";

export default function IncomesPage() {
  const [propertyId, setPropertyId] = useState<number | "all">("all");
  const [viewType, setViewType] = useState<ViewType>("monthly");

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showAdd, setShowAdd] = useState(false);

  const { data: properties = [] } = useProperties();

  // 🔹 Build API params
  const params = useMemo(() => {
    let from: string | undefined;
    let to: string | undefined;

    if (viewType === "monthly") {
      from = `${month}-01`;
      to = `${month}-31`;
    } else if (viewType === "daily") {
      from = date;
      to = date;
    } else {
      from = fromDate || undefined;
      to = toDate || undefined;
    }

    return {
      propertyId: propertyId === "all" ? undefined : propertyId,
      fromDate: from,
      toDate: to,
    };
  }, [propertyId, viewType, month, date, fromDate, toDate]);

  const { data: incomes = [], refetch } = useIncomes(params);

  // 🔹 Total income
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, i) => sum + i.amount, 0);
  }, [incomes]);

  // 🔹 Income by property
  const incomeByProperty = useMemo(() => {
    return incomes.reduce<Record<string, number>>((acc, i) => {
      const name = i.property.name;
      acc[name] = (acc[name] || 0) + i.amount;
      return acc;
    }, {});
  }, [incomes]);

  // 🔹 Income by property + platform
  const incomeByPropertyPlatform = useMemo(() => {
    return incomes.reduce<Record<string, number>>((acc, i) => {
      const key = `${i.property.name} • ${i.platform || "OTHER"}`;
      acc[key] = (acc[key] || 0) + i.amount;
      return acc;
    }, {});
  }, [incomes]);

  return (
    <div className="space-y-6">
      {/* ================= FILTERS ================= */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Property */}
          <select
            value={propertyId}
            onChange={(e) =>
              setPropertyId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* View Type */}
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ViewType)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="range">Date Range</option>
          </select>

          {/* Date Inputs */}
          {viewType === "monthly" && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          )}

          {viewType === "daily" && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          )}

          {viewType === "range" && (
            <>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>
      </div>

      {/* ================= TOTAL ================= */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Total Income</h3>
          <DollarSign className="w-8 h-8 opacity-80" />
        </div>
        <p className="text-4xl font-bold mt-2">${totalIncome.toFixed(2)}</p>
      </div>

      {/* ================= BY PROPERTY ================= */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Income by Property</h3>

        {Object.keys(incomeByProperty).length === 0 ? (
          <p className="text-sm text-gray-500">No data</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(incomeByProperty).map(([name, amount]) => (
              <div key={name} className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">{name}</p>
                <p className="text-xl font-bold">${amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= BY PROPERTY + PLATFORM ================= */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Income by Property & Platform</h3>

        {Object.keys(incomeByPropertyPlatform).length === 0 ? (
          <p className="text-sm text-gray-500">No data</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(incomeByPropertyPlatform).map(([key, amount]) => (
              <div key={key} className="flex justify-between text-sm">
                <span>{key}</span>
                <span className="font-semibold">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddIncomeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        properties={properties}
      />
    </div>
  );
}
