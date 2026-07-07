import { useEffect, useState } from "react";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const [coursesRes, studentsRes] = await Promise.all([
        fetch("https://667bcc2968d178a8.mokky.dev/lessons"),
        fetch("https://667bcc2968d178a8.mokky.dev/users"),
      ]);

      const coursesData = await coursesRes.json();
      const studentsData = await studentsRes.json();

      // Filter courses by teacher ID
      const teacherCourses = coursesData.filter((c) => c.teacherId === user.id);

      setCourses(teacherCourses);
      setStudents(studentsData);
      setLoading(false);
    } catch (error) {
      console.error("Ma'lumot yuklanishida xato:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Kurslar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📚 Mening Kurslarim
        </h1>
        <p className="text-gray-600">
          Siz o'qitayotgan kurslar va talabalar ro'yxati
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-12 rounded-xl text-center border-2 border-dashed border-blue-300">
          <p className="text-gray-600 text-lg">
            📭 Hozircha sizga kurs tayinlanmagan
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Admin orqali kurs tayinlanishi uchun kutib turing
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => {
            const courseStudents = students.filter(
              (s) => s.groupId === course.id && s.role === "student",
            );

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-600 p-6"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      📌 {course.code}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      🕐 {course.time}
                    </span>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Talabalar:</span>{" "}
                    <span className="text-lg font-bold text-blue-600">
                      {courseStudents.length}
                    </span>
                  </p>
                </div>

                {courseStudents.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setSelectedCourse(
                          selectedCourse?.id === course.id ? null : course,
                        )
                      }
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      {selectedCourse?.id === course.id
                        ? "▼ Talabalarni yashirish"
                        : "▶ Talabalarni ko'rish"}
                    </button>
                  </div>
                )}

                {selectedCourse?.id === course.id && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      📋 Talabalar ro'yxati:
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {courseStudents.length > 0 ? (
                        courseStudents.map((student, idx) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-semibold text-gray-600 w-6">
                              {idx + 1}.
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {student.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Talabalar yo'q
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
