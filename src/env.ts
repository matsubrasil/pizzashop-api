import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config({
  path: '.env.local',
})

const envSchema = z.object({
  API_BASE_URL: z.string().url().min(1),
  AUTH_REDIRECT_URL: z.string().url().min(1),
  DATABASE_URL: z.string().url().min(1),
  JWT_SECRET_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
