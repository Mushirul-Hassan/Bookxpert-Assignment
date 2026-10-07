import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import {
  Alert,
  Btn,
  Card,
  PageHeader,
  inputCls,
  labelCls,
  money,
  tdCls,
  thCls,
} from "../ui";

const empty = { name: "", price: "", stock: "" };
const LOW_STOCK = 5;

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get("/products")
      .then((r) => setItems(r.data))
      .catch((e) => setError(errorMessage(e)));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const reset = () => {
    setForm(empty);
    setEditId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock || 0),
    };
    try {
      if (editId) await api.put(`/products/${editId}`, payload);
      else await api.post("/products", payload);
      setOk(editId ? "Product updated" : "Product added");
      reset();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const edit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock) });
    setOk("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageHeader title="Products" subtitle={`${items.length} items`} />

      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-serif text-lg font-bold">
          {editId ? `Edit product #${editId}` : "Add product"}
        </h2>
        <Alert>{error}</Alert>
        <Alert kind="ok">{ok}</Alert>
        <form onSubmit={submit} className="grid grid-cols-4 items-end gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Name</label>
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={set("name")}
            />
          </div>
          <div>
            <label className={labelCls}>Price (₹)</label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              className={inputCls}
              value={form.price}
              onChange={set("price")}
            />
          </div>
          <div>
            <label className={labelCls}>Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              className={inputCls}
              value={form.stock}
              onChange={set("stock")}
            />
          </div>
          <div className="col-span-4 flex gap-2">
            <Btn type="submit" disabled={saving}>
              {saving ? "Saving..." : editId ? "Save changes" : "Add product"}
            </Btn>
            {editId && (
              <Btn type="button" variant="secondary" onClick={reset}>
                Cancel
              </Btn>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className={thCls}>ID</th>
              <th className={thCls}>Name</th>
              <th className={`${thCls} text-right`}>Price</th>
              <th className={`${thCls} text-right`}>Stock</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className={`${tdCls} font-mono text-muted`}>{p.id}</td>
                <td className={tdCls}>{p.name}</td>
                <td className={`${tdCls} text-right`}>{money(p.price)}</td>
                <td
                  className={`${tdCls} text-right ${p.stock <= LOW_STOCK ? "font-medium text-red-600" : ""}`}
                >
                  {p.stock}
                </td>
                <td className={`${tdCls} text-right`}>
                  <button
                    onClick={() => edit(p)}
                    className="text-brand hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
