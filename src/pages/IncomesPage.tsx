/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { useIncomes } from "../hooks/useIncomes";
import { AddIncomeModal } from "../components/AddIncomeModal";
import { useReservations } from "../hooks/useReservations";
// import { useDeleteIncome } from "../hooks/useDeleteIncome";

type ViewType = "monthly" | "daily" | "range";

export default function IncomesPage() {
  const [propertyId, setPropertyId] = useState<number | "all">("all");
  const [viewType, setViewType] = useState<ViewType>("monthly");

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showAdd, setShowAdd] = useState(false);

  const { data: properties = [], isPending: propertiesLoading } =
    useProperties();
  const { data: dirrectIncomes = [], isPending: dirrectIncomesLoading } =
    useReservations();

  // const { mutate: deleteIncome, isPending: isDeletingIncome } =
  //   useDeleteIncome();

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

  const {
    data: incomes = [],
    refetch,
    isPending: incomesLoading,
  } = useIncomes(params);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );

  const incomeByProperty = useMemo(() => {
    return incomes.reduce<Record<string, number>>((acc, i) => {
      const name = i.property.name;
      acc[name] = (acc[name] || 0) + i.amount;
      return acc;
    }, {});
  }, [incomes]);

  const incomeByPropertyPlatform = useMemo(() => {
    return incomes.reduce<Record<string, number>>((acc, i) => {
      const key = `${i.property.name} • ${i.platform || "OTHER"}`;
      acc[key] = (acc[key] || 0) + i.amount;
      return acc;
    }, {});
  }, [incomes]);

  const reservationByIncomeId = useMemo(() => {
    return dirrectIncomes.reduce<Record<number, any>>((acc, r) => {
      if (r.incomeId) acc[r.incomeId] = r;
      return acc;
    }, {});
  }, [dirrectIncomes]);

  const incomesByProperty = useMemo(() => {
    return incomes.reduce<Record<string, any[]>>((acc, income) => {
      const propertyName = income.property.name;
      if (!acc[propertyName]) acc[propertyName] = [];
      acc[propertyName].push({
        ...income,
        reservation: reservationByIncomeId[income.id] || null,
      });
      return acc;
    }, {});
  }, [incomes, reservationByIncomeId]);

  if (propertiesLoading || incomesLoading || dirrectIncomesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-500">Loading income data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= FILTERS ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={propertyId}
            onChange={(e) =>
              setPropertyId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ViewType)}
            className="rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="range">Date Range</option>
          </select>

          {viewType === "monthly" && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}

          {viewType === "daily" && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}

          {viewType === "range" && (
            <>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>
      </div>

      {/* ================= TOTAL ================= */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm opacity-90">Total Income</h3>
          AED
        </div>
        <p className="text-4xl font-semibold mt-2">
          AED {totalIncome.toFixed(2)}
        </p>
      </div>

      {/* ================= BY PROPERTY + PLATFORM ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Income by Property & Platform</h3>

        {Object.keys(incomeByPropertyPlatform).length === 0 ? (
          <p className="text-sm text-gray-400">No data available</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(incomeByPropertyPlatform).map(([key, amount]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition"
              >
                <span className="text-sm text-gray-600">{key}</span>
                <span className="font-semibold text-gray-900">
                  AED {amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= BY PROPERTY ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Income by Property</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(incomeByProperty).map(([name, amount]) => (
            <div
              key={name}
              className="rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition"
            >
              <p className="text-sm text-gray-500">{name}</p>
              <p className="text-xl font-semibold">AED {amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= INCOME DETAILS ================= */}
      {Object.entries(incomesByProperty).map(([propertyName, items]) => (
        <div key={propertyName} className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">{propertyName}</h3>

          <div className="space-y-4">
            {items.map((income) => (
              <div
                key={income.id}
                className="rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(income.date).toLocaleDateString()}
                    </p>
                    <p className="font-semibold">
                      AED {income.amount.toFixed(2)} • {income.platform}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full font-bold text-blue-700">
                    #{income.id}
                  </span>
                </div>

                {income.reservation && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <strong>Guest:</strong> {income.reservation.guest?.name}
                    </p>
                    <p>
                      <strong>Room:</strong> {income.reservation.room?.name}
                    </p>
                  </div>
                )}

                {/* <button
                  onClick={() => deleteIncome(income.id)}
                  disabled={isDeletingIncome}
                  className="text-red-600 hover:underline text-sm mt-2"
                >
                  Delete
                </button> */}
              </div>
            ))}
          </div>
        </div>
      ))}

      <AddIncomeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        properties={properties}
      />
    </div>
  );
}
