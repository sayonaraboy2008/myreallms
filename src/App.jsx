import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseList from "./components/CourseList";
import StudentList from "./components/StudentList";
import StudentStats from "./components/StudentStats";
import TeacherCourses from "./components/TeacherCourses";
import Settings from "./components/Settings";
import LessonCalendar from "./components/LessonCalendar";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Asosiy yo'nalish: Dashboard layouti ichida sahifalar almashadi */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Dashboard ichidagi sahifalar */}
          <Route path="courses" element={<CourseList />} />
          <Route path="students" element={<StudentList />} />
          <Route path="teacher-courses" element={<TeacherCourses />} />
          <Route
            path="calendar"
            element={
              <LessonCalendar
                role={JSON.parse(localStorage.getItem("user"))?.role}
              />
            }
          />
          <Route path="settings" element={<Settings />} />
          <Route index element={<StudentStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
