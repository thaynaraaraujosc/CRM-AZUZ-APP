import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErroDeSessao } from '@/api/cliente';
import { usePermissoes } from '@/api/permissoes';
import { encerrarSessao, pedirLinkDeNovaSenha, useEquipe, useSessoesAtivas } from '@/api/recursos';
import { useAoPerderSessao, useSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  Avatar,
  Aviso,
  Cabecalho,
  Cartao,
  Corpo,
  Divisor,
  LinhaMenu,
  Secundario,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

function quando(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Senha, sessões abertas de verdade e quem tem qual papel. */
export default function SegurancaScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Segurança" modulo="configurações" voltar={true} />;

  return <Seguranca />;
}

function Seguranca() {
  const c = useCores();
  const { usuario } = useSessao();
  const aoPerderSessao = useAoPerderSessao();

  const sessoes = useSessoesAtivas(aoPerderSessao);
  const equipe = useEquipe(aoPerderSessao);

  const [encerrando, setEncerrando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tom: 'sucesso' | 'erro'; texto: string } | null>(null);

  const abertas = sessoes.dados ?? [];
  const outras = abertas.filter((s) => !s.atual);

  async function encerrar(id: string) {
    setEncerrando(id);
    setAviso(null);
    try {
      await encerrarSessao(id);
      sessoes.recarregar();
      setAviso({ tom: 'sucesso', texto: 'Sessão encerrada. Aquele aparelho vai cair no login.' });
    } catch (e) {
      if (e instanceof ErroDeSessao) {
        aoPerderSessao();
        return;
      }
      setAviso({ tom: 'erro', texto: e instanceof Error ? e.message : 'Não deu para encerrar essa sessão.' });
    } finally {
      setEncerrando(null);
    }
  }

  async function encerrarTodas() {
    setAviso(null);
    for (const s of outras) {
      try {
        await encerrarSessao(s.id);
      } catch {
        // Uma que falha não deve impedir as outras; o recarregar mostra o que sobrou.
      }
    }
    sessoes.recarregar();
    setAviso({ tom: 'sucesso', texto: 'Encerramos as outras sessões.' });
  }

  async function trocarSenha() {
    const email = usuario?.email;
    if (!email) return;
    setAviso(null);
    try {
      await pedirLinkDeNovaSenha(email);
      setAviso({ tom: 'sucesso', texto: `Link de nova senha enviado para ${email}. Vale por uma hora.` });
    } catch (e) {
      setAviso({ tom: 'erro', texto: e instanceof Error ? e.message : 'Não deu para enviar o link agora.' });
    }
  }

  function recarregar() {
    sessoes.recarregar();
    equipe.recarregar();
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Segurança" sub="Acesso ao workspace" voltar />

      {sessoes.erro ? (
        <FalhaAoCarregar mensagem={sessoes.erro} aoTentar={recarregar} />
      ) : sessoes.carregando && !sessoes.dados ? (
        <Carregando texto="Conferindo os seus acessos" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={sessoes.carregando} onRefresh={recarregar} tintColor={c.blue} />
          }
        >
          {aviso ? <Aviso tom={aviso.tom} texto={aviso.texto} /> : null}

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Acesso" />
            <Cartao padding={0} style={{ overflow: 'hidden' }}>
              <LinhaMenu
                icone="lock-closed-outline"
                titulo="Alterar senha"
                sub="Enviamos um link para o seu e-mail"
                onPress={trocarSenha}
              />
            </Cartao>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao
              titulo="Sessões abertas"
              contagem={abertas.length}
              acao={outras.length > 0 ? 'Encerrar as outras' : undefined}
              onAcao={outras.length > 0 ? encerrarTodas : undefined}
            />
            <Cartao padding={0} style={{ overflow: 'hidden' }}>
              {abertas.map((s, i) => (
                <View key={s.id}>
                  {i > 0 ? <Divisor /> : null}
                  <LinhaMenu
                    icone={s.atual ? 'phone-portrait-outline' : 'desktop-outline'}
                    titulo={s.atual ? `${s.dispositivo} — este aparelho` : s.dispositivo}
                    sub={[s.ip, quando(s.criadoEm)].filter(Boolean).join(' · ')}
                    direita={
                      s.atual ? (
                        <Selo texto="Atual" cor={c.success} fundo={c.successSoft} />
                      ) : (
                        <Pressable onPress={() => encerrar(s.id)} disabled={encerrando === s.id} hitSlop={8}>
                          <Text style={{ color: c.danger, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                            {encerrando === s.id ? 'Encerrando…' : 'Encerrar'}
                          </Text>
                        </Pressable>
                      )
                    }
                  />
                </View>
              ))}
            </Cartao>
            <Secundario>
              Encerrar derruba aquele aparelho no próximo toque que ele der no CRM.
            </Secundario>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Permissões da equipe" contagem={equipe.dados?.length} />
            <Cartao style={{ gap: space[3] }}>
              {(equipe.dados ?? []).map((m) => {
                const papel = m.role ?? 'Membro';
                const admin = papel.toLowerCase().includes('admin');
                const iniciais = m.initials || m.nome.slice(0, 2).toUpperCase();
                return (
                  <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                    <Avatar iniciais={iniciais} tamanho={34} />
                    <View style={{ flex: 1 }}>
                      <Corpo style={{ fontWeight: fontWeight.bold }}>{m.nome}</Corpo>
                      <Secundario numberOfLines={1}>{m.cargo || m.email}</Secundario>
                    </View>
                    <Selo
                      texto={papel}
                      cor={admin ? c.blue : c.textMuted}
                      fundo={admin ? c.blueSoft : c.gray100}
                    />
                  </View>
                );
              })}
            </Cartao>
            <Secundario>Mudar papel e permissão de alguém é feito no CRM pelo computador.</Secundario>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
