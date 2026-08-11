import { cn } from '@/lib/utils';
import { initials } from '@/lib/format';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-base' };
const PX = { sm: 32, md: 40, lg: 56 };

export function Avatar({ src, firstName, lastName, size = 'md', className }: AvatarProps) {
  const label = initials(firstName, lastName);

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-clay-100 font-semibold text-clay-700',
        SIZES[size],
        className,
      )}
      aria-hidden={!firstName}
    >
      {src ? (
        <Image src={src} alt={`${firstName ?? ''} ${lastName ?? ''}`.trim()} width={PX[size]} height={PX[size]} className="size-full object-cover" />
      ) : (
        label
      )}
    </span>
  );
}
