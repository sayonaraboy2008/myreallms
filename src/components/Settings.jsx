import { useState, useEffect } from "react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        avatar: userData.avatar || "",
      });
    }
  }, []);

  const showMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage("Rasm 5MB dan katta bo'lmasligi kerak!", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, avatar: event.target.result });
        showMessage("Rasm muvaffaqiyatli yuklanildi! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `https://667bcc2968d178a8.mokky.dev/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            avatar: formData.avatar,
          }),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        showMessage("Profil muvaffaqiyatli yangilandi! ✅");
      } else {
        showMessage("Xatolik yuz berdi!", "error");
      }
    } catch (error) {
      showMessage("Yangilashda xato: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("Yangi parollar mos kelmadi!", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak!", "error");
      return;
    }

    if (passwordData.oldPassword !== user.pw) {
      showMessage("Eski parol noto'g'ri!", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://667bcc2968d178a8.mokky.dev/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pw: passwordData.newPassword,
          }),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        showMessage("Parol muvaffaqiyatli o'zgartirildi! ✅");
      } else {
        showMessage("Xatolik yuz berdi!", "error");
      }
    } catch (error) {
      showMessage("Parol o'zgartirishda xato: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">
            Foydalanuvchi ma'lumoti yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-white ${
            message.type === "success"
              ? "bg-green-500 border-l-4 border-green-600"
              : "bg-red-500 border-l-4 border-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ Sozlamalar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="mb-4 relative">
              {formData.avatar && formData.avatar.startsWith("data:") ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl">
                  {formData.avatar && !formData.avatar.startsWith("data:")
                    ? formData.avatar
                    : "👤"}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors"
                title="Rasmni o'zgartirish"
              >
                📷
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {user.fullName}
            </h2>
            <p className="text-sm text-gray-600 mb-2">{user.email}</p>
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {user.role === "admin" && "👨‍💼 Admin"}
              {user.role === "teacher" && "👨‍🏫 O'qituvchi"}
              {user.role === "student" && "👨‍🎓 Talaba"}
            </span>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Update Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📝 Profil Axboratini O'zgartirish
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To'liq Ism
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📸 Profil Rasmi
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ JPG, PNG, GIF qo'llab-quvvatlangan (Maks: 5MB)
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors duration-200"
              >
                {loading ? "Saqlanmoqda..." : "✅ O'zgarishlarni Saqlash"}
              </button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🔐 Parolni O'zgartirish
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Eski Parol
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Yangi Parol
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Yangi Parolni Tasdiqlang
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors duration-200"
              >
                {loading ? "O'zgartirilmoqda..." : "🔄 Parolni O'zgartirish"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
