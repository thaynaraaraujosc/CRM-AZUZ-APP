import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCores, useSombra } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';
import type { ContatoNaTela, ConversaNaTela, NegocioNaTela } from '@/api/adaptar';
import type { Compromisso, Tarefa } from '@/mock/dados';

import { TagOrigem } from './funil';
import { Avatar, Cartao, Selo } from './ui';

/** Compromisso da agenda do dia. */
export function CartaoCompromisso({ compromisso }: { compromisso: Compromisso }) {
  const c = useCores();
  const cor =
    compromisso.status === 'Atrasado' ? c.danger : compromisso.status === 'Confirmado' ? c.success : c.textMuted;

  return (
    <Cartao padding={space[3]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View
          style={{
            width: 52,
            paddingVertical: space[2],
            borderRadius: radius.md,
            backgroundColor: c.gray100,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
            {compromisso.hora}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
            {compromisso.titulo}
          </Text>
          <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
            {compromisso.com} · {compromisso.local}
          </Text>
        </View>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cor }} />
      </View>
    </Cartao>
  );
}

/** Canal do banco é texto livre; um canal novo cai no ícone genérico em vez de quebrar a linha. */
const ICONE_CANAL: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  WhatsApp: 'logo-whatsapp',
  Instagram: 'logo-instagram',
  TikTok: 'musical-notes-outline',
  'E-mail': 'mail-outline',
};

function iconeDoCanal(canal: string) {
  return ICONE_CANAL[canal] ?? 'chatbubble-outline';
}

/**
 * Conversa da caixa de entrada. No web cada conversa é um cartão branco sobre o cinza da lista
 * (`.wa-row`), não uma faixa encostada na outra: sem isso, vinte conversas viram uma coluna
 * contínua e achar onde uma termina depende de ler o texto. A barra de 2px na esquerda é o que
 * marca não lida.
 */
export function LinhaConversa({
  conversa,
  onPress,
  onLongPress,
}: {
  conversa: ConversaNaTela;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const c = useCores();
  const sombra = useSombra();
  const naoLida = conversa.naoLidas > 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: space[3],
        padding: space[3],
        paddingRight: space[4],
        backgroundColor: pressed ? c.surfaceHover : c.surfaceElevated,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        borderLeftWidth: 2,
        borderLeftColor: naoLida ? c.blue : c.line,
        ...sombra('xs'),
      })}
    >
      <View>
        <Avatar iniciais={conversa.iniciais} tamanho={42} />
        <View
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: c.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.line,
          }}
        >
          <Ionicons name={iconeDoCanal(conversa.canal)} size={10} color={c.textMuted} />
        </View>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: naoLida ? c.ink : c.inkNome,
              fontSize: 14,
              fontWeight: fontWeight.bold,
              letterSpacing: -0.1,
            }}
          >
            {conversa.nome}
          </Text>
          <Text style={{ color: naoLida ? c.blue : c.textFaint, fontSize: 10.5 }}>{conversa.tempo}</Text>
        </View>

        <Text
          numberOfLines={1}
          style={{ color: naoLida ? c.ink : c.textMuted, fontSize: fontSize.sm, lineHeight: 18 }}
        >
          {conversa.previa}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 2 }}>
          <TagOrigem origem={conversa.origem} />
          {conversa.responsavel ? (
            <Text numberOfLines={1} style={{ color: c.textFaint, fontSize: 10.5, flex: 1 }}>
              {conversa.responsavel}
            </Text>
          ) : (
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Selo texto="Sem responsável" cor={c.warning} fundo={c.warningSoft} />
            </View>
          )}
          {naoLida ? (
            <View
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 5,
                borderRadius: 10,
                backgroundColor: c.blue,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: fontWeight.bold }}>
                {conversa.naoLidas}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/** Card de tarefa — prazo em vermelho quando atrasada. */
export function CartaoTarefa({ tarefa }: { tarefa: Tarefa }) {
  const c = useCores();

  return (
    <Cartao padding={space[3]} style={{ gap: space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[3] }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: radius.sm,
            borderWidth: 1.5,
            borderColor: c.lineStrong,
            marginTop: 1,
          }}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{tarefa.titulo}</Text>
          <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>{tarefa.contato}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Selo
          icone="calendar-outline"
          texto={tarefa.prazo}
          cor={tarefa.atrasada ? c.danger : c.textMuted}
          fundo={tarefa.atrasada ? c.dangerSoft : c.gray100}
        />
        <View style={{ flex: 1 }} />
        <Avatar iniciais={tarefa.iniciaisResponsavel} tamanho={24} />
      </View>
    </Cartao>
  );
}

/** Contato da lista — o mesmo cartão da conversa, para as duas listas lerem igual. */
export function LinhaContato({ contato, onPress }: { contato: ContatoNaTela; onPress?: () => void }) {
  const c = useCores();
  const sombra = useSombra();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        padding: space[3],
        paddingRight: space[4],
        backgroundColor: pressed ? c.surfaceHover : c.surfaceElevated,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        borderLeftWidth: 2,
        borderLeftColor: contato.favorito ? c.warning : c.line,
        ...sombra('xs'),
      })}
    >
      <Avatar iniciais={contato.iniciais} tamanho={42} />

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
          <Text
            numberOfLines={1}
            style={{ color: c.inkNome, fontSize: 14, fontWeight: fontWeight.bold, letterSpacing: -0.1 }}
          >
            {contato.nome}
          </Text>
          {contato.favorito ? <Ionicons name="star" size={11} color={c.warning} /> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <TagOrigem origem={contato.origem} />
          <Selo texto={contato.etapa} />
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 3 }}>
        <Text style={{ color: c.ink, fontSize: 14, fontWeight: fontWeight.bold }}>{contato.valor}</Text>
        <Text style={{ color: c.textFaint, fontSize: 10.5 }}>{contato.ultima}</Text>
      </View>
    </Pressable>
  );
}
