import { useEffect, useState } from "react";
import { isLessonToday, isLessonOngoing } from "../utils/lessonUtils";

export default function AttendanceGrading({
  lesson,
  lessonDate,
  startTime,
  endTime,
}) {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [lesson]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("https://667bcc2968d178a8.mokky.dev/users");
      const data = await res.json();
      const students = data.filter(
        (u) => u.groupId === lesson.id && u.role === "student",
      );
      setUsers(students);
      setLoading(false);
    } catch (error) {
      console.error("Talabalar yuklanishida xato:", error);
      setLoading(false);
    }
  };

  const handleAttendance = (studentId, isPresent) => {
    setAttendance({
      ...attendance,
      [studentId]: isPresent,
    });
  };

  const handleGrade = (studentId, grade) => {
    setGrades({
      ...grades,
      [studentId]: parseInt(grade),
    });
  };

  const handleSaveAll = async () => {
    console.log("Davomat:", attendance);
    console.log("Baholar:", grades);
    alert("Davomat va baholar saqlanildi!");
    // TODO: Save to backend
  };

  const today = isLessonToday(lessonDate);
  const ongoing = isLessonOngoing(lessonDate, startTime, endTime);

  if (!today) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700">
          ⚠️ Davomat faqat bugungi dars uchun qo'yilishi mumkin
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-600">Talabalar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`p-4 rounded-lg ${
          ongoing
            ? "bg-red-50 border-l-4 border-red-500"
            : "bg-blue-50 border-l-4 border-blue-500"
        }`}
      >
        <p
          className={
            ongoing ? "text-red-700 font-bold" : "text-blue-700 font-bold"
          }
        >
          {ongoing
            ? "🔴 DARS JARAYONDA - Davomat belgilaysiz!"
            : "📅 Bugungi dars - Davomat belgilashingiz mumkin"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Talaba</th>
              <th className="p-3 text-center">Davomat</th>
              <th className="p-3 text-center">Baho (0-100)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((student) => (
              <tr
                key={student.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  <p className="font-semibold">{student.fullName}</p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleAttendance(student.id, true)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        attendance[student.id] === true
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ✓ Bor
                    </button>
                    <button
                      onClick={() => handleAttendance(student.id, false)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        attendance[student.id] === false
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ✗ Yo'q
                    </button>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grades[student.id] || ""}
                    onChange={(e) => handleGrade(student.id, e.target.value)}
                    placeholder="Baho"
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSaveAll}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
        >
          💾 Davomat va Baholarni Saqlash
        </button>
      </div>
    </div>
  );
}
