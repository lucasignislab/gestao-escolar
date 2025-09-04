import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export interface ScheduleEvent {
  id: string
  title: string
  start: Date
  end: Date
  resourceId?: string
  color?: string
}

interface WeeklyScheduleProps {
  events: ScheduleEvent[]
  onEventClick?: (event: ScheduleEvent) => void
  minTime?: Date
  maxTime?: Date
}

const WeeklySchedule = ({
  events,
  onEventClick,
  minTime = new Date(2025, 0, 1, 7, 0), // 7:00 AM
  maxTime = new Date(2025, 0, 1, 18, 0), // 6:00 PM
}: WeeklyScheduleProps) => {
  const eventStyleGetter = (event: ScheduleEvent) => {
    return {
      style: {
        backgroundColor: event.color || '#3182ce',
        borderRadius: '4px',
      },
    }
  }

  return (
    <div className="h-[600px] w-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        views={['week']}
        min={minTime}
        max={maxTime}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => onEventClick?.(event as ScheduleEvent)}
        toolbar={false}
        formats={{
          timeGutterFormat: (date) => format(date, 'HH:mm'),
          dayFormat: (date) => format(date, 'EEE').toUpperCase(),
        }}
      />
    </div>
  )
}

export default WeeklySchedule
