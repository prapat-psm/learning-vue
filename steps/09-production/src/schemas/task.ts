import { z } from 'zod'

/** Local date as YYYY-MM-DD (what <input type="date"> uses). */
export function today(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * ONE schema = validation rules + TypeScript type.
 * Same idea as react-hook-form + zodResolver(schema).
 */
export const titleSchema = z
  .string()
  .trim()
  .min(3, 'Title needs at least 3 characters')
  .max(80, 'Title can be at most 80 characters')

export const taskSchema = z.object({
  title: titleSchema,
  description: z.string().trim().max(500, 'Description can be at most 500 characters').default(''),
  priority: z.enum(['low', 'medium', 'high'], { message: 'Choose a priority' }),
  dueDate: z
    .string()
    .optional()
    // ISO dates compare correctly as strings: '2026-11-04' < '2026-11-05'
    .refine((v) => !v || v >= today(), 'Due date cannot be in the past'),
})

// z.infer: the type comes FROM the schema, so they can never drift apart
export type TaskInput = z.infer<typeof taskSchema>
