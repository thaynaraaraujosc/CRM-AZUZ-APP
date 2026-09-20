import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  distribuicaoDeMotivos,
  moeda,
  negociosPerdidos,
  percentual,
  todosOsNegocios,
  valorPerdido,
} from '@/api/metricas';
import { usePermissoes } from '@/api/permissoes';
import { useFunis, useMotivosDePerda } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  BarraProgresso,
  Cabecalho,
  Cartao,
  Corpo,
  Indicador,
  ListaVazia,
  Secundario,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

function dataCurta(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Por que os negócios não fecharam — o motivo é escolhido ao marcar perdido no funil. */
export default function MotivosPerdaScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Motivos de perda" modulo="relatórios" voltar={true} />;

  return <MotivosPerda />;
}

function MotivosPerda() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const funis = useFunis(aoPerderSessao);
  const cadastrados = useMotivosDePerda(aoPerderSessao);

  const cards = todosOsNegocios(funis.dados ?? []);
  const perdidos = negociosPerdidos(cards);
  const motivos = distribuicaoDeMotivos(cards);
  const semMotivo = perdidos.filter((p) => !p.motivoPerda).length;

  const ultimos = [...perdidos]
    .sort((a, b) => (b.dataFechamento ?? '').localeCompare(a.dataFechamento ?? ''))
    .slice(0, 8);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Motivos de perda"
        sub={perdidos.length === 1 ? '1 negócio perdido' : `${perdidos.length} negócios perdidos`}
        voltar
      />

      {funis.erro ? (
        <FalhaAoCarregar mensagem={funis.erro} aoTentar={funis.recarregar} />
      ) : funis.carregando && !funis.dados ? (
        <Carregando texto="Somando as perdas" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={funis.carregando} onRefresh={funis.recarregar} tintColor={c.blue} />
          }
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={perdidos.length} rotulo="Perdidos" cor={c.danger} />
            <Indicador numero={moeda(valorPerdido(cards))} rotulo="Valor que saiu" />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Motivos" contagem={motivos.length} />
            {motivos.length === 0 ? (
              <ListaVazia
                icone="close-circle-outline"
                titulo="Nenhum motivo registrado"
                descricao="Ao marcar um negócio como perdido no funil, escolha o motivo — é o que alimenta esta tela."
              />
            ) : (
              <Cartao style={{ gap: space[4] }}>
                {motivos.map((m) => (
                  <View key={m.motivo} style={{ gap: space[2] }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                      <Corpo style={{ flex: 1 }}>{m.motivo}</Corpo>
                      <Text style={{ color: c.ink, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                        {m.quantidade}
                      </Text>
                      <Secundario>{percentual(m.percentual, 0)}</Secundario>
                    </View>
                    <BarraProgresso valor={Math.round(m.percentual)} cor={c.danger} />
                  </View>
                ))}
              </Cartao>
            )}
            {semMotivo > 0 ? (
              <Secundario>
                {semMotivo === 1
                  ? '1 negócio perdido está sem motivo registrado.'
                  : `${semMotivo} negócios perdidos estão sem motivo registrado.`}
              </Secundario>
            ) : null}
          </View>

          {ultimos.length > 0 ? (
            <View style={{ gap: space[3] }}>
              <TituloSecao titulo="Últimos perdidos" contagem={ultimos.length} />
              {ultimos.map((p) => (
                <Cartao key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <View style={{ flex: 1 }}>
                    <Corpo style={{ fontWeight: fontWeight.bold }}>{p.nome}</Corpo>
                    <Secundario numberOfLines={1}>
                      {[p.motivoPerda ?? 'Sem motivo', dataCurta(p.dataFechamento)].filter(Boolean).join(' · ')}
                    </Secundario>
                  </View>
                  <Selo texto={p.valor} cor={c.danger} fundo={c.dangerSoft} />
                </Cartao>
              ))}
            </View>
          ) : null}

          {(cadastrados.dados ?? []).length > 0 ? (
            <View style={{ gap: space[2] }}>
              <TituloSecao titulo="Motivos disponíveis" contagem={cadastrados.dados?.length} />
              <Secundario>{(cadastrados.dados ?? []).join(' · ')}</Secundario>
              <Secundario>Essa lista é editada no CRM pelo computador.</Secundario>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
