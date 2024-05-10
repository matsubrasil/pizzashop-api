import postgres from 'postgres'
import chalk from 'chalk'
import { env } from '../env'
import * as schema from './schema/index.ts'

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const connection = postgres(env.DATABASE_URL, { max: 1 })
const db = drizzle(connection, { schema })

await migrate(db, { migrationsFolder: 'drizzle' })
console.log(chalk.greenBright('Migrations applied successfully!'))

await connection.end()
console.log(chalk.bgMagentaBright('Connection end...'))
process.exit(1)
