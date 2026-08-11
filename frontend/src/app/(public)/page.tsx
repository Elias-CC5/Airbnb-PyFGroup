import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { FeaturedProperties } from '@/features/home/components/FeaturedProperties';
import { HostCta } from '@/features/home/components/HostCta';
import { HowItWorks } from '@/features/home/components/HowItWorks';
import { ParallaxHero } from '@/features/home/components/ParallaxHero';
import { PopularDestinations } from '@/features/home/components/PopularDestinations';
import { Testimonials } from '@/features/home/components/Testimonials';
import { catalogServerService } from '@/features/properties/services/catalog.service';
import { propertiesServerService } from '@/features/properties/services/properties.service';

export const revalidate = 120;

/**
 * Home renderizada en el servidor: bueno para SEO y para el primer pintado.
 * Cada bloque degrada a null si la API no responde, la página nunca se rompe.
 */
export default async function HomePage() {
  const [featured, categories, destinations] = await Promise.all([
    propertiesServerService.featured(8),
    catalogServerService.categories(),
    catalogServerService.topDestinations(5),
  ]);

  return (
    <>
      <ParallaxHero />
      <CategoryGrid categories={categories ?? []} />
      <FeaturedProperties properties={featured ?? []} />
      <PopularDestinations destinations={destinations ?? []} />
      <HowItWorks />
      <Testimonials />
      <HostCta />
    </>
  );
}