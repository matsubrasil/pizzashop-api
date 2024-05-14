import { Elysia } from 'elysia'

import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { signOut } from './routes/sign-out'
import { getProfile } from './routes/get-profile'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getOrderDetails } from './routes/get-order-details'
import { approveOrder } from './routes/approve-order'
import { cancelOrder } from './routes/cancel-order'
import { dispatchOrder } from './routes/dispatch-order'
import { deliverOrder } from './routes/deliver-order'
import { getOrders } from './routes/get-orders'
import { getMonthRevenue } from './routes/get-month-revenue'
import { getDayOrdersAmount } from './routes/get-day-orders-amount'
import { getMonthOrdersAmount } from './routes/get-month-orders-amount'
import { getMonthCanceledOrdersAmount } from './routes/get-month-canceled-orders-amount'
import { getPopularProducts } from './routes/get-popular-products'
import { getDailyRevenueInPeriod } from './routes/get-daily-revenue-in-period'

// HS256 -> secret
// RS256 -> priv/pub
// HS256  -> JWT -> header.payload.signature -> payload -> {sub, ...}

const app = new Elysia()

// routes
app.use(registerRestaurant)
app.use(sendAuthLink)
app.use(authenticateFromLink)
app.use(signOut)
app.use(getProfile)
app.use(getManagedRestaurant)
app.use(getOrderDetails)
app.use(approveOrder)
app.use(cancelOrder)
app.use(dispatchOrder)
app.use(deliverOrder)
app.use(getOrders)
app.use(getMonthRevenue)
app.use(getDayOrdersAmount)
app.use(getMonthOrdersAmount)
app.use(getMonthCanceledOrdersAmount)
app.use(getPopularProducts)
app.use(getDailyRevenueInPeriod)
app.onError(({ code, error, set }) => {
  switch (code) {
    case 'VALIDATION': {
      set.status = error.status
      return error.toResponse()
    }
    case 'NOT_FOUND': {
      return new Response(null, { status: 404 })
    }
    default: {
      console.error(error)
      return new Response(null, { status: 500 })
    }
  }
})

// run
app.listen(3333, () => {
  console.log('HTTP server running!')
})
