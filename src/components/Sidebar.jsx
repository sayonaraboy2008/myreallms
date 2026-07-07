import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
    window.location.reload();
  };

  const navItems = [
    { label: "📊 Asosiy", href: "/", roles: ["admin", "teacher", "student"] },
    { label: "📚 Kurslar", href: "/courses", roles: ["admin"] },
    { label: "👥 Talabalar", href: "/students", roles: ["admin"] },
    {
      label: "👨‍🏫 Mening Guruhlarim",
      href: "/teacher-groups",
      roles: ["teacher"],
    },
    { label: "📅 Mening Darslarim", href: "/my-schedule", roles: ["student"] },
    {
      label: "💬 Xabarlar",
      href: "/messages",
      roles: ["admin", "teacher", "student"],
    },
    {
      label: "⚙️ Sozlamalar",
      href: "/settings",
      roles: ["admin", "teacher", "student"],
    },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen p-5 flex flex-col shadow-2xl">
      {/* Logo/Header */}
      <div className="mb-8 pb-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">📖 LMS</h1>
        <p className="text-xs text-gray-400 mt-2">O'quv Boshqaruv Tizimi</p>
      </div>

      {/* User Profile */}
      {user && (
        <div className="mb-6 p-3 bg-gray-700 rounded-lg border border-gray-600">
          <p className="text-sm font-semibold text-blue-300">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Rol:{" "}
            <span className="text-green-400 font-bold">
              {role || "Foydalanuvchi"}
            </span>
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) =>
            item.roles.includes(role) ? (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                    location.pathname === item.href
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 hover:bg-blue-600"
                  }`}
                >
                  <span className="text-lg">{item.label}</span>
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="pt-6 border-t border-gray-700 mt-auto">
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
        >
          🚪 Chiqish
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          MyRealLMS &copy; 2026
        </p>
      </div>
    </div>
  );
}
