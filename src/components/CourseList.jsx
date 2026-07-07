import { useEffect, useState } from "react";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  useEffect(() => {
    console.log("Yuklangan foydalanuvchilar:", users);
  }, [users]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [cRes, uRes] = await Promise.all([
      fetch("https://667bcc2968d178a8.mokky.dev/lessons"),
      fetch("https://667bcc2968d178a8.mokky.dev/users"),
    ]);
    setCourses(await cRes.json());
    setUsers(await uRes.json());
  };

  const deleteCourse = async (id) => {
    if (confirm("Guruhni o'chirishga ishonchingiz komilmi?")) {
      await fetch(`https://667bcc2968d178a8.mokky.dev/lessons/${id}`, {
        method: "DELETE",
      });
      fetchData();
    }
  };

  const saveCourse = async (e) => {
    e.preventDefault();

    // Ma'lumotlarni tozalab, bazaga yuboramiz
    const updatedData = {
      title: editingCourse.title,
      time: editingCourse.time,
      teacherId: Number(editingCourse.teacherId), // Majburiy raqam
    };

    const res = await fetch(
      `https://667bcc2968d178a8.mokky.dev/lessons/${editingCourse.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      },
    );

    if (res.ok) {
      setEditingCourse(null);
      fetchData(); // Ma'lumotlarni qayta yuklaymiz
    } else {
      alert("Saqlashda xatolik yuz berdi!");
    }
  };

  const removeFromGroup = async (studentId) => {
    await fetch(`https://667bcc2968d178a8.mokky.dev/users/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: null }),
    });
    fetchData();
  };
  const addToGroup = async (studentId, groupId) => {
    await fetch(`https://667bcc2968d178a8.mokky.dev/users/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: groupId }),
    });
    fetchData(); // Sahifani yangilash
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Guruhlar ro'yxati</h1>
      <div className="grid gap-4">
        {courses.map((course) => {
          const teacher = users.find(
            (u) => u.id == course.teacherId && u.role === "teacher",
          );
          const students = users.filter(
            (u) => u.groupId == course.id && u.role === "student",
          );

          return (
            <div
              key={course.id}
              className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold text-lg">{course.title}</h2>
                <p className="text-sm text-gray-500">
                  Kod: {course.code} | Vaqti: {course.time}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  O'qituvchi: {teacher?.fullName || "Tayinlanmagan"}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {students.length}
                  </span>
                  <p className="text-xs text-gray-400">talaba</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tahrirlash Modali */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px] shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              Guruh: {editingCourse.title}
            </h2>

            {/* O'qituvchini tanlash */}
            <select
              className="w-full border p-2 rounded mb-4"
              value={editingCourse.teacherId || ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  teacherId: Number(e.target.value),
                })
              }
            >
              <option value="">O'qituvchi tayinlanmagan</option>
              {users &&
                users
                  .filter((u) => u.role === "teacher")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
            </select>

            {/* 2. O'quvchini qo'shish (Guruhsizlarni tanlash) */}
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-1">
                Yangi talaba qo'shish:
              </h3>
              <select
                className="w-full border p-2 rounded"
                onChange={(e) => {
                  const studentId = e.target.value;
                  if (studentId) addToGroup(studentId, editingCourse.id);
                }}
              >
                <option value="">Talaba tanlang...</option>
                {users
                  .filter((u) => u.role === "student" && !u.groupId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
              </select>
            </div>

            {/* 3. Guruhdagi mavjud talabalar */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Guruhdagi talabalar:</h3>
              <div className="max-h-40 overflow-y-auto">
                {users
                  .filter(
                    (u) =>
                      u.groupId == editingCourse.id && u.role === "student",
                  )
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between p-2 border-b"
                    >
                      {s.fullName}
                      <button
                        onClick={() => removeFromGroup(s.id)}
                        className="text-red-500 text-sm font-bold"
                      >
                        Olib tashlash
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={saveCourse}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Saqlash
              </button>
              <button
                onClick={() => setEditingCourse(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
