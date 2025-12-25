import { useState } from "react";
import { X } from "lucide-react";
import { useReservationPayment } from "../hooks/useReservationPayment";

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

  const [amount, setAmount] = useState<number>(0);
  const [platform, setPlatform] = useState<"BOOKING" | "DIRECT" | "AIRBNB">(
    "DIRECT"
  );
  const [note, setNote] = useState("");

  if (!open) return null;

  const submit = () => {
    mutate(
      {
        reservationId,
        propertyId,
        date: new Date().toISOString().slice(0, 10),
        amount,
        platform,
        note,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Make Payment</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />

        <select
          value={platform}
          onChange={(e) =>
            setPlatform(e.target.value as "BOOKING" | "DIRECT" | "AIRBNB")
          }
          className="w-full px-3 py-2 border rounded"
        >
          <option value="DIRECT">DIRECT</option>
          <option value="BOOKING">BOOKING</option>
          <option value="AIRBNB">AIRBNB</option>
        </select>

        <textarea
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <button
          disabled={isPending}
          onClick={submit}
          className="w-full py-2 bg-green-600 text-white rounded"
        >
          Save Payment
        </button>
      </div>
    </div>
  );
}
