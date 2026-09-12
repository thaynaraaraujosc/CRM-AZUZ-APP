import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { contatoNaTela } from '@/api/adaptar';
import { useContatos } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { LinhaContato } from '@/components/cards';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { BarraBusca, BotaoIcone, Cabecalho, Chip, ListaVazia } from '@/components/ui';
import { filtrosContatos } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/** Base de contatos do workspace, lendo `/api/contatos`. */
export default function ContatosScreen() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useContatos(aoPerderSessao);

  const contatos = (dados ?? []).map(contatoNaTela);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Contatos"
        sub={carregando ? 'Carregando…' : `${contatos.length} pessoas nesta visão`}
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

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && contatos.length === 0 ? (
        <Carregando texto="Buscando seus contatos" />
      ) : (
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LinhaContato contato={item} onPress={() => router.push(`/contatos/${item.id}`)} />
          )}
          contentContainerStyle={{ padding: space[4], gap: 7 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
          ListEmptyComponent={
            <ListaVazia
              icone="people-outline"
              titulo="Nenhum contato ainda"
              descricao="Contato entra sozinho quando um lead chama por um canal conectado ou responde um formulário."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
