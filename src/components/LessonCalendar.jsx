import { useEffect, useState } from "react";
import {
  generateLessonDates,
  parseLessonSchedule,
  getLessonStatus,
  formatDateForDisplay,
  isLessonToday,
} from "../utils/lessonUtils";
import AttendanceGrading from "./AttendanceGrading";

export default function LessonCalendar({ role }) {
  const [lessons, setLessons] = useState([]);
  const [lessonDates, setLessonDates] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [gradesData, setGradesData] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const [lessonsRes, usersRes] = await Promise.all([
        fetch("https://667bcc2968d178a8.mokky.dev/lessons"),
        fetch("https://667bcc2968d178a8.mokky.dev/users"),
      ]);

      const lessonsData = await lessonsRes.json();
      const usersData = await usersRes.json();

      setUsers(usersData);

      // Filter lessons based on role
      let filteredLessons = lessonsData;
      if (role === "teacher") {
        filteredLessons = lessonsData.filter(
          (l) => l.teacherId === currentUser.id,
        );
      }

      setLessons(filteredLessons);

      // Generate calendar dates for all lessons
      const allDates = [];
      filteredLessons.forEach((lesson) => {
        const schedule = parseLessonSchedule(lesson.time);
        if (schedule) {
          const dates = generateLessonDates(
            schedule,
            lesson.startDate,
            lesson.endDate,
            lesson.skippedDates,
          );
          allDates.push({
            lesson,
            schedule,
            dates,
          });
        }
      });

      setLessonDates(allDates);
      setLoading(false);
    } catch (error) {
      console.error("Ma'lumot yuklanishida xato:", error);
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (
      confirm(
        "Bu darsni shuni uchun o'chirishga ishonchingiz komilmi? Barcha davomat va baho ma'lumotlari o'chib ketadi!",
      )
    ) {
      try {
        await fetch(`https://667bcc2968d178a8.mokky.dev/lessons/${lessonId}`, {
          method: "DELETE",
        });
        fetchData();
        setSelectedLesson(null);
      } catch (error) {
        console.error("O'chirishda xato:", error);
      }
    }
  };

  const handleMarkAttendance = async (lessonId, studentId, isPresent) => {
    const key = `${lessonId}-${studentId}`;
    setAttendanceData({
      ...attendanceData,
      [key]: isPresent,
    });
  };

  const handleGradeSubmission = async (lessonId, studentId, grade) => {
    const key = `${lessonId}-${studentId}`;
    setGradesData({
      ...gradesData,
      [key]: grade,
    });
  };

  const handleSaveChanges = async () => {
    // TODO: Save attendance and grades to backend
    console.log("Davomat:", attendanceData);
    console.log("Baholar:", gradesData);
    alert("Davomat va baholar saqlanildi!");
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Dars jadvalı yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Dars Jadvalı</h1>
      <p className="text-gray-600 mb-8">
        {role === "teacher"
          ? "Sizning kurslar va darslar jadvalini boshqaring"
          : "Barcha kurslar va darslar jadvalini ko'ring"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lessons List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <h2 className="font-bold text-lg">📚 Darslar Ro'yxati</h2>
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
              {lessons.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Dars topilmadi
                </div>
              ) : (
                lessons.map((lesson) => {
                  const teacher = users.find(
                    (u) => u.id === lesson.teacherId && u.role === "teacher",
                  );
                  const students = users.filter(
                    (u) => u.groupId === lesson.id && u.role === "student",
                  );

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedLesson?.id === lesson.id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <h3 className="font-bold text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.code}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-semibold">
                        🕐 {lesson.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        👨‍🏫 {teacher?.fullName || "Nomalum"}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-bold">
                        👥 {students.length} ta talaba
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Lesson Details and Calendar */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Lesson Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedLesson.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      📌 Kod: {selectedLesson.code}
                    </p>
                  </div>
                  {role === "admin" && (
                    <button
                      onClick={() => handleDeleteLesson(selectedLesson.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      🗑️ Darsni O'chirish
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Vaqti</p>
                    <p className="text-lg font-bold text-blue-600">
                      🕐 {selectedLesson.time}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Talabalar</p>
                    <p className="text-lg font-bold text-green-600">
                      👥{" "}
                      {
                        users.filter(
                          (u) =>
                            u.groupId === selectedLesson.id &&
                            u.role === "student",
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📆 Dars Jadvali (Kelayotgan 8 hafta)
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lessonDates
                    .find((ld) => ld.lesson.id === selectedLesson.id)
                    ?.dates.map((dateInfo, idx) => {
                      const status = getLessonStatus(
                        dateInfo.date,
                        dateInfo.startTime,
                        dateInfo.endTime,
                      );

                      const isSelected =
                        selectedDate &&
                        selectedDate.getDate() === dateInfo.date.getDate() &&
                        selectedDate.getMonth() === dateInfo.date.getMonth() &&
                        selectedDate.getFullYear() ===
                          dateInfo.date.getFullYear();

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (role === "teacher" || role === "admin") {
                              setSelectedDate(dateInfo.date);
                            }
                          }}
                          className={`flex justify-between items-center p-3 rounded-lg transition-colors border-l-4 cursor-pointer ${
                            isSelected
                              ? "bg-blue-100 border-l-blue-600 bg-blue-50"
                              : "bg-gray-50 hover:bg-gray-100 border-l-gray-300"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatDateForDisplay(dateInfo.date)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {dateInfo.startTime} - {dateInfo.endTime}
                            </p>
                          </div>
                          <span className={`font-bold text-sm ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Attendance and Grading Section */}
              {(role === "teacher" || role === "admin") &&
                selectedDate &&
                isLessonToday(selectedDate) && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      ✏️ Davomat va Baho Berish
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {role === "teacher"
                        ? "Bugungi darsda davomat olib, baho berishingiz mumkin"
                        : "Admin sifatida davomat va baholarni ko'rishingiz mumkin"}
                    </p>
                    <AttendanceGrading
                      lesson={selectedLesson}
                      lessonDate={selectedDate}
                      startTime={
                        lessonDates
                          .find((ld) => ld.lesson.id === selectedLesson.id)
                          ?.dates.find(
                            (d) =>
                              d.date.getDate() === selectedDate.getDate() &&
                              d.date.getMonth() === selectedDate.getMonth(),
                          )?.startTime
                      }
                      endTime={
                        lessonDates
                          .find((ld) => ld.lesson.id === selectedLesson.id)
                          ?.dates.find(
                            (d) =>
                              d.date.getDate() === selectedDate.getDate() &&
                              d.date.getMonth() === selectedDate.getMonth(),
                          )?.endTime
                      }
                    />
                  </div>
                )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg">
                📚 Darsni tanlang, uning jadvali va ma'lumotlarini ko'rish uchun
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
