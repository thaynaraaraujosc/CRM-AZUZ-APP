import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cartao, Divisor, Secundario, TituloSecao } from '@/components/ui';
import { notificacoes } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const ICONE = {
  conversa: 'chatbubble-ellipses-outline',
  ganho: 'trophy-outline',
  automacao: 'flash-outline',
  tarefa: 'checkbox-outline',
} as const;

/** Aberta como folha por cima da tela atual — notificação é interrupção, não destino. */
export default function NotificacoesScreen() {
  const c = useCores();
  const router = useRouter();

  const naoLidas = notificacoes.filter((n) => !n.lida);
  const lidas = notificacoes.filter((n) => n.lida);

  function Linha({ n }: { n: (typeof notificacoes)[number] }) {
    const cor = n.tipo === 'ganho' ? c.success : n.tipo === 'tarefa' ? c.warning : c.blue;
    return (
      <View style={{ flexDirection: 'row', gap: space[3], padding: space[3] }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.md,
            backgroundColor: n.lida ? c.gray100 : `${cor}22`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={ICONE[n.tipo]} size={16} color={n.lida ? c.textFaint : cor} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{n.titulo}</Text>
          <Secundario>{n.detalhe}</Secundario>
          <Text style={{ color: c.textFaint, fontSize: fontSize.xs, marginTop: 2 }}>{n.quando}</Text>
        </View>

        {!n.lida ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.blue, marginTop: 6 }} /> : null}
      </View>
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
          <Secundario>{naoLidas.length} não lidas</Secundario>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={22} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Novas" contagem={naoLidas.length} acao="Marcar todas como lidas" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {naoLidas.map((n, i) => (
              <View key={n.id}>
                {i > 0 ? <Divisor /> : null}
                <Linha n={n} />
              </View>
            ))}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Anteriores" contagem={lidas.length} />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {lidas.map((n, i) => (
              <View key={n.id}>
                {i > 0 ? <Divisor /> : null}
                <Linha n={n} />
              </View>
            ))}
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
