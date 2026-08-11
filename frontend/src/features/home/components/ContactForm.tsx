'use client';

import { Button, Input, Label, Textarea } from '@/components/ui';
import { SITE } from '@/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Ingresa tu nombre'),
  email: z.string().email('Correo inválido'),
  subject: z.string().min(3, 'Ingresa un asunto'),
  message: z.string().min(10, 'Cuéntanos un poco más'),
});

type ContactInput = z.infer<typeof contactSchema>;

/**
 * El formulario abre WhatsApp con el mensaje ya redactado: comunicación directa
 * sin infraestructura de correo. El módulo backend de mensajes queda listo para
 * persistirlos cuando se necesite.
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = handleSubmit((values) => {
    const text = [
      `Hola, soy ${values.name}.`,
      `Asunto: ${values.subject}`,
      values.message,
      `Mi correo: ${values.email}`,
    ].join('\n');

    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    toast.success('Abrimos WhatsApp con tu mensaje listo para enviar');
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>Nombre</Label>
          <Input id="name" placeholder="Ana Quispe" error={errors.name?.message} {...register('name')} />
        </div>
        <div>
          <Label htmlFor="email" required>Correo</Label>
          <Input id="email" type="email" placeholder="ana@correo.com" error={errors.email?.message} {...register('email')} />
        </div>
      </div>

      <div>
        <Label htmlFor="subject" required>Asunto</Label>
        <Input id="subject" placeholder="Consulta sobre una reserva" error={errors.subject?.message} {...register('subject')} />
      </div>

      <div>
        <Label htmlFor="message" required>Mensaje</Label>
        <Textarea id="message" placeholder="Cuéntanos en qué podemos ayudarte…" error={errors.message?.message} {...register('message')} />
      </div>

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Enviar por WhatsApp
      </Button>
    </form>
  );
}
