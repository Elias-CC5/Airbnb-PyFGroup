import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/components/shared/RequireAuth';
import { AccountNav } from '@/components/layout/AccountNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="contenido" className="container-page min-h-[60vh] pt-28 pb-10 sm:pt-32">
        <RequireAuth>
          <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
            <AccountNav />
            <div className="min-w-0">{children}</div>
          </div>
        </RequireAuth>
      </main>
      <Footer />
    </>
  );
}