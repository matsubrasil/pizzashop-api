import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'

/**
 * Retorna a informação do restaurante do usuário logado.
 */
export const getManagedRestaurant = new Elysia()
  .use(auth)
  .get('/managed-restaurant', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new Error('User is not manager.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    if (!managedRestaurant) {
      throw new Error('Managed restaurant does not exist.')
    }

    return managedRestaurant
  })
