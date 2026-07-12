import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const toNumber = (value: string | undefined, fallback: number) => {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

const envSchema = z.object({
	PORT: z.preprocess((val) => toNumber(val as string | undefined, 5000), z.number()),
	DATABASE_URL: z
		.string({
			message: 'DATABASE_URL is required',
		})
		.url('DATABASE_URL must be a valid connection URL'),
	JWT_ACCESS_SECRET: z
		.string({
			message: 'JWT_ACCESS_SECRET is required',
		})
		.min(1, 'JWT_ACCESS_SECRET cannot be empty'),
	JWT_REFRESH_SECRET: z
		.string({
			message: 'JWT_REFRESH_SECRET is required',
		})
		.min(1, 'JWT_REFRESH_SECRET cannot be empty'),
	SMTP_HOST: z.string().default(''),
	SMTP_PORT: z.preprocess((val) => toNumber(val as string | undefined, 587), z.number()),
	SMTP_USER: z.string().default(''),
	SMTP_PASS: z.string().default(''),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	console.error(' Invalid environment variables:', z.treeifyError(parsedEnv.error))
	throw new Error('Invalid environment variables')
}

export const {
	PORT,
	DATABASE_URL,
	JWT_ACCESS_SECRET,
	JWT_REFRESH_SECRET,
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
} = parsedEnv.data
