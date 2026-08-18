import { StackSection } from '@/components/ui/StackSection';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { FeaturedProperties } from '@/features/home/components/FeaturedProperties';
import { Hero } from '@/features/home/components/Hero';
import { PopularDestinations } from '@/features/home/components/PopularDestinations';
import { Testimonials } from '@/features/home/components/Testimonials';
import { catalogServerService } from '@/features/properties/services/catalog.service';
import { propertiesServerService } from '@/features/properties/services/properties.service';

export const revalidate = 120;

export default async function HomePage() {
  const [featured, categories, destinations] = await Promise.all([
    propertiesServerService.featured(8),
    catalogServerService.categories(),
    catalogServerService.topDestinations(5),
  ]);

  return (
    <>
      {/* El hero ya tiene su propio sticky interno: queda al fondo de la pila. */}
      <Hero />

      <StackSection index={1} className="bg-white">
        <FeaturedProperties properties={featured ?? []} />
      </StackSection>

      <StackSection index={2} className="bg-white">
        <CategoryGrid categories={categories ?? []} />
      </StackSection>

      {/*
        Destinos NO va en la pila: su animación de scroll necesita recorrido
        propio. Dentro de un `sticky` con `overflow-hidden` la tarjeta queda
        pinneada y la sección siguiente la corta por encima.
      */}
      <section className="relative z-[3] rounded-t-[40px] bg-ink-50 shadow-[0_-24px_70px_-24px_rgba(28,25,23,0.45)]">
        <PopularDestinations destinations={destinations ?? []} />
      </section>

      <StackSection index={4} className="bg-ink-50">
        <Testimonials />
      </StackSection>
    </>
  );
}
