'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export type Review = {
  id: string | number;
  name: string;
  affiliation: string;
  quote: string;
  imageSrc: string;
  thumbnailSrc: string;
};

interface TestimonialSliderProps {
  reviews: Review[];
  className?: string;
  /** Texto vertical de la columna izquierda. */
  label?: string;
}

/** Slider de testimonios con transición vertical de la foto y lateral del texto. */
export function TestimonialSlider({
  reviews,
  className,
  label = 'Reseñas',
}: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  if (!reviews.length) return null;
  const activeReview = reviews[currentIndex];

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  const handleNext = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const thumbnails = reviews.filter((_, i) => i !== currentIndex).slice(0, 3);

  const imageVariants = {
    enter: (dir: 'left' | 'right') => ({ y: dir === 'right' ? '100%' : '-100%', opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: 'left' | 'right') => ({ y: dir === 'right' ? '-100%' : '100%', opacity: 0 }),
  };

  const textVariants = {
    enter: (dir: 'left' | 'right') => ({ x: dir === 'right' ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right') => ({ x: dir === 'right' ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className={cn('relative w-full overflow-hidden text-ink-900', className)}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Columna izquierda: contador y miniaturas */}
        <div className="order-2 flex flex-col justify-between md:order-1 md:col-span-3">
          <div className="flex flex-row justify-between space-x-4 md:flex-col md:justify-start md:space-x-0 md:space-y-4">
            <span className="font-mono text-sm text-ink-500">
              {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(reviews.length).padStart(2, '0')}
            </span>
            <h3 className="hidden text-sm font-medium uppercase tracking-widest text-ink-400 [writing-mode:vertical-rl] md:block md:rotate-180">
              {label}
            </h3>
          </div>

          <div className="mt-8 flex space-x-2 md:mt-0">
            {thumbnails.map((review) => {
              const originalIndex = reviews.findIndex((r) => r.id === review.id);
              return (
                <button
                  key={review.id}
                  onClick={() => goTo(originalIndex)}
                  aria-label={`Ver la reseña de ${review.name}`}
                  className="h-20 w-16 overflow-hidden rounded-md opacity-70 transition-opacity duration-300 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 md:h-24 md:w-20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={review.thumbnailSrc}
                    alt={review.name}
                    className="size-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna central: foto */}
        <div className="relative order-1 min-h-[380px] md:order-2 md:col-span-4 md:min-h-[460px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentIndex}
              src={activeReview.imageSrc}
              alt={activeReview.name}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 size-full rounded-xl object-cover"
            />
          </AnimatePresence>
        </div>

        {/* Columna derecha: texto y navegación */}
        <div className="order-3 flex flex-col justify-between md:col-span-5 md:pl-6">
          <div className="relative min-h-[220px] overflow-hidden pt-4 md:pt-16">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <p className="text-sm text-ink-500">{activeReview.affiliation}</p>
                <p className="mt-1 text-lg font-semibold text-ink-900">{activeReview.name}</p>
                <blockquote className="mt-6 text-xl font-medium leading-snug text-ink-800 md:text-2xl">
                  “{activeReview.quote}”
                </blockquote>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center gap-2 md:mt-0">
            <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Reseña anterior">
              <ArrowLeft className="size-5" />
            </Button>
            <Button variant="primary" size="icon" onClick={handleNext} aria-label="Reseña siguiente">
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
