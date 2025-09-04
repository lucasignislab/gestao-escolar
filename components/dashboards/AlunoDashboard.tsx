'use client';

import { Profile, Lesson, Subject, Class } from '@prisma/client';
import AgendaCalendar from './AgendaCalendar';

interface AlunoDashboardProps {
  profile: Profile;
  aulas: Array<Lesson & {
    subject: Subject;
    class: Class;
  }>;
}

export default function AlunoDashboard({ profile, aulas }: AlunoDashboardProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Minha Agenda</h1>
      <p className="text-gray-600 mb-8">Sua grade horária para a semana atual.</p>
      <AgendaCalendar aulas={aulas} />
    </div>
  );
}
