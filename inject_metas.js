/**
 * Script temporario para injetar as metas comerciais no banco via Supabase.
 * Rodar uma vez: node inject_metas.js
 * Pode ser deletado apos execucao.
 */

const fs = require('fs')
const path = require('path')

// Leitura manual do .env do backend
const envPath = path.join(__dirname, 'backend', '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const SUPABASE_URL = env.SUPABASE_URL
const SUPABASE_SERVICE = env.SUPABASE_SERVICE

if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error('ERRO: SUPABASE_URL ou SUPABASE_SERVICE nao encontrados no .env')
  process.exit(1)
}

const metas = [
  // ──────────────────────────────────────────────
  // C1 - Consultor Junior
  // Fonte: screenshot (consultorias como vendas, comissao em R$, faturamento em EUR)
  // ──────────────────────────────────────────────
  { nivel: 'C1', meta_num: 1, min_vendas: 10,  max_vendas: 20,  valor_comissao_eur: 10,  min_faturamento_eur: 1500,  max_faturamento_eur: 3000,  pct_comissao_faturamento: 0.5  },
  { nivel: 'C1', meta_num: 2, min_vendas: 21,  max_vendas: 40,  valor_comissao_eur: 20,  min_faturamento_eur: 3001,  max_faturamento_eur: 6000,  pct_comissao_faturamento: 1    },
  { nivel: 'C1', meta_num: 3, min_vendas: 41,  max_vendas: 60,  valor_comissao_eur: 40,  min_faturamento_eur: 6001,  max_faturamento_eur: 10000, pct_comissao_faturamento: 1.5  },
  { nivel: 'C1', meta_num: 4, min_vendas: 61,  max_vendas: null,valor_comissao_eur: 60,  min_faturamento_eur: 10001, max_faturamento_eur: null,  pct_comissao_faturamento: 2    },

  // ──────────────────────────────────────────────
  // C2 - Consultor Senior + Assessoria
  // ──────────────────────────────────────────────
  { nivel: 'C2', meta_num: 1, min_vendas: 1,   max_vendas: 20,  valor_comissao_eur: 10,  min_faturamento_eur: 5000,  max_faturamento_eur: 10000, pct_comissao_faturamento: 0.5  },
  { nivel: 'C2', meta_num: 2, min_vendas: 21,  max_vendas: 40,  valor_comissao_eur: 20,  min_faturamento_eur: 10001, max_faturamento_eur: 20000, pct_comissao_faturamento: 1    },
  { nivel: 'C2', meta_num: 3, min_vendas: 41,  max_vendas: 80,  valor_comissao_eur: 40,  min_faturamento_eur: 20001, max_faturamento_eur: 40000, pct_comissao_faturamento: 1.5  },
  { nivel: 'C2', meta_num: 4, min_vendas: 81,  max_vendas: null,valor_comissao_eur: 80,  min_faturamento_eur: 40001, max_faturamento_eur: null,  pct_comissao_faturamento: 2    },

  // ──────────────────────────────────────────────
  // HEAD - Supervisor de Equipe
  // ──────────────────────────────────────────────
  { nivel: 'HEAD', meta_num: 1, min_vendas: 40,  max_vendas: 80,  valor_comissao_eur: 5,   min_faturamento_eur: 16000, max_faturamento_eur: 32000,  pct_comissao_faturamento: 0.25 },
  { nivel: 'HEAD', meta_num: 2, min_vendas: 81,  max_vendas: 120, valor_comissao_eur: 10,  min_faturamento_eur: 32001, max_faturamento_eur: 60000,  pct_comissao_faturamento: 0.5  },
  { nivel: 'HEAD', meta_num: 3, min_vendas: 121, max_vendas: 200, valor_comissao_eur: 20,  min_faturamento_eur: 60001, max_faturamento_eur: 100000, pct_comissao_faturamento: 1    },
  { nivel: 'HEAD', meta_num: 4, min_vendas: 201, max_vendas: null,valor_comissao_eur: 30,  min_faturamento_eur: 100001,max_faturamento_eur: null,  pct_comissao_faturamento: 1.5  },
]

const payloads = metas.map(m => ({
  ...m,
  atualizado_em: new Date().toISOString()
}))

async function run() {
  const url = `${SUPABASE_URL}/rest/v1/metas_comerciais`
  const headers = {
    'apikey': SUPABASE_SERVICE,
    'Authorization': `Bearer ${SUPABASE_SERVICE}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation'
  }

  console.log(`Injetando ${payloads.length} metas em ${SUPABASE_URL}...`)

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payloads)
  })

  const text = await res.text()

  if (!res.ok) {
    console.error(`ERRO ${res.status}:`, text)
    process.exit(1)
  }

  const data = JSON.parse(text)
  console.log(`Sucesso! ${data.length} registros inseridos/atualizados.`)
  data.forEach(r => console.log(`  ${r.nivel} Meta ${r.meta_num}: vendas ${r.min_vendas}-${r.max_vendas ?? 'ilimitado'}, comissao ${r.valor_comissao_eur}, faturamento ${r.min_faturamento_eur}-${r.max_faturamento_eur ?? 'ilimitado'} (${r.pct_comissao_faturamento}%)`))
}

run().catch(err => {
  console.error('Erro inesperado:', err)
  process.exit(1)
})
