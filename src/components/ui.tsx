import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCores, useSombra } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

type IconeNome = ComponentProps<typeof Ionicons>['name'];

/* -------------------------------------------------------------------------- */
/* Estrutura de tela                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Casca de qualquer tela: pinta o chão, respeita notch/gesto e deixa o conteúdo rolar.
 * `rolagem={false}` para telas que gerenciam a própria lista (FlatList, kanban horizontal).
 */
export function Tela({
  children,
  rolagem = true,
  padding = true,
  bordas = ['top'],
}: {
  children: ReactNode;
  rolagem?: boolean;
  padding?: boolean;
  bordas?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  const c = useCores();
  const conteudo = rolagem ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: padding ? space[4] : 0,
        paddingBottom: space[7],
        gap: space[4],
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );

  return (
    <SafeAreaView edges={bordas} style={{ flex: 1, backgroundColor: c.canvas }}>
      {conteudo}
    </SafeAreaView>
  );
}

/**
 * Cabeçalho de tela — equivalente da `Topbar` do CRM web: título, uma linha de contexto e
 * espaço para uma ação à direita. Com `voltar`, mostra a seta de retorno.
 */
export function Cabecalho({
  titulo,
  sub,
  voltar = false,
  acao,
}: {
  titulo: string;
  sub?: string;
  voltar?: boolean;
  acao?: ReactNode;
}) {
  const c = useCores();
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: c.line,
        paddingHorizontal: space[4],
        paddingTop: space[3],
        paddingBottom: space[3],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
      }}
    >
      {voltar ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.gray100,
          }}
        >
          <Ionicons name="chevron-back" size={18} color={c.ink} />
        </Pressable>
      ) : null}

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: c.ink,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            letterSpacing: -0.2,
          }}
        >
          {titulo}
        </Text>
        {sub ? (
          <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
            {sub}
          </Text>
        ) : null}
      </View>

      {acao}
    </View>
  );
}

/** Título de bloco dentro da tela, com contador opcional e link de "ver tudo". */
export function TituloSecao({
  titulo,
  contagem,
  acao,
  onAcao,
}: {
  titulo: string;
  contagem?: number | string;
  acao?: string;
  onAcao?: () => void;
}) {
  const c = useCores();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
      <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>{titulo}</Text>
      {contagem !== undefined ? (
        <View
          style={{
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: radius.pill,
            backgroundColor: c.gray100,
          }}
        >
          <Text style={{ color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
            {contagem}
          </Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }} />
      {acao ? (
        <Pressable onPress={onAcao} hitSlop={8}>
          <Text style={{ color: c.blue, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>{acao}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Superfícies                                                                */
/* -------------------------------------------------------------------------- */

/** Card padrão: superfície branca, borda fina, raio grande. Sombra é discreta de propósito. */
export function Cartao({
  children,
  style,
  onPress,
  padding = space[4],
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
}) {
  const c = useCores();
  const sombra = useSombra();
  const base: ViewStyle = {
    backgroundColor: c.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    // Borda quase transparente: no web o card se separa por SOMBRA, e o traço só dá o corte
    // exato onde a sombra sozinha ficaria vaga.
    borderColor: c.lineSoft,
    padding,
    ...sombra('sm'),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { backgroundColor: c.surfaceHover }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

/** Linha divisória interna de card/lista. */
export function Divisor({ margem = 0 }: { margem?: number }) {
  const c = useCores();
  return (
    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginVertical: margem }} />
  );
}

/* -------------------------------------------------------------------------- */
/* Texto                                                                      */
/* -------------------------------------------------------------------------- */

export function Titulo({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useCores();
  return (
    <Text style={[{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }, style]}>
      {children}
    </Text>
  );
}

export function Corpo({
  children,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const c = useCores();
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: c.ink, fontSize: fontSize.base, lineHeight: 20 }, style]}>
      {children}
    </Text>
  );
}

export function Secundario({
  children,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const c = useCores();
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: c.textMuted, fontSize: fontSize.sm, lineHeight: 18 }, style]}>
      {children}
    </Text>
  );
}

/* -------------------------------------------------------------------------- */
/* Controles                                                                  */
/* -------------------------------------------------------------------------- */

type VarianteBotao = 'primario' | 'secundario' | 'fantasma' | 'perigo';

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  bloco = false,
  style,
}: {
  titulo: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  icone?: IconeNome;
  bloco?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useCores();

  const fundo = {
    primario: c.acao,
    secundario: c.surface,
    fantasma: 'transparent',
    perigo: c.dangerSoft,
  }[variante];

  const tinta = {
    primario: c.acaoTexto,
    secundario: c.ink,
    fantasma: c.ink,
    perigo: c.danger,
  }[variante];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[2],
          paddingHorizontal: space[4],
          height: 44,
          borderRadius: radius.md,
          backgroundColor: fundo,
          borderWidth: variante === 'primario' || variante === 'secundario' ? StyleSheet.hairlineWidth : 0,
          borderColor: variante === 'primario' ? c.acaoBorda : c.lineStrong,
          alignSelf: bloco ? 'stretch' : 'flex-start',
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {icone ? <Ionicons name={icone} size={16} color={tinta} /> : null}
      <Text numberOfLines={1} style={{ color: tinta, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
        {titulo}
      </Text>
    </Pressable>
  );
}

/** Botão só de ícone — usado no canto das barras e dos cards. */
export function BotaoIcone({
  icone,
  onPress,
  cor,
  fundo,
}: {
  icone: IconeNome;
  onPress?: () => void;
  cor?: string;
  fundo?: string;
}) {
  const c = useCores();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fundo ?? c.gray100,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icone} size={17} color={cor ?? c.ink} />
    </Pressable>
  );
}

export function Campo({
  rotulo,
  placeholder,
  valor,
  aoMudar,
  aoEnviar,
  seguro,
  multilinha,
  icone,
  teclado,
  autoCompletar,
}: {
  rotulo?: string;
  placeholder?: string;
  valor?: string;
  /** Com `aoMudar`, o campo é controlado pela tela; sem, ele só exibe `valor` como inicial. */
  aoMudar?: (texto: string) => void;
  aoEnviar?: () => void;
  seguro?: boolean;
  multilinha?: boolean;
  icone?: IconeNome;
  teclado?: ComponentProps<typeof TextInput>['keyboardType'];
  autoCompletar?: ComponentProps<typeof TextInput>['autoComplete'];
}) {
  const c = useCores();
  return (
    <View style={{ gap: space[2] }}>
      {rotulo ? (
        <Text style={{ color: c.textMuted, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>{rotulo}</Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multilinha ? 'flex-start' : 'center',
          gap: space[2],
          paddingHorizontal: space[3],
          minHeight: multilinha ? 96 : 46,
          paddingVertical: multilinha ? space[3] : 0,
          borderRadius: radius.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.lineStrong,
          backgroundColor: c.surface,
        }}
      >
        {icone ? <Ionicons name={icone} size={16} color={c.textFaint} /> : null}
        <TextInput
          {...(aoMudar ? { value: valor, onChangeText: aoMudar } : { defaultValue: valor })}
          placeholder={placeholder}
          placeholderTextColor={c.textFaint}
          secureTextEntry={seguro}
          multiline={multilinha}
          keyboardType={teclado}
          autoComplete={autoCompletar}
          autoCapitalize={teclado === 'email-address' || seguro ? 'none' : 'sentences'}
          onSubmitEditing={aoEnviar}
          returnKeyType={aoEnviar ? 'go' : undefined}
          style={{
            flex: 1,
            color: c.ink,
            fontSize: fontSize.base,
            paddingVertical: multilinha ? 0 : space[3],
            textAlignVertical: multilinha ? 'top' : 'center',
          }}
        />
      </View>
    </View>
  );
}

/** Barra de busca das listas (Contatos, Conversas, Documentos…). */
export function BarraBusca({
  placeholder = 'Buscar',
  valor,
  aoMudar,
}: {
  placeholder?: string;
  valor?: string;
  aoMudar?: (texto: string) => void;
}) {
  const c = useCores();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[2],
        height: 42,
        paddingHorizontal: space[3],
        borderRadius: radius.md,
        backgroundColor: c.gray100,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.lineSoft,
      }}
    >
      <Ionicons name="search" size={16} color={c.textFaint} />
      <TextInput
        {...(aoMudar ? { value: valor, onChangeText: aoMudar } : {})}
        placeholder={placeholder}
        placeholderTextColor={c.textFaint}
        autoCorrect={false}
        style={{ flex: 1, color: c.ink, fontSize: fontSize.base }}
      />
    </View>
  );
}

/** Filtro em pílula — o `fchip` do CRM web. */
export function Chip({
  texto,
  ativo = false,
  onPress,
  cor,
  desabilitado = false,
}: {
  texto: string;
  ativo?: boolean;
  onPress?: () => void;
  cor?: string;
  desabilitado?: boolean;
}) {
  const c = useCores();
  return (
    <Pressable
      onPress={desabilitado ? undefined : onPress}
      disabled={desabilitado}
      style={({ pressed }) => ({
        paddingHorizontal: space[3],
        height: 32,
        justifyContent: 'center',
        borderRadius: radius.md,
        backgroundColor: ativo ? c.acao : pressed ? c.surfaceHover : 'transparent',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ativo ? c.acaoBorda : 'transparent',
        opacity: desabilitado ? 0.45 : 1,
      })}
    >
      <Text
        style={{
          color: ativo ? c.acaoTexto : (cor ?? c.textMuted),
          fontSize: 12,
          fontWeight: fontWeight.bold,
        }}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

/** Linha horizontal de chips com rolagem — padrão de filtro no topo das listas. */
export function FaixaDeChips({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
    >
      {children}
    </ScrollView>
  );
}

/** Etiqueta de estado/categoria — menor que o chip e não clicável. */
export function Selo({
  texto,
  cor,
  fundo,
  icone,
}: {
  texto: string;
  cor?: string;
  fundo?: string;
  icone?: IconeNome;
}) {
  const c = useCores();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: space[3],
        paddingVertical: space[1],
        borderRadius: radius.xl,
        backgroundColor: fundo ?? c.gray100,
      }}
    >
      {icone ? <Ionicons name={icone} size={11} color={cor ?? c.textMuted} /> : null}
      <Text style={{ color: cor ?? c.textMuted, fontSize: 10.5, fontWeight: fontWeight.bold }}>
        {texto}
      </Text>
    </View>
  );
}

/** Iniciais do contato — o CRM web não usa foto na maior parte das listas. */
export function Avatar({
  iniciais,
  tamanho = 40,
  cor,
}: {
  iniciais: string;
  tamanho?: number;
  cor?: string;
}) {
  const c = useCores();
  return (
    <View
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cor ?? c.gray100,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
      }}
    >
      <Text
        style={{
          color: cor ? '#FFFFFF' : c.inkNome,
          fontSize: tamanho * 0.36,
          fontWeight: fontWeight.bold,
        }}
      >
        {iniciais}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Indicadores                                                                */
/* -------------------------------------------------------------------------- */

/** Número grande + rótulo — o `inicio-stat-mini` do web. */
export function Indicador({
  numero,
  rotulo,
  obs,
  cor,
  onPress,
  style,
}: {
  numero: string | number;
  rotulo: string;
  obs?: string;
  cor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useCores();
  return (
    <Cartao onPress={onPress} padding={space[3]} style={[{ flex: 1, minWidth: 0 }, style]}>
      <Text style={{ color: cor ?? c.ink, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, letterSpacing: -0.8 }}>
        {numero}
      </Text>
      <Text style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>{rotulo}</Text>
      {obs ? (
        <Text style={{ color: c.textFaint, fontSize: fontSize.xs, marginTop: 4 }} numberOfLines={2}>
          {obs}
        </Text>
      ) : null}
    </Cartao>
  );
}

export function BarraProgresso({ valor, cor }: { valor: number; cor?: string }) {
  const c = useCores();
  return (
    <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: c.gray100, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, valor))}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: cor ?? c.blue,
        }}
      />
    </View>
  );
}

/**
 * Gráfico de colunas simples, feito só com View — sem biblioteca de chart.
 *
 * A altura de cada barra é calculada em pixels, não em porcentagem: altura percentual dentro de
 * um pai dimensionado por `flex` não resolve no React Native Web, e as barras saíam todas rentes
 * ao eixo.
 */
export function GraficoBarras({
  dados,
  altura = 120,
  cor,
}: {
  dados: { rotulo: string; valor: number; destaque?: boolean }[];
  altura?: number;
  cor?: string;
}) {
  const c = useCores();
  const maximo = Math.max(...dados.map((d) => d.valor), 1);
  const alturaRotulo = 20;
  const areaBarras = Math.max(altura - alturaRotulo, 10);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: altura }}>
      {dados.map((d) => (
        <View key={d.rotulo} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ height: areaBarras, width: '100%', justifyContent: 'flex-end' }}>
            <View
              style={{
                height: Math.max((d.valor / maximo) * areaBarras, 4),
                borderRadius: radius.sm,
                backgroundColor: d.destaque ? (cor ?? c.blue) : c.gray200,
              }}
            />
          </View>
          <Text style={{ color: c.textFaint, fontSize: fontSize.xs, height: alturaRotulo, lineHeight: alturaRotulo }}>
            {d.rotulo}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Estado vazio de lista — o CRM web sempre diz o que fazer, não só "sem dados". */
export function ListaVazia({
  icone = 'file-tray-outline',
  titulo,
  descricao,
}: {
  icone?: IconeNome;
  titulo: string;
  descricao?: string;
}) {
  const c = useCores();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space[7], gap: space[2] }}>
      <Ionicons name={icone} size={30} color={c.textFaint} />
      <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{titulo}</Text>
      {descricao ? (
        <Text style={{ color: c.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 260 }}>
          {descricao}
        </Text>
      ) : null}
    </View>
  );
}

/** Linha de item de lista/menu, com ícone à esquerda e seta à direita. */
export function LinhaMenu({
  icone,
  titulo,
  sub,
  onPress,
  direita,
  corIcone,
}: {
  icone: IconeNome;
  titulo: string;
  sub?: string;
  onPress?: () => void;
  direita?: ReactNode;
  corIcone?: string;
}) {
  const c = useCores();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingVertical: space[3],
        paddingHorizontal: space[4],
        backgroundColor: pressed ? c.surfaceHover : 'transparent',
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.gray100,
        }}
      >
        <Ionicons name={icone} size={17} color={corIcone ?? c.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{titulo}</Text>
        {sub ? (
          <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 1 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {direita ?? <Ionicons name="chevron-forward" size={16} color={c.textFaint} />}
    </Pressable>
  );
}
