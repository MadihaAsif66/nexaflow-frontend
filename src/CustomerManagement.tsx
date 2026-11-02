import { useEffect, useState } from "react";
import {
  Plus, Search, Pencil, Trash2,
  Users, X, Save, Loader2
} from "lucide-react";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: "Active" | "Inactive";
};

type CustomerForm = Omit<Customer, "_id">;

const API = "http://localhost:3000/api/customers";

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  status: "Active"
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Could not load customers");
      }

      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch {
      setError("Cannot connect to the customer API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(customer: Customer) {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      status: customer.status
    });

    setEditingId(customer._id);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function updateField(
    field: keyof CustomerForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function saveCustomer(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.city.trim()) {
      setError("Please complete all fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Unable to save customer"
        );
      }

      setMessage(
        editingId
          ? "Customer updated successfully!"
          : "Customer registered successfully!"
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Delete ${customer.name}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/${customer._id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Unable to delete customer");
      }

      setMessage("Customer deleted successfully!");
      await loadCustomers();
    } catch {
      setError("Customer could not be deleted.");
    }
  }

  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone} ${customer.city}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const fieldStyle =
    "w-full rounded-xl border border-white/15 " +
    "bg-[#11152b] px-4 py-3 text-white " +
    "outline-none focus:border-violet-400";

  return (
    <div className="space-y-6 text-white">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Customers",
            value: customers.length,
            color: "text-violet-400"
          },
          {
            title: "Active Customers",
            value: activeCount,
            color: "text-emerald-400"
          },
          {
            title: "Inactive Customers",
            value: customers.length - activeCount,
            color: "text-amber-400"
          }
        ].map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-white/10
              bg-[#222139] p-5"
          >
            <p className="text-sm text-slate-400">
              {stat.title}
            </p>
            <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10
        bg-[#222139] p-5">
        <div className="mb-5 flex flex-wrap items-center
          justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2
              text-lg font-semibold">
              <Users className="text-violet-400" />
              Customer Directory
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage customer records stored in MongoDB Atlas.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl
              bg-violet-600 px-4 py-3 text-sm font-medium
              hover:bg-violet-500"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>

        <div className="mb-5 flex max-w-md items-center
          gap-3 rounded-xl border border-white/15
          bg-[#11152b] px-4">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers..."
            className="w-full bg-transparent py-3
              text-sm text-white outline-none"
          />
        </div>

        {message && (
          <p className="mb-4 rounded-lg bg-emerald-500/10
            p-3 text-sm text-emerald-300">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10
            p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="flex items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin" size={18} />
            Loading customers...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10
                  text-xs uppercase text-slate-400">
                  <th className="px-3 py-4">Customer</th>
                  <th className="px-3 py-4">Phone</th>
                  <th className="px-3 py-4">City</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-white/5"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold">
                        {customer.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      {customer.phone}
                    </td>

                    <td className="px-3 py-4">
                      {customer.city}
                    </td>

                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1
                        text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}>
                        {customer.status}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(customer)}
                          className="rounded-lg bg-blue-500/15
                            p-2 text-blue-300"
                          title="Edit customer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => deleteCustomer(customer)}
                          className="rounded-lg bg-red-500/15
                            p-2 text-red-300"
                          title="Delete customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="py-8 text-center text-slate-400">
                No customers found.
              </p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex
          items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-2xl
            border border-white/15 bg-[#222139] p-6
            shadow-2xl">
            <div className="mb-6 flex items-center
              justify-between">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Edit Customer"
                  : "Register New Customer"}
              </h2>

              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="space-y-4">
              <input
                className={fieldStyle}
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                required
              />

              <input
                className={fieldStyle}
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                required
              />

              <input
                className={fieldStyle}
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                required
              />

              <input
                className={fieldStyle}
                placeholder="City"
                value={form.city}
                onChange={(e) =>
                  updateField("city", e.target.value)
                }
                required
              />

              <select
                className={fieldStyle}
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center
                  justify-center gap-2 rounded-xl
                  bg-violet-600 py-3 font-semibold
                  hover:bg-violet-500 disabled:opacity-50"
              >
                <Save size={18} />
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Customer"
                  : "Save Customer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}