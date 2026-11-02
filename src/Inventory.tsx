
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Save, Loader2, Package } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
};

type ProductForm = Omit<Product, "_id">;

const API = `${import.meta.env.VITE_API_URL}/api/inventory`;

const emptyForm: ProductForm = {
  name: "",
  price: 0,
  stock: 0,
  description: ""
};

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error();
      setProducts(await response.json());
    } catch {
      setError("Cannot connect to the inventory API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || ""
    });
    setEditingId(product._id);
    setError("");
    setShowForm(true);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
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
        throw new Error(data.message || "Unable to save product");
      }

      setMessage(editingId ? "Product updated successfully!" : "Product added successfully!");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${product._id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error();

      setMessage("Product deleted successfully!");
      await loadProducts();
    } catch {
      setError("Product could not be deleted.");
    }
  }

  const filtered = products.filter(product =>
    `${product.name} ${product.description}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter(product => product.stock < 10).length;

  const fieldStyle =
    "w-full rounded-xl border border-white/15 bg-[#11152b] px-4 py-3 text-white outline-none focus:border-violet-400";

  return (
    <div className="space-y-6 text-white">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Total Products", value: products.length, color: "text-violet-400" },
          { title: "Total Units", value: products.reduce((sum, p) => sum + p.stock, 0), color: "text-emerald-400" },
          { title: "Low Stock Items", value: lowStock, color: "text-amber-400" }
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
              <Package className="text-violet-400" /> Inventory Management
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage products and stock stored in MongoDB Atlas.
            </p>
          </div>

          <button onClick={openAddForm} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm hover:bg-violet-500">
            <Plus size={18} /> Add Product
          </button>
        </div>

        <div className="mb-5 flex max-w-md items-center gap-3 rounded-xl border border-white/15 bg-[#11152b] px-4">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-transparent py-3 text-sm text-white outline-none" />
        </div>

        {message && <p className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {loading ? (
          <p className="flex items-center gap-2 text-slate-400"><Loader2 size={18} className="animate-spin" /> Loading inventory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Price</th>
                  <th className="px-3 py-4">Stock</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product._id} className="border-b border-white/5">
                    <td className="px-3 py-4">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.description}</p>
                    </td>
                    <td className="px-3 py-4">PKR {Number(product.price).toLocaleString()}</td>
                    <td className="px-3 py-4">{product.stock} units</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${
                        product.stock < 10
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}>
                        {product.stock < 10 ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditForm(product)} className="rounded-lg bg-blue-500/15 p-2 text-blue-300"><Pencil size={16} /></button>
                        <button onClick={() => deleteProduct(product)} className="rounded-lg bg-red-500/15 p-2 text-red-300"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-8 text-center text-slate-400">No products found.</p>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#222139] p-6 shadow-2xl">
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <form onSubmit={saveProduct} className="space-y-4">
              <input className={fieldStyle} placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className={fieldStyle} type="number" min="0" placeholder="Price (PKR)" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
              <input className={fieldStyle} type="number" min="0" step="1" placeholder="Available Stock" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} required />
              <textarea className={fieldStyle} placeholder="Product Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />

              <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
                <Save size={18} /> {saving ? "Saving..." : editingId ? "Update Product" : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
