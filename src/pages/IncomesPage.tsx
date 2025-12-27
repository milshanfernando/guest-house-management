/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { useProperties } from "../hooks/useProperties";
import { useIncomes } from "../hooks/useIncomes";
import { useReservations } from "../hooks/useReservations";
import { useDeleteIncome } from "../hooks/useDeleteIncome";
import { AddIncomeModal } from "../components/AddIncomeModal";

type ViewType = "monthly" | "daily" | "range";

/* ================= NIGHT CALCULATION ================= */
function calculateNights(
  checkIn?: string | null,
  checkOut?: string | null
): number | null {
  if (!checkIn || !checkOut) return null;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return nights > 0 ? nights : null;
}

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

  /* ================= QUERY PARAMS ================= */
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

  const { data: reservations = [] } = useReservations(
    params.fromDate!,
    params.toDate!,
    params.propertyId
  );

  const { mutate: deleteIncome, isPending: isDeletingIncome } =
    useDeleteIncome();

  /* ================= MAP RESERVATIONS ================= */
  const reservationMap = useMemo(() => {
    return reservations.reduce<Record<number, any>>((acc, r) => {
      if (r.incomeId) acc[r.incomeId] = r;
      return acc;
    }, {});
  }, [reservations]);

  /* ================= GROUP BY PROPERTY ================= */
  const incomesByProperty = useMemo(() => {
    return incomes.reduce<
      Record<
        string,
        {
          total: number;
          platformTotals: Record<string, number>;
          items: any[];
        }
      >
    >((acc, income) => {
      const propertyName = income.property.name;
      const platform = income.platform || "OTHER";

      if (!acc[propertyName]) {
        acc[propertyName] = {
          total: 0,
          platformTotals: {},
          items: [],
        };
      }

      acc[propertyName].total += income.amount;
      acc[propertyName].platformTotals[platform] =
        (acc[propertyName].platformTotals[platform] || 0) + income.amount;

      acc[propertyName].items.push({
        ...income,
        reservation: reservationMap[income.id] || null,
      });

      return acc;
    }, {});
  }, [incomes, reservationMap]);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );

  if (propertiesLoading || incomesLoading) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        Loading income data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= FILTERS ================= */}
      <div className="bg-white rounded-xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={propertyId}
            onChange={(e) =>
              setPropertyId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="rounded-lg px-3 py-2 bg-gray-50 border"
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
            className="rounded-lg px-3 py-2 bg-gray-50 border"
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
              className="rounded-lg px-3 py-2 bg-gray-50 border"
            />
          )}

          {viewType === "daily" && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg px-3 py-2 bg-gray-50 border"
            />
          )}

          {viewType === "range" && (
            <>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg px-3 py-2 bg-gray-50 border"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg px-3 py-2 bg-gray-50 border"
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>
      </div>

      {/* ================= TOTAL ================= */}
      <div>
        <p className="text-sm text-gray-500">Total Income</p>
        <p className="text-3xl font-semibold text-gray-900">
          AED {totalIncome.toFixed(2)}
        </p>
      </div>

      {/* ================= PROPERTY SECTIONS ================= */}
      {Object.entries(incomesByProperty).map(
        ([propertyName, { total, platformTotals, items }]) => (
          <div key={propertyName} className="space-y-4">
            {/* PROPERTY HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold">{propertyName}</h3>
                <div className="h-0.5 w-12 bg-blue-600 rounded-full mt-1" />
                <p className="text-sm text-gray-500 mt-1">
                  Total:{" "}
                  <span className="font-medium text-gray-800">
                    AED {total.toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(platformTotals).map(([platform, amount]) => (
                  <span
                    key={platform}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100"
                  >
                    {platform}: AED {amount.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            {/* RECORDS */}
            <div className="divide-y bg-white rounded-xl shadow-sm">
              {items.map((income) => {
                const r = income.reservation;

                return (
                  <div
                    key={income.id}
                    className="py-4 pl-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/40 to-transparent hover:from-blue-100/60 transition rounded-r-xl"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-500">
                          {new Date(income.date).toLocaleDateString()}
                        </p>

                        <p className="font-semibold text-gray-900 text-base">
                          AED {income.amount.toFixed(2)}
                          <span className="text-gray-500 font-normal text-sm">
                            {" "}
                            • {income.platform || "OTHER"}
                          </span>
                        </p>

                        {r && (
                          <div className="mt-2 p-3 rounded-lg bg-white  space-y-0.5">
                            <p>
                              Guest:{" "}
                              <span className="font-medium text-gray-800">
                                {r.guest?.name || "N/A"}
                              </span>
                            </p>
                            <p>
                              Room:{" "}
                              <span className="font-medium text-gray-800">
                                {r.room?.name || "N/A"}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Stay:{" "}
                              {new Date(r.checkInDateTime).toLocaleDateString()}{" "}
                              →{" "}
                              {new Date(
                                r.checkOutDateTime
                              ).toLocaleDateString()}{" "}
                              <span className="text-gray-500">
                                (
                                {calculateNights(
                                  r.checkInDateTime,
                                  r.checkOutDateTime
                                )}{" "}
                                nights)
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteIncome(income.id)}
                        disabled={isDeletingIncome}
                        className="text-red-500 hover:text-red-700 text-sm font-medium mx-5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      <AddIncomeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        properties={properties}
      />
    </div>
  );
}
