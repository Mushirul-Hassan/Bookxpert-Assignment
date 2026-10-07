import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./Layout";
import Login from "./pages/Login";

const Soon = ({ title }) => (
  <h1 className="font-serif text-2xl font-bold">{title}</h1>
);

function Protected({ children, managerOnly = false }) {
  const { user, isManager } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (managerOnly && !isManager) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Soon title="Dashboard" />} />
        <Route path="/products" element={<Soon title="Products" />} />
        <Route path="/customers" element={<Soon title="Customers" />} />
        <Route path="/orders" element={<Soon title="Orders" />} />
        <Route
          path="/approvals"
          element={
            <Protected managerOnly>
              <Soon title="Approvals" />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}