import { Ionicons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { moeda, percentual, porEtapa, porOrigem, todosOsNegocios, valorEmAberto } from '@/api/metricas';
import { usePermissoes } from '@/api/permissoes';
import { useContatos, useFunis } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Cabecalho, Cartao, Corpo, Indicador, ListaVazia, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Quantos dias o negócio já tem, e onde os leads estão parados. */
export default function JornadaScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Jornada do cliente" modulo="relatórios" voltar={true} />;

  return <Jornada />;
}

function diasDesde(iso: string | undefined): number | null {
  if (!iso) return null;
  const inicio = new Date(iso);
  if (Number.isNaN(inicio.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - inicio.getTime()) / 86_400_000));
}

function Jornada() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();

  const funis = useFunis(aoPerderSessao);
  const contatos = useContatos(aoPerderSessao);

  const lista = funis.dados ?? [];
  const cards = todosOsNegocios(lista);
  const abertos = cards.filter((card) => !card.statusFechamento);
  const etapas = porEtapa(lista[0]);
  const origens = porOrigem(contatos.dados ?? []);

  const idades = abertos.map((card) => diasDesde(card.data)).filter((d): d is number => d !== null);
  const idadeMedia = idades.length > 0 ? Math.round(idades.reduce((s, d) => s + d, 0) / idades.length) : 0;

  const fechados = cards.filter((card) => card.statusFechamento && card.data && card.dataFechamento);
  const ciclos = fechados
    .map((card) => {
      const inicio = new Date(card.data).getTime();
      const fim = new Date(card.dataFechamento as string).getTime();
      if (Number.isNaN(inicio) || Number.isNaN(fim)) return null;
      return Math.max(0, Math.round((fim - inicio) / 86_400_000));
    })
    .filter((d): d is number => d !== null);
  const cicloMedio = ciclos.length > 0 ? Math.round(ciclos.reduce((s, d) => s + d, 0) / ciclos.length) : 0;

  const parados = [...abertos]
    .map((card) => ({ card, dias: diasDesde(card.data) ?? 0 }))
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 6);

  function recarregar() {
    funis.recarregar();
    contatos.recarregar();
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Jornada do cliente" sub="Do primeiro contato ao fechamento" voltar />

      {funis.erro ? (
        <FalhaAoCarregar mensagem={funis.erro} aoTentar={recarregar} />
      ) : funis.carregando && !funis.dados ? (
        <Carregando texto="Medindo a jornada" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={funis.carregando} onRefresh={recarregar} tintColor={c.blue} />
          }
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador
              numero={cicloMedio > 0 ? `${cicloMedio} dias` : '—'}
              rotulo="Ciclo médio"
              obs={ciclos.length > 0 ? `${ciclos.length} negócio(s) fechado(s)` : 'nenhum fechado ainda'}
            />
            <Indicador
              numero={idadeMedia > 0 ? `${idadeMedia} dias` : '—'}
              rotulo="Idade média em aberto"
              cor={c.warning}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={abertos.length} rotulo="Em aberto" />
            <Indicador numero={moeda(valorEmAberto(cards))} rotulo="Valor em jogo" />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Onde estão os leads" contagem={etapas.length} />
            <Cartao style={{ gap: space[3] }}>
              {etapas.length === 0 ? <Secundario>Nenhuma etapa com negócio ainda.</Secundario> : null}
              {etapas.map((etapa, i) => (
                <View key={etapa.etapa} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: radius.pill,
                      backgroundColor: c.blueSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: c.blue, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>{i + 1}</Text>
                  </View>
                  <Corpo style={{ flex: 1 }}>{etapa.etapa}</Corpo>
                  <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {etapa.total}
                  </Text>
                </View>
              ))}
            </Cartao>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Esperando há mais tempo" contagem={parados.length} />
            {parados.length === 0 ? (
              <ListaVazia
                icone="footsteps-outline"
                titulo="Nenhum negócio em aberto"
                descricao="Quando houver negócio andando no funil, os mais antigos aparecem aqui."
              />
            ) : null}
            {parados.map(({ card, dias }) => (
              <Cartao key={card.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <Ionicons name="time-outline" size={16} color={dias > 14 ? c.danger : c.textMuted} />
                <View style={{ flex: 1 }}>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{card.nome}</Corpo>
                  <Secundario>{`${card.valor} · ${card.origem}`}</Secundario>
                </View>
                <Selo
                  texto={dias === 0 ? 'hoje' : `${dias} dias`}
                  cor={dias > 14 ? c.danger : c.textMuted}
                  fundo={dias > 14 ? c.dangerSoft : c.gray100}
                />
              </Cartao>
            ))}
          </View>

          {origens.length > 0 ? (
            <View style={{ gap: space[3] }}>
              <TituloSecao titulo="Por onde chegaram" contagem={origens.length} />
              <Cartao style={{ gap: space[3] }}>
                {origens.slice(0, 6).map((o) => (
                  <View key={o.origem} style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                    <Corpo style={{ flex: 1 }}>{o.origem}</Corpo>
                    <Text style={{ color: c.ink, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                      {o.quantidade}
                    </Text>
                    <Secundario>{percentual(o.percentual, 0)}</Secundario>
                  </View>
                ))}
              </Cartao>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
