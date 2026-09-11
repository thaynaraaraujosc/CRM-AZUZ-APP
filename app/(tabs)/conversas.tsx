import { useRouter } from 'expo-router';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinhaConversa } from '@/components/cards';
import { BarraBusca, BotaoIcone, Cabecalho, Chip } from '@/components/ui';
import { conversas } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

const FILTROS = ['Todas', 'Não lidas', 'Minhas', 'Sem responsável', 'WhatsApp', 'Instagram', 'TikTok', 'E-mail'];

/**
 * Caixa de entrada unificada. O nome é "Conversas" e não "WhatsApp" porque a tela atende quatro
 * canais — chamar de um deles escondia os outros três de quem procurava.
 */
export default function ConversasScreen() {
  const c = useCores();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Conversas"
        sub="6 não lidas · 4 canais conectados"
        acao={<BotaoIcone icone="options-outline" />}
      />

      <View style={{ backgroundColor: c.surface, paddingHorizontal: space[4], paddingTop: space[3], gap: space[3] }}>
        <BarraBusca placeholder="Buscar contato ou mensagem" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingBottom: space[3] }}
        >
          {FILTROS.map((f, i) => (
            <Chip key={f} texto={f} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={conversas}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: 71 }} />
        )}
        renderItem={({ item }) => (
          <LinhaConversa conversa={item} onPress={() => router.push(`/conversa/${item.id}`)} />
        )}
        contentContainerStyle={{ backgroundColor: c.surface }}
        style={{ backgroundColor: c.canvas }}
      />
    </SafeAreaView>
  );
}
