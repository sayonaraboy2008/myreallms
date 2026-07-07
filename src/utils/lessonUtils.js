// Utility function to parse lesson schedule
export const parseLessonSchedule = (timeString) => {
  // "Dushanba 10:00-11:30" formatini parsla
  const dayMap = {
    Dushanba: 1,
    Seshanba: 2,
    Chorshanba: 3,
    Payshanba: 4,
    Juma: 5,
    Shanba: 6,
    Yakshanba: 0,
  };

  const parts = timeString.split(" ");
  if (parts.length < 2) return null;

  const dayName = parts[0];
  const timeRange = parts[1]; // "10:00-11:30"
  const [startTime, endTime] = timeRange.split("-");

  return {
    dayOfWeek: dayMap[dayName],
    dayName: dayName,
    startTime: startTime, // "10:00"
    endTime: endTime, // "11:30"
  };
};

// Generate lesson dates for upcoming weeks within course date range
export const generateLessonDates = (
  lessonSchedule,
  startDateStr,
  endDateStr,
  skippedDates = [],
) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lessonSchedule || lessonSchedule.dayOfWeek === undefined) {
    return dates;
  }

  // Parse course date range
  const courseStart = new Date(startDateStr);
  courseStart.setHours(0, 0, 0, 0);
  const courseEnd = new Date(endDateStr);
  courseEnd.setHours(23, 59, 59, 999);

  // Start from the course start date or today, whichever is later
  const actualStart = courseStart > today ? courseStart : today;

  // Go back to start of week to find first lesson date
  const startOfWeek = new Date(actualStart);
  startOfWeek.setDate(actualStart.getDate() - actualStart.getDay());

  // Generate dates until we exceed course end date
  let date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + lessonSchedule.dayOfWeek);

  while (date <= courseEnd) {
    if (date >= actualStart) {
      // Check if this date is not skipped
      const dateStr = date.toISOString().split("T")[0];
      if (!skippedDates.includes(dateStr)) {
        dates.push({
          date: new Date(date),
          dayName: lessonSchedule.dayName,
          startTime: lessonSchedule.startTime,
          endTime: lessonSchedule.endTime,
        });
      }
    }
    // Move to next week
    date.setDate(date.getDate() + 7);
  }

  return dates;
};

// Check if lesson is today
export const isLessonToday = (lessonDate) => {
  const today = new Date();
  const lesson = new Date(lessonDate);

  return (
    today.getDate() === lesson.getDate() &&
    today.getMonth() === lesson.getMonth() &&
    today.getFullYear() === lesson.getFullYear()
  );
};

// Check if lesson time has passed
export const hasLessonPassed = (lessonDate, endTime) => {
  const now = new Date();
  const [hours, minutes] = endTime.split(":").map(Number);

  const lessonEndTime = new Date(lessonDate);
  lessonEndTime.setHours(hours, minutes, 0, 0);

  return now > lessonEndTime;
};

// Check if lesson is currently ongoing
export const isLessonOngoing = (lessonDate, startTime, endTime) => {
  const now = new Date();
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const lessonStart = new Date(lessonDate);
  lessonStart.setHours(startHours, startMinutes, 0, 0);

  const lessonEnd = new Date(lessonDate);
  lessonEnd.setHours(endHours, endMinutes, 0, 0);

  return now >= lessonStart && now <= lessonEnd;
};

// Format date for display
export const formatDateForDisplay = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("uz-UZ", options);
};

// Get lesson status
export const getLessonStatus = (lessonDate, startTime, endTime) => {
  if (isLessonOngoing(lessonDate, startTime, endTime)) {
    return { status: "ongoing", label: "🔴 JARAYONDA", color: "text-red-600" };
  }
  if (hasLessonPassed(lessonDate, endTime)) {
    return {
      status: "passed",
      label: "✅ TUGALLANDI",
      color: "text-green-600",
    };
  }
  if (isLessonToday(lessonDate)) {
    return { status: "today", label: "📅 BUGUN", color: "text-blue-600" };
  }
  return { status: "upcoming", label: "⏳ KELAYOTGAN", color: "text-gray-600" };
};
