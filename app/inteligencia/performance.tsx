import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, BarraProgresso, Cabecalho, Cartao, GraficoBarras, Indicador, Secundario, TituloSecao } from '@/components/ui';
import { funilDoMes, leadsPorDia } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const RANKING = [
  { nome: 'Bruno Salles', iniciais: 'BS', vendas: 18, valor: 'R$ 21.400', share: 100 },
  { nome: 'Dr. Hélio Marinho', iniciais: 'HM', vendas: 11, valor: 'R$ 11.200', share: 61 },
  { nome: 'Ana Ferreira', iniciais: 'AF', vendas: 7, valor: 'R$ 5.800', share: 39 },
];

/** Conversão por etapa e ranking de vendas realizadas. */
export default function PerformanceScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Performance de vendas" sub="Julho de 2025" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero="36" rotulo="Vendas" cor={c.success} />
          <Indicador numero="R$ 38.400" rotulo="Faturado" />
          <Indicador numero="14,6%" rotulo="Conversão" />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Funil do mês" />
          <Cartao style={{ gap: space[4] }}>
            {funilDoMes.map((etapa) => (
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
                    width: `${etapa.largura}%`,
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
            <GraficoBarras dados={leadsPorDia} altura={110} cor={c.success} />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Ranking" contagem={RANKING.length} />
          {RANKING.map((r, i) => (
            <Cartao key={r.nome} style={{ gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <Text style={{ color: c.textFaint, fontSize: fontSize.md, fontWeight: fontWeight.bold, width: 16 }}>
                  {i + 1}
                </Text>
                <Avatar iniciais={r.iniciais} tamanho={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {r.nome}
                  </Text>
                  <Secundario>{r.vendas} vendas</Secundario>
                </View>
                <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{r.valor}</Text>
              </View>
              <BarraProgresso valor={r.share} cor={c.success} />
            </Cartao>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
