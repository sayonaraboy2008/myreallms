import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./../components/Sidebar";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Agar login qilmagan bo'lsa, avtomatik login sahifasiga qaytaradi
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex">
      <Sidebar role={user.role} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
