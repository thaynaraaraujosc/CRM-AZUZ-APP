import { useRouter } from 'expo-router';
import { FlatList, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinhaContato } from '@/components/cards';
import { BarraBusca, BotaoIcone, Cabecalho, Chip } from '@/components/ui';
import { contatos, filtrosContatos } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/** Base de contatos do workspace, com busca e os mesmos filtros de origem do web. */
export default function ContatosScreen() {
  const c = useCores();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Contatos"
        sub={`${contatos.length} pessoas nesta visão`}
        voltar
        acao={<BotaoIcone icone="person-add-outline" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingHorizontal: space[4], paddingTop: space[3], gap: space[3] }}>
        <BarraBusca placeholder="Buscar por nome, e-mail ou telefone" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingBottom: space[3] }}
        >
          {filtrosContatos.map((f, i) => (
            <Chip key={f} texto={f} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={contatos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinhaContato contato={item} onPress={() => router.push(`/contatos/${item.id}`)} />
        )}
        contentContainerStyle={{ padding: space[4], gap: 7 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
