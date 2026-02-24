import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes'
import { env } from './config/env'
import { notFound } from './middlewares/notFound'
import { errorHandler } from './middlewares/errorHandler'
import dotenv from 'dotenv'
import { supabase } from './config/SupabaseClient'
import parceiro from './routes/parceiro'
import cliente from './routes/cliente'
import comercial from './routes/comercial'
import juridico from './routes/juridico'
import traducoes from './routes/traducoes'
import config from './routes/config'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()

app.use(cors())
// Rota de Webhook do Stripe precisa do corpo bruto (raw) para validar a assinatura
app.post('/comercial/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const ComercialController = require('./controllers/ComercialController').default
  ComercialController.handleStripeWebhook(req, res)
})
app.post('/webhooks/mercadopago', express.json(), (req, res) => {
  const ComercialController = require('./controllers/ComercialController').default
  ComercialController.handleMercadoPagoWebhook(req, res)
})
app.use(express.json())
app.use(morgan('dev'))


app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API BoraExpandir', env: env.NODE_ENV })
})

app.use('/api', router)
app.use('/auth', authRoutes)
app.use('/parceiro', parceiro)
app.use('/cliente', cliente)
app.use('/comercial', comercial)
app.use('/juridico', juridico)
app.use('/traducoes', traducoes)
app.use('/configuracoes', config)

app.post('/leads', (req, res) => {
  const ClienteController = require('./controllers/ClienteController').default
  ClienteController.registerLead(req, res)
})



app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`Servidor rodando na porta ${env.PORT}`)
  })
}

export default app
