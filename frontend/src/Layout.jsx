import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Item({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "bg-white text-brand" : "text-white/85 hover:bg-white/10"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, isManager } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-brand p-4 text-white">
        <div className="mb-6 px-1">
          <div className="font-serif text-lg font-bold leading-tight">
            Sales & Inventory
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            Management system
          </div>
        </div>

        <nav className="space-y-1">
          <Item to="/" end>Dashboard</Item>
          <Item to="/products">Products</Item>
          <Item to="/customers">Customers</Item>
          <Item to="/orders">Orders</Item>
          {isManager && <Item to="/approvals">Approvals</Item>}
        </nav>

        <div className="mt-auto rounded-lg bg-white/10 p-3">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-white/70">
            {user?.role}
          </div>
          <button
            onClick={logout}
            className="text-sm underline underline-offset-2 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}