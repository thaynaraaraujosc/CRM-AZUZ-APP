import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { negocioNaTela, type NegocioNaTela } from '@/api/adaptar';
import { moverNegocio, useFunis } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import type { ColunaFunil } from '@/api/tipos';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import {
  CabecalhoEtapa,
  CardNegocio,
  FOLGA_COLUNA,
  LARGURA_COLUNA,
  MARGEM_QUADRO,
} from '@/components/funil';
import { BotaoIcone, Cabecalho, Chip } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Faixa nas bordas do quadro que faz a rolagem andar sozinha enquanto se arrasta um card. */
const ZONA_DE_ROLAGEM = 56;
const VELOCIDADE_ROLAGEM = 9;

type EtapaNaTela = { id: string; titulo: string; cards: NegocioNaTela[] };
type EmArraste = { negocio: NegocioNaTela; etapaOrigem: string } | null;

function somaDaEtapa(etapa: EtapaNaTela): number {
  return etapa.cards.reduce((total, card) => {
    const numero = Number(card.valor.replace(/[^0-9]/g, ''));
    return total + (Number.isNaN(numero) ? 0 : numero);
  }, 0);
}

function paraTela(colunas: ColunaFunil[]): EtapaNaTela[] {
  return colunas.map((coluna) => ({
    id: coluna.id,
    titulo: coluna.titulo,
    cards: coluna.cards.map(negocioNaTela),
  }));
}

/**
 * Kanban de negócios, nas cores do CRM web: coluna cinza sem moldura, card branco com borda fina
 * e sombra mínima por cima dela, bolinha azul na etapa e a origem em caixa alta com a cor da
 * plataforma.
 *
 * Segurar um card por um instante o levanta, e aí ele acompanha o dedo até outra etapa — a
 * rolagem do quadro anda sozinha quando o dedo chega perto da borda, que é o que faz o gesto
 * funcionar numa tela onde só cabe uma coluna e meia.
 */
export default function FunilScreen() {
  const c = useCores();
  const router = useRouter();

  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useFunis(aoPerderSessao);

  const [funilAtivo, setFunilAtivo] = useState(0);
  const [etapas, setEtapas] = useState<EtapaNaTela[]>([]);
  const [emArraste, setEmArraste] = useState<EmArraste>(null);
  const [etapaAlvo, setEtapaAlvo] = useState(-1);
  const [falhaAoMover, setFalhaAoMover] = useState<string | null>(null);

  const funis = dados ?? [];
  const funil = funis[funilAtivo];

  // O quadro é editável (arrastar move card na hora), então o estado local é a fonte da tela e o
  // servidor é a fonte da verdade. Toda vez que a API responde, o local é refeito a partir dela.
  const assinatura = funil ? `${funil.id}:${funil.colunas.map((co) => `${co.id}=${co.cards.length}`).join(',')}` : '';
  const [assinaturaAplicada, setAssinaturaAplicada] = useState('');
  if (funil && assinatura !== assinaturaAplicada) {
    setAssinaturaAplicada(assinatura);
    setEtapas(paraTela(funil.colunas));
  }

  const listaRef = useAnimatedRef<Animated.ScrollView>();
  const rolagem = useSharedValue(0);
  const dedoX = useSharedValue(0);
  const dedoY = useSharedValue(0);
  const quadroX = useSharedValue(0);
  const quadroY = useSharedValue(0);
  const quadroLargura = useSharedValue(0);
  const arrastando = useSharedValue(0);
  const alvo = useSharedValue(-1);
  const totalEtapas = useSharedValue(etapas.length);
  totalEtapas.value = etapas.length;

  const quadroRef = useRef<View>(null);

  const aoRolar = useAnimatedScrollHandler((e) => {
    rolagem.value = e.contentOffset.x;
  });

  /** O quadro precisa saber onde está na tela: o dedo chega em coordenada de janela. */
  const medirQuadro = useCallback(() => {
    quadroRef.current?.measureInWindow((x, y, largura) => {
      quadroX.value = x;
      quadroY.value = y;
      quadroLargura.value = largura;
    });
  }, [quadroLargura, quadroX, quadroY]);

  const rolagemAutomatica = useFrameCallback(() => {
    'worklet';
    if (!arrastando.value) return;
    const relativo = dedoX.value - quadroX.value;
    if (relativo < ZONA_DE_ROLAGEM) {
      scrollTo(listaRef, Math.max(rolagem.value - VELOCIDADE_ROLAGEM, 0), 0, false);
    } else if (relativo > quadroLargura.value - ZONA_DE_ROLAGEM) {
      scrollTo(listaRef, rolagem.value + VELOCIDADE_ROLAGEM, 0, false);
    }
  }, false);

  const comecarArraste = useCallback(
    (negocio: NegocioNaTela, etapaOrigem: string) => {
      setEmArraste({ negocio, etapaOrigem });
      rolagemAutomatica.setActive(true);
    },
    [rolagemAutomatica],
  );

  /**
   * Solta o card na etapa sob o dedo: move na tela primeiro e grava em seguida.
   *
   * Se a gravação falhar, o quadro volta ao que está no banco e a falha aparece — o pior desfecho
   * aqui seria a tela mostrar o card na etapa nova e o CRM continuar com ele na antiga.
   */
  const soltar = useCallback(() => {
    rolagemAutomatica.setActive(false);
    const destino = alvo.value;
    setEtapaAlvo(-1);

    setEmArraste((atual) => {
      if (!atual) return null;
      const etapaDestino = etapas[destino];
      if (etapaDestino && etapaDestino.id !== atual.etapaOrigem) {
        setEtapas((anteriores) =>
          anteriores.map((etapa) => {
            if (etapa.id === atual.etapaOrigem) {
              return { ...etapa, cards: etapa.cards.filter((card) => card.id !== atual.negocio.id) };
            }
            if (etapa.id === etapaDestino.id) {
              return { ...etapa, cards: [...etapa.cards, atual.negocio] };
            }
            return etapa;
          }),
        );

        setFalhaAoMover(null);
        moverNegocio(atual.negocio.id, etapaDestino.id).catch((e: unknown) => {
          setFalhaAoMover(e instanceof Error ? e.message : 'Não foi possível mover o negócio.');
          recarregar();
        });
      }
      return null;
    });
  }, [alvo, etapas, recarregar, rolagemAutomatica]);

  const totalNegocios = etapas.reduce((soma, e) => soma + e.cards.length, 0);
  const valorTotal = etapas.reduce((soma, e) => soma + somaDaEtapa(e), 0);

  const estiloFlutuante = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dedoX.value - quadroX.value - (LARGURA_COLUNA - space[3] * 2) / 2,
    top: dedoY.value - quadroY.value - 34,
    width: LARGURA_COLUNA - space[3] * 2,
    opacity: arrastando.value,
    transform: [{ scale: 1.04 }, { rotate: '-1.5deg' }],
  }));

  function CardArrastavel({ negocio, etapaId }: { negocio: NegocioNaTela; etapaId: string }) {
    const arrastar = Gesture.Pan()
      .activateAfterLongPress(220)
      .onStart((e) => {
        dedoX.value = e.absoluteX;
        dedoY.value = e.absoluteY;
        arrastando.value = 1;
        runOnJS(comecarArraste)(negocio, etapaId);
      })
      .onUpdate((e) => {
        dedoX.value = e.absoluteX;
        dedoY.value = e.absoluteY;

        const xNoConteudo = e.absoluteX - quadroX.value + rolagem.value - MARGEM_QUADRO;
        const bruto = Math.floor(xNoConteudo / (LARGURA_COLUNA + FOLGA_COLUNA));
        const indice = Math.min(Math.max(bruto, 0), totalEtapas.value - 1);
        if (indice !== alvo.value) {
          alvo.value = indice;
          runOnJS(setEtapaAlvo)(indice);
        }
      })
      .onEnd(() => {
        arrastando.value = 0;
        runOnJS(soltar)();
      })
      .onFinalize(() => {
        arrastando.value = 0;
      });

    const abrir = Gesture.Tap().onEnd(() => {
      runOnJS(router.push)(`/negocio/${negocio.id}`);
    });

    return (
      <GestureDetector gesture={Gesture.Exclusive(arrastar, abrir)}>
        <View>
          <CardNegocio negocio={negocio} fantasma={emArraste?.negocio.id === negocio.id} />
        </View>
      </GestureDetector>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo={funil?.nome ?? 'Funil'}
        sub={
          carregando
            ? 'Carregando…'
            : `${totalNegocios} negócios abertos · R$ ${valorTotal.toLocaleString('pt-BR')} em jogo`
        }
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {funis.map((f, i) => (
            <Chip key={f.id} texto={f.nome} ativo={i === funilAtivo} onPress={() => setFunilAtivo(i)} />
          ))}
          <Chip texto="+ Novo funil" />
        </ScrollView>
      </View>

      {falhaAoMover ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[2],
            marginHorizontal: space[4],
            marginTop: space[3],
            padding: space[3],
            borderRadius: radius.md,
            backgroundColor: c.dangerSoft,
          }}
        >
          <Ionicons name="alert-circle-outline" size={16} color={c.danger} />
          <Text style={{ flex: 1, color: c.danger, fontSize: fontSize.sm }}>{falhaAoMover}</Text>
          <Pressable onPress={() => setFalhaAoMover(null)} hitSlop={8}>
            <Ionicons name="close" size={16} color={c.danger} />
          </Pressable>
        </View>
      ) : null}

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && etapas.length === 0 ? (
        <Carregando texto="Buscando seu funil" />
      ) : (
      <View ref={quadroRef} onLayout={medirQuadro} style={{ flex: 1 }}>
        <Animated.ScrollView
          ref={listaRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!emArraste}
          onScroll={aoRolar}
          scrollEventThrottle={16}
          contentContainerStyle={{ padding: MARGEM_QUADRO, gap: FOLGA_COLUNA }}
        >
          {etapas.map((etapa, indice) => {
            const soma = somaDaEtapa(etapa);
            const ehAlvo = Boolean(emArraste) && etapaAlvo === indice;

            return (
              <View
                key={etapa.id}
                style={{
                  width: LARGURA_COLUNA,
                  backgroundColor: ehAlvo ? c.blueSoft : c.surfaceRaised2,
                  borderRadius: radius.lg,
                  padding: space[3],
                  gap: space[3],
                }}
              >
                <CabecalhoEtapa
                  titulo={etapa.titulo}
                  quantidade={etapa.cards.length}
                  soma={soma > 0 ? `R$ ${soma.toLocaleString('pt-BR')} nesta etapa` : 'Sem valor informado'}
                  alvo={ehAlvo}
                />

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={!emArraste}
                  contentContainerStyle={{ gap: space[2], paddingBottom: space[2] }}
                >
                  {etapa.cards.map((negocio) => (
                    <CardArrastavel key={negocio.id} negocio={negocio} etapaId={etapa.id} />
                  ))}

                  {etapa.cards.length === 0 ? (
                    <Text style={{ color: c.textFaint, fontSize: fontSize.sm, paddingVertical: space[3] }}>
                      Nenhum negócio nesta etapa.
                    </Text>
                  ) : null}

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
            <Text style={{ color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
              Nova etapa
            </Text>
          </Pressable>
        </Animated.ScrollView>

        {/* A cópia que acompanha o dedo. Fica fora da rolagem, senão andaria junto com o quadro. */}
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
          {emArraste ? (
            <Animated.View style={estiloFlutuante}>
              <CardNegocio negocio={emArraste.negocio} flutuante />
            </Animated.View>
          ) : null}
        </View>
      </View>
      )}

      {emArraste ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingVertical: space[2],
            alignItems: 'center',
            backgroundColor: c.acao,
          }}
        >
          <Text style={{ color: c.acaoTexto, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
            Solte sobre a etapa
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
