import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseList from "./components/CourseList";
import StudentList from "./components/StudentList";
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
          Kelajakda: <Route path="students" element={<StudentList />} />
          <Route index element={<Navigate to="courses" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
