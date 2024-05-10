import { text, pgTable, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

import { orderItems, restaurants, users } from '.'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'delivering',
  'delivered',
  'canceled',
])

/**
 * Se um usuário for excluído, os pedidos não são excluídos, desta forma não afeta a contabilidade. (onDelete = SET NULL)
 * Se um restaurante for excluído, todos os pedidos são deste restaurante são excluídos. (onDelete = CASCADE)
 */
export const orders = pgTable('orders', {
  id: text('id')
    .notNull()
    .$defaultFn(() => createId())
    .primaryKey(),
  customerId: text('customer_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    }),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalInCents: integer('total_in_cents').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const ordersRelations = relations(orders, ({ one, many }) => {
  return {
    customer: one(users, {
      fields: [orders.customerId],
      references: [users.id],
      relationName: 'order_customer',
    }),
    restaurant: one(restaurants, {
      fields: [orders.restaurantId],
      references: [restaurants.id],
      relationName: 'order_restaurant',
    }),
    orderItems: many(orderItems),
  }
})
