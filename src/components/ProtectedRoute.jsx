import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Hozircha oddiy tekshiruv (keyinchalik buni localStorage yoki global state bilan almashtiramiz)
  const isAuthenticated = localStorage.getItem("isLoggedIn");

  if (!isAuthenticated) {
    // Agar kirmagan bo'lsa, login sahifasiga qaytarib yuboramiz
    return <Navigate to="/login" replace />;
  }

  // Agar kirgan bo'lsa, ichidagi sahifani (Dashboard) ko'rsatamiz
  return children;
};

export default ProtectedRoute;
