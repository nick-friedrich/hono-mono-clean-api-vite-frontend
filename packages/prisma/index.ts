import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn']
    })
  }
  prisma = global.cachedPrisma
}

export * from '@prisma/client'
export const db = prisma