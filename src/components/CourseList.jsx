import { useEffect, useState } from "react";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    teacherId: "",
    lessonDayVariant: 1, // 1: Du/Chor/Juma, 2: Se/Pay/Shanba
    lessonStartTime: "10:00",
    lessonDuration: 2,
    courseStartDate: "",
    courseEndDate: "",
    skippedDates: [],
  });
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

  const createCourse = async (e) => {
    e.preventDefault();

    if (
      !newCourse.title ||
      !newCourse.code ||
      !newCourse.lessonStartTime ||
      !newCourse.courseStartDate ||
      !newCourse.courseEndDate ||
      !newCourse.teacherId
    ) {
      alert("Barcha maydonlarni to'ldiring!");
      return;
    }

    // Dars kunlarini variant asosida tanlash
    const daysVariant1 = ["Dushanba", "Chorshanba", "Juma"];
    const daysVariant2 = ["Seshanba", "Payshanba", "Shanba"];
    const selectedDays =
      newCourse.lessonDayVariant === 1 ? daysVariant1 : daysVariant2;

    // Dars vaqtini hisoblash
    const [hours, minutes] = newCourse.lessonStartTime.split(":").map(Number);
    const endHours = hours + newCourse.lessonDuration;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    try {
      // Har bir kun uchun alohida dars record yaratish
      for (let day of selectedDays) {
        const lessonTime = `${day} ${newCourse.lessonStartTime}-${endTime}`;

        const courseData = {
          title: newCourse.title,
          code: newCourse.code,
          time: lessonTime,
          teacherId: Number(newCourse.teacherId),
          startDate: newCourse.courseStartDate,
          endDate: newCourse.courseEndDate,
          skippedDates: newCourse.skippedDates || [],
        };

        const res = await fetch("https://667bcc2968d178a8.mokky.dev/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        });

        if (!res.ok) {
          throw new Error(`${day} dars qo'shishda xato`);
        }
      }

      // Barcha darslar qo'shilgandan so'ng
      setNewCourse({
        title: "",
        code: "",
        teacherId: "",
        lessonDayVariant: 1,
        lessonStartTime: "10:00",
        lessonDuration: 2,
        courseStartDate: "",
        courseEndDate: "",
        skippedDates: [],
      });
      setShowAddForm(false);
      fetchData();
      alert("Yangi kurs muvaffaqiyatli qo'shildi! (3 ta dars yaratildi)");
    } catch (error) {
      console.error("Xato:", error);
      alert("Kurs qo'shishda xatolik yuz berdi!");
    }
  };
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Guruhlar ro'yxati</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          ➕ Yangi Kurs Qo'shish
        </button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg mb-8 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📚 Yangi Kurs Guruhini Qo'shish
          </h2>
          <form onSubmit={createCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kurs Nomi
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Matematika 10-sinf"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kurs Kodi
                </label>
                <input
                  type="text"
                  placeholder="Masalan: MATH-101"
                  value={newCourse.code}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, code: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📅 Dars Kunlari Varianti (Haftada 3 kun)
              </label>
              <div className="space-y-2">
                <label
                  className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all"
                  style={{
                    borderColor:
                      newCourse.lessonDayVariant === 1 ? "#3b82f6" : "#d1d5db",
                    backgroundColor:
                      newCourse.lessonDayVariant === 1 ? "#eff6ff" : "white",
                  }}
                >
                  <input
                    type="radio"
                    value="1"
                    checked={newCourse.lessonDayVariant === 1}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        lessonDayVariant: Number(e.target.value),
                      })
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      🔵 Variant 1: Du/Chor/Juma
                    </p>
                    <p className="text-sm text-gray-600">
                      Dushanba • Chorshanba • Juma
                    </p>
                  </div>
                </label>

                <label
                  className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all"
                  style={{
                    borderColor:
                      newCourse.lessonDayVariant === 2 ? "#3b82f6" : "#d1d5db",
                    backgroundColor:
                      newCourse.lessonDayVariant === 2 ? "#eff6ff" : "white",
                  }}
                >
                  <input
                    type="radio"
                    value="2"
                    checked={newCourse.lessonDayVariant === 2}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        lessonDayVariant: Number(e.target.value),
                      })
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      🔵 Variant 2: Se/Pay/Shanba
                    </p>
                    <p className="text-sm text-gray-600">
                      Seshanba • Payshanba • Shanba
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dars Vaqti (Boshlang'ich)
                </label>
                <input
                  type="time"
                  value={newCourse.lessonStartTime}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      lessonStartTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dars Davomiylig'i (soat)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={newCourse.lessonDuration}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      lessonDuration: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kurs Boshlangan Sanasi
                </label>
                <input
                  type="date"
                  value={newCourse.courseStartDate}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      courseStartDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kurs Tugagan Sanasi
                </label>
                <input
                  type="date"
                  value={newCourse.courseEndDate}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      courseEndDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                O'qituvchini Tanlang
              </label>
              <select
                value={newCourse.teacherId}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, teacherId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                required
              >
                <option value="">-- O'qituvchini tanlang --</option>
                {users
                  .filter((u) => u.role === "teacher")
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                ✅ Kursni Qo'shish
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                ❌ Bekor Qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses Grid */}
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
                  Kod: {course.code} | 🕐 Vaqti: {course.time}
                </p>
                <p className="text-sm text-gray-600">
                  📅 Boshlanish: {course.startDate} | Tugash: {course.endDate}
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
