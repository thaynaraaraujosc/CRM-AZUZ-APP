import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho, Cartao, Corpo, Indicador, Secundario, Selo, TituloSecao } from '@/components/ui';
import { etapasJornada } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Quanto tempo o lead passa em cada etapa, e onde ele empaca. */
export default function JornadaScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Jornada do cliente" sub="Do primeiro contato ao fechamento" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero="8 dias" rotulo="Ciclo médio" />
          <Indicador numero="4 min" rotulo="1ª resposta" cor={c.success} />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Etapas" contagem={etapasJornada.length} />

          <Cartao style={{ gap: space[4] }}>
            {etapasJornada.map((e, i) => {
              const anterior = i > 0 ? etapasJornada[i - 1].total : e.total;
              const queda = Math.round(((anterior - e.total) / anterior) * 100);

              return (
                <View key={e.etapa} style={{ flexDirection: 'row', gap: space[3] }}>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: c.acao,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: c.acaoTexto, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                        {i + 1}
                      </Text>
                    </View>
                    {i < etapasJornada.length - 1 ? (
                      <View style={{ width: 1, flex: 1, backgroundColor: c.line, marginTop: 4 }} />
                    ) : null}
                  </View>

                  <View style={{ flex: 1, paddingBottom: space[3], gap: space[2] }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                      <Corpo style={{ flex: 1, fontWeight: fontWeight.bold }}>{e.etapa}</Corpo>
                      <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                        {e.total}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: space[1], flexWrap: 'wrap' }}>
                      <Selo texto={`${e.media} em média`} icone="time-outline" />
                      {i > 0 && queda > 0 ? (
                        <Selo texto={`-${queda}% do passo anterior`} cor={c.danger} fundo={c.dangerSoft} />
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Onde está travando" />
          <Cartao style={{ flexDirection: 'row', gap: space[3] }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.md,
                backgroundColor: c.warningSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="warning-outline" size={16} color={c.warning} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>Qualificação para proposta</Corpo>
              <Secundario>
                A maior queda do funil acontece aqui: 59 de 143 leads qualificados chegam a receber proposta.
              </Secundario>
            </View>
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
