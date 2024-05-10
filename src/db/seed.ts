/* eslint-disable drizzle/enforce-delete-with-where*/
import { createId } from '@paralleldrive/cuid2'
import { faker } from '@faker-js/faker'
import {
  users,
  restaurants,
  orderItems,
  orders,
  products,
  authLinks,
  OrderItemsRelations,
} from './schema'
import { db } from './connection'

import chalk from 'chalk'

/**
 * Reset database
 */
await db.delete(users)
await db.delete(restaurants)
await db.delete(orderItems)
await db.delete(orders)
await db.delete(products)
await db.delete(authLinks)

console.log(chalk.yellow('Database reset!'))

/**
 * Create customers
 */
const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

console.log(chalk.yellow('Created customers!'))

/**
 * Create manager
 */
const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({
    id: users.id,
  })
console.log(chalk.yellow('Created manager!'))

/**
 * Create restaurant
 */
const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

console.log(chalk.yellow('Created restaurant!'))

function generateProducts() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    restaurantId: restaurant.id,
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490 })),
  }
}

/**
 * Create products
 */
const availableProducts = await db
  .insert(products)
  .values([
    generateProducts(),
    generateProducts(),
    generateProducts(),
    generateProducts(),
    generateProducts(),
    generateProducts(),
  ])
  .returning()

console.log(chalk.yellow('Create products!'))

/**
 * Create orders
 *
 * 1. criar 200 pedidos (ordersToInsert), faço um LOOP
 * 2. Para cada pedido, pode ter até 3 produtos (orderProducts)
 * 3. para cada produto de um pedido, pode ter até 3 quantidades.
 * 4. Então para cada produto e quantidade, guarda no (orderItemsToInsert)
 * 5. Ao final, adiciono o pedido (ordersToInsert)
 */
type OrderItemsInsert = typeof orderItems.$inferInsert
type OrderInsert = typeof orders.$inferInsert

const orderItemsToInsert: OrderItemsInsert[] = []
const ordersToInsert: OrderInsert[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()

  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 3 })
    totalInCents += orderProduct.priceInCents * quantity

    orderItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  })

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log(chalk.yellow('Create orders!'))

console.log(chalk.green('Database seeded successfully!'))

process.exit()
