'use client';

import { DiagonalMarquee } from '@/components/ui/DiagonalMarquee';

const CARDS = ['cusco', 'lima', 'arequipa', 'ica', 'piura', 'puno'].map((name, i) => ({
  id: i,
  url: `https://picsum.photos/seed/wasi-${name}/680/480`,
  title: name,
}));

export default function TestMarquee() {
  return (
    <div className="h-screen w-full">
      <DiagonalMarquee cards={CARDS} />
    </div>
  );
}