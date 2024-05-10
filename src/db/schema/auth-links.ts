import { text, timestamp, pgTable } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'

/**
 * Se excluir um usuário, deve excluir também todos os authLinks (onDelete = CASCADE)
 */

export const authLinks = pgTable('auth_links', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  code: text('code').notNull().unique(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
