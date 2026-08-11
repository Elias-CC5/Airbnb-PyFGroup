'use client';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import { buildWhatsappUrl } from '../services/whatsapp.service';

interface WhatsappButtonProps {
  phone?: string | null;
  propertyTitle: string;
  location: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  className?: string;
  variant?: 'outline' | 'ghost' | 'primary';
  label?: string;
}

/** Abre WhatsApp con un mensaje ya redactado para el anfitrión. */
export function WhatsappButton({
  phone,
  propertyTitle,
  location,
  checkIn,
  checkOut,
  guests,
  className,
  variant = 'outline',
  label = 'Contactar por WhatsApp',
}: WhatsappButtonProps) {
  const url = buildWhatsappUrl({ phone, propertyTitle, location, checkIn, checkOut, guests });

  return (
    <Button asChild variant={variant} size="lg" fullWidth className={cn(className)}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-4.5" />
        {label}
      </a>
    </Button>
  );
}
