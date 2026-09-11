import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartaoCompromisso } from '@/components/cards';
import { BotaoIcone, Cabecalho, Cartao, Chip, Corpo, ListaVazia, Secundario, TituloSecao } from '@/components/ui';
import { compromissosHoje, diasDaSemana } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const VISOES = ['Dia', 'Semana', 'Mês'];

/** Agenda da semana com o dia selecionado aberto abaixo. */
export default function AgendaScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Agenda"
        sub="Setembro de 2025 · 8 compromissos na semana"
        voltar
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3], gap: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {VISOES.map((v, i) => (
            <Chip key={v} texto={v} ativo={i === 0} />
          ))}
        </ScrollView>

        {/* Faixa da semana */}
        <View style={{ flexDirection: 'row', paddingHorizontal: space[3], gap: space[1] }}>
          {diasDaSemana.map((d) => {
            const hoje = 'hoje' in d && d.hoje;
            return (
              <View
                key={d.dia}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: space[2],
                  borderRadius: radius.md,
                  backgroundColor: hoje ? c.acao : 'transparent',
                  borderWidth: hoje ? StyleSheet.hairlineWidth : 0,
                  borderColor: c.acaoBorda,
                }}
              >
                <Text style={{ color: hoje ? 'rgba(255,255,255,0.7)' : c.textFaint, fontSize: fontSize.xs }}>
                  {d.dia}
                </Text>
                <Text
                  style={{
                    color: hoje ? c.acaoTexto : c.ink,
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.bold,
                  }}
                >
                  {d.numero}
                </Text>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: d.eventos > 0 ? (hoje ? c.acaoTexto : c.blue) : 'transparent',
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Quarta, 10 de setembro" contagem={compromissosHoje.length} />
          <View style={{ gap: space[2] }}>
            {compromissosHoje.map((cp) => (
              <CartaoCompromisso key={cp.id} compromisso={cp} />
            ))}
          </View>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Quinta, 11 de setembro" contagem={0} />
          <Cartao>
            <ListaVazia
              icone="calendar-outline"
              titulo="Dia livre"
              descricao="Nenhum compromisso marcado. Bom momento para o follow-up dos negócios parados."
            />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Integrações" />
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: radius.md,
                backgroundColor: c.gray100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="logo-google" size={16} color={c.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>Google Agenda</Corpo>
              <Secundario>Sincroniza compromissos nos dois sentidos</Secundario>
            </View>
            <View
              style={{
                paddingHorizontal: space[2],
                paddingVertical: 4,
                borderRadius: radius.sm,
                backgroundColor: c.successSoft,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: c.line,
              }}
            >
              <Text style={{ color: c.success, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>Conectado</Text>
            </View>
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
