import { useSessao } from './sessao';

/**
 * Permissão de módulo, no mesmo vocabulário do CRM web.
 *
 * O servidor guarda as permissões no token da sessão (`sessao.user.permissoes`), e o painel web
 * as aplica no `proxy.ts`, que só roda em PÁGINA. Rota de API não é conferida — e o app só fala
 * com a API. Então, por enquanto, quem restringe o que o app mostra é o próprio app.
 *
 * Isso esconde a tela, não protege o dado: alguém com a sessão na mão ainda consegue chamar a API
 * direto. A correção definitiva é o CRM passar a conferir permissão também em `/api`.
 */
export type Modulo =
  | 'conversas'
  | 'funil'
  | 'contatos'
  | 'formularios'
  | 'automacoes'
  | 'relatorios'
  | 'configuracoes';

const PERMISSAO_DO_MODULO: Record<Modulo, string> = {
  conversas: 'wa_visualizar',
  funil: 'funil_visualizar',
  contatos: 'contatos_visualizar',
  formularios: 'form_visualizar',
  automacoes: 'auto_visualizar',
  relatorios: 'rel_visualizar',
  configuracoes: 'config_visualizar',
};

export function usePermissoes() {
  const { usuario } = useSessao();

  // Admin do workspace vê tudo: é o dono da conta, restringir ele mesmo não faz sentido. Mesma
  // regra do web.
  const vêTudo = usuario?.superAdmin === true || usuario?.papelTipo === 'admin';
  const permissoes = usuario?.permissoes ?? [];

  function pode(modulo: Modulo): boolean {
    if (vêTudo) return true;
    return permissoes.includes(PERMISSAO_DO_MODULO[modulo]);
  }

  return { pode, vêTudo };
}
