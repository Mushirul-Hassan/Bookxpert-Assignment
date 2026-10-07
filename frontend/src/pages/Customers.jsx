import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import {
  Alert,
  Btn,
  Card,
  PageHeader,
  inputCls,
  labelCls,
  tdCls,
  thCls,
} from "../ui";

const empty = { name: "", email: "", phone: "", address: "" };

export default function Customers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get("/customers")
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
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    };
    try {
      if (editId) await api.put(`/customers/${editId}`, payload);
      else await api.post("/customers", payload);
      setOk(editId ? "Customer updated" : "Customer added");
      reset();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const edit = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      address: c.address || "",
    });
    setOk("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${items.length} customers`} />

      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-serif text-lg font-bold">
          {editId ? `Edit customer #${editId}` : "Add customer"}
        </h2>
        <Alert>{error}</Alert>
        <Alert kind="ok">{ok}</Alert>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Name</label>
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={set("name")}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              required
              type="email"
              className={inputCls}
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <Btn type="submit" disabled={saving}>
              {saving ? "Saving..." : editId ? "Save changes" : "Add customer"}
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
              <th className={thCls}>Email</th>
              <th className={thCls}>Phone</th>
              <th className={thCls}>Address</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className={`${tdCls} font-mono text-muted`}>{c.id}</td>
                <td className={tdCls}>{c.name}</td>
                <td className={tdCls}>{c.email}</td>
                <td className={tdCls}>{c.phone}</td>
                <td className={tdCls}>{c.address}</td>
                <td className={`${tdCls} text-right`}>
                  <button
                    onClick={() => edit(c)}
                    className="text-brand hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
