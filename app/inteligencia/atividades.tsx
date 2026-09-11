import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, BarraProgresso, Cabecalho, Cartao, Corpo, Indicador, Secundario, TituloSecao } from '@/components/ui';
import { atividadesPorVendedor } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

/** Esforço comercial por pessoa — quantidade de contato, não resultado. */
export default function AtividadesScreen() {
  const c = useCores();

  const ligacoes = atividadesPorVendedor.reduce((s, v) => s + v.ligacoes, 0);
  const mensagens = atividadesPorVendedor.reduce((s, v) => s + v.mensagens, 0);
  const reunioes = atividadesPorVendedor.reduce((s, v) => s + v.reunioes, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Atividades de vendas" sub="Últimos 30 dias" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero={ligacoes} rotulo="Ligações" />
          <Indicador numero={mensagens} rotulo="Mensagens" />
          <Indicador numero={reunioes} rotulo="Reuniões" />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Por vendedor" contagem={atividadesPorVendedor.length} />

          {atividadesPorVendedor.map((v) => (
            <Cartao key={v.nome} style={{ gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <Avatar iniciais={v.iniciais} tamanho={36} />
                <Text style={{ flex: 1, color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                  {v.nome}
                </Text>
                <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                  {v.ligacoes + v.mensagens + v.reunioes}
                </Text>
              </View>

              <BarraProgresso valor={v.share} />

              <View style={{ flexDirection: 'row', gap: space[5] }}>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{v.ligacoes}</Corpo>
                  <Secundario>ligações</Secundario>
                </View>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{v.mensagens}</Corpo>
                  <Secundario>mensagens</Secundario>
                </View>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{v.reunioes}</Corpo>
                  <Secundario>reuniões</Secundario>
                </View>
              </View>
            </Cartao>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
