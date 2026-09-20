import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho, Cartao, Chip, Divisor, GraficoBarras, Indicador, LinhaMenu, Secundario, TituloSecao } from '@/components/ui';
import { kpisInicio, leadsPorDia } from '@/mock/dados';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

const PERIODOS = ['Hoje', '7 dias', '30 dias', 'Este mês', 'Personalizado'];

/**
 * Central de análise. Os sete módulos leem dos mesmos dados do CRM, então ficam juntos aqui
 * em vez de espalhados pelo menu — mesma organização do web.
 */
export default function InteligenciaScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Inteligência comercial" modulo="relatórios" voltar={true} />;

  const c = useCores();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Inteligência comercial" sub="Julho de 2025 · dados do workspace" voltar />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {PERIODOS.map((p, i) => (
            <Chip key={p} texto={p} ativo={i === 2} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Números do mês */}
        <View style={{ gap: space[2] }}>
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={kpisInicio[0].valor} rotulo={kpisInicio[0].label} obs={kpisInicio[0].delta} />
            <Indicador numero={kpisInicio[1].valor} rotulo={kpisInicio[1].label} obs={kpisInicio[1].delta} />
          </View>
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador
              numero={kpisInicio[2].valor}
              rotulo={kpisInicio[2].label}
              obs={kpisInicio[2].delta}
              cor={c.success}
            />
            <Indicador numero={kpisInicio[3].valor} rotulo={kpisInicio[3].label} obs={kpisInicio[3].delta} />
          </View>
        </View>

        {/* Leads por dia */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Leads por dia" />
          <Cartao style={{ gap: space[3] }}>
            <Secundario>Últimos 14 dias · 84 leads hoje</Secundario>
            <GraficoBarras dados={leadsPorDia} altura={130} />
          </Cartao>
        </View>

        {/* Módulos */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Relatórios do módulo" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="megaphone-outline"
              titulo="Tráfego"
              sub="Canal, investimento, custo por lead e ROAS"
              onPress={() => router.push('/inteligencia/trafego')}
            />
            <Divisor />
            <LinhaMenu
              icone="pulse-outline"
              titulo="Atividades"
              sub="Ligação, mensagem e reunião por vendedor"
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
              sub="Tempo médio em cada etapa"
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
              sub="Gerados e exportados"
              onPress={() => router.push('/inteligencia/relatorios')}
            />
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
