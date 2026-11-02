
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Save, Loader2, ShoppingBag } from "lucide-react";

type Order = {
  _id: string;
  orderId: string;
  customer: string;
  amount: number;
  status: "Pending" | "Processing" | "Completed";
};

type OrderForm = Omit<Order, "_id">;

const API = `${import.meta.env.VITE_API_URL}/api/orders`;

const emptyForm: OrderForm = {
  orderId: "",
  customer: "",
  amount: 0,
  status: "Pending"
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error();
      setOrders(await response.json());
    } catch {
      setError("Cannot connect to the orders API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function openAddForm() {
    setForm({
      ...emptyForm,
      orderId: `NX-${Date.now().toString().slice(-8)}`
    });
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(order: Order) {
    setForm({
      orderId: order.orderId,
      customer: order.customer,
      amount: order.amount,
      status: order.status
    });
    setEditingId(order._id);
    setError("");
    setShowForm(true);
  }

  async function saveOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to save order");
      }

      setMessage(editingId ? "Order updated successfully!" : "Order added successfully!");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrder(order: Order) {
    if (!window.confirm(`Delete ${order.orderId}?`)) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${order._id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error();

      setMessage("Order deleted successfully!");
      await loadOrders();
    } catch {
      setError("Order could not be deleted.");
    }
  }

  const filtered = orders.filter((order) =>
    `${order.orderId} ${order.customer} ${order.status}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const fieldStyle =
    "w-full rounded-xl border border-white/15 bg-[#11152b] px-4 py-3 text-white outline-none focus:border-violet-400";

  return (
    <div className="space-y-6 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Orders", value: orders.length, color: "text-violet-400" },
          { title: "Completed", value: orders.filter(o => o.status === "Completed").length, color: "text-emerald-400" },
          { title: "Pending", value: orders.filter(o => o.status === "Pending").length, color: "text-amber-400" }
        ].map(stat => (
          <div key={stat.title} className="rounded-2xl border border-white/10 bg-[#222139] p-5">
            <p className="text-sm text-slate-400">{stat.title}</p>
            <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#222139] p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="text-violet-400" />
              Order Management
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage orders stored in MongoDB Atlas.
            </p>
          </div>

          <button onClick={openAddForm} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm hover:bg-violet-500">
            <Plus size={18} /> Add Order
          </button>
        </div>

        <div className="mb-5 flex max-w-md items-center gap-3 rounded-xl border border-white/15 bg-[#11152b] px-4">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full bg-transparent py-3 text-sm text-white outline-none" />
        </div>

        {message && <p className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {loading ? (
          <p className="flex items-center gap-2 text-slate-400"><Loader2 size={18} className="animate-spin" /> Loading orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <th className="px-3 py-4">Order ID</th>
                  <th className="px-3 py-4">Customer</th>
                  <th className="px-3 py-4">Amount</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id} className="border-b border-white/5">
                    <td className="px-3 py-4 font-semibold text-violet-300">{order.orderId}</td>
                    <td className="px-3 py-4">{order.customer}</td>
                    <td className="px-3 py-4">PKR {Number(order.amount).toLocaleString()}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${
                        order.status === "Completed" ? "bg-emerald-500/15 text-emerald-300" :
                        order.status === "Processing" ? "bg-blue-500/15 text-blue-300" :
                        "bg-amber-500/15 text-amber-300"
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditForm(order)} className="rounded-lg bg-blue-500/15 p-2 text-blue-300"><Pencil size={16} /></button>
                        <button onClick={() => deleteOrder(order)} className="rounded-lg bg-red-500/15 p-2 text-red-300"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-8 text-center text-slate-400">No orders found.</p>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#222139] p-6 shadow-2xl">
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-bold">{editingId ? "Edit Order" : "Add New Order"}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <form onSubmit={saveOrder} className="space-y-4">
              <input className={fieldStyle} value={form.orderId} readOnly placeholder="Order ID" />
              <input className={fieldStyle} placeholder="Customer Name" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required />
              <input className={fieldStyle} type="number" min="0" placeholder="Amount (PKR)" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required />
              <select className={fieldStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as OrderForm["status"] })}>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>

              <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
                <Save size={18} /> {saving ? "Saving..." : editingId ? "Update Order" : "Save Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
