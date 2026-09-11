import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCores } from '@/theme/ThemeContext';
import { corDaOrigem, fontSize, fontWeight, radius, space } from '@/theme/tokens';
import type { Compromisso, Conversa, Contato, ItemDoDia, Negocio, Prioridade, Tarefa } from '@/mock/dados';

import { Avatar, Cartao, Selo } from './ui';

/** Cor da prioridade — verde = oportunidade, âmbar = atenção, vermelho = urgente. */
function usarCorPrioridade(prioridade: Prioridade) {
  const c = useCores();
  if (prioridade === 'urgente') return { tinta: c.danger, fundo: c.dangerSoft, texto: 'Urgente' };
  if (prioridade === 'atencao') return { tinta: c.warning, fundo: c.warningSoft, texto: 'Atenção' };
  return { tinta: c.success, fundo: c.successSoft, texto: 'Oportunidade' };
}

const ICONE_MODULO = {
  conversa: 'chatbubble-ellipses-outline',
  tarefa: 'checkmark-circle-outline',
  lead: 'person-outline',
  automacao: 'flash-outline',
} as const;

/** Pendência da Central do Dia — origem, prioridade e o que precisa ser feito. */
export function CartaoItemDoDia({ item, onPress }: { item: ItemDoDia; onPress?: () => void }) {
  const c = useCores();
  const p = usarCorPrioridade(item.prioridade);

  return (
    <Cartao onPress={onPress} padding={space[3]} style={{ gap: space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: p.tinta }} />
        <Avatar iniciais={item.iniciais} tamanho={38} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
            {item.nome}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <Ionicons name={ICONE_MODULO[item.modulo]} size={12} color={c.textFaint} />
            <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.sm, flex: 1 }}>
              {item.tipo} · {item.quando}
            </Text>
          </View>
        </View>
        <Selo texto={p.texto} cor={p.tinta} fundo={p.fundo} />
      </View>

      <Text numberOfLines={2} style={{ color: c.textMuted, fontSize: fontSize.sm, lineHeight: 18 }}>
        {item.detalhe}
      </Text>
    </Cartao>
  );
}

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

const ICONE_CANAL = {
  WhatsApp: 'logo-whatsapp',
  Instagram: 'logo-instagram',
  TikTok: 'musical-notes-outline',
  'E-mail': 'mail-outline',
} as const;

/** Linha da caixa de entrada — canal, prévia, tempo e contador de não lidas. */
export function LinhaConversa({ conversa, onPress }: { conversa: Conversa; onPress?: () => void }) {
  const c = useCores();
  const naoLida = conversa.naoLidas > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: space[3],
        paddingHorizontal: space[4],
        paddingVertical: space[3],
        backgroundColor: pressed ? c.surfaceHover : c.surface,
      })}
    >
      <View>
        <Avatar iniciais={conversa.iniciais} tamanho={44} />
        <View
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: c.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.line,
          }}
        >
          <Ionicons name={ICONE_CANAL[conversa.canal]} size={10} color={c.textMuted} />
        </View>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <Text
            numberOfLines={1}
            style={{ flex: 1, color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}
          >
            {conversa.nome}
          </Text>
          <Text style={{ color: naoLida ? c.blue : c.textFaint, fontSize: fontSize.xs }}>{conversa.tempo}</Text>
        </View>

        <Text
          numberOfLines={1}
          style={{ color: naoLida ? c.ink : c.textMuted, fontSize: fontSize.sm, lineHeight: 18 }}
        >
          {conversa.previa}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 2 }}>
          <Selo texto={conversa.origem} cor={corDaOrigem[conversa.origem]} fundo={c.gray100} />
          {conversa.responsavel ? (
            <Text numberOfLines={1} style={{ color: c.textFaint, fontSize: fontSize.xs, flex: 1 }}>
              {conversa.responsavel}
            </Text>
          ) : (
            <Selo texto="Sem responsável" cor={c.warning} fundo={c.warningSoft} />
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
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: fontWeight.bold }}>{conversa.naoLidas}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/** Card de negócio no kanban do funil. */
export function CartaoNegocio({ negocio, onPress }: { negocio: Negocio; onPress?: () => void }) {
  const c = useCores();

  return (
    <Cartao onPress={onPress} padding={space[3]} style={{ gap: space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Avatar iniciais={negocio.iniciais} tamanho={30} />
        <Text
          numberOfLines={1}
          style={{ flex: 1, color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}
        >
          {negocio.nome}
        </Text>
      </View>

      <Text style={{ color: c.ink, fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
        {negocio.valor}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space[1] }}>
        <Selo texto={negocio.origem} cor={corDaOrigem[negocio.origem]} fundo={c.gray100} />
        {negocio.etiquetas.map((e) => (
          <Selo key={e} texto={e} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="time-outline" size={12} color={c.textFaint} />
        <Text style={{ color: c.textFaint, fontSize: fontSize.xs, flex: 1 }} numberOfLines={1}>
          {negocio.dias} nesta etapa · {negocio.responsavel || 'sem responsável'}
        </Text>
      </View>
    </Cartao>
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

/** Linha da lista de contatos. */
export function LinhaContato({ contato, onPress }: { contato: Contato; onPress?: () => void }) {
  const c = useCores();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingHorizontal: space[4],
        paddingVertical: space[3],
        backgroundColor: pressed ? c.surfaceHover : c.surface,
      })}
    >
      <Avatar iniciais={contato.iniciais} tamanho={42} />

      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
          <Text numberOfLines={1} style={{ color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
            {contato.nome}
          </Text>
          {contato.favorito ? <Ionicons name="star" size={12} color={c.warning} /> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
          <Selo texto={contato.origem} cor={corDaOrigem[contato.origem]} fundo={c.gray100} />
          <Selo texto={contato.etapa} />
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 3 }}>
        <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{contato.valor}</Text>
        <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>{contato.ultima}</Text>
      </View>
    </Pressable>
  );
}
