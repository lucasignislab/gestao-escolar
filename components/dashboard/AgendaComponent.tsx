'use client'

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Configurar moment para português
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

interface Lesson {
  id: string
  subject: {
    name: string
  }
  class: {
    name: string
  }
  startTime: Date
  endTime: Date
  dayOfWeek: number // 0 = Domingo, 1 = Segunda, etc.
}

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  resource?: Lesson
}

interface AgendaComponentProps {
  lessons: Lesson[]
}

export default function AgendaComponent({ lessons }: AgendaComponentProps) {
  // Função para converter as aulas em eventos do calendário
  const convertLessonsToEvents = (lessons: Lesson[]): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    const today = moment()
    const startOfWeek = today.clone().startOf('week')

    lessons.forEach((lesson) => {
      // Calcular a data da aula na semana atual
      const lessonDate = startOfWeek.clone().add(lesson.dayOfWeek, 'days')
      
      // Extrair horas e minutos do startTime e endTime
      const startTime = new Date(lesson.startTime)
      const endTime = new Date(lesson.endTime)
      const startHour = startTime.getHours()
      const startMinute = startTime.getMinutes()
      const endHour = endTime.getHours()
      const endMinute = endTime.getMinutes()
      
      // Criar as datas de início e fim
      const startDateTime = lessonDate.clone()
        .hour(startHour)
        .minute(startMinute)
        .second(0)
        .millisecond(0)
      
      const endDateTime = lessonDate.clone()
        .hour(endHour)
        .minute(endMinute)
        .second(0)
        .millisecond(0)
      
      events.push({
        title: `${lesson.subject.name} - ${lesson.class.name}`,
        start: startDateTime.toDate(),
        end: endDateTime.toDate(),
        resource: lesson
      })
    })

    return events
  }

  const events = convertLessonsToEvents(lessons)

  // Configurações do calendário
  const calendarMessages = {
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período',
    showMore: (total: number) => `+ Ver mais (${total})`
  }

  const formats = {
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
    },
    dayFormat: 'dddd DD/MM',
    dateFormat: 'DD',
    monthHeaderFormat: 'MMMM YYYY',
    dayHeaderFormat: 'dddd DD/MM',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agenda Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            defaultView="week"
            views={['week', 'day']}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 7, 0)} // 07:00
            max={new Date(2024, 0, 1, 22, 0)} // 22:00
            messages={calendarMessages}
            formats={formats}
            culture="pt-BR"
            className="rbc-calendar"
            eventPropGetter={() => ({
              style: {
                backgroundColor: '#3b82f6',
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
              }
            })}
          />
        </div>
      </CardContent>
    </Card>
  )
}