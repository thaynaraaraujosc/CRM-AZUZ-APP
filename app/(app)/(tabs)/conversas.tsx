import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { conversaNaTela } from '@/api/adaptar';
import { useConversas } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { LinhaConversa } from '@/components/cards';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { BarraBusca, BotaoIcone, Cabecalho, Chip, ListaVazia } from '@/components/ui';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

const FILTROS = ['Todas', 'Não lidas', 'Minhas', 'Sem responsável', 'WhatsApp', 'Instagram', 'TikTok', 'E-mail'];

/**
 * Caixa de entrada unificada, lendo `/api/conversas` — a mesma rota do painel web, com as mesmas
 * regras de canal conectado e de workspace.
 *
 * O nome é "Conversas" e não "WhatsApp" porque a tela atende quatro canais: chamar de um deles
 * escondia os outros três de quem procurava.
 */
export default function ConversasScreen() {
  const { pode } = usePermissoes();
  if (!pode('conversas')) return <TelaSemPermissao titulo="Conversas" modulo="conversas" voltar={false} />;

  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useConversas(aoPerderSessao);

  const conversas = (dados ?? []).map(conversaNaTela);
  const naoLidas = conversas.reduce((soma, cv) => soma + (cv.naoLidas ?? 0), 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Conversas"
        sub={carregando ? 'Carregando…' : `${conversas.length} conversas · ${naoLidas} não lidas`}
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

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && conversas.length === 0 ? (
        <Carregando texto="Buscando suas conversas" />
      ) : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LinhaConversa conversa={item} onPress={() => router.push(`/conversa/${item.id}`)} />
          )}
          contentContainerStyle={{ padding: space[4], gap: 7 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
          ListEmptyComponent={
            <ListaVazia
              icone="chatbubbles-outline"
              titulo="Nenhuma conversa ainda"
              descricao="Quando um lead chamar por WhatsApp, Instagram, TikTok ou e-mail, ele aparece aqui."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
