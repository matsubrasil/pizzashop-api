import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'

/**
 * Se o usuário não for manager de um restaurante, ele não esta autorizado.
 * Lista o pedido com os items.
 */
export const getOrderDetails = new Elysia().use(auth).get(
  '/order/:orderId',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      where(fields, { and, eq }) {
        return and(
          eq(fields.restaurantId, restaurantId),
          eq(fields.id, orderId),
        )
      },
    })

    if (!order) {
      set.status = 400
      return { message: 'Order not found' }
    }

    return order
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
