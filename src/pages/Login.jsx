import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("https://667bcc2968d178a8.mokky.dev/users");
    const users = await res.json();

    // Debug uchun bazani ko'ramiz
    console.log("To'liq bazadagi birinchi foydalanuvchi:", users[0]);

    const user = users.find(
      (u) => u.email === email && String(u.pw) === String(password), // 'password' o'rniga 'pw' deb yozdik
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
      window.location.reload(); // Majburiy yangilash
    } else {
      alert("Email yoki parol noto'g'ri! Iltimos, ma'lumotlarni tekshiring.");
    }
  };
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">LMS ga kirish</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parol"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Kirish
        </button>
      </form>
    </div>
  );
}

export default Login;
