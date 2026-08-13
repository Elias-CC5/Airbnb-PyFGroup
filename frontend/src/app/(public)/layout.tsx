import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { WhatsappFloating } from '@/features/whatsapp/components/WhatsappFloating';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="contenido" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <WhatsappFloating />
    </>
  );
}