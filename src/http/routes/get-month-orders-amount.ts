import Elysia from 'elysia'
import { eq, and, gte, count, sql } from 'drizzle-orm'
import dayjs from 'dayjs'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getMonthOrdersAmount = new Elysia()
  .use(auth)
  .get('/metrics/month-orders-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs() // 24-05-2024
    const lastMonth = today.subtract(1, 'month') // 24-04-2024
    const startOfLastMonth = lastMonth.startOf('month') // 01-04-2024

    const orderPerMonths = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const currentMothWWithYear = today.format('YYYY-MM') // 2024-05
    const lastMonthWithYear = lastMonth.format('YYYY-MM') // 2024-04

    const currentMonthOrdersAmount = orderPerMonths.find(
      (orderPerMonth) => orderPerMonth.monthWithYear === currentMothWWithYear,
    )

    console.log(orderPerMonths)

    const lastMonthOrdersAmount = orderPerMonths.find(
      (orderPerMonth) => orderPerMonth.monthWithYear === lastMonthWithYear,
    )

    const diffFromLastMonth =
      currentMonthOrdersAmount && lastMonthOrdersAmount
        ? (currentMonthOrdersAmount.amount * 100) / lastMonthOrdersAmount.amount
        : null

    return {
      amount: currentMonthOrdersAmount?.amount,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  })
