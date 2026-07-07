import { useEffect, useState } from "react";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState("student");
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    groupId: "",
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Ma'lumotlarni yuklash
    fetch("https://667bcc2968d178a8.mokky.dev/users")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.filter((u) => u.role === "student"));
        setTeachers(data.filter((u) => u.role === "teacher"));
      });
    fetch("https://667bcc2968d178a8.mokky.dev/lessons")
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const res = await fetch("https://667bcc2968d178a8.mokky.dev/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role: userType }),
    });

    if (res.ok) {
      const added = await res.json();
      if (userType === "student") {
        setStudents([...students, added]);
        showToast("Talaba muvaffaqiyatli qo'shildi!");
      } else {
        setTeachers([...teachers, added]);
        showToast("O'qituvchi muvaffaqiyatli qo'shildi!");
      }
      setIsOpen(false);
      setFormData({ fullName: "", email: "", password: "", groupId: "" });
    }
  };

  const deleteStudent = async (id) => {
    await fetch(`https://667bcc2968d178a8.mokky.dev/users/${id}`, {
      method: "DELETE",
    });
    if (userType === "student") {
      setStudents(students.filter((s) => s.id !== id));
      showToast("Talaba o'chirildi!");
    } else {
      setTeachers(teachers.filter((t) => t.id !== id));
      showToast("O'qituvchi o'chirildi!");
    }
  };

  return (
    <div className="p-8">
      {toast && (
        <div className="fixed top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Header va Tablar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Foydalanuvchilar</h1>
          <button
            onClick={() => {
              setIsOpen(true);
              setUserType("student");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + Yangi qo'shish
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setUserType("student")}
            className={`px-6 py-3 font-semibold transition-colors ${
              userType === "student"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            👥 Talabalar ({students.length})
          </button>
          <button
            onClick={() => setUserType("teacher")}
            className={`px-6 py-3 font-semibold transition-colors ${
              userType === "teacher"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            👨‍🏫 O'qituvchilar ({teachers.length})
          </button>
        </div>
      </div>

      {/* Jadval ko'rinishida ro'yxat */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4">Ism Familiya</th>
              <th className="p-4">Email</th>
              {userType === "student" && <th className="p-4">Guruh</th>}
              <th className="p-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {(userType === "student" ? students : teachers).map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">{u.fullName}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                {userType === "student" && (
                  <td className="p-4 text-gray-600">
                    {groups.find((g) => g.id == u.groupId)?.title || "Guruhsiz"}
                  </td>
                )}
                <td className="p-4 text-center">
                  <button
                    onClick={() => deleteStudent(u.id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                  >
                    O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal oyna */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {userType === "student"
                ? "Yangi Talaba Qo'shish"
                : "Yangi O'qituvchi Qo'shish"}
            </h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <input
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ism va Familiya"
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
              <input
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Email"
                type="email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <input
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Parol"
                type="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              {userType === "student" && (
                <select
                  className="w-full border-gray-300 border p-3 rounded-lg outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, groupId: e.target.value })
                  }
                >
                  <option value="">Guruhni tanlang (ixtiyoriy)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                >
                  Qo'shish
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
