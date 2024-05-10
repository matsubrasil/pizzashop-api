import { text, pgTable, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

import { orders, products } from '.'

/**
 * Se pedido for excluído, não faz sentido manter os items do pedido (onDelete = CASCADE)
 * Se um produto for excluído, mantém o item do pedido (onDelete = SET NULL)
 */
export const orderItems = pgTable('order_items', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),
  productId: text('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  priceInCents: integer('price_in_cents').notNull(),
  quantity: integer('quantity').notNull(),
})

export const OrderItemsRelations = relations(orderItems, ({ one }) => {
  return {
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
      relationName: 'order_item_order',
    }),
    product: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
      relationName: 'order_item_product',
    }),
  }
})
