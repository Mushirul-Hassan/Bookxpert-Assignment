import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
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

function Stat({ label, value, note }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-serif text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted">{note}</div>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setData(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <p className="text-muted">Loading...</p>;

  const { sales, orders, inventory, recent_orders } = data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview" />

      <div className="grid grid-cols-4 gap-4">
        <Stat
          label="Total sales"
          value={money(sales.total_sales)}
          note="From completed orders"
        />
        <Stat
          label="Pending approvals"
          value={orders.pending_approval}
          note="Waiting for a manager"
        />
        <Stat
          label="Completed orders"
          value={orders.completed}
          note={`${orders.total} orders in total`}
        />
        <Stat
          label="Products"
          value={inventory.total_products}
          note={`${inventory.total_units} units in stock`}
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="col-span-2 overflow-hidden">
          <div className="border-b border-line px-4 py-3 font-serif text-lg font-bold">
            Recent orders
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className={thCls}>Order</th>
                <th className={thCls}>Customer</th>
                <th className={`${thCls} text-right`}>Total</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className={`${tdCls} font-mono`}>#{o.id}</td>
                  <td className={tdCls}>{o.customer}</td>
                  <td className={`${tdCls} text-right`}>{money(o.total)}</td>
                  <td className={tdCls}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={`${tdCls} text-muted`}>
                    {fmtDate(o.created_at)}
                  </td>
                </tr>
              ))}
              {recent_orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-line px-4 py-3 font-serif text-lg font-bold">
            Low stock
          </div>
          <ul>
            {inventory.low_stock.map((p) => (
              <li
                key={p.id}
                className="flex justify-between border-b border-line px-4 py-3 last:border-0"
              >
                <span>{p.name}</span>
                <span className="font-medium text-red-600">{p.stock} left</span>
              </li>
            ))}
            {inventory.low_stock.length === 0 && (
              <li className="px-4 py-6 text-center text-muted">
                All products well stocked
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
