import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  aguardandoAtendimento,
  moeda,
  percentual,
  taxaDeConversao,
  todosOsNegocios,
  ultimosDias,
  valorEmAberto,
  valorVendido,
} from '@/api/metricas';
import { usePermissoes } from '@/api/permissoes';
import { useContatos, useConversas, useFunis } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  Cabecalho,
  Cartao,
  Chip,
  Divisor,
  GraficoBarras,
  Indicador,
  LinhaMenu,
  Secundario,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

const PERIODOS = [
  { rotulo: '7 dias', dias: 7 },
  { rotulo: '14 dias', dias: 14 },
  { rotulo: '30 dias', dias: 30 },
] as const;

/**
 * Central de análise. Os seis módulos leem dos mesmos dados do CRM, então ficam juntos aqui
 * em vez de espalhados pelo menu — mesma organização do web.
 */
export default function InteligenciaScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Inteligência comercial" modulo="relatórios" voltar={true} />;

  return <Inteligencia />;
}

function Inteligencia() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();

  const funis = useFunis(aoPerderSessao);
  const conversas = useConversas(aoPerderSessao);
  const contatos = useContatos(aoPerderSessao);

  const [periodo, setPeriodo] = useState(1);

  const cards = todosOsNegocios(funis.dados ?? []);
  const dias = ultimosDias(cards, PERIODOS[periodo].dias);
  const criadosNoPeriodo = dias.reduce((soma, d) => soma + d.criadas, 0);
  const vendasNoPeriodo = dias.reduce((soma, d) => soma + d.vendas, 0);

  const grafico = dias.map((d) => ({
    rotulo: d.dia.slice(8, 10),
    valor: d.criadas,
    destaque: d.criadas > 0,
  }));

  const carregando = funis.carregando || conversas.carregando || contatos.carregando;

  function recarregar() {
    funis.recarregar();
    conversas.recarregar();
    contatos.recarregar();
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Inteligência comercial" sub="Contas do seu workspace, agora" voltar />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {PERIODOS.map((p, i) => (
            <Chip key={p.rotulo} texto={p.rotulo} ativo={i === periodo} onPress={() => setPeriodo(i)} />
          ))}
        </ScrollView>
      </View>

      {funis.erro ? (
        <FalhaAoCarregar mensagem={funis.erro} aoTentar={recarregar} />
      ) : carregando && !funis.dados ? (
        <Carregando texto="Somando os seus números" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ gap: space[2] }}>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Indicador
                numero={criadosNoPeriodo}
                rotulo="Negócios novos"
                obs={`nos últimos ${PERIODOS[periodo].dias} dias`}
              />
              <Indicador
                numero={aguardandoAtendimento(conversas.dados ?? []).length}
                rotulo="Sem resposta"
                obs="conversas esperando"
                cor={c.warning}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Indicador
                numero={moeda(valorVendido(cards))}
                rotulo="Fechado"
                obs={`${vendasNoPeriodo} venda(s) no período`}
                cor={c.success}
              />
              <Indicador
                numero={percentual(taxaDeConversao(cards))}
                rotulo="Conversão"
                obs="ganhos ÷ encerrados"
              />
            </View>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Negócios novos por dia" />
            <Cartao style={{ gap: space[3] }}>
              <Secundario>
                {`${PERIODOS[periodo].dias} dias · ${criadosNoPeriodo} negócios · ${moeda(valorEmAberto(cards))} em aberto`}
              </Secundario>
              <GraficoBarras dados={grafico} altura={130} />
            </Cartao>
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Relatórios do módulo" />
            <Cartao padding={0} style={{ overflow: 'hidden' }}>
              <LinhaMenu
                icone="megaphone-outline"
                titulo="Tráfego"
                sub="Investimento, custo por lead e ROAS"
                onPress={() => router.push('/inteligencia/trafego')}
              />
              <Divisor />
              <LinhaMenu
                icone="pulse-outline"
                titulo="Atividades"
                sub="Tarefas e compromissos por pessoa"
                onPress={() => router.push('/inteligencia/atividades')}
              />
              <Divisor />
              <LinhaMenu
                icone="trending-up-outline"
                titulo="Performance de vendas"
                sub="Conversão por etapa e por pessoa"
                onPress={() => router.push('/inteligencia/performance')}
              />
              <Divisor />
              <LinhaMenu
                icone="footsteps-outline"
                titulo="Jornada do cliente"
                sub="De onde vêm e onde estão os leads"
                onPress={() => router.push('/inteligencia/jornada')}
              />
              <Divisor />
              <LinhaMenu
                icone="close-circle-outline"
                titulo="Motivos de perda"
                sub="Por que os negócios não fecharam"
                onPress={() => router.push('/inteligencia/motivos-perda')}
              />
              <Divisor />
              <LinhaMenu
                icone="document-outline"
                titulo="Relatórios"
                sub="Gerados no CRM"
                onPress={() => router.push('/inteligencia/relatorios')}
              />
            </Cartao>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
