import { Lesson } from '@prisma/client'
import { ScheduleEvent } from '@/components/schedule/WeeklySchedule'
import { startOfWeek, addDays, setHours, setMinutes } from 'date-fns'

export const convertLessonsToEvents = (
  lessons: Array<Lesson & { subject: { name: string } }>,
  weekStart: Date = new Date()
): ScheduleEvent[] => {
  return lessons.map((lesson): ScheduleEvent => {
    // Get the start of the week
    const baseDate = startOfWeek(weekStart)
    
    // Add days to get to the correct day of week (0 = Sunday, so we subtract 1 from lesson.dayOfWeek)
    const lessonDate = addDays(baseDate, lesson.dayOfWeek - 1)
    
    // Parse the time from the lesson's startTime and endTime
    const startHours = lesson.startTime.getHours()
    const startMinutes = lesson.startTime.getMinutes()
    const endHours = lesson.endTime.getHours()
    const endMinutes = lesson.endTime.getMinutes()
    
    // Create the full start and end dates
    const start = setMinutes(setHours(lessonDate, startHours), startMinutes)
    const end = setMinutes(setHours(lessonDate, endHours), endMinutes)

    return {
      id: lesson.id,
      title: lesson.subject.name,
      start,
      end,
      resourceId: lesson.classId,
      color: getSubjectColor(lesson.subject.name), // You can implement this function to assign consistent colors to subjects
    }
  })
}

// You can customize these colors or generate them dynamically
const subjectColors: { [key: string]: string } = {
  'Matemática': '#3182ce',
  'Português': '#e53e3e',
  'História': '#38a169',
  'Geografia': '#805ad5',
  'Ciências': '#d69e2e',
  // Add more subjects and colors as needed
}

export const getSubjectColor = (subjectName: string): string => {
  return subjectColors[subjectName] || '#3182ce' // Default blue if subject not found
}
