import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gravarPreferencia, lerPreferencia, useAgenda, useConversas, useTarefas } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Cartao, Divisor, ListaVazia, Secundario, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

type Tipo = 'conversa' | 'tarefa' | 'compromisso';
type Aviso = { id: string; tipo: Tipo; titulo: string; detalhe: string; quando: string; rota?: string };

const ICONE = {
  conversa: 'chatbubble-ellipses-outline',
  tarefa: 'checkbox-outline',
  compromisso: 'calendar-outline',
} as const;

/** Onde o CRM guarda quais avisos esta conta já viu. */
const CHAVE = 'app-avisos-lidos';

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Aberta como folha por cima da tela atual — notificação é interrupção, não destino.
 *
 * O CRM não tem uma tabela de notificações: o que existe são conversas sem resposta, tarefas
 * atrasadas e compromissos de hoje. Esta tela junta essas três coisas, que é exatamente o que a
 * pessoa precisa ver ao abrir o app.
 */
export default function NotificacoesScreen() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();

  const { dados: conversas } = useConversas(aoPerderSessao);
  const { dados: colunas } = useTarefas(aoPerderSessao);
  const { dados: agenda } = useAgenda(aoPerderSessao);

  const [lidos, setLidos] = useState<string[]>([]);

  useEffect(() => {
    let vivo = true;
    lerPreferencia<{ ids?: string[] }>(CHAVE)
      .then((p) => {
        if (vivo && Array.isArray(p?.ids)) setLidos(p.ids);
      })
      .catch(() => {
        // Sem preferência gravada, tudo conta como novo. Não é erro que valha interromper a tela.
      });
    return () => {
      vivo = false;
    };
  }, []);

  const avisos = useMemo<Aviso[]>(() => {
    const lista: Aviso[] = [];

    for (const conversa of conversas ?? []) {
      if (conversa.arquivada || !conversa.naoLidas) continue;
      lista.push({
        id: `conversa:${conversa.id}`,
        tipo: 'conversa',
        titulo: `${conversa.nome} mandou mensagem`,
        detalhe: conversa.naoLidas === 1 ? '1 mensagem sem resposta' : `${conversa.naoLidas} mensagens sem resposta`,
        quando: conversa.tempo,
        rota: `/conversa/${conversa.id}`,
      });
    }

    for (const coluna of colunas ?? []) {
      for (const tarefa of coluna.cards) {
        if (tarefa.concluida || !tarefa.atrasada) continue;
        lista.push({
          id: `tarefa:${tarefa.id}`,
          tipo: 'tarefa',
          titulo: `Tarefa atrasada: ${tarefa.titulo}`,
          detalhe: [tarefa.contato, tarefa.responsavel?.nome].filter(Boolean).join(' · ') || 'Sem contato',
          quando: tarefa.data,
          rota: '/tarefas',
        });
      }
    }

    const hoje = hojeIso();
    for (const compromisso of agenda ?? []) {
      if (compromisso.dataIso !== hoje) continue;
      if (compromisso.status?.toLowerCase() === 'cancelado') continue;
      lista.push({
        id: `agenda:${compromisso.id}`,
        tipo: 'compromisso',
        titulo: `${compromisso.tipo} com ${compromisso.contato}`,
        detalhe: [compromisso.hora, compromisso.local].filter(Boolean).join(' · '),
        quando: 'Hoje',
        rota: '/agenda',
      });
    }

    return lista;
  }, [conversas, colunas, agenda]);

  const novos = avisos.filter((a) => !lidos.includes(a.id));
  const vistos = avisos.filter((a) => lidos.includes(a.id));

  async function marcarTodosComoLidos() {
    const ids = avisos.map((a) => a.id);
    setLidos(ids);
    try {
      await gravarPreferencia(CHAVE, { ids });
    } catch {
      // A marcação segue valendo nesta sessão mesmo se a gravação falhar.
    }
  }

  function Linha({ a, lido }: { a: Aviso; lido: boolean }) {
    const cor = a.tipo === 'compromisso' ? c.success : a.tipo === 'tarefa' ? c.warning : c.blue;
    return (
      <Pressable
        onPress={a.rota ? () => router.push(a.rota as never) : undefined}
        style={({ pressed }) => ({
          flexDirection: 'row',
          gap: space[3],
          padding: space[3],
          backgroundColor: pressed ? c.surfaceHover : 'transparent',
        })}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.md,
            backgroundColor: lido ? c.gray100 : `${cor}22`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={ICONE[a.tipo]} size={16} color={lido ? c.textFaint : cor} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{a.titulo}</Text>
          <Secundario>{a.detalhe}</Secundario>
          <Text style={{ color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 }}>{a.quando}</Text>
        </View>

        {!lido ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.blue, marginTop: 6 }} /> : null}
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          paddingHorizontal: space[4],
          paddingVertical: space[3],
          backgroundColor: c.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.ink, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Notificações</Text>
          <Secundario>{novos.length === 1 ? '1 não lida' : `${novos.length} não lidas`}</Secundario>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={22} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        {avisos.length === 0 ? (
          <ListaVazia
            icone="notifications-off-outline"
            titulo="Nada pendente"
            descricao="Nenhuma conversa sem resposta, tarefa atrasada ou compromisso hoje."
          />
        ) : null}

        {novos.length > 0 ? (
          <View style={{ gap: space[3] }}>
            <TituloSecao
              titulo="Novas"
              contagem={novos.length}
              acao="Marcar todas como lidas"
              onAcao={marcarTodosComoLidos}
            />
            <Cartao padding={0} style={{ overflow: 'hidden' }}>
              {novos.map((a, i) => (
                <View key={a.id}>
                  {i > 0 ? <Divisor /> : null}
                  <Linha a={a} lido={false} />
                </View>
              ))}
            </Cartao>
          </View>
        ) : null}

        {vistos.length > 0 ? (
          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Anteriores" contagem={vistos.length} />
            <Cartao padding={0} style={{ overflow: 'hidden' }}>
              {vistos.map((a, i) => (
                <View key={a.id}>
                  {i > 0 ? <Divisor /> : null}
                  <Linha a={a} lido />
                </View>
              ))}
            </Cartao>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
