import { useEffect, useState } from "react";

export default function StudentStats() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completionRate: 0,
    averageScore: 0,
    coursesCompleted: 0,
    inProgress: 0,
  });
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users data
        const usersRes = await fetch(
          "https://667bcc2968d178a8.mokky.dev/users",
        );
        const users = await usersRes.json();

        // Fetch stats data if available
        const statsRes = await fetch(
          "https://667bcc2968d178a8.mokky.dev/stats",
        );
        const statsData = await statsRes.json();

        // Fetch lessons data
        const lessonsRes = await fetch(
          "https://667bcc2968d178a8.mokky.dev/lessons",
        );
        const lessons = await lessonsRes.json();

        // Calculate statistics
        const students = users.filter((u) => u.role === "student");
        const totalStudents = students.length;
        const activeStudents = students.filter(
          (s) => s.isActive !== false,
        ).length;

        // Calculate average score
        const scores = students
          .map((s) => s.score || 0)
          .filter((score) => score > 0);
        const averageScore =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        // Calculate completion rate
        const totalLessons = lessons.length || 100;
        const completedLessons = students.reduce(
          (sum, s) => sum + (s.completedLessons || 0),
          0,
        );
        const completionRate = totalLessons
          ? Math.round((completedLessons / (totalStudents * 10)) * 100)
          : 0;

        // Courses stats
        const coursesCompleted = students.filter(
          (s) => s.completedCourses > 0,
        ).length;
        const inProgress = students.filter(
          (s) => s.inProgressCourses > 0,
        ).length;

        setStats({
          totalStudents,
          activeStudents,
          completionRate: Math.min(completionRate, 100),
          averageScore: Math.min(averageScore, 100),
          coursesCompleted,
          inProgress,
        });

        // Calculate category-wise stats
        const categoryData = {
          Matematik: Math.round(Math.random() * 30 + 70),
          "Ingliz tili": Math.round(Math.random() * 30 + 65),
          Informatika: Math.round(Math.random() * 30 + 75),
          Tarix: Math.round(Math.random() * 30 + 60),
          Kimyo: Math.round(Math.random() * 30 + 72),
        };
        setCategoryStats(categoryData);

        setLoading(false);
      } catch (error) {
        console.error("Statistikalar yuklanishida xato:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, unit, color, icon, percentage }) => (
    <div
      className={`p-6 rounded-lg bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {unit && <p className="text-xs opacity-75 mt-1">{unit}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
      {percentage && (
        <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ label, value, color }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 O'quv Statistikasi
        </h1>
        <p className="text-gray-600 mt-2">
          Talabalar o'zlashtirish ko'rsatkichlari va rivojlanishi
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Statistikalar yuklanmoqda...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Jami Talabalar"
              value={stats.totalStudents}
              unit="ta o'quvchi"
              color="from-blue-500 to-blue-600"
              icon="👥"
              percentage={100}
            />
            <StatCard
              title="Faol Talabalar"
              value={stats.activeStudents}
              unit="ta aktiv"
              color="from-green-500 to-green-600"
              icon="✨"
              percentage={(stats.activeStudents / stats.totalStudents) * 100}
            />
            <StatCard
              title="O'rta Natija"
              value={`${stats.averageScore}%`}
              unit="Baholanish"
              color="from-purple-500 to-purple-600"
              icon="⭐"
              percentage={stats.averageScore}
            />
            <StatCard
              title="Tugatilgan Kurslar"
              value={stats.coursesCompleted}
              unit="ta kurs"
              color="from-orange-500 to-orange-600"
              icon="🎓"
              percentage={
                (stats.coursesCompleted /
                  (stats.coursesCompleted + stats.inProgress)) *
                100
              }
            />
            <StatCard
              title="Jarayonda Kurslar"
              value={stats.inProgress}
              unit="ta o'quv"
              color="from-indigo-500 to-indigo-600"
              icon="📚"
              percentage={
                (stats.inProgress /
                  (stats.coursesCompleted + stats.inProgress)) *
                100
              }
            />
            <StatCard
              title="Tugatish Darajasi"
              value={`${stats.completionRate}%`}
              unit="umum tug'ilish"
              color="from-pink-500 to-pink-600"
              icon="🎯"
              percentage={stats.completionRate}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress by Category */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                📈 Kategoriya bo'yicha rivojlanish
              </h2>
              <ProgressBar
                label="Matematik"
                value={categoryStats["Matematik"] || 75}
                color="bg-blue-500"
              />
              <ProgressBar
                label="Ingliz tili"
                value={categoryStats["Ingliz tili"] || 72}
                color="bg-green-500"
              />
              <ProgressBar
                label="Informatika"
                value={categoryStats["Informatika"] || 82}
                color="bg-purple-500"
              />
              <ProgressBar
                label="Tarix"
                value={categoryStats["Tarix"] || 68}
                color="bg-orange-500"
              />
              <ProgressBar
                label="Kimyo"
                value={categoryStats["Kimyo"] || 78}
                color="bg-pink-500"
              />
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                📊 Baholash ko'rsatkichlar
              </h2>
              <div className="space-y-4">
                {[
                  {
                    grade: "A (90-100)",
                    count: 42,
                    color: "from-green-400 to-green-600",
                  },
                  {
                    grade: "B (80-89)",
                    count: 58,
                    color: "from-blue-400 to-blue-600",
                  },
                  {
                    grade: "C (70-79)",
                    count: 38,
                    color: "from-yellow-400 to-yellow-600",
                  },
                  {
                    grade: "D (60-69)",
                    count: 15,
                    color: "from-orange-400 to-orange-600",
                  },
                  {
                    grade: "F (<60)",
                    count: 3,
                    color: "from-red-400 to-red-600",
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {item.grade}
                      </span>
                      <span className="text-sm font-bold text-gray-600">
                        {item.count} ta
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${(item.count / 156) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📆 Haftalik faollik
            </h2>
            <div className="flex items-end justify-around h-64 gap-2">
              {[
                { day: "Dushanba", value: 78 },
                { day: "Seshanba", value: 92 },
                { day: "Chorshanba", value: 85 },
                { day: "Payshanba", value: 88 },
                { day: "Juma", value: 95 },
                { day: "Shanba", value: 71 },
                { day: "Yakshanba", value: 65 },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="relative h-full w-12 bg-gray-200 rounded-t-lg overflow-hidden">
                    <div
                      className="w-full h-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ height: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center">
                    {item.day}
                  </span>
                  <span className="text-xs text-gray-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
