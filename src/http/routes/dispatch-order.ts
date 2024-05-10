import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { eq } from 'drizzle-orm'
import { orders } from '../../db/schema'

/**
 * Vamos ter uma rota para cada mudança de status do pedido.
 * Desta forma, o sistema fica mais simples, pois o fluxo fica melhor mapeado.
 * O sistema deixa apenas aprovar pedido com status igual a PENDING.
 */
export const dispatchOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/dispatch',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!order) {
      set.status = 400
      return { message: 'Order not found.' }
    }

    if (order.status !== 'processing') {
      set.status = 400
      return {
        message:
          'You cannot dispatch orders that are not in "processing" status',
      }
    }

    await db
      .update(orders)
      .set({ status: 'delivering' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
