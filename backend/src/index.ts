import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import router from './routes'
import { env } from './config/env'
import { notFound } from './middlewares/notFound'
import { errorHandler } from './middlewares/errorHandler'
import dotenv from 'dotenv'
import {supabase} from './config/SupabaseClient'
import parceiro from './routes/parceiro'
import cliente from './routes/cliente'
import comercial from './routes/comercial'
import juridico from './routes/juridico'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))


app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API BoraExpandir', env: env.NODE_ENV })
})

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Endpoint de exemplo funcionando!' })
})

app.use('/api', router)
app.use('/parceiro', parceiro)
app.use('/cliente', cliente)
app.use('/comercial', comercial)
app.use('/juridico', juridico)



app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`Servidor rodando na porta ${env.PORT}`)
  })
}

export default app
