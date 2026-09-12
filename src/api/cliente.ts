import { URL_DA_API } from './config';

/**
 * Cliente HTTP do CRM.
 *
 * Duas particularidades do servidor moldam este arquivo:
 *
 * 1. A sessão é um cookie do Auth.js, não um token no cabeçalho. O React Native guarda cookie
 *    sozinho (iOS e Android têm cofre de cookie no próprio sistema de rede), então basta o app
 *    fazer o login uma vez que as chamadas seguintes já vão assinadas.
 * 2. Sem sessão, o servidor NÃO devolve 401: ele redireciona para `/login` com 307. Se o `fetch`
 *    seguir o desvio, a resposta chega com status 200 e uma página HTML dentro — que parece
 *    sucesso e quebra o `JSON.parse` num lugar distante daqui. Por isso toda resposta é conferida
 *    pelo endereço final e pelo tipo de conteúdo antes de virar dado.
 */

export class ErroDeSessao extends Error {
  constructor() {
    super('Sua sessão expirou. Entre de novo.');
    this.name = 'ErroDeSessao';
  }
}

export class ErroDaApi extends Error {
  status: number;
  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

type Opcoes = {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  corpo?: unknown;
  /** Formulário em vez de JSON — o Auth.js só aceita o login nesse formato. */
  formulario?: Record<string, string>;
};

function ehRespostaDeLogin(resposta: Response): boolean {
  const tipo = resposta.headers.get('content-type') ?? '';
  return resposta.url.includes('/login') || tipo.includes('text/html');
}

export async function chamar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { metodo = 'GET', corpo, formulario } = opcoes;

  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  let body: string | undefined;

  if (formulario) {
    cabecalhos['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(formulario).toString();
  } else if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
    body = JSON.stringify(corpo);
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${URL_DA_API}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body,
      // Necessário só na web; no aparelho o cookie já viaja pelo cofre do sistema.
      credentials: 'include',
    });
  } catch {
    throw new ErroDaApi('Não foi possível falar com o servidor. Verifique a conexão.', 0);
  }

  if (resposta.status === 401 || ehRespostaDeLogin(resposta)) throw new ErroDeSessao();

  if (!resposta.ok) {
    const detalhe = await resposta
      .json()
      .then((d: { erro?: string }) => d?.erro)
      .catch(() => undefined);
    throw new ErroDaApi(detalhe ?? `O servidor respondeu ${resposta.status}.`, resposta.status);
  }

  if (resposta.status === 204) return undefined as T;

  try {
    return (await resposta.json()) as T;
  } catch {
    throw new ErroDaApi('O servidor respondeu num formato inesperado.', resposta.status);
  }
}

/**
 * Login. O Auth.js exige o passo do token anti-fraude antes das credenciais, e não devolve a
 * sessão na resposta — quem confirma se deu certo é `/api/auth/session`, logo depois.
 */
export async function entrarNoCrm(email: string, senha: string): Promise<void> {
  const { csrfToken } = await chamar<{ csrfToken: string }>('/api/auth/csrf');

  await fetch(`${URL_DA_API}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, email, senha, redirect: 'false' }).toString(),
    credentials: 'include',
  }).catch(() => {
    throw new ErroDaApi('Não foi possível falar com o servidor. Verifique a conexão.', 0);
  });
}

export async function sairDoCrm(): Promise<void> {
  const { csrfToken } = await chamar<{ csrfToken: string }>('/api/auth/csrf');
  await fetch(`${URL_DA_API}/api/auth/signout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, redirect: 'false' }).toString(),
    credentials: 'include',
  }).catch(() => undefined);
}
