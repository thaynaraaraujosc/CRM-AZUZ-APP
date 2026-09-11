import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Cabecalho, Cartao, Divisor, LinhaMenu, TituloSecao } from '@/components/ui';
import { usuario } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];
type Item = { icone: Icone; titulo: string; sub: string; rota: Href };

const RELACIONAMENTO: Item[] = [
  { icone: 'people-outline', titulo: 'Contatos', sub: '248 no workspace', rota: '/contatos' },
  { icone: 'calendar-outline', titulo: 'Agenda', sub: '3 compromissos hoje', rota: '/agenda' },
  { icone: 'person-circle-outline', titulo: 'Equipe', sub: '4 pessoas · 2 online', rota: '/equipe' },
];

const OPERACAO: Item[] = [
  { icone: 'flash-outline', titulo: 'Automações', sub: '3 ativas', rota: '/automacoes' },
  { icone: 'document-text-outline', titulo: 'Formulários', sub: '322 respostas', rota: '/formularios' },
  { icone: 'folder-outline', titulo: 'Documentos', sub: '4 arquivos', rota: '/documentos' },
  { icone: 'sparkles-outline', titulo: 'Azuz IA', sub: 'Resumo, resposta e análise', rota: '/azuz-ia' },
];

const ANALISE: Item[] = [
  { icone: 'trending-up-outline', titulo: 'Inteligência comercial', sub: 'Tráfego, performance e jornada', rota: '/inteligencia' },
  { icone: 'bar-chart-outline', titulo: 'Relatórios', sub: '3 relatórios gerados', rota: '/inteligencia/relatorios' },
];

const CONTA: Item[] = [
  { icone: 'settings-outline', titulo: 'Configurações', sub: 'Workspace, canais e plano', rota: '/configuracoes' },
  { icone: 'notifications-outline', titulo: 'Notificações', sub: '2 não lidas', rota: '/notificacoes' },
];

/** Tudo que não coube na barra inferior. Agrupado por intenção, não por ordem alfabética. */
export default function MaisScreen() {
  const c = useCores();
  const router = useRouter();

  function Grupo({ titulo, itens }: { titulo: string; itens: Item[] }) {
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
      <Cabecalho titulo="Mais" sub={usuario.workspace} />

      <ScrollView
        contentContainerStyle={{ paddingVertical: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartão da conta */}
        <View style={{ paddingHorizontal: space[4] }}>
          <Cartao onPress={() => router.push('/perfil')} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Avatar iniciais={usuario.iniciais} tamanho={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>{usuario.nome}</Text>
              <Text style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
                {usuario.cargo} · {usuario.workspace}
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
            onPress={() => router.replace('/login')}
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

        <Text style={{ color: c.textFaint, fontSize: fontSize.xs, textAlign: 'center' }}>AZUZ CRM · versão 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
