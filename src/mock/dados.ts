/**
 * Conteúdo estático das telas.
 *
 * Este app é, por ora, só a camada visual: nenhuma tela busca API, grava nada nem guarda estado
 * entre sessões. Os nomes, origens e etapas vêm do CRM web (`src/lib/data.ts`) para que o desenho
 * seja avaliado com dado parecido com o real.
 */

export type Origem = 'Meta Ads' | 'Google Ads' | 'Instagram' | 'TikTok' | 'Indicação' | 'Formulário';
export type Canal = 'WhatsApp' | 'Instagram' | 'TikTok' | 'E-mail';

export const usuario = {
  nome: 'Ana Ferreira',
  iniciais: 'AF',
  cargo: 'Gestora de tráfego',
  email: 'ana@empresademo.com.br',
  workspace: 'Empresa Demo',
};

/* -------------------------------------------------------------------------- */
/* Agenda                                                                     */
/* -------------------------------------------------------------------------- */

export type Compromisso = {
  id: string;
  titulo: string;
  hora: string;
  com: string;
  local: string;
  status: 'Confirmado' | 'Atrasado' | 'Pendente';
};

export const compromissosHoje: Compromisso[] = [
  {
    id: 'c1',
    titulo: 'Call de apresentação',
    hora: '09:30',
    com: 'Beatriz Nogueira',
    local: 'Google Meet',
    status: 'Confirmado',
  },
  {
    id: 'c2',
    titulo: 'Retorno de proposta',
    hora: '11:00',
    com: 'Julia Prado',
    local: 'Ligação',
    status: 'Atrasado',
  },
  {
    id: 'c3',
    titulo: 'Alinhamento de tráfego',
    hora: '16:00',
    com: 'Equipe interna',
    local: 'Sala 2',
    status: 'Pendente',
  },
];

/* -------------------------------------------------------------------------- */
/* Conversas                                                                  */
/* -------------------------------------------------------------------------- */

export type Conversa = {
  id: string;
  iniciais: string;
  nome: string;
  canal: Canal;
  previa: string;
  tempo: string;
  naoLidas: number;
  origem: Origem;
  status: 'Aberta' | 'Aguardando' | 'Resolvida';
  responsavel: string;
};

export const conversas: Conversa[] = [
  {
    id: 'marcos-aurelio',
    iniciais: 'MA',
    nome: 'Marcos Aurélio',
    canal: 'WhatsApp',
    previa: 'Bom dia! Consegue me passar o valor do pacote completo?',
    tempo: '6 min',
    naoLidas: 2,
    origem: 'Meta Ads',
    status: 'Aberta',
    responsavel: 'Dr. Hélio Marinho',
  },
  {
    id: 'camila-duarte',
    iniciais: 'CD',
    nome: 'Camila Duarte',
    canal: 'Instagram',
    previa: 'Vi o story de vocês e queria entender como funciona',
    tempo: '14 min',
    naoLidas: 1,
    origem: 'Instagram',
    status: 'Aberta',
    responsavel: 'Ana Ferreira',
  },
  {
    id: 'beatriz-nogueira',
    iniciais: 'BN',
    nome: 'Beatriz Nogueira',
    canal: 'WhatsApp',
    previa: 'Perfeito, vou revisar o contrato e te falo hoje ainda',
    tempo: '21 min',
    naoLidas: 0,
    origem: 'Google Ads',
    status: 'Aguardando',
    responsavel: 'Bruno Salles',
  },
  {
    id: 'lorena-bastos',
    iniciais: 'LB',
    nome: 'Lorena Bastos',
    canal: 'TikTok',
    previa: 'oi, vcs atendem em Goiânia?',
    tempo: '31 min',
    naoLidas: 3,
    origem: 'TikTok',
    status: 'Aberta',
    responsavel: '',
  },
  {
    id: 'renata-farias',
    iniciais: 'RF',
    nome: 'Renata Farias',
    canal: 'WhatsApp',
    previa: 'Obrigada! Já recebi a proposta',
    tempo: '1h',
    naoLidas: 0,
    origem: 'Meta Ads',
    status: 'Aguardando',
    responsavel: 'Bruno Salles',
  },
  {
    id: 'paulo-lacerda',
    iniciais: 'PL',
    nome: 'Paulo Lacerda',
    canal: 'E-mail',
    previa: 'Fechado, pode emitir a nota nesses dados',
    tempo: '2h',
    naoLidas: 0,
    origem: 'Google Ads',
    status: 'Resolvida',
    responsavel: 'Bruno Salles',
  },
  {
    id: 'julia-prado',
    iniciais: 'JP',
    nome: 'Julia Prado',
    canal: 'WhatsApp',
    previa: 'Vou conversar com meu sócio e retorno',
    tempo: '4 d',
    naoLidas: 0,
    origem: 'Indicação',
    status: 'Aguardando',
    responsavel: 'Bruno Salles',
  },
];

export type Mensagem = {
  id: string;
  tipo: 'in' | 'out' | 'sistema';
  texto: string;
  hora: string;
  status?: 'enviada' | 'entregue' | 'lida';
};

export const mensagens: Mensagem[] = [
  { id: 'm0', tipo: 'sistema', texto: 'Conversa iniciada por anúncio do Meta Ads', hora: '08:40' },
  { id: 'm1', tipo: 'in', texto: 'Bom dia! Vi o anúncio de vocês no Instagram.', hora: '08:41' },
  {
    id: 'm2',
    tipo: 'out',
    texto: 'Bom dia, Marcos! Que bom que chegou até aqui. Como posso ajudar?',
    hora: '08:44',
    status: 'lida',
  },
  { id: 'm3', tipo: 'in', texto: 'Queria entender melhor o que está incluso no pacote.', hora: '08:46' },
  {
    id: 'm4',
    tipo: 'out',
    texto:
      'Claro. O pacote completo inclui a consulta inicial, o acompanhamento mensal e o suporte pelo WhatsApp em horário comercial.',
    hora: '08:49',
    status: 'lida',
  },
  { id: 'm5', tipo: 'in', texto: 'Consegue me passar o valor do pacote completo?', hora: '09:12' },
  { id: 'm6', tipo: 'in', texto: 'E vocês parcelam?', hora: '09:12' },
];

/* -------------------------------------------------------------------------- */
/* Funil                                                                      */
/* -------------------------------------------------------------------------- */

export type Negocio = {
  id: string;
  nome: string;
  iniciais: string;
  valor: string;
  origem: Origem;
  dias: string;
  responsavel: string;
  etiquetas: string[];
};

export type EtapaFunil = {
  id: string;
  titulo: string;
  cards: Negocio[];
};

export const funis = [
  { id: 'f1', nome: 'Funil comercial', responsavel: 'Bruno Salles' },
  { id: 'f2', nome: 'Pós-venda', responsavel: 'Ana Ferreira' },
];

export const etapasFunil: EtapaFunil[] = [
  {
    id: 'e1',
    titulo: 'Novo',
    cards: [
      {
        id: 'n1',
        nome: 'Camila Duarte',
        iniciais: 'CD',
        valor: '—',
        origem: 'Instagram',
        dias: 'hoje',
        responsavel: 'Ana Ferreira',
        etiquetas: ['Novo lead'],
      },
      {
        id: 'n2',
        nome: 'Fernando Lima',
        iniciais: 'FL',
        valor: '—',
        origem: 'Meta Ads',
        dias: 'hoje',
        responsavel: 'Ana Ferreira',
        etiquetas: [],
      },
      {
        id: 'n3',
        nome: 'Lorena Bastos',
        iniciais: 'LB',
        valor: '—',
        origem: 'TikTok',
        dias: '1 dia',
        responsavel: '',
        etiquetas: ['Sem responsável'],
      },
    ],
  },
  {
    id: 'e2',
    titulo: 'Qualificado',
    cards: [
      {
        id: 'n4',
        nome: 'Marcos Aurélio',
        iniciais: 'MA',
        valor: 'R$ 890',
        origem: 'Meta Ads',
        dias: '2 dias',
        responsavel: 'Dr. Hélio Marinho',
        etiquetas: ['Quente', 'Prioridade'],
      },
      {
        id: 'n5',
        nome: 'Beatriz Nogueira',
        iniciais: 'BN',
        valor: 'R$ 1.240',
        origem: 'Google Ads',
        dias: '3 dias',
        responsavel: 'Bruno Salles',
        etiquetas: ['Empresa'],
      },
    ],
  },
  {
    id: 'e3',
    titulo: 'Proposta',
    cards: [
      {
        id: 'n6',
        nome: 'Julia Prado',
        iniciais: 'JP',
        valor: 'R$ 2.100',
        origem: 'Indicação',
        dias: '4 dias',
        responsavel: 'Bruno Salles',
        etiquetas: ['Parada'],
      },
      {
        id: 'n7',
        nome: 'Renata Farias',
        iniciais: 'RF',
        valor: 'R$ 780',
        origem: 'Meta Ads',
        dias: '1 dia',
        responsavel: 'Bruno Salles',
        etiquetas: [],
      },
    ],
  },
  {
    id: 'e4',
    titulo: 'Fechado',
    cards: [
      {
        id: 'n8',
        nome: 'Paulo Lacerda',
        iniciais: 'PL',
        valor: 'R$ 1.560',
        origem: 'Google Ads',
        dias: 'hoje',
        responsavel: 'Bruno Salles',
        etiquetas: ['Ganho'],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Tarefas                                                                    */
/* -------------------------------------------------------------------------- */

export type Prioridade = 'urgente' | 'atencao' | 'oportunidade';

export type Tarefa = {
  id: string;
  titulo: string;
  contato: string;
  prazo: string;
  atrasada: boolean;
  responsavel: string;
  iniciaisResponsavel: string;
  prioridade: Prioridade;
};

export const colunasTarefas: { id: string; titulo: string; tarefas: Tarefa[] }[] = [
  {
    id: 't-fazer',
    titulo: 'A fazer',
    tarefas: [
      {
        id: 't1',
        titulo: 'Enviar contrato revisado',
        contato: 'Beatriz Nogueira',
        prazo: 'Ontem, 18:00',
        atrasada: true,
        responsavel: 'Bruno Salles',
        iniciaisResponsavel: 'BS',
        prioridade: 'urgente',
      },
      {
        id: 't2',
        titulo: 'Ligar para confirmar horário',
        contato: 'Julia Prado',
        prazo: 'Hoje, 11:00',
        atrasada: false,
        responsavel: 'Ana Ferreira',
        iniciaisResponsavel: 'AF',
        prioridade: 'atencao',
      },
      {
        id: 't3',
        titulo: 'Qualificar lead novo',
        contato: 'Camila Duarte',
        prazo: 'Hoje, 17:00',
        atrasada: false,
        responsavel: 'Ana Ferreira',
        iniciaisResponsavel: 'AF',
        prioridade: 'oportunidade',
      },
    ],
  },
  {
    id: 't-andamento',
    titulo: 'Em andamento',
    tarefas: [
      {
        id: 't4',
        titulo: 'Montar proposta comercial',
        contato: 'Marcos Aurélio',
        prazo: 'Amanhã, 10:00',
        atrasada: false,
        responsavel: 'Dr. Hélio Marinho',
        iniciaisResponsavel: 'HM',
        prioridade: 'atencao',
      },
    ],
  },
  {
    id: 't-concluido',
    titulo: 'Concluído',
    tarefas: [
      {
        id: 't5',
        titulo: 'Emitir nota fiscal',
        contato: 'Paulo Lacerda',
        prazo: 'Hoje, 09:00',
        atrasada: false,
        responsavel: 'Bruno Salles',
        iniciaisResponsavel: 'BS',
        prioridade: 'oportunidade',
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Contatos                                                                   */
/* -------------------------------------------------------------------------- */

export type Contato = {
  id: string;
  iniciais: string;
  nome: string;
  origem: Origem;
  etapa: 'Novo' | 'Qualificado' | 'Proposta' | 'Fechado';
  responsavel: string;
  ultima: string;
  valor: string;
  email: string;
  whatsapp: string;
  cidade: string;
  etiquetas: string[];
  favorito: boolean;
};

export const contatos: Contato[] = [
  {
    id: 'marcos-aurelio',
    iniciais: 'MA',
    nome: 'Marcos Aurélio',
    origem: 'Meta Ads',
    etapa: 'Qualificado',
    responsavel: 'Dr. Hélio Marinho',
    ultima: 'Há 6 min',
    valor: 'R$ 890',
    email: 'marcos.aurelio@gmail.com',
    whatsapp: '(62) 99999-0001',
    cidade: 'Goiânia, GO',
    etiquetas: ['Quente', 'Prioridade'],
    favorito: true,
  },
  {
    id: 'beatriz-nogueira',
    iniciais: 'BN',
    nome: 'Beatriz Nogueira',
    origem: 'Google Ads',
    etapa: 'Qualificado',
    responsavel: 'Bruno Salles',
    ultima: 'Há 21 min',
    valor: 'R$ 1.240',
    email: 'beatriz@studiobeatriz.com.br',
    whatsapp: '(62) 99999-0002',
    cidade: 'Anápolis, GO',
    etiquetas: ['Empresa'],
    favorito: false,
  },
  {
    id: 'camila-duarte',
    iniciais: 'CD',
    nome: 'Camila Duarte',
    origem: 'Instagram',
    etapa: 'Novo',
    responsavel: 'Ana Ferreira',
    ultima: 'Há 14 min',
    valor: '—',
    email: 'camila.duarte@gmail.com',
    whatsapp: '(62) 99999-0003',
    cidade: 'Goiânia, GO',
    etiquetas: ['Novo lead'],
    favorito: true,
  },
  {
    id: 'fernando-lima',
    iniciais: 'FL',
    nome: 'Fernando Lima',
    origem: 'Meta Ads',
    etapa: 'Novo',
    responsavel: 'Ana Ferreira',
    ultima: 'Há 6 min',
    valor: '—',
    email: 'fernando.lima@gmail.com',
    whatsapp: '(62) 99999-0004',
    cidade: 'Aparecida de Goiânia, GO',
    etiquetas: [],
    favorito: false,
  },
  {
    id: 'julia-prado',
    iniciais: 'JP',
    nome: 'Julia Prado',
    origem: 'Indicação',
    etapa: 'Proposta',
    responsavel: 'Bruno Salles',
    ultima: 'Há 4 dias',
    valor: 'R$ 2.100',
    email: 'julia.prado@gmail.com',
    whatsapp: '(62) 99999-0005',
    cidade: 'Brasília, DF',
    etiquetas: ['Parada'],
    favorito: false,
  },
  {
    id: 'renata-farias',
    iniciais: 'RF',
    nome: 'Renata Farias',
    origem: 'Meta Ads',
    etapa: 'Proposta',
    responsavel: 'Bruno Salles',
    ultima: 'Há 1h',
    valor: 'R$ 780',
    email: 'renata.farias@gmail.com',
    whatsapp: '(62) 99999-0006',
    cidade: 'Goiânia, GO',
    etiquetas: [],
    favorito: false,
  },
  {
    id: 'paulo-lacerda',
    iniciais: 'PL',
    nome: 'Paulo Lacerda',
    origem: 'Google Ads',
    etapa: 'Fechado',
    responsavel: 'Bruno Salles',
    ultima: 'Há 2h',
    valor: 'R$ 1.560',
    email: 'paulo@lacerdaconsultoria.com',
    whatsapp: '(62) 99999-0007',
    cidade: 'Goiânia, GO',
    etiquetas: ['Cliente'],
    favorito: false,
  },
  {
    id: 'lorena-bastos',
    iniciais: 'LB',
    nome: 'Lorena Bastos',
    origem: 'TikTok',
    etapa: 'Novo',
    responsavel: '',
    ultima: 'Há 31 min',
    valor: '—',
    email: 'lorena.bastos@gmail.com',
    whatsapp: '(62) 99999-0008',
    cidade: 'Goiânia, GO',
    etiquetas: ['Sem responsável'],
    favorito: false,
  },
];

export const filtrosContatos = ['Todos', 'Meus leads', 'Favoritos', 'Meta Ads', 'Google Ads', 'Instagram', 'TikTok'];

/* -------------------------------------------------------------------------- */
/* Agenda                                                                     */
/* -------------------------------------------------------------------------- */

export const diasDaSemana = [
  { dia: 'Seg', numero: '8', eventos: 2 },
  { dia: 'Ter', numero: '9', eventos: 1 },
  { dia: 'Qua', numero: '10', eventos: 3, hoje: true },
  { dia: 'Qui', numero: '11', eventos: 0 },
  { dia: 'Sex', numero: '12', eventos: 2 },
  { dia: 'Sáb', numero: '13', eventos: 0 },
  { dia: 'Dom', numero: '14', eventos: 0 },
];

/* -------------------------------------------------------------------------- */
/* Equipe                                                                     */
/* -------------------------------------------------------------------------- */

export const equipe = [
  {
    id: 'u1',
    iniciais: 'AF',
    nome: 'Ana Ferreira',
    cargo: 'Gestora de tráfego',
    papel: 'Administrador',
    online: true,
    conversas: 12,
    negocios: 4,
  },
  {
    id: 'u2',
    iniciais: 'BS',
    nome: 'Bruno Salles',
    cargo: 'Closer',
    papel: 'Vendedor',
    online: true,
    conversas: 24,
    negocios: 9,
  },
  {
    id: 'u3',
    iniciais: 'HM',
    nome: 'Dr. Hélio Marinho',
    cargo: 'Especialista',
    papel: 'Vendedor',
    online: false,
    conversas: 8,
    negocios: 3,
  },
  {
    id: 'u4',
    iniciais: 'TS',
    nome: 'Thaynara Souza',
    cargo: 'Atendimento',
    papel: 'Atendente',
    online: false,
    conversas: 17,
    negocios: 1,
  },
];

/* -------------------------------------------------------------------------- */
/* Inteligência comercial                                                     */
/* -------------------------------------------------------------------------- */

export const leadsPorDia = [
  { rotulo: '17', valor: 38 },
  { rotulo: '18', valor: 52 },
  { rotulo: '19', valor: 44 },
  { rotulo: '20', valor: 66 },
  { rotulo: '21', valor: 58 },
  { rotulo: '22', valor: 30 },
  { rotulo: '23', valor: 34 },
  { rotulo: '24', valor: 70 },
  { rotulo: '25', valor: 62 },
  { rotulo: '26', valor: 48 },
  { rotulo: '27', valor: 55 },
  { rotulo: '28', valor: 40 },
  { rotulo: '29', valor: 60 },
  { rotulo: '30', valor: 84, destaque: true },
];

export const funilDoMes = [
  { etapa: 'Novo', total: 247, largura: 100 },
  { etapa: 'Qualificado', total: 143, largura: 58 },
  { etapa: 'Proposta', total: 59, largura: 24 },
  { etapa: 'Fechado', total: 36, largura: 15 },
];

export const kpisInicio = [
  { label: 'Leads no mês', valor: '247', delta: '+18% vs. junho' },
  { label: 'Taxa de conversão', valor: '14,6%', delta: '+2,1 pts' },
  { label: 'Vendas no mês', valor: 'R$ 38.400', delta: '+9% vs. junho' },
  { label: 'ROAS médio', valor: '4,2x', delta: '+0,4x' },
];

export const canaisDeTrafego = [
  { nome: 'Meta Ads', leads: 128, investimento: 'R$ 4.200', cpl: 'R$ 32,80', roas: '4,6x', share: 100 },
  { nome: 'Google Ads', leads: 74, investimento: 'R$ 3.100', cpl: 'R$ 41,90', roas: '3,4x', share: 58 },
  { nome: 'Instagram', leads: 28, investimento: '—', cpl: '—', roas: '—', share: 22 },
  { nome: 'TikTok', leads: 17, investimento: '—', cpl: '—', roas: '—', share: 13 },
];

export const motivosDePerda = [
  { motivo: 'Preço acima do esperado', total: 18, percentual: 42 },
  { motivo: 'Sem retorno do lead', total: 11, percentual: 26 },
  { motivo: 'Escolheu concorrente', total: 7, percentual: 16 },
  { motivo: 'Fora do perfil', total: 4, percentual: 9 },
  { motivo: 'Outro', total: 3, percentual: 7 },
];

export const atividadesPorVendedor = [
  { nome: 'Bruno Salles', iniciais: 'BS', ligacoes: 42, mensagens: 186, reunioes: 9, share: 100 },
  { nome: 'Ana Ferreira', iniciais: 'AF', ligacoes: 21, mensagens: 142, reunioes: 5, share: 68 },
  { nome: 'Dr. Hélio Marinho', iniciais: 'HM', ligacoes: 14, mensagens: 63, reunioes: 7, share: 41 },
  { nome: 'Thaynara Souza', iniciais: 'TS', ligacoes: 8, mensagens: 97, reunioes: 1, share: 33 },
];

export const etapasJornada = [
  { etapa: 'Primeiro contato', media: '4 min', total: 247 },
  { etapa: 'Qualificação', media: '1 dia', total: 143 },
  { etapa: 'Proposta enviada', media: '2 dias', total: 59 },
  { etapa: 'Negociação', media: '5 dias', total: 41 },
  { etapa: 'Fechamento', media: '8 dias', total: 36 },
];

export const relatorios = [
  { id: 'rel1', nome: 'Resumo comercial — agosto', tipo: 'PDF', gerado: '01/09/2025', autor: 'Ana Ferreira' },
  { id: 'rel2', nome: 'Performance por vendedor', tipo: 'PDF', gerado: '28/08/2025', autor: 'Bruno Salles' },
  { id: 'rel3', nome: 'Origem de leads — trimestre', tipo: 'CSV', gerado: '15/08/2025', autor: 'Ana Ferreira' },
];

/* -------------------------------------------------------------------------- */
/* Automações, formulários, documentos                                        */
/* -------------------------------------------------------------------------- */

export const automacoes = [
  {
    id: 'a1',
    nome: 'Boas-vindas Meta Ads',
    gatilho: 'Lead entra pelo Meta Ads',
    passos: 4,
    ativa: true,
    execucoes: '1.284 execuções',
  },
  {
    id: 'a2',
    nome: 'Follow-up de proposta',
    gatilho: 'Negócio parado há 3 dias',
    passos: 3,
    ativa: true,
    execucoes: '312 execuções',
  },
  {
    id: 'a3',
    nome: 'Reativação de lead frio',
    gatilho: 'Sem resposta há 15 dias',
    passos: 5,
    ativa: false,
    execucoes: '87 execuções',
  },
  {
    id: 'a4',
    nome: 'Pesquisa pós-venda',
    gatilho: 'Negócio marcado como ganho',
    passos: 2,
    ativa: true,
    execucoes: '64 execuções',
  },
];

export const formularios = [
  { id: 'fo1', nome: 'Formulário de captação — Instagram', respostas: 184, conversao: '22%', ativo: true },
  { id: 'fo2', nome: 'Agendamento de avaliação', respostas: 96, conversao: '31%', ativo: true },
  { id: 'fo3', nome: 'Pesquisa de satisfação', respostas: 42, conversao: '—', ativo: false },
];

export const documentos = [
  { id: 'd1', nome: 'Contrato padrão 2025', tipo: 'PDF', tamanho: '284 KB', data: '02/09/2025' },
  { id: 'd2', nome: 'Proposta comercial — modelo', tipo: 'DOCX', tamanho: '96 KB', data: '28/08/2025' },
  { id: 'd3', nome: 'Tabela de preços', tipo: 'PDF', tamanho: '142 KB', data: '20/08/2025' },
  { id: 'd4', nome: 'Termo de consentimento', tipo: 'PDF', tamanho: '58 KB', data: '11/08/2025' },
];

export const notificacoes = [
  {
    id: 'nt1',
    titulo: 'Nova conversa no WhatsApp',
    detalhe: 'Marcos Aurélio enviou 2 mensagens.',
    quando: 'há 6 min',
    lida: false,
    tipo: 'conversa' as const,
  },
  {
    id: 'nt2',
    titulo: 'Negócio marcado como ganho',
    detalhe: 'Paulo Lacerda — R$ 1.560.',
    quando: 'há 2h',
    lida: false,
    tipo: 'ganho' as const,
  },
  {
    id: 'nt3',
    titulo: 'Automação pausada',
    detalhe: '"Reativação de lead frio" foi desativada por Bruno Salles.',
    quando: 'ontem',
    lida: true,
    tipo: 'automacao' as const,
  },
  {
    id: 'nt4',
    titulo: 'Tarefa atrasada',
    detalhe: 'Enviar contrato revisado — Beatriz Nogueira.',
    quando: 'ontem',
    lida: true,
    tipo: 'tarefa' as const,
  },
];

export const conversaIa = [
  {
    id: 'ia1',
    tipo: 'ia' as const,
    texto: 'Oi, Ana. Posso resumir conversas, sugerir resposta e apontar onde o funil está travando. Por onde começamos?',
  },
  { id: 'ia2', tipo: 'eu' as const, texto: 'Quais leads estão parados há mais tempo?' },
  {
    id: 'ia3',
    tipo: 'ia' as const,
    texto:
      'Três negócios estão parados há mais de 4 dias: Julia Prado (R$ 2.100, proposta), Marcos Aurélio (R$ 890, qualificado) e Renata Farias (R$ 780, proposta). Julia é a mais crítica — foi a única que não respondeu à última mensagem.',
  },
];

export const sugestoesIa = [
  'Resumir a conversa com Marcos Aurélio',
  'Escrever follow-up para Julia Prado',
  'Qual canal trouxe mais vendas este mês?',
];
