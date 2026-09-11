import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartaoCompromisso, CartaoItemDoDia } from '@/components/cards';
import { Avatar, Botao, Cartao, Chip, Corpo, Indicador, Secundario, TituloSecao } from '@/components/ui';
import { compromissosHoje, itensDoDia, recomendacoes, usuario } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const FILTROS = ['Todos', 'Meus itens', 'Urgentes', 'Conversas', 'Tarefas', 'Leads'];

/**
 * Central do Dia — a tela responde uma pergunta só: o que precisa ser feito hoje. Mesma decisão
 * do web, que trocou a antiga "Visão geral" cheia de gráfico por uma lista de pendência.
 */
export default function InicioScreen() {
  const c = useCores();
  const router = useRouter();

  const urgentes = itensDoDia.filter((i) => i.prioridade === 'urgente').length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      {/* Saudação + acesso a notificações e perfil */}
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
          <Text style={{ color: c.ink, fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
            Bom dia, {usuario.primeiroNome}.
          </Text>
          <Text style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
            {itensDoDia.length} itens precisam da sua atenção hoje.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/notificacoes')}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.md,
            backgroundColor: c.gray100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="notifications-outline" size={18} color={c.ink} />
          <View
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: c.blue,
            }}
          />
        </Pressable>

        <Pressable onPress={() => router.push('/perfil')} hitSlop={8}>
          <Avatar iniciais={usuario.iniciais} tamanho={36} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo do dia em números */}
        <View style={{ gap: space[3] }}>
          {/* Quatro números em duas linhas: em tela de telefone, quatro colunas quebram o
              rótulo no meio da palavra. */}
          <View style={{ gap: space[2] }}>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Indicador numero={itensDoDia.length} rotulo="Pendentes" />
              <Indicador numero={urgentes} rotulo="Urgentes" cor={c.danger} />
            </View>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Indicador numero={3} rotulo="Concluídos" cor={c.success} />
              <Indicador numero={2} rotulo="Atrasados" cor={c.warning} />
            </View>
          </View>

          <Botao titulo="Organizar meu dia" icone="sparkles-outline" bloco />
        </View>

        {/* Pendências */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Pendências" contagem={itensDoDia.length} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[2] }}>
            {FILTROS.map((f, i) => (
              <Chip key={f} texto={f} ativo={i === 0} />
            ))}
          </ScrollView>

          <View style={{ gap: space[2] }}>
            {itensDoDia.map((item) => (
              <CartaoItemDoDia
                key={item.id}
                item={item}
                onPress={() => router.push(item.modulo === 'conversa' ? `/conversa/${item.id}` : '/contatos')}
              />
            ))}
          </View>
        </View>

        {/* Agenda do dia */}
        <View style={{ gap: space[3] }}>
          <TituloSecao
            titulo="Agenda de hoje"
            contagem={compromissosHoje.length}
            acao="Ver agenda"
            onAcao={() => router.push('/agenda')}
          />
          <View style={{ gap: space[2] }}>
            {compromissosHoje.map((cp) => (
              <CartaoCompromisso key={cp.id} compromisso={cp} />
            ))}
          </View>
        </View>

        {/* Resultado do funil */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Resultado" acao="Ver funil" onAcao={() => router.push('/(tabs)/funil')} />
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={41} rotulo="Oportunidades" obs="Clientes em fechamento" onPress={() => router.push('/(tabs)/funil')} />
            <Indicador
              numero={43}
              rotulo="Vendas perdidas"
              obs="Desistiram ou não compraram"
              cor={c.danger}
              onPress={() => router.push('/inteligencia/motivos-perda')}
            />
          </View>
          <Indicador
            numero={36}
            rotulo="Vendas realizadas"
            obs="R$ 38.400 fechados no mês"
            cor={c.success}
            onPress={() => router.push('/inteligencia/performance')}
          />
        </View>

        {/* Diário por origem */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Leads que entraram hoje" />
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={9} rotulo="Tráfego / Anúncios" />
            <Indicador numero={4} rotulo="Outras origens" />
          </View>
        </View>

        {/* Recomendações */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Recomendações" />
          {recomendacoes.map((r) => (
            <Cartao key={r.id} padding={space[3]} style={{ flexDirection: 'row', gap: space[3] }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.md,
                  backgroundColor: c.iaSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="sparkles" size={15} color={c.ia} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Corpo style={{ fontWeight: fontWeight.bold }}>{r.titulo}</Corpo>
                <Secundario>{r.motivo}</Secundario>
              </View>
            </Cartao>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
