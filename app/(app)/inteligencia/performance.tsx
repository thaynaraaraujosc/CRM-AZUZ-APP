import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  moeda,
  negociosGanhos,
  percentual,
  porEtapa,
  porResponsavel,
  taxaDeConversao,
  ticketMedio,
  todosOsNegocios,
  ultimosDias,
  valorVendido,
} from '@/api/metricas';
import { usePermissoes } from '@/api/permissoes';
import { useFunis } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  Avatar,
  BarraProgresso,
  Cabecalho,
  Cartao,
  GraficoBarras,
  Indicador,
  ListaVazia,
  Secundario,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

function iniciaisDe(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/** Conversão por etapa e ranking de vendas realizadas. */
export default function PerformanceScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Performance" modulo="relatórios" voltar={true} />;

  return <Performance />;
}

function Performance() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useFunis(aoPerderSessao);

  const funis = dados ?? [];
  const cards = todosOsNegocios(funis);
  const ganhos = negociosGanhos(cards);
  const etapas = porEtapa(funis[0]);
  const ranking = porResponsavel(cards);
  const maiorReceita = Math.max(1, ...ranking.map((r) => r.receita));

  const vendasPorDia = ultimosDias(cards, 14).map((d) => ({
    rotulo: d.dia.slice(8, 10),
    valor: d.vendas,
    destaque: d.vendas > 0,
  }));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Performance de vendas"
        sub={funis[0] ? funis[0].nome : 'Todos os funis'}
        voltar
      />

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && !dados ? (
        <Carregando texto="Somando as suas vendas" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={ganhos.length} rotulo="Vendas" cor={c.success} />
            <Indicador numero={moeda(valorVendido(cards))} rotulo="Fechado" />
            <Indicador numero={percentual(taxaDeConversao(cards))} rotulo="Conversão" />
          </View>

          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={moeda(ticketMedio(cards))} rotulo="Ticket médio" obs="fechado ÷ vendas" />
            <Indicador numero={cards.length} rotulo="Negócios no funil" />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo={funis[0] ? `Etapas do ${funis[0].nome}` : 'Etapas'} />
            <Cartao style={{ gap: space[4] }}>
              {etapas.length === 0 ? (
                <Secundario>Nenhuma etapa com negócio ainda.</Secundario>
              ) : null}
              {etapas.map((etapa) => (
                <View key={etapa.etapa} style={{ gap: space[2] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ flex: 1, color: c.ink, fontSize: fontSize.base }}>{etapa.etapa}</Text>
                    <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                      {etapa.total}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 26,
                      width: `${Math.max(etapa.largura, 3)}%`,
                      borderRadius: radius.sm,
                      backgroundColor: c.acao,
                      opacity: 0.15 + (etapa.largura / 100) * 0.85,
                    }}
                  />
                </View>
              ))}
            </Cartao>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Vendas por dia" />
            <Cartao style={{ gap: space[3] }}>
              <Secundario>Últimos 14 dias</Secundario>
              <GraficoBarras dados={vendasPorDia} altura={110} cor={c.success} />
            </Cartao>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Ranking" contagem={ranking.length} />
            {ranking.length === 0 ? (
              <ListaVazia
                icone="trophy-outline"
                titulo="Nenhuma venda com responsável"
                descricao="O ranking usa o responsável de cada negócio. Marque quem responde por cada um no funil."
              />
            ) : null}
            {ranking.map((r, i) => (
              <Cartao key={r.nome} style={{ gap: space[3] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <Text style={{ color: c.textFaint, fontSize: fontSize.md, fontWeight: fontWeight.bold, width: 16 }}>
                    {i + 1}
                  </Text>
                  <Avatar iniciais={iniciaisDe(r.nome)} tamanho={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                      {r.nome}
                    </Text>
                    <Secundario>
                      {`${r.vendidas} venda(s)${r.perdidas > 0 ? ` · ${r.perdidas} perdida(s)` : ''}`}
                    </Secundario>
                  </View>
                  <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {moeda(r.receita)}
                  </Text>
                </View>
                <BarraProgresso valor={Math.round((r.receita / maiorReceita) * 100)} cor={c.success} />
              </Cartao>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
