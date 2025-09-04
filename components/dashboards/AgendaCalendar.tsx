'use client';

import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br'; // Importa a localização para o português
import { Lesson, Subject, Class } from '@prisma/client';

// Configura o moment para usar a localização pt-br
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Tipo para as aulas com suas relações
type AulaComRelacoes = Lesson & {
  subject: Subject;
  class: Class;
};

interface AgendaCalendarProps {
  aulas: AulaComRelacoes[];
}

// Função para transformar os dados do Prisma em eventos para o calendário
const formatarAulasParaEventos = (aulas: AulaComRelacoes[]) => {
  const eventos = aulas.map((aula) => {
    // Pega o dia da semana (0=Domingo, 1=Segunda, etc.) do banco
    const diaDaSemana = aula.dayOfWeek;

    // Calcula a data de início para a semana atual
    const dataInicio = moment()
      .day(diaDaSemana) // Vai para o dia correto da semana atual
      .set({
        hour: moment(aula.startTime).hour(),
        minute: moment(aula.startTime).minute(),
        second: 0,
      }).toDate();

    // Calcula a data de fim para a semana atual
    const dataFim = moment()
      .day(diaDaSemana)
      .set({
        hour: moment(aula.endTime).hour(),
        minute: moment(aula.endTime).minute(),
        second: 0,
      }).toDate();

    return {
      title: `${aula.subject.name} - Turma ${aula.class.name}`,
      start: dataInicio,
      end: dataFim,
      allDay: false,
    };
  });
  return eventos;
};

export default function AgendaCalendar({ aulas }: AgendaCalendarProps) {
  const eventos = formatarAulasParaEventos(aulas);

  const messages = {
      allDay: 'Dia Inteiro',
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
      noEventsInRange: 'Não há eventos neste período.',
      showMore: (total: number) => `+ Ver mais (${total})`,
  };

  return (
    <div className="h-[70vh]"> {/* Define uma altura para o container do calendário */}
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK} // A visualização padrão será a semanal
        views={['week', 'day']} // Permite alternar entre semana e dia
        messages={messages}
        culture='pt-br'
      />
    </div>
  );
}
