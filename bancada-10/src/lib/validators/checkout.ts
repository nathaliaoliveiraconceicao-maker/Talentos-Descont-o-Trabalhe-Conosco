import { z } from 'zod'
import { isValidCpf } from '@/lib/utils/masks'

export const identificationSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.'),
  email: z.string().trim().email('E-mail inválido.'),
  cpf: z.string().refine((v) => isValidCpf(v), 'CPF inválido.'),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Telefone inválido.'),
})

export const addressSchema = z.object({
  zipCode: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length === 8, 'CEP inválido.'),
  street: z.string().trim().min(2, 'Informe a rua.'),
  number: z.string().trim().min(1, 'Informe o número.'),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(2, 'Informe o bairro.'),
  city: z.string().trim().min(2, 'Informe a cidade.'),
  state: z.string().trim().length(2, 'Use a sigla do estado (ex.: SP).'),
})

export const paymentMethodSchema = z.enum(['pix', 'credit_card', 'boleto'])

export const checkoutSchema = z.object({
  identification: identificationSchema,
  address: addressSchema,
  shippingOptionId: z.string().min(1, 'Selecione uma opção de entrega.'),
  paymentMethod: paymentMethodSchema,
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: 'É necessário aceitar os termos para continuar.' }) }),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
