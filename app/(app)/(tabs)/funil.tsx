import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { negocioNaTela, type NegocioNaTela } from '@/api/adaptar';
import {
  criarEtapa,
  criarFunil,
  criarNegocio,
  moverNegocio,
  ORIGENS_DE_NEGOCIO,
  useEquipe,
  useFunis,
} from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import type { ColunaFunil } from '@/api/tipos';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { FolhaDeCriacao } from '@/components/FolhaDeCriacao';
import {
  CabecalhoEtapa,
  CardNegocio,
  FOLGA_COLUNA,
  LARGURA_COLUNA,
  MARGEM_QUADRO,
} from '@/components/funil';
import { BotaoIcone, Cabecalho, Campo, Chip, Secundario } from '@/components/ui';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Tempo sem sinal do gesto até o quadro se destravar sozinho. */
const SEGUNDOS_ATE_DESTRAVAR = 10;

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
 * O que cada gesto de card precisa saber. Vem do quadro pronto e com identidade estável, senão o
 * card seria remontado a cada toque.
 */
type Arraste = {
  dedoX: SharedValue<number>;
  dedoY: SharedValue<number>;
  arrastando: SharedValue<number>;
  alvo: SharedValue<number>;
  rolagem: SharedValue<number>;
  quadroX: SharedValue<number>;
  totalEtapas: SharedValue<number>;
  comecar: (negocio: NegocioNaTela, etapaOrigem: string) => void;
  mudarAlvo: (indice: number) => void;
  soltar: () => void;
  cancelar: () => void;
  abrir: (id: string) => void;
};

/**
 * Card que se levanta ao ser segurado.
 *
 * Mora aqui fora, e não dentro da tela do funil, por um motivo que custou caro: um componente
 * declarado dentro de outro é um tipo novo a cada desenho da tela. O React então desmonta e monta
 * o card de novo — e o gesto em curso morre junto, no meio do arraste. Era isso que travava o
 * quadro.
 */
const CardArrastavel = memo(function CardArrastavel({
  negocio,
  etapaId,
  fantasma,
  arraste,
}: {
  negocio: NegocioNaTela;
  etapaId: string;
  fantasma: boolean;
  arraste: Arraste;
}) {
  const arrastar = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart((e) => {
      arraste.dedoX.value = e.absoluteX;
      arraste.dedoY.value = e.absoluteY;
      arraste.arrastando.value = 1;
      runOnJS(arraste.comecar)(negocio, etapaId);
    })
    .onUpdate((e) => {
      arraste.dedoX.value = e.absoluteX;
      arraste.dedoY.value = e.absoluteY;

      const xNoConteudo = e.absoluteX - arraste.quadroX.value + arraste.rolagem.value - MARGEM_QUADRO;
      const bruto = Math.floor(xNoConteudo / (LARGURA_COLUNA + FOLGA_COLUNA));
      const indice = Math.min(Math.max(bruto, 0), arraste.totalEtapas.value - 1);
      if (indice !== arraste.alvo.value) {
        arraste.alvo.value = indice;
        runOnJS(arraste.mudarAlvo)(indice);
      }
    })
    .onEnd(() => {
      arraste.arrastando.value = 0;
      runOnJS(arraste.soltar)();
    })
    // Gesto cancelado (dedo saiu da tela, sistema tomou o toque) também precisa devolver o quadro
    // ao normal — senão ele fica sem rolar e sem aceitar outro arraste.
    .onFinalize((_e, sucesso) => {
      arraste.arrastando.value = 0;
      if (!sucesso) runOnJS(arraste.cancelar)();
    })
    .onTouchesCancelled(() => {
      arraste.arrastando.value = 0;
      runOnJS(arraste.cancelar)();
    });

  const abrir = Gesture.Tap().onEnd(() => {
    runOnJS(arraste.abrir)(negocio.id);
  });

  return (
    <GestureDetector gesture={Gesture.Exclusive(arrastar, abrir)}>
      <View>
        <CardNegocio negocio={negocio} fantasma={fantasma} />
      </View>
    </GestureDetector>
  );
});

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
  const { pode } = usePermissoes();
  if (!pode('funil')) return <TelaSemPermissao titulo="Funil" modulo="o funil" voltar={false} />;

  const c = useCores();
  const router = useRouter();

  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useFunis(aoPerderSessao);

  const [funilAtivo, setFunilAtivo] = useState(0);
  const [etapas, setEtapas] = useState<EtapaNaTela[]>([]);
  const [emArraste, setEmArraste] = useState<EmArraste>(null);
  const [etapaAlvo, setEtapaAlvo] = useState(-1);
  const [falhaAoMover, setFalhaAoMover] = useState<string | null>(null);

  // As três criações do quadro: negócio (numa etapa), etapa nova e funil novo.
  const [criando, setCriando] = useState<'negocio' | 'etapa' | 'funil' | null>(null);
  const [etapaEscolhida, setEtapaEscolhida] = useState<string | null>(null);
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [valorNegocio, setValorNegocio] = useState('');
  const [origemNegocio, setOrigemNegocio] = useState<string>(ORIGENS_DE_NEGOCIO[0]);
  const [nomeEtapa, setNomeEtapa] = useState('');
  const [responsavelDoFunil, setResponsavelDoFunil] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [falhaAoCriar, setFalhaAoCriar] = useState<string | null>(null);

  const equipe = useEquipe(aoPerderSessao);

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

  // Escrever num valor compartilhado durante o desenho da tela é justamente o que o Reanimated
  // avisa para não fazer: o desenho e a animação rodam em linhas de execução diferentes, e o valor
  // pode chegar pela metade. Aqui ele é atualizado depois que a tela termina de desenhar.
  useEffect(() => {
    totalEtapas.value = etapas.length;
  }, [etapas.length, totalEtapas]);

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

  // O que está no ar agora. Vive também numa `ref` porque quem solta o card precisa saber disso
  // na hora, e o estado só chega no próximo desenho da tela.
  const noArRef = useRef<EmArraste>(null);

  /**
   * Rede de segurança do arraste.
   *
   * Enquanto um card está no ar, o quadro não rola. Se por qualquer motivo o fim do gesto não
   * chegar — e no celular isso acontece: chamada entrando, aplicativo indo para segundo plano —
   * o funil ficaria travado até fechar e abrir. Este relógio devolve o quadro ao normal sozinho.
   */
  const relogioDeSeguranca = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pararRelogio = useCallback(() => {
    if (relogioDeSeguranca.current) {
      clearTimeout(relogioDeSeguranca.current);
      relogioDeSeguranca.current = null;
    }
  }, []);

  /** Recomeça a contagem a cada sinal de vida do gesto. */
  const armarRelogio = useCallback(() => {
    pararRelogio();
    relogioDeSeguranca.current = setTimeout(() => {
      encerrarArrasteRef.current();
    }, SEGUNDOS_ATE_DESTRAVAR * 1000);
  }, [pararRelogio]);

  /** `encerrarArraste` é definido logo abaixo; a referência evita a dependência circular. */
  const encerrarArrasteRef = useRef<() => void>(() => {});

  const comecarArraste = useCallback(
    (negocio: NegocioNaTela, etapaOrigem: string) => {
      noArRef.current = { negocio, etapaOrigem };
      setEmArraste({ negocio, etapaOrigem });
      rolagemAutomatica.setActive(true);
      armarRelogio();
    },
    [armarRelogio, rolagemAutomatica],
  );

  /**
   * Fim do gesto, dê no que der.
   *
   * O quadro para de rolar enquanto um card está no ar (`scrollEnabled={!emArraste}`). Se o gesto
   * fosse cancelado — o dedo saindo da tela, o sistema tomando o toque — nada desfazia esse
   * estado, e o funil ficava travado: não rolava mais e não deixava arrastar de novo. Agora todo
   * fim de gesto passa por aqui.
   */
  const encerrarArraste = useCallback(() => {
    pararRelogio();
    noArRef.current = null;
    rolagemAutomatica.setActive(false);
    arrastando.value = 0;
    alvo.value = -1;
    setEtapaAlvo(-1);
    setEmArraste(null);
  }, [alvo, arrastando, pararRelogio, rolagemAutomatica]);

  /**
   * Solta o card na etapa sob o dedo: move na tela primeiro e grava em seguida.
   *
   * Se a gravação falhar, o quadro volta ao que está no banco e a falha aparece — o pior desfecho
   * aqui seria a tela mostrar o card na etapa nova e o CRM continuar com ele na antiga.
   */
  const soltar = useCallback(() => {
    const atual = noArRef.current;
    const etapaDestino = etapas[alvo.value];
    encerrarArraste();

    if (!atual || !etapaDestino || etapaDestino.id === atual.etapaOrigem) return;

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
  }, [alvo, encerrarArraste, etapas, recarregar]);

  const abrirNegocio = useCallback((negocioId: string) => router.push(`/negocio/${negocioId}`), [router]);

  const mudarAlvo = useCallback(
    (indice: number) => {
      setEtapaAlvo(indice);
      armarRelogio();
    },
    [armarRelogio],
  );

  useEffect(() => {
    encerrarArrasteRef.current = encerrarArraste;
  }, [encerrarArraste]);

  // Identidade estável: se esse objeto mudasse a cada desenho, todo card mudaria junto.
  const arraste = useMemo<Arraste>(
    () => ({
      dedoX,
      dedoY,
      arrastando,
      alvo,
      rolagem,
      quadroX,
      totalEtapas,
      comecar: comecarArraste,
      mudarAlvo: mudarAlvo,
      soltar,
      cancelar: encerrarArraste,
      abrir: abrirNegocio,
    }),
    [
      abrirNegocio,
      alvo,
      arrastando,
      comecarArraste,
      dedoX,
      dedoY,
      encerrarArraste,
      mudarAlvo,
      quadroX,
      rolagem,
      soltar,
      totalEtapas,
    ],
  );

  function abrirNovoNegocio(etapaId?: string) {
    setEtapaEscolhida(etapaId ?? etapas[0]?.id ?? null);
    setNomeNegocio('');
    setValorNegocio('');
    setOrigemNegocio(ORIGENS_DE_NEGOCIO[0]);
    setFalhaAoCriar(null);
    setCriando('negocio');
  }

  async function salvarCriacao() {
    setFalhaAoCriar(null);

    try {
      if (criando === 'negocio') {
        if (!nomeNegocio.trim()) {
          setFalhaAoCriar('Escreva o nome do negócio.');
          return;
        }
        if (!etapaEscolhida) {
          setFalhaAoCriar('Escolha a etapa.');
          return;
        }
        setSalvando(true);
        await criarNegocio(funis, {
          nome: nomeNegocio.trim(),
          valor: valorNegocio,
          origem: origemNegocio,
          etapaId: etapaEscolhida,
        });
      }

      if (criando === 'etapa') {
        if (!nomeEtapa.trim()) {
          setFalhaAoCriar('Escreva o nome da etapa.');
          return;
        }
        if (!funil) return;
        setSalvando(true);
        await criarEtapa(funil.id, nomeEtapa.trim());
      }

      if (criando === 'funil') {
        if (!responsavelDoFunil) {
          setFalhaAoCriar('Escolha quem responde por esse funil.');
          return;
        }
        setSalvando(true);
        await criarFunil(responsavelDoFunil);
      }

      setCriando(null);
      setNomeEtapa('');
      setResponsavelDoFunil('');
      recarregar();
    } catch (e) {
      setFalhaAoCriar(e instanceof Error ? e.message : 'Não deu para gravar agora.');
    } finally {
      setSalvando(false);
    }
  }

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

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo={funil?.nome ?? 'Funil'}
        sub={
          carregando
            ? 'Carregando…'
            : `${totalNegocios} negócios abertos · R$ ${valorTotal.toLocaleString('pt-BR')} em jogo`
        }
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} onPress={() => abrirNovoNegocio()} />}
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
          <Chip
            texto="+ Novo funil"
            onPress={() => {
              setResponsavelDoFunil(equipe.dados?.[0]?.nome ?? '');
              setFalhaAoCriar(null);
              setCriando('funil');
            }}
          />
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
                    <CardArrastavel
                      key={negocio.id}
                      negocio={negocio}
                      etapaId={etapa.id}
                      fantasma={emArraste?.negocio.id === negocio.id}
                      arraste={arraste}
                    />
                  ))}

                  {etapa.cards.length === 0 ? (
                    <Text style={{ color: c.textFaint, fontSize: fontSize.sm, paddingVertical: space[3] }}>
                      Nenhum negócio nesta etapa.
                    </Text>
                  ) : null}

                  <Pressable
                    onPress={() => abrirNovoNegocio(etapa.id)}
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
            onPress={() => {
              setNomeEtapa('');
              setFalhaAoCriar(null);
              setCriando('etapa');
            }}
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

      <FolhaDeCriacao
        aberta={criando === 'negocio'}
        titulo="Novo negócio"
        descricao="Entra no funil já na etapa escolhida."
        salvando={salvando}
        erro={falhaAoCriar}
        aoFechar={() => setCriando(null)}
        aoSalvar={salvarCriacao}
        rotuloSalvar="Criar negócio"
      >
        <Campo rotulo="Nome" placeholder="Nome do cliente ou da negociação" valor={nomeNegocio} aoMudar={setNomeNegocio} />
        <Campo rotulo="Valor" placeholder="R$ 2.500" valor={valorNegocio} aoMudar={setValorNegocio} />

        <View style={{ gap: space[2] }}>
          <Secundario>Origem</Secundario>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {ORIGENS_DE_NEGOCIO.map((o) => (
              <Chip key={o} texto={o} ativo={origemNegocio === o} onPress={() => setOrigemNegocio(o)} />
            ))}
          </View>
        </View>

        <View style={{ gap: space[2] }}>
          <Secundario>Etapa</Secundario>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {etapas.map((e) => (
              <Chip key={e.id} texto={e.titulo} ativo={etapaEscolhida === e.id} onPress={() => setEtapaEscolhida(e.id)} />
            ))}
          </View>
        </View>
      </FolhaDeCriacao>

      <FolhaDeCriacao
        aberta={criando === 'etapa'}
        titulo="Nova etapa"
        descricao={funil ? `Entra no fim do ${funil.nome}.` : undefined}
        salvando={salvando}
        erro={falhaAoCriar}
        aoFechar={() => setCriando(null)}
        aoSalvar={salvarCriacao}
        rotuloSalvar="Criar etapa"
      >
        <Campo rotulo="Nome da etapa" placeholder="Proposta enviada" valor={nomeEtapa} aoMudar={setNomeEtapa} />
      </FolhaDeCriacao>

      <FolhaDeCriacao
        aberta={criando === 'funil'}
        titulo="Novo funil"
        descricao="Nasce com as etapas Novo, Qualificado, Proposta e Fechado — as mesmas do CRM."
        salvando={salvando}
        erro={falhaAoCriar}
        aoFechar={() => setCriando(null)}
        aoSalvar={salvarCriacao}
        rotuloSalvar="Criar funil"
      >
        <View style={{ gap: space[2] }}>
          <Secundario>Responsável</Secundario>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {(equipe.dados ?? []).map((m) => (
              <Chip
                key={m.id}
                texto={m.nome}
                ativo={responsavelDoFunil === m.nome}
                onPress={() => setResponsavelDoFunil(m.nome)}
              />
            ))}
          </View>
          {(equipe.dados ?? []).length === 0 ? (
            <Secundario>Nenhuma pessoa na equipe ainda. Convide alguém em Mais → Equipe.</Secundario>
          ) : null}
        </View>
      </FolhaDeCriacao>
    </SafeAreaView>
  );
}
