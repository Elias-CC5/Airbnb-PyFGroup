import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe incluir mayúscula, minúscula y número');

export const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Ingresa tu nombre').max(80),
    lastName: z.string().min(2, 'Ingresa tus apellidos').max(80),
    email: z.string().email('Correo inválido'),
    phone: z
      .string()
      .regex(/^[\d\s+()-]{6,20}$/, 'Teléfono inválido')
      .optional()
      .or(z.literal('')),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo inválido'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token requerido'),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
