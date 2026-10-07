import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useAuth } from "../AuthContext";
import {
  Alert,
  Card,
  PageHeader,
  StatusBadge,
  fmtDate,
  money,
  tdCls,
  thCls,
} from "../ui";

const FILTERS = [
  ["ALL", "All"],
  ["PENDING_APPROVAL", "Pending"],
  ["COMPLETED", "Completed"],
  ["REJECTED", "Rejected"],
];

export default function Orders() {
  const { isManager } = useAuth();
  const location = useLocation();
  const flash = location.state?.msg;

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((r) => setOrders(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  // so the message doesn't come back after a page refresh
  useEffect(() => {
    if (flash) window.history.replaceState({}, "");
  }, [flash]);

  const shown =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={isManager ? "All orders" : "Your orders"}
      >
        <Link
          to="/orders/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          New order
        </Link>
      </PageHeader>

      <Alert kind="ok">{flash}</Alert>
      <Alert>{error}</Alert>

      <div className="mb-4 flex gap-2">
        {FILTERS.map(([value, text]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === value
                ? "bg-ink text-white"
                : "border border-line bg-white text-muted hover:text-ink"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className={thCls}>Order</th>
              <th className={thCls}>Customer</th>
              <th className={thCls}>Items</th>
              {isManager && <th className={thCls}>Created by</th>}
              <th className={`${thCls} text-right`}>Total</th>
              <th className={thCls}>Status</th>
              <th className={thCls}>Date</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr
                key={o.id}
                className="border-b border-line align-top last:border-0"
              >
                <td className={`${tdCls} font-mono`}>#{o.id}</td>
                <td className={tdCls}>{o.customer.name}</td>
                <td className={`${tdCls} text-muted`}>
                  {o.items
                    .map((i) => `${i.product.name} × ${i.quantity}`)
                    .join(", ")}
                </td>
                {isManager && <td className={tdCls}>{o.creator.name}</td>}
                <td className={`${tdCls} text-right`}>
                  {money(o.total_amount)}
                </td>
                <td className={tdCls}>
                  <StatusBadge status={o.status} />
                  {o.approval?.remarks && (
                    <div className="mt-1 max-w-48 text-xs text-muted">
                      Manager note: {o.approval.remarks}
                    </div>
                  )}
                </td>
                <td className={`${tdCls} text-muted`}>
                  {fmtDate(o.created_at)}
                </td>
              </tr>
            ))}
            {!loading && shown.length === 0 && (
              <tr>
                <td
                  colSpan={isManager ? 7 : 6}
                  className="px-4 py-6 text-center text-muted"
                >
                  No orders to show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
