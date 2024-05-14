import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { orderItems, orders, products } from '../../db/schema'
import { desc, eq, sum, and, gte, lte, sql } from 'drizzle-orm'
import dayjs from 'dayjs'

/**
 *
 */
export const getDailyRevenueInPeriod = new Elysia().use(auth).get(
  '/metrics/daily-revenue-in-period',
  async ({ getCurrentUser, query, set }) => {
    const { restaurantId } = await getCurrentUser()
    const { from, to } = query

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs()

    // se existe "from"", pega a data, senão, pega 7 dias atrás
    const startDate = from ? dayjs(from) : today.subtract(7, 'days')

    // se existe "to", pega a data, se não existe, tem 2 possibilidade
    // 1. se existe a data "from", a data to são 7 dias após a data "from"
    // 2. se não existe a data "from", então, a data "to" é a data de hoje.
    const endDate = to ? dayjs(to) : from ? startDate.add(7, 'days') : today

    if (endDate.diff(startDate, 'days') > 7) {
      set.status = 400

      return {
        message: 'You cannot list revenue in a larger period than 7 days.',
      }
    }

    // 2024-02-21T11:22:00-03:00 ( o front-end vai manda com time zone )
    // 2024-02-21T14:22:00       ( vou pegar esta hora e adicionar o timezone para o horário)
    const revenuePerDay = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD/MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(
            orders.createdAt,
            startDate
              .startOf('day')
              .add(startDate.utcOffset(), 'minutes')
              .toDate(),
          ),
          lte(
            orders.createdAt,
            endDate.endOf('day').add(endDate.utcOffset(), 'minutes').toDate(),
          ),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`)
      .orderBy((fields) => {
        return desc(fields.date)
      })

    const orderedRevenuePerDay = revenuePerDay.sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number)
      const [dayB, monthB] = b.date.split('/').map(Number)

      if (monthA === monthB) {
        return dayA - dayB
      } else {
        const dateA = new Date(2024, monthA - 1)
        const dateB = new Date(2024, monthB - 1)
        return dateA.getTime() - dateB.getTime()
      }
    })
    return orderedRevenuePerDay
  },
  {
    query: t.Object({
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  },
)
