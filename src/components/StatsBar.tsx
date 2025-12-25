/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  total: number;
  occupied: number;
  available: number;
}

export const StatsBar = ({ total, occupied, available }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Stat label="Total" value={total} />
      <Stat label="Occupied" value={occupied} color="text-red-600" />
      <Stat label="Available" value={available} color="text-green-600" />
    </div>
  );
};

const Stat = ({ label, value, color = "" }: any) => (
  <div className="bg-white p-4 rounded-lg border text-center">
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);
