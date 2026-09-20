import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes, type Modulo } from '@/api/permissoes';
import { useAgenda, useAutomacoes, useContatos, useEquipe, useRelatorios } from '@/api/recursos';
import { useAoPerderSessao, useSessao } from '@/api/sessao';
import { Avatar, Cabecalho, Cartao, Divisor, LinhaMenu, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];
type Item = { icone: Icone; titulo: string; sub: string; rota: Href; modulo?: Modulo };

function contar(quantos: number | undefined, um: string, varios: string, vazio: string): string {
  if (quantos === undefined) return '…';
  if (quantos === 0) return vazio;
  return quantos === 1 ? `1 ${um}` : `${quantos} ${varios}`;
}

/** Tudo que não coube na barra inferior. Agrupado por intenção, não por ordem alfabética. */
export default function MaisScreen() {
  const c = useCores();
  const router = useRouter();
  const { usuario, sair } = useSessao();
  const { pode } = usePermissoes();
  const aoPerderSessao = useAoPerderSessao();

  // Os subtítulos do menu são contagens de verdade: número inventado aqui vira desconfiança no
  // resto do aplicativo.
  const contatos = useContatos(aoPerderSessao);
  const equipe = useEquipe(aoPerderSessao);
  const agenda = useAgenda(aoPerderSessao);
  const automacoes = useAutomacoes(pode('automacoes') ? aoPerderSessao : undefined);
  const relatorios = useRelatorios(pode('relatorios') ? aoPerderSessao : undefined);

  const hoje = new Date().toISOString().slice(0, 10);
  const compromissosDeHoje = (agenda.dados ?? []).filter((a) => a.dataIso === hoje).length;
  const automacoesAtivas = (automacoes.dados ?? []).filter((f) => f.ativa && f.status === 'publicado').length;

  const RELACIONAMENTO: Item[] = [
    {
      icone: 'people-outline',
      titulo: 'Contatos',
      sub: contar(contatos.dados?.length, 'pessoa', 'pessoas', 'nenhum contato ainda'),
      rota: '/contatos',
      modulo: 'contatos',
    },
    {
      icone: 'calendar-outline',
      titulo: 'Agenda',
      sub: agenda.dados
        ? contar(compromissosDeHoje, 'compromisso hoje', 'compromissos hoje', 'nada marcado para hoje')
        : '…',
      rota: '/agenda',
    },
    {
      icone: 'person-circle-outline',
      titulo: 'Equipe',
      sub: contar(equipe.dados?.length, 'pessoa', 'pessoas', 'só você'),
      rota: '/equipe',
    },
  ];

  const OPERACAO: Item[] = [
    {
      icone: 'flash-outline',
      titulo: 'Automações',
      sub: automacoes.dados ? contar(automacoesAtivas, 'ativa', 'ativas', 'nenhuma ativa') : '…',
      rota: '/automacoes',
      modulo: 'automacoes',
    },
    {
      icone: 'document-text-outline',
      titulo: 'Formulários',
      sub: 'Os formulários do workspace',
      rota: '/formularios',
      modulo: 'formularios',
    },
  ];

  const ANALISE: Item[] = [
    {
      icone: 'trending-up-outline',
      titulo: 'Inteligência comercial',
      sub: 'Tráfego, performance e jornada',
      rota: '/inteligencia',
      modulo: 'relatorios',
    },
    {
      icone: 'bar-chart-outline',
      titulo: 'Relatórios',
      sub: relatorios.dados ? contar(relatorios.dados.length, 'gerado', 'gerados', 'nenhum gerado ainda') : '…',
      rota: '/inteligencia/relatorios',
      modulo: 'relatorios',
    },
  ];

  const CONTA: Item[] = [
    {
      icone: 'settings-outline',
      titulo: 'Configurações',
      sub: 'Workspace, canais e segurança',
      rota: '/configuracoes',
      modulo: 'configuracoes',
    },
    { icone: 'notifications-outline', titulo: 'Notificações', sub: 'Conversas, tarefas e agenda', rota: '/notificacoes' },
  ];

  const nome = usuario?.name ?? 'Sua conta';
  const iniciais = usuario?.initials ?? (usuario?.name ?? '?').slice(0, 2).toUpperCase();
  const workspace = usuario?.workspaceNome ?? '';
  const cargo = usuario?.role ?? usuario?.email ?? '';

  async function encerrar() {
    await sair();
    router.replace('/login');
  }

  function Grupo({ titulo, itens: todos }: { titulo: string; itens: Item[] }) {
    const itens = todos.filter((i) => !i.modulo || pode(i.modulo));
    if (itens.length === 0) return null;

    return (
      <View style={{ gap: space[2] }}>
        <View style={{ paddingHorizontal: space[4] }}>
          <TituloSecao titulo={titulo} />
        </View>
        <Cartao padding={0} style={{ overflow: 'hidden' }}>
          {itens.map((item, i) => (
            <View key={item.titulo}>
              {i > 0 ? <Divisor /> : null}
              <LinhaMenu
                icone={item.icone}
                titulo={item.titulo}
                sub={item.sub}
                onPress={() => router.push(item.rota)}
              />
            </View>
          ))}
        </Cartao>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Mais" sub={workspace} />

      <ScrollView
        contentContainerStyle={{ paddingVertical: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartão da conta */}
        <View style={{ paddingHorizontal: space[4] }}>
          <Cartao onPress={() => router.push('/perfil')} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Avatar iniciais={iniciais} tamanho={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>{nome}</Text>
              <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
                {[cargo, workspace].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
          </Cartao>
        </View>

        <View style={{ paddingHorizontal: space[4] }}>
          <Grupo titulo="Relacionamento" itens={RELACIONAMENTO} />
        </View>
        <View style={{ paddingHorizontal: space[4] }}>
          <Grupo titulo="Operação" itens={OPERACAO} />
        </View>
        <View style={{ paddingHorizontal: space[4] }}>
          <Grupo titulo="Análise" itens={ANALISE} />
        </View>
        <View style={{ paddingHorizontal: space[4] }}>
          <Grupo titulo="Conta" itens={CONTA} />
        </View>

        <View style={{ paddingHorizontal: space[4] }}>
          <Pressable
            onPress={encerrar}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[2],
              height: 46,
              borderRadius: radius.md,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.lineStrong,
              backgroundColor: pressed ? c.surfaceHover : c.surface,
            })}
          >
            <Ionicons name="log-out-outline" size={16} color={c.danger} />
            <Text style={{ color: c.danger, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>Sair da conta</Text>
          </Pressable>
        </View>

        <Text style={{ color: c.textFaint, fontSize: fontSize.xs, textAlign: 'center' }}>
          {`AZUZ CRM · versão ${Constants.expoConfig?.version ?? '1.0.0'}`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
