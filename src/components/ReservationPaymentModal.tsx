import { useState } from "react";
import { X, Calendar, CreditCard } from "lucide-react";
import { useReservationPayment } from "../hooks/useReservationPayment";

type Platform = "DIRECT" | "BOOKING" | "AIRBNB";

interface Props {
  open: boolean;
  onClose: () => void;
  reservationId: number;
  propertyId: number;
}

export function ReservationPaymentModal({
  open,
  onClose,
  reservationId,
  propertyId,
}: Props) {
  const { mutate, isPending } = useReservationPayment();

  const [amount, setAmount] = useState("");
  const [platform, setPlatform] = useState<Platform>("DIRECT");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  if (!open) return null;

  const submit = () => {
    if (!amount) return;

    mutate(
      {
        reservationId,
        propertyId,
        date,
        amount: Number(amount),
        platform,
        note,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Add Payment</h3>
            <p className="text-sm text-gray-500">
              Record a payment for this reservation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AMOUNT */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">
            Amount (AED)
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* DATE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">
            Payment Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* PLATFORM */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Payment Platform
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(["DIRECT", "BOOKING", "AIRBNB"] as Platform[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`py-2 rounded-xl border text-sm font-medium transition
                  ${
                    platform === p
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* NOTE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">
            Note (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* ACTION */}
        <button
          disabled={isPending || !amount}
          onClick={submit}
          className="w-full py-2.5 rounded-xl bg-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Payment"}
        </button>
      </div>
    </div>
  );
}
