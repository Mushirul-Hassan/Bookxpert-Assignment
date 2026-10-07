// export const inputCls =
//   "w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-brand";
// export const labelCls =
//   "mb-1 block font-mono text-[11px] text-muted";
// export const thCls =
//   "px-4 py-2.5 text-left font-mono text-[11px] font-medium text-muted";
// export const tdCls = "px-4 py-3";

// export const money = (n) =>
//   "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// export const fmtDate = (s) => {
//   if (!s) return "";
//   return new Date(s.endsWith("Z") ? s : s + "Z").toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// export function PageHeader({ title, subtitle, children }) {
//   return (
//     <div className="mb-6 flex items-end justify-between">
//       <div>
//         <h1 className="font-serif text-2xl font-bold">{title}</h1>
//         {subtitle && (
//           <p className="mt-1 font-mono text-xs text-muted">
//             {subtitle}
//           </p>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// export const Card = ({ className = "", children }) => (
//   <div className={`rounded-xl border border-line bg-white ${className}`}>
//     {children}
//   </div>
// );

// export function Btn({ variant = "primary", className = "", ...props }) {
//   const styles = {
//     primary: "bg-brand text-white hover:bg-brand-dark",
//     secondary: "border border-line bg-white text-ink hover:bg-page",
//     success: "bg-green-700 text-white hover:bg-green-800",
//     danger: "bg-red-600 text-white hover:bg-red-700",
//   };
//   return (
//     <button
//       {...props}
//       className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 ${styles[variant]} ${className}`}
//     />
//   );
// }

// const STATUS = {
//   PENDING_APPROVAL: ["Pending approval", "bg-amber-100 text-amber-800"],
//   COMPLETED: ["Completed", "bg-green-100 text-green-800"],
//   REJECTED: ["Rejected", "bg-red-100 text-red-800"],
// };

// export function StatusBadge({ status }) {
//   const [text, cls] = STATUS[status] || [status, "bg-gray-100 text-gray-700"];
//   return (
//     <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
//       {text}
//     </span>
//   );
// }

// export function Alert({ kind = "error", children }) {
//   if (!children) return null;
//   const cls =
//     kind === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700";
//   return <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${cls}`}>{children}</p>;
// }


export const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
export const labelCls = "mb-1 block text-sm font-medium text-ink";
export const thCls = "bg-page/70 px-4 py-2.5 text-left text-xs font-semibold text-muted";
export const tdCls = "px-4 py-3";

export const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const fmtDate = (s) => {
  if (!s) return "";
  return new Date(s.endsWith("Z") ? s : s + "Z").toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export const Card = ({ className = "", children }) => (
  <div className={`rounded-xl border border-line bg-white ${className}`}>
    {children}
  </div>
);

export function Btn({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "border border-line bg-white text-ink hover:bg-page",
    success: "bg-green-700 text-white hover:bg-green-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${styles[variant]} ${className}`}
    />
  );
}

const STATUS = {
  PENDING_APPROVAL: ["Pending approval", "bg-amber-100 text-amber-800"],
  COMPLETED: ["Completed", "bg-green-100 text-green-800"],
  REJECTED: ["Rejected", "bg-red-100 text-red-800"],
};

export function StatusBadge({ status }) {
  const [text, cls] = STATUS[status] || [status, "bg-gray-100 text-gray-700"];
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
}

export function Alert({ kind = "error", children }) {
  if (!children) return null;
  const cls =
    kind === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700";
  return <p className={`mb-4 rounded-md px-3 py-2 text-sm ${cls}`}>{children}</p>;
}