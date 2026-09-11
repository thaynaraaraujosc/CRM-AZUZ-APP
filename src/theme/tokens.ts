/**
 * Tokens do design system do AZUZ CRM, transpostos do `globals.css` do CRM web.
 *
 * Regra da marca, mantida aqui: base preto/branco/cinza, azul-marinho `#0B1533` como tinta
 * estrutural e cor de ação, azul `#2E6BFF` como accent. Nada de cor quente, glow, neon ou
 * gradiente pesado — peso vem de proporção, tipografia e espaçamento.
 */

export type Paleta = {
  /** Chão da tela — atrás de todo painel. */
  canvas: string;
  /** Superfície padrão (card, painel, barra). */
  surface: string;
  surfaceRaised: string;
  surfaceRaised2: string;
  surfaceElevated: string;

  blue: string;
  blueSoft: string;
  blueStrong: string;

  /** Cor da ação principal (botão salvar, chip ligado, item selecionado). */
  acao: string;
  acaoTexto: string;
  /**
   * Contorno das superfícies de ação. No tema claro o marinho já se separa do fundo sozinho e
   * o valor é transparente; no escuro a luminosidade é parecida com a do fundo e é a borda que
   * recorta a peça — o tom da marca continua sendo um só nos dois temas.
   */
  acaoBorda: string;

  line: string;
  lineSoft: string;
  lineStrong: string;

  ink: string;
  inkNome: string;
  textMuted: string;
  textFaint: string;

  surfaceHover: string;
  surfaceActive: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  ia: string;
  iaSoft: string;

  gray100: string;
  gray200: string;
  gray300: string;
};

export const paletaClara: Paleta = {
  canvas: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceRaised: '#F5F6F8',
  surfaceRaised2: '#ECEEF2',
  surfaceElevated: '#FFFFFF',

  blue: '#2E6BFF',
  blueSoft: 'rgba(46, 107, 255, 0.14)',
  blueStrong: '#1D4FD1',

  acao: '#0B1533',
  acaoTexto: '#FFFFFF',
  acaoBorda: 'transparent',

  line: 'rgba(11, 21, 51, 0.10)',
  lineSoft: 'rgba(11, 21, 51, 0.06)',
  lineStrong: 'rgba(11, 21, 51, 0.18)',

  ink: '#0B1533',
  inkNome: '#253052',
  textMuted: 'rgba(11, 21, 51, 0.64)',
  textFaint: 'rgba(11, 21, 51, 0.54)',

  surfaceHover: 'rgba(11, 21, 51, 0.035)',
  surfaceActive: 'rgba(11, 21, 51, 0.06)',

  success: '#0A7A4D',
  successSoft: 'rgba(15, 157, 99, 0.12)',
  warning: '#8A6600',
  warningSoft: 'rgba(216, 164, 0, 0.14)',
  danger: '#C2352F',
  dangerSoft: 'rgba(214, 69, 69, 0.12)',
  info: '#2E6BFF',
  infoSoft: 'rgba(46, 107, 255, 0.10)',
  ia: '#8A3FFC',
  iaSoft: 'rgba(138, 63, 252, 0.12)',

  gray100: 'rgba(11, 21, 51, 0.04)',
  gray200: 'rgba(11, 21, 51, 0.07)',
  gray300: 'rgba(11, 21, 51, 0.11)',
};

export const paletaEscura: Paleta = {
  canvas: '#08080A',
  surface: '#17171A',
  surfaceRaised: '#121214',
  surfaceRaised2: '#202024',
  surfaceElevated: '#1E1E22',

  blue: '#5B8CFF',
  blueSoft: 'rgba(91, 140, 255, 0.18)',
  blueStrong: '#7BA4FF',

  acao: '#0B1533',
  acaoTexto: '#FFFFFF',
  acaoBorda: 'rgba(255, 255, 255, 0.16)',

  line: 'rgba(255, 255, 255, 0.10)',
  lineSoft: 'rgba(255, 255, 255, 0.06)',
  lineStrong: 'rgba(255, 255, 255, 0.18)',

  ink: '#FAFAFA',
  inkNome: '#E6E6EA',
  textMuted: 'rgba(250, 250, 250, 0.70)',
  textFaint: 'rgba(250, 250, 250, 0.56)',

  surfaceHover: 'rgba(250, 250, 250, 0.05)',
  surfaceActive: 'rgba(250, 250, 250, 0.09)',

  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  warning: '#E3B341',
  warningSoft: 'rgba(227, 179, 65, 0.16)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.16)',
  info: '#5B8CFF',
  infoSoft: 'rgba(91, 140, 255, 0.14)',
  ia: '#A97BFF',
  iaSoft: 'rgba(169, 123, 255, 0.16)',

  gray100: 'rgba(250, 250, 250, 0.05)',
  gray200: 'rgba(250, 250, 250, 0.08)',
  gray300: 'rgba(250, 250, 250, 0.12)',
};

/** Escala de raio: sm = etiqueta · md = input/botão · lg = card · xl = modal/painel. */
export const radius = {
  sm: 8,
  md: 11,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 28,
  7: 36,
} as const;

/** Tamanhos de texto — hierarquia vem de tamanho + peso + espaçamento juntos. */
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 32,
} as const;

/** Dois pesos reais, como no web: regular e bold. */
export const fontWeight = {
  regular: '400',
  bold: '700',
} as const;

/** Cor de cada origem de lead — mesma nomenclatura do CRM web. */
export const corDaOrigem: Record<string, string> = {
  'Meta Ads': '#2E6BFF',
  'Google Ads': '#0A7A4D',
  Instagram: '#8A3FFC',
  TikTok: '#253052',
  'Indicação': '#8A6600',
  'Formulário': '#0F766E',
};
