/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayoutRow {
  referenceNumber: string;
  net: number;
}

interface ReservationRow {
  bookNumber: string;
  unitType: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
}

interface MergedRow {
  bookingNo: string;
  unitType: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  net: number;
}

interface Report {
  id: string;
  title: string;
  merged: MergedRow[];
  totalsByUnit: Record<string, number>;
  grandTotal: number;
  createdAt: string;
}

const normalizeUnitType = (unitType: string): string => {
  if (!unitType) return "UNKNOWN";
  const value = unitType.toLowerCase();
  if (value.includes("superior single room") || value.includes("superior"))
    return "Superior";
  if (value.includes("queen")) return "Queen";
  if (value.includes("deluxe")) return "Deluxe";
  return "Other";
};

const UnitTypeReport: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [merged, setMerged] = useState<MergedRow[]>([]);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [reportTitle, setReportTitle] = useState("");
  const [reports, setReports] = useState<Report[]>([]);

  // File reading
  const readFile = (file: File): Promise<any[]> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet));
      };
      reader.readAsBinaryString(file);
    });

  // Upload handlers
  const handlePayoutUpload = async (file: File) => {
    const raw = await readFile(file);
    setPayouts(
      raw.map((r: any) => ({
        referenceNumber: String(r["Reference number"]).trim(),
        net: Number(r["Net"] || 0),
      }))
    );
    setMerged([]);
  };

  const handleReservationUpload = async (file: File) => {
    const raw = await readFile(file);
    setReservations(
      raw.map((r: any) => ({
        bookNumber: String(r["Book number"]).trim(),
        unitType: r["Unit type"] || "",
        guestName: r["Guest name(s)"] || "—",
        checkIn: r["Check-in"] || "—",
        checkOut: r["Check-out"] || "—",
        rooms: Number(r["Rooms"] || 1),
      }))
    );
    setMerged([]);
  };

  // Merge payouts and reservations
  const mergeData = () => {
    if (!reportTitle.trim()) {
      alert("Please enter a topic/title for the report");
      return;
    }

    const map = new Map<string, ReservationRow>();
    reservations.forEach((r) => map.set(r.bookNumber, r));

    const mergedRows: MergedRow[] = payouts.map((p) => {
      const r = map.get(p.referenceNumber);
      return {
        bookingNo: p.referenceNumber,
        net: p.net,
        unitType: normalizeUnitType(r?.unitType || ""),
        guestName: r?.guestName || "—",
        checkIn: r?.checkIn || "—",
        checkOut: r?.checkOut || "—",
        rooms: r?.rooms || 0,
      };
    });

    const totalsByUnit = mergedRows.reduce<Record<string, number>>((acc, r) => {
      acc[r.unitType] = (acc[r.unitType] || 0) + r.net;
      return acc;
    }, {});

    const grandTotal = mergedRows.reduce((s, r) => s + r.net, 0);

    const newReport: Report = {
      id: crypto.randomUUID(),
      title: reportTitle,
      merged: mergedRows,
      totalsByUnit,
      grandTotal,
      createdAt: new Date().toLocaleDateString(),
    };

    setReports((prev) => [...prev, newReport]);
    setMerged(mergedRows);
    setReportTitle(""); // clear input
  };

  // Filters
  const filtered = useMemo(() => {
    return merged.filter((r) => {
      const matchSearch =
        r.guestName.toLowerCase().includes(search.toLowerCase()) ||
        r.bookingNo.toLowerCase().includes(search.toLowerCase());
      const matchUnit = unitFilter === "ALL" || r.unitType === unitFilter;
      return matchSearch && matchUnit;
    });
  }, [merged, search, unitFilter]);

  const totalsByUnit = useMemo(() => {
    return merged.reduce<Record<string, number>>((acc, r) => {
      acc[r.unitType] = (acc[r.unitType] || 0) + r.net;
      return acc;
    }, {});
  }, [merged]);

  const grandTotal = merged.reduce((s, r) => s + r.net, 0);
  const unitTypes = ["ALL", ...Object.keys(totalsByUnit)];

  const overallTotals = useMemo(() => {
    return reports.reduce<Record<string, number>>((acc, report) => {
      Object.entries(report.totalsByUnit).forEach(([unit, total]) => {
        acc[unit] = (acc[unit] || 0) + total;
      });
      return acc;
    }, {});
  }, [reports]);

  const overallGrandTotal = reports.reduce((s, r) => s + r.grandTotal, 0);

  // PDF Generation
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const BRAND_COLOR: [number, number, number] = [33, 64, 154];

    const drawHeader = () => {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND_COLOR);
      doc.text("Majestic Town Real Estate - L.L.C - S.P.C", 105, 15, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(
        "Al Khalidiya, Abu Dhabi | info@majestictown.ae | +971 54 757 5749",
        105,
        23,
        { align: "center" }
      );

      doc.setDrawColor(180);
      doc.line(14, 28, 196, 28);
    };

    reports.forEach((report, index) => {
      if (index > 0) doc.addPage();
      drawHeader();

      let y = 35;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND_COLOR);
      doc.text(`${report.title} - Generated: ${report.createdAt}`, 105, y, {
        align: "center",
      });
      y += 10;

      const summaryRows = Object.entries(report.totalsByUnit).map(
        ([unit, total]) => [unit, total.toFixed(2)]
      );
      autoTable(doc, {
        startY: y,
        head: [["Unit Type", "Total Net (AED)"]],
        body: summaryRows,
        theme: "grid",
        headStyles: {
          fillColor: BRAND_COLOR,
          textColor: 255,
          fontStyle: "bold",
          fontSize: 12,
        },
        styles: { fontSize: 12, cellPadding: 4 },
        columnStyles: { 1: { halign: "right" } },
      });

      y = (doc as any).lastAutoTable.finalY + 6;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND_COLOR);
      doc.text(`Report Total: AED ${report.grandTotal.toFixed(2)}`, 196, y, {
        align: "right",
      });

      y += 10;
      autoTable(doc, {
        startY: y,
        head: [
          [
            "Guest",
            "Booking",
            "Unit",
            "Check-in",
            "Check-out",
            "Rooms",
            "Net (AED)",
          ],
        ],
        body: report.merged.map((r) => [
          r.guestName,
          r.bookingNo,
          r.unitType,
          r.checkIn,
          r.checkOut,
          r.rooms,
          r.net.toFixed(2),
        ]),
        theme: "grid",
        headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontSize: 10 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 5: { halign: "center" }, 6: { halign: "right" } },
      });
    });

    // Overall totals
    doc.addPage();
    drawHeader();
    let y = 35;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_COLOR);
    doc.text("OVERALL TOTALS", 105, y, { align: "center" });
    y += 10;

    const overallRows = Object.entries(overallTotals).map(([unit, total]) => [
      unit,
      total.toFixed(2),
    ]);
    autoTable(doc, {
      startY: y,
      head: [["Unit Type", "Total Net (AED)"]],
      body: overallRows,
      theme: "grid",
      headStyles: {
        fillColor: BRAND_COLOR,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 12,
      },
      styles: { fontSize: 12, cellPadding: 4 },
      columnStyles: { 1: { halign: "right" } },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_COLOR);
    doc.text(
      `OVERALL GRAND TOTAL: AED ${overallGrandTotal.toFixed(2)}`,
      196,
      y,
      { align: "right" }
    );

    doc.save("unit-income-summary.pdf");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Payout & Reservation Report</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Upload Payout File</h2>
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={(e) =>
              e.target.files && handlePayoutUpload(e.target.files[0])
            }
          />
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Upload Reservation File</h2>
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={(e) =>
              e.target.files && handleReservationUpload(e.target.files[0])
            }
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <input
          className="px-4 py-2 border rounded-lg flex-1"
          placeholder="Report title/topic (e.g. Week 01: Jan 1–7)"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
        />
        <button
          onClick={mergeData}
          disabled={!payouts.length || !reservations.length}
          className="px-6 py-2 bg-black text-white rounded-lg disabled:opacity-40"
        >
          Generate Report
        </button>

        {merged.length > 0 && (
          <button
            onClick={generatePDF}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Export PDF
          </button>
        )}
      </div>

      {/* Summary Totals */}
      {merged.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-green-100 p-4 rounded-xl shadow">
            <p className="text-gray-600 text-sm">Grand Total</p>
            <p className="text-2xl font-bold text-green-800">
              AED {grandTotal.toFixed(2)}
            </p>
          </div>

          {Object.entries(totalsByUnit).map(([unit, total]) => (
            <div key={unit} className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500 text-sm">{unit}</p>
              <p className="text-xl font-semibold">AED {total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Overall Totals */}
      {reports.length > 1 && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4 mt-6">
          <h2 className="text-xl font-bold">All Reports Summary</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Overall Grand Total</p>
              <p className="text-2xl font-bold text-blue-800">
                AED {overallGrandTotal.toFixed(2)}
              </p>
            </div>

            {Object.entries(overallTotals).map(([unit, total]) => (
              <div key={unit} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">{unit}</p>
                <p className="text-xl font-semibold">AED {total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {merged.length > 0 && (
        <>
          <div className="flex gap-3 mt-4">
            <input
              className="px-4 py-2 border rounded-lg flex-1"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="px-4 py-2 border rounded-lg"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              {unitTypes.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="overflow-auto bg-white rounded-xl shadow mt-4">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Guest</th>
                  <th className="p-3">Booking</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Check-in</th>
                  <th className="p-3">Check-out</th>
                  <th className="p-3">Rooms</th>
                  <th className="p-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{r.guestName}</td>
                    <td className="p-3 text-center">{r.bookingNo}</td>
                    <td className="p-3 text-center">{r.unitType}</td>
                    <td className="p-3 text-center">{r.checkIn}</td>
                    <td className="p-3 text-center">{r.checkOut}</td>
                    <td className="p-3 text-center">{r.rooms}</td>
                    <td className="p-3 text-right font-semibold">
                      {r.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Saved Reports */}
      {reports.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-xl font-bold mb-4">Saved Reports</h2>
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-gray-500">
                    {r.createdAt} — AED {r.grandTotal.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setMerged(r.merged)}
                  className="px-4 py-1 bg-gray-800 text-white rounded"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UnitTypeReport;
