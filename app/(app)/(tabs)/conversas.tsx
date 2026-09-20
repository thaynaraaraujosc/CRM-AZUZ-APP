import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { conversaNaTela } from '@/api/adaptar';
import { usePermissoes } from '@/api/permissoes';
import { useConversas } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import type { Conversa } from '@/api/tipos';
import { LinhaConversa } from '@/components/cards';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { BarraBusca, BotaoIcone, Cabecalho, Chip, ListaVazia } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/** Situação da conversa. Mesmos nomes da web. */
const SITUACOES = [
  { valor: 'tudo', rotulo: 'Tudo' },
  { valor: 'nao-lidas', rotulo: 'Não lidas' },
  { valor: 'favoritas', rotulo: 'Favoritas' },
  { valor: 'arquivadas', rotulo: 'Arquivadas' },
] as const;

/**
 * Canal fica numa linha separada da situação, como na web, porque são coisas independentes: dá
 * para querer "não lidas do Instagram". O TikTok aparece desligado de propósito, porque o canal
 * está anunciado no produto mas ainda não recebe mensagem, e esconder faria parecer que não existe.
 */
const CANAIS = [
  { valor: 'todos', rotulo: 'Todos os canais', emBreve: false },
  { valor: 'WhatsApp', rotulo: 'WhatsApp', emBreve: false },
  { valor: 'Instagram', rotulo: 'Instagram', emBreve: false },
  { valor: 'TikTok', rotulo: 'TikTok', emBreve: true },
] as const;

type Situacao = (typeof SITUACOES)[number]['valor'];
type Canal = (typeof CANAIS)[number]['valor'];

export default function ConversasScreen() {
  const { pode } = usePermissoes();
  if (!pode('conversas')) return <TelaSemPermissao titulo="Conversas" modulo="conversas" voltar={false} />;

  return <Conversas />;
}

function Conversas() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useConversas(aoPerderSessao);

  const [situacao, setSituacao] = useState<Situacao>('tudo');
  const [canal, setCanal] = useState<Canal>('todos');

  const todas = dados ?? [];

  function combina(cv: Conversa, sit: Situacao, can: Canal): boolean {
    // Arquivada só aparece quando é ela que está sendo pedida — igual à web.
    if (sit === 'arquivadas') {
      if (!cv.arquivada) return false;
    } else if (cv.arquivada) {
      return false;
    }
    if (sit === 'nao-lidas' && !(cv.naoLidas ?? 0)) return false;
    if (sit === 'favoritas' && !cv.favorita) return false;
    if (can !== 'todos' && cv.canal !== can) return false;
    return true;
  }

  const visiveis = todas.filter((cv) => combina(cv, situacao, canal)).map(conversaNaTela);
  const naoLidas = todas.filter((cv) => combina(cv, 'nao-lidas', canal)).length;

  /** Contagem de cada chip, respeitando o outro filtro que já está ligado. */
  const quantosNaSituacao = (valor: Situacao) => todas.filter((cv) => combina(cv, valor, canal)).length;
  const quantosNoCanal = (valor: Canal) => todas.filter((cv) => combina(cv, situacao, valor)).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Conversas"
        sub={carregando ? 'Carregando…' : `${visiveis.length} conversas · ${naoLidas} não lidas`}
        acao={<BotaoIcone icone="options-outline" />}
      />

      <View style={{ backgroundColor: c.surface, paddingTop: space[3], gap: space[2] }}>
        <View style={{ paddingHorizontal: space[4] }}>
          <BarraBusca placeholder="Buscar contato ou mensagem" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {SITUACOES.map((s) => (
            <Chip
              key={s.valor}
              texto={s.valor === 'tudo' ? s.rotulo : `${s.rotulo} (${quantosNaSituacao(s.valor)})`}
              ativo={situacao === s.valor}
              onPress={() => setSituacao(s.valor)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4], paddingBottom: space[3] }}
        >
          {CANAIS.map((ch) => {
            const quantidade = quantosNoCanal(ch.valor);
            return (
              <Chip
                key={ch.valor}
                texto={ch.emBreve ? `${ch.rotulo} · em breve` : quantidade > 0 ? `${ch.rotulo} (${quantidade})` : ch.rotulo}
                ativo={canal === ch.valor}
                desabilitado={ch.emBreve}
                onPress={() => setCanal(ch.valor)}
              />
            );
          })}
        </ScrollView>
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && todas.length === 0 ? (
        <Carregando texto="Buscando suas conversas" />
      ) : (
        <FlatList
          data={visiveis}
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
              titulo={todas.length === 0 ? 'Nenhuma conversa ainda' : 'Nada com esses filtros'}
              descricao={
                todas.length === 0
                  ? 'Quando um lead chamar por um canal conectado, ele aparece aqui.'
                  : 'Troque a situação ou o canal para ver outras conversas.'
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
