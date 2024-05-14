import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, desc, eq, gte, sql, sum } from 'drizzle-orm'
/**
 * Receita mensal
 * Quantos porcentos a receita (lucro) deste mês esta em relação ao mês anterior
 * Exemplo:
 *   22-02-2024 today
 *   01-01-2024 pedidos desde esta data até hoje
 */

export const getMonthRevenue = new Elysia()
  .use(auth)
  .get('/metrics/month-revenue', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs() // 24-05-2024
    const lastMonth = today.subtract(1, 'month') // 24-04-2024
    const startOfLastMonth = lastMonth.startOf('month') // 01-04-2024

    // retorna uma string, por isto, precisa realizar o cast para Number
    // revenue: sum(orders.totalInCents).mapWith(soma => Number(soma)),
    // simplificando
    // revenue: sum(orders.totalInCents).mapWith(Number),

    const monthRevenues = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number),
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

    const currentMonthRevenue = monthRevenues.find(
      (monthRevenue) => monthRevenue.monthWithYear === currentMothWWithYear,
    )
    const lastMonthRevenue = monthRevenues.find(
      (monthRevenue) => monthRevenue.monthWithYear === lastMonthWithYear,
    )

    console.log(currentMonthRevenue, lastMonthRevenue)

    const diffFromLastMonth =
      currentMonthRevenue && lastMonthRevenue
        ? (currentMonthRevenue.revenue * 100) / lastMonthRevenue.revenue
        : null

    return {
      revenue: currentMonthRevenue?.revenue,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  })
