import { useState } from "react";
import { Trash2, Users, Search } from "lucide-react";
import { useDeleteGuest } from "../hooks/useDeleteGuest";
import { useGuestList } from "../hooks/useGuestList";
import { confirmToast } from "../utility/ConfirmTost";

export default function Guests() {
  const [search, setSearch] = useState("");
  const { data: guests = [], isLoading } = useGuestList();
  const deleteGuestMutation = useDeleteGuest();

  const filteredGuests = guests.filter((g) =>
    `${g.name} ${g.nic} ${g.passport}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Guests</h1>
              <p className="text-gray-500">Manage all registered guests</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            placeholder="Search by name, NIC or passport"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading guests...
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No guests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-gray-600 font-medium">
                      Name
                    </th>
                    <th className="p-3 text-left text-gray-600 font-medium">
                      NIC / Passport
                    </th>
                    <th className="p-3 text-left text-gray-600 font-medium">
                      Contact
                    </th>
                    <th className="p-3 text-left text-gray-600 font-medium">
                      Country
                    </th>
                    <th className="p-3 text-right text-gray-600 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredGuests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {guest.name}
                      </td>
                      <td className="p-3 text-gray-600">
                        {guest.nic || guest.passport || "-"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {guest.contactNo || "-"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {guest.country || "-"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          disabled={deleteGuestMutation.isPending}
                          onClick={() =>
                            confirmToast({
                              title: "Delete Guest",
                              message: `Are you sure you want to delete ${guest.name}?`,
                              confirmText: "Delete",
                              onConfirm: () =>
                                deleteGuestMutation.mutate(guest.id),
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
