// app/dashboard/layout.tsx
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar'; // Importe a Sidebar

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar /> {/* Use o componente Sidebar dinâmico */}
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}