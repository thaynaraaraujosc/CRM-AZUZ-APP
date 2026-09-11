import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartaoNegocio } from '@/components/cards';
import { BotaoIcone, Cabecalho, Chip } from '@/components/ui';
import { etapasFunil, funis } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const LARGURA_COLUNA = 268;

/**
 * Kanban de negócios. No telefone as colunas viram carrossel horizontal com rolagem vertical
 * dentro de cada uma — mesma leitura do web, sem obrigar a pessoa a girar o aparelho.
 */
export default function FunilScreen() {
  const c = useCores();
  const router = useRouter();

  const totalNegocios = etapasFunil.reduce((soma, e) => soma + e.cards.length, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Funil comercial"
        sub={`${totalNegocios} negócios abertos · R$ 7.470 em jogo`}
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      {/* Seleção de funil — o workspace pode ter mais de um */}
      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {funis.map((f, i) => (
            <Chip key={f.id} texto={f.nome} ativo={i === 0} />
          ))}
          <Chip texto="+ Novo funil" />
        </ScrollView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: space[4], gap: space[3] }}
        snapToInterval={LARGURA_COLUNA + space[3]}
        decelerationRate="fast"
      >
        {etapasFunil.map((etapa) => {
          const soma = etapa.cards.reduce((total, card) => {
            const numero = Number(card.valor.replace(/[^0-9]/g, ''));
            return total + (Number.isNaN(numero) ? 0 : numero);
          }, 0);

          return (
            <View
              key={etapa.id}
              style={{
                width: LARGURA_COLUNA,
                backgroundColor: c.surfaceRaised2,
                borderRadius: radius.lg,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: c.line,
                padding: space[3],
                gap: space[3],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                  {etapa.titulo}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: radius.pill,
                    backgroundColor: c.surface,
                  }}
                >
                  <Text style={{ color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                    {etapa.cards.length}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <Pressable hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={c.textFaint} />
                </Pressable>
              </View>

              <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>
                {soma > 0 ? `R$ ${soma.toLocaleString('pt-BR')} nesta etapa` : 'Sem valor informado'}
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: space[2], paddingBottom: space[2] }}
              >
                {etapa.cards.map((negocio) => (
                  <CartaoNegocio
                    key={negocio.id}
                    negocio={negocio}
                    onPress={() => router.push(`/negocio/${negocio.id}`)}
                  />
                ))}

                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: space[2],
                    paddingVertical: space[3],
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: c.lineStrong,
                  }}
                >
                  <Ionicons name="add" size={15} color={c.textMuted} />
                  <Text style={{ color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                    Adicionar negócio
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          );
        })}

        {/* Criar etapa nova, no fim do carrossel */}
        <Pressable
          style={{
            width: 150,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: c.lineStrong,
            alignItems: 'center',
            justifyContent: 'center',
            gap: space[2],
          }}
        >
          <Ionicons name="add-circle-outline" size={22} color={c.textMuted} />
          <Text style={{ color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>Nova etapa</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
