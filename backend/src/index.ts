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
import admRoutes from './routes/adm'
import formulario from './routes/formulario'
import apostilamentos from './routes/apostilamentos'
import financeiroRoutes from './routes/financeiro'
import usuarioRoutes from './routes/usuario'

dotenv.config()

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3010')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  })
)
app.use(morgan('dev')) // movido para o topo para logar até webhooks capturados antecipadamente

const autentiqueWebhookHandler = (req: any, res: any) => {
  const WebhookController = require('./controllers/WebhookController').default
  WebhookController.handleAutentiqueWebhook(req, res)
}

app.post('/webhooks/autentique', express.json(), autentiqueWebhookHandler)
app.post('//webhooks/autentique', express.json(), autentiqueWebhookHandler)

app.use(express.json())


app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API BoraExpandir', env: env.NODE_ENV })
})

app.use('/api', router)
app.use('/auth', authRoutes)
app.use('/parceiro', parceiro)
app.use('/cliente', cliente)
app.use('/comercial', comercial)
app.use('/juridico', juridico)
app.use('/usuario', usuarioRoutes)
app.use('/traducoes', traducoes)
app.use('/configuracoes', config)
app.use('/adm', admRoutes)
app.use('/formulario', formulario)
app.use('/apostilamentos', apostilamentos)
app.use('/financeiro', financeiroRoutes)

app.post('/leads', (req, res) => {
  const ClienteController = require('./controllers/ClienteController').default
  ClienteController.registerLead(req, res)
})

import { startCronJobs } from './workers/cronJobs'
startCronJobs()



app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`Servidor rodando na porta ${env.PORT}`)
  })
}

export default app
