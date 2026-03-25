// ===== MENSAGENS DE SUCESSO =====
export const SUCESSO = {
  AGENDAMENTO_CRIADO: "Agendamento criado com sucesso!",
  CLIENTE_CADASTRADO: "Cliente cadastrado com sucesso!",
  CONTRATO_GERADO: "Contrato gerado com sucesso!",
  LINK_PAGAMENTO_CRIADO: "Link de pagamento criado com sucesso!",
  OPERACAO_CONCLUIDA: "Operação realizada com sucesso!",
  DADOS_SALVOS: "Dados salvos com sucesso!",
  PAGAMENTO_CONFIRMADO: "Pagamento confirmado com sucesso!",
  CONTRATO_ASSINADO: "Contrato assinado com sucesso!",
} as const;

// ===== MENSAGENS DE ERRO =====
export const ERRO = {
  AGENDAMENTO_FALHOU: "Erro ao criar agendamento. Tente novamente.",
  HORARIO_INDISPONIVEL: "Este horário não está disponível.",
  CLIENTE_NAO_ENCONTRADO: "Cliente não encontrado.",
  CONTRATO_NAO_SALVO: "Erro ao salvar contrato.",
  LINK_PAGAMENTO_ERRO: "Erro ao gerar link de pagamento.",
  CONEXAO_FALHOU: "Erro de conexão com o servidor.",
  CAMPOS_OBRIGATORIOS: "Preencha todos os campos obrigatórios.",
  ARQUIVO_NAO_CARREGADO: "Erro ao carregar o arquivo.",
} as const;

// ===== MENSAGENS DE AVISO =====
export const AVISO = {
  OPERACAO_LENTA: "A operação está demorando. Aguarde...",
  DADOS_NAO_SALVOS: "Você tem dados não salvos.",
  HORARIOS_POUCOS: "Poucos horários disponíveis no mês.",
  PAGAMENTO_PENDENTE: "Você tem pagamentos pendentes.",
  SESSAO_EXPIRANDO: "Sua sessão está prestes a expirar.",
} as const;

// ===== MENSAGENS DE INFORMAÇÃO =====
export const INFO = {
  CARREGANDO: "Carregando informações...",
  PROCESSANDO: "Processando sua solicitação...",
  NENHUM_RESULTADO: "Nenhum resultado encontrado.",
  AGENDAMENTO_CANCELADO: "Agendamento cancelado.",
  DADOS_ATUALIZADOS: "Dados atualizados com sucesso!",
  FRASE_DO_DIA: "A persistência é o caminho do êxito",
} as const;

// ===== FRASES MOTIVACIONAIS =====
export const FRASES_MOTIVACIONAIS = [
  "A persistência é o caminho do êxito",
  "Inovação transforma ideias em realidade",
  "Qualidade em cada detalhe",
  "Crescimento começa com ação",
  "Juntos somos mais fortes",
  "Seu potencial é ilimitado",
  "Cada desafio é uma oportunidade",
  "Sucesso é uma jornada, não um destino",
  "Transforme sonhos em resultados",
  "Seja o protagonista da sua história",
  "O melhor momento é agora",
  "Sua visão cria seu futuro",
];

// ===== FUNÇÕES AUXILIARES =====
export const getRandomFrase = (): string => {
  return FRASES_MOTIVACIONAIS[Math.floor(Math.random() * FRASES_MOTIVACIONAIS.length)];
};

export const getDailyFrase = (): string => {
  const key = `frase_${new Date().toDateString()}`;
  const cached = localStorage.getItem(key);
  if (cached) return cached;
  
  const frase = getRandomFrase();
  localStorage.setItem(key, frase);
  return frase;
};
