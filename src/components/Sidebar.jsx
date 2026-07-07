export default function Sidebar({ role }) {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-5">
      <ul className="space-y-4">
        {role === "admin" && (
          <>
            <li>
              <a href="/courses">Guruhlar</a>
            </li>
            <li>
              <a href="/students">Talabalar</a>
            </li>
          </>
        )}
        {role === "teacher" && (
          <li>
            <a href="/teacher-groups">Mening guruhlarim</a>
          </li>
        )}
        {role === "student" && (
          <li>
            <a href="/my-schedule">Darslarim</a>
          </li>
        )}
      </ul>
    </div>
  );
}
