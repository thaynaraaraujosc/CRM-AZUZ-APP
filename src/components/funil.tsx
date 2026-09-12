import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { NegocioNaTela } from '@/api/adaptar';
import { useCorDaOrigem, useCores, useSombra } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Largura de cada coluna do quadro e a folga entre elas — o cálculo do alvo do arraste usa isto. */
export const LARGURA_COLUNA = 268;
export const FOLGA_COLUNA = space[3];
export const MARGEM_QUADRO = space[4];

/**
 * Etiqueta de origem no formato do CRM web (`.tag` + `.origem-*`): caixa alta, corpo pequeno,
 * espaçada, e a cor da própria plataforma na letra — sem pílula atrás. É metadado, o degrau mais
 * discreto do card.
 */
export function TagOrigem({ origem }: { origem: string }) {
  const corOrigem = useCorDaOrigem();
  return (
    <Text
      style={{
        color: corOrigem(origem),
        fontSize: 10,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}
    >
      {origem}
    </Text>
  );
}

/**
 * Card de negócio, nas medidas do `.lead-card` do web: branco sobre a coluna cinza, borda fina,
 * sombra mínima. É a diferença de superfície que separa card de coluna, não uma moldura pesada.
 *
 * `fantasma` é o buraco que fica no lugar do card enquanto ele está sendo arrastado; `flutuante`
 * é a cópia que segue o dedo.
 */
export function CardNegocio({
  negocio,
  fantasma = false,
  flutuante = false,
}: {
  negocio: NegocioNaTela;
  fantasma?: boolean;
  flutuante?: boolean;
}) {
  const c = useCores();
  const sombra = useSombra();

  return (
    <View
      style={{
        backgroundColor: c.surfaceElevated,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: flutuante ? c.blue : c.line,
        padding: space[4],
        gap: 6,
        opacity: fantasma ? 0.32 : 1,
        ...sombra(flutuante ? 'lg' : 'xs'),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: c.inkNome,
            fontSize: 14,
            fontWeight: fontWeight.bold,
            letterSpacing: -0.1,
          }}
        >
          {negocio.nome}
        </Text>
        <Text style={{ color: c.ink, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
          {negocio.valor}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <TagOrigem origem={negocio.origem} />
        <View style={{ flex: 1 }} />
        <Text style={{ color: c.textFaint, fontSize: 10 }}>{negocio.dias}</Text>
      </View>

      {negocio.etiquetas.length > 0 || negocio.responsavel ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1], flexWrap: 'wrap' }}>
          {negocio.etiquetas.map((e) => (
            <View
              key={e}
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: radius.sm,
                backgroundColor: c.blueSoft,
              }}
            >
              <Text style={{ color: c.blue, fontSize: 10, fontWeight: fontWeight.bold }}>{e}</Text>
            </View>
          ))}
          {negocio.responsavel ? (
            <Text numberOfLines={1} style={{ color: c.textFaint, fontSize: 10, flexShrink: 1 }}>
              {negocio.responsavel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Cabeçalho da coluna, igual ao `.kcol-h` do web: bolinha azul, título e a contagem numa pílula
 * cinza. A bolinha é sempre azul — ela marca a etapa, não classifica.
 */
export function CabecalhoEtapa({
  titulo,
  quantidade,
  soma,
  alvo,
}: {
  titulo: string;
  quantidade: number;
  soma: string;
  alvo: boolean;
}) {
  const c = useCores();

  return (
    <View style={{ gap: 4, paddingHorizontal: space[1] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.blue }} />
        <Text style={{ flex: 1, color: c.ink, fontSize: 13, fontWeight: fontWeight.bold, letterSpacing: -0.15 }}>
          {titulo}
        </Text>
        <View
          style={{
            paddingHorizontal: space[2],
            paddingVertical: 2,
            borderRadius: radius.pill,
            backgroundColor: alvo ? c.blue : c.gray200,
          }}
        >
          <Text
            style={{
              color: alvo ? '#FFFFFF' : c.textMuted,
              fontSize: 10.5,
              fontWeight: fontWeight.bold,
            }}
          >
            {quantidade}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={15} color={c.textFaint} />
      </View>
      <Text style={{ color: c.textFaint, fontSize: 10.5 }}>{soma}</Text>
    </View>
  );
}
