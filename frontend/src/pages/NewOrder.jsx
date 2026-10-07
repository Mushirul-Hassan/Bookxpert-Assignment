import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { Alert, Btn, Card, PageHeader, inputCls, labelCls, money } from "../ui";

export default function NewOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [threshold, setThreshold] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [rows, setRows] = useState([{ productId: "", qty: 1 }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/customers"),
      api.get("/products"),
      api.get("/orders/config"),
    ])
      .then(([c, p, cfg]) => {
        setCustomers(c.data);
        setProducts(p.data);
        setThreshold(cfg.data.approval_threshold);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const byId = useMemo(
    () => Object.fromEntries(products.map((p) => [String(p.id), p])),
    [products],
  );

  const setRow = (i, patch) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows([...rows, { productId: "", qty: 1 }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const lines = rows.map((r) => {
    const product = byId[r.productId];
    const qty = Number(r.qty) || 0;
    return {
      ...r,
      product,
      qty,
      total: product ? product.price * qty : 0,
      tooMany: product ? qty > product.stock : false,
    };
  });

  const total = lines.reduce((sum, l) => sum + l.total, 0);
  const needsApproval = threshold !== null && total > threshold;
  const valid =
    customerId && lines.every((l) => l.product && l.qty >= 1 && !l.tooMany);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.post("/orders", {
        customer_id: Number(customerId),
        items: lines.map((l) => ({
          product_id: Number(l.productId),
          quantity: l.qty,
        })),
      });
      const msg =
        data.status === "PENDING_APPROVAL"
          ? `Order #${data.id} was sent to a manager for approval`
          : `Order #${data.id} was completed`;
      navigate("/orders", { state: { msg } });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="New order" subtitle="Sales order" />
      <Alert>{error}</Alert>

      <form onSubmit={submit}>
        <Card className="mb-6 p-5">
          <label className={labelCls}>Customer</label>
          <select
            required
            className={inputCls}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <p className="mt-2 text-sm text-muted">
              No customers yet. Add one on the Customers page first.
            </p>
          )}
        </Card>

        <Card className="mb-6 p-5">
          <h2 className="mb-4 font-serif text-lg font-bold">Items</h2>

          <div className="space-y-3">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 items-start gap-3">
                <div className="col-span-6">
                  <select
                    required
                    className={inputCls}
                    value={rows[i].productId}
                    onChange={(e) => setRow(i, { productId: e.target.value })}
                  >
                    <option value="">Select a product</option>
                    {products
                      .filter(
                        (p) =>
                          String(p.id) === rows[i].productId ||
                          !rows.some(
                            (r, idx) =>
                              idx !== i && r.productId === String(p.id),
                          ),
                      )
                      .map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.stock === 0}
                        >
                          {p.name}
                          {p.stock === 0 ? " (out of stock)" : ""}
                        </option>
                      ))}
                  </select>
                  {l.product && (
                    <p
                      className={`mt-1 text-xs ${l.tooMany ? "text-red-600" : "text-muted"}`}
                    >
                      {l.tooMany
                        ? `Only ${l.product.stock} in stock`
                        : `In stock: ${l.product.stock} · ${money(l.product.price)} each`}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    className={inputCls}
                    value={rows[i].qty}
                    onChange={(e) => setRow(i, { qty: e.target.value })}
                  />
                </div>

                <div className="col-span-3 pt-2 text-right font-medium">
                  {money(l.total)}
                </div>

                <div className="col-span-1 pt-2 text-right">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Btn
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={addRow}
          >
            Add another product
          </Btn>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Order total
            </span>
            <span className="font-serif text-2xl font-bold">
              {money(total)}
            </span>
          </div>

          {total > 0 && (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                needsApproval
                  ? "bg-amber-50 text-amber-800"
                  : "bg-green-50 text-green-800"
              }`}
            >
              {needsApproval
                ? `This order is above ${money(threshold)} and needs manager approval. Stock is deducted only after it is approved.`
                : "This order will be completed immediately."}
            </p>
          )}
        </Card>

        <div className="flex gap-2">
          <Btn type="submit" disabled={!valid || saving}>
            {saving ? "Placing order..." : "Place order"}
          </Btn>
          <Btn
            type="button"
            variant="secondary"
            onClick={() => navigate("/orders")}
          >
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
