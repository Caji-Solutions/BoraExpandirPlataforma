import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido').trim().toLowerCase(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').trim().toLowerCase(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['comercial', 'juridico', 'administrativo', 'tradutor', 'super_admin'])
})

export const uuidSchema = z.string().uuid('ID inválido')

export const validateInput = (schema: z.ZodSchema, data: any) => {
  try {
    return { success: true, data: schema.parse(data) }
  } catch (error: any) {
    return { success: false, errors: error.errors }
  }
}
