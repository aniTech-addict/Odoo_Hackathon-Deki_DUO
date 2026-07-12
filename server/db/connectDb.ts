import prisma from './prisma.js'

export default async function connectDb() {
	await prisma.$connect()
}
