import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso, Cabecalho, Cartao, Chip, Corpo, Indicador, Secundario, TituloSecao } from '@/components/ui';
import { canaisDeTrafego } from '@/mock/dados';
import { useCorDaOrigem, useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

const PERIODOS = ['7 dias', '30 dias', 'Este mês'];

/** Origem paga x orgânica: quanto entrou, quanto custou e o retorno. */
export default function TrafegoScreen() {
  const c = useCores();
  const corOrigem = useCorDaOrigem();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Tráfego" sub="247 leads · R$ 7.300 investidos" voltar />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {PERIODOS.map((p, i) => (
            <Chip key={p} texto={p} ativo={i === 1} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero="247" rotulo="Leads" />
          <Indicador numero="R$ 35,90" rotulo="Custo por lead" />
          <Indicador numero="4,2x" rotulo="ROAS" cor={c.success} />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Por canal" contagem={canaisDeTrafego.length} />

          {canaisDeTrafego.map((canal) => (
            <Cartao key={canal.nome} style={{ gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: corOrigem(canal.nome) ?? c.textMuted,
                  }}
                />
                <Text style={{ flex: 1, color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                  {canal.nome}
                </Text>
                <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                  {canal.leads}
                </Text>
                <Secundario>leads</Secundario>
              </View>

              <BarraProgresso valor={canal.share} cor={corOrigem(canal.nome) ?? c.textMuted} />

              <View style={{ flexDirection: 'row', gap: space[5] }}>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{canal.investimento}</Corpo>
                  <Secundario>investido</Secundario>
                </View>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{canal.cpl}</Corpo>
                  <Secundario>por lead</Secundario>
                </View>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{canal.roas}</Corpo>
                  <Secundario>ROAS</Secundario>
                </View>
              </View>
            </Cartao>
          ))}
        </View>

        <Cartao>
          <Secundario>
            Instagram e TikTok aparecem sem investimento porque são tráfego orgânico — o número de leads é real, o
            custo não se aplica.
          </Secundario>
        </Cartao>
      </ScrollView>
    </SafeAreaView>
  );
}
