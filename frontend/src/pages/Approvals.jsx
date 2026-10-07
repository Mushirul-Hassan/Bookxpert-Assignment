import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import {
  Alert,
  Btn,
  Card,
  PageHeader,
  fmtDate,
  inputCls,
  labelCls,
  money,
  tdCls,
  thCls,
} from "../ui";

function ApprovalCard({ order, onDone }) {
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const decide = async (action) => {
    setError("");
    setBusy(true);
    try {
      await api.post(`/approvals/${order.id}/${action}`, {
        remarks: remarks.trim() || null,
      });
      onDone(
        `Order #${order.id} ${action === "approve" ? "approved and completed" : "rejected"}`,
      );
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex items-start justify-between border-b border-line p-5">
        <div>
          <h2 className="font-serif text-xl font-bold">Order #{order.id}</h2>
          <p className="mt-1 text-sm">
            {order.customer.name}
            <span className="text-muted">
              {" "}
              · created by {order.creator.name}
            </span>
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted">
            {fmtDate(order.created_at)}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Total
          </div>
          <div className="font-serif text-2xl font-bold">
            {money(order.total_amount)}
          </div>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-line">
            <th className={thCls}>Product</th>
            <th className={`${thCls} text-right`}>Qty</th>
            <th className={`${thCls} text-right`}>Unit price</th>
            <th className={`${thCls} text-right`}>Line total</th>
            <th className={`${thCls} text-right`}>Stock now</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => {
            const short = i.product.stock < i.quantity;
            return (
              <tr
                key={i.product_id}
                className="border-b border-line last:border-0"
              >
                <td className={tdCls}>{i.product.name}</td>
                <td className={`${tdCls} text-right`}>{i.quantity}</td>
                <td className={`${tdCls} text-right`}>{money(i.unit_price)}</td>
                <td className={`${tdCls} text-right`}>{money(i.line_total)}</td>
                <td
                  className={`${tdCls} text-right ${short ? "font-medium text-red-600" : ""}`}
                >
                  {i.product.stock}
                  {short && " (short)"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-line bg-page/60 p-5">
        <Alert>{error}</Alert>
        <label className={labelCls}>Remarks (optional)</label>
        <textarea
          rows={2}
          maxLength={500}
          className={inputCls}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Reason for your decision"
        />
        <div className="mt-3 flex gap-2">
          <Btn
            variant="success"
            disabled={busy}
            onClick={() => decide("approve")}
          >
            Approve
          </Btn>
          <Btn
            variant="danger"
            disabled={busy}
            onClick={() => decide("reject")}
          >
            Reject
          </Btn>
        </div>
      </div>
    </Card>
  );
}

export default function Approvals() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get("/approvals/pending")
      .then((r) => setOrders(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const done = (msg) => {
    setMessage(msg);
    load();
  };

  return (
    <div>
      <PageHeader title="Approvals" subtitle={`${orders.length} waiting`} />
      <Alert kind="ok">{message}</Alert>
      <Alert>{error}</Alert>

      {orders.map((o) => (
        <ApprovalCard key={o.id} order={o} onDone={done} />
      ))}

      {!loading && orders.length === 0 && (
        <Card className="p-8 text-center text-muted">
          No orders are waiting for approval.
        </Card>
      )}
    </div>
  );
}
