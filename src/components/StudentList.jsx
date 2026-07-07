import { useEffect, useState } from "react";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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
      .then((data) => setStudents(data.filter((u) => u.role === "student")));
    fetch("https://667bcc2968d178a8.mokky.dev/lessons")
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const res = await fetch("https://667bcc2968d178a8.mokky.dev/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role: "student" }),
    });

    if (res.ok) {
      const added = await res.json();
      setStudents([...students, added]);
      setIsOpen(false);
      setFormData({ fullName: "", email: "", password: "", groupId: "" });
      showToast("Talaba muvaffaqiyatli qo'shildi!");
    }
  };

  const deleteStudent = async (id) => {
    await fetch(`https://667bcc2968d178a8.mokky.dev/users/${id}`, {
      method: "DELETE",
    });
    setStudents(students.filter((s) => s.id !== id));
    showToast("Talaba o'chirildi!");
  };

  return (
    <div className="p-8">
      {toast && (
        <div className="fixed top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Talabalar ro'yxati</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Yangi o'quvchi qo'shish
        </button>
      </div>

      {/* Jadval ko'rinishida ro'yxat */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4">Ism Familiya</th>
              <th className="p-4">Email</th>
              <th className="p-4">Guruh</th>
              <th className="p-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">{s.fullName}</td>
                <td className="p-4 text-gray-600">{s.email}</td>
                <td className="p-4 text-gray-600">
                  {groups.find((g) => g.id == s.groupId)?.title || "Guruhsiz"}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => deleteStudent(s.id)}
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

      {/* Modal oyna (oldingi kod qoladi) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Yangi o'quvchi
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
              <select
                className="w-full border-gray-300 border p-3 rounded-lg outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, groupId: e.target.value })
                }
              >
                <option value="">Guruhni tanlang</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
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
