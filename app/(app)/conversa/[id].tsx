import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { conversaNaTela } from '@/api/adaptar';
import { usePermissoes } from '@/api/permissoes';
import { enviarMensagem, useConversas, useHistoricoDeMensagens } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import type { Mensagem } from '@/api/tipos';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TagOrigem } from '@/components/funil';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Avatar, Chip, ListaVazia, Selo } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const ACOES_RAPIDAS = ['Atribuir ao funil', 'Criar tarefa', 'Marcar como resolvida', 'Resumir com IA'];

/** Conversa aberta: histórico real do CRM e envio pelo mesmo caminho que o painel web usa. */
export default function ConversaScreen() {
  const { pode } = usePermissoes();
  if (!pode('conversas')) return <TelaSemPermissao titulo="Conversa" modulo="conversas" voltar={true} />;

  return <Conversa />;
}

function Conversa() {
  const c = useCores();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const aoPerderSessao = useAoPerderSessao();

  const listaRef = useRef<ScrollView>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  /** Mensagem que acabou de sair, mostrada antes do servidor confirmar no próximo histórico. */
  const [recemEnviadas, setRecemEnviadas] = useState<Mensagem[]>([]);

  const conversas = useConversas(aoPerderSessao);
  const historico = useHistoricoDeMensagens(aoPerderSessao);

  const linha = (conversas.dados ?? []).find((cv) => cv.id === id);
  const conversa = linha ? conversaNaTela(linha) : null;

  const doServidor = conversa ? (historico.dados?.[conversa.nome] ?? []) : [];
  const mensagens = [
    ...doServidor,
    // Só mantém a otimista enquanto o servidor ainda não devolveu aquele texto.
    ...recemEnviadas.filter((m) => !doServidor.some((s) => s.texto === m.texto && s.tipo === 'out')),
  ];

  const carregando = conversas.carregando || historico.carregando;
  const erro = conversas.erro ?? historico.erro;

  useEffect(() => {
    const t = setTimeout(() => listaRef.current?.scrollToEnd({ animated: false }), 80);
    return () => clearTimeout(t);
  }, [mensagens.length]);

  async function enviar() {
    const conteudo = texto.trim();
    if (!conteudo || !conversa || enviando) return;

    setEnviando(true);
    setFalha(null);
    const agora = new Date();
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    try {
      await enviarMensagem(conversa.nome, conteudo);
      setTexto('');
      setRecemEnviadas((antes) => [...antes, { tipo: 'out', texto: conteudo, hora, status: 'enviada' }]);
      // O servidor grava a mensagem; reler o histórico traz a versão dele, com id e status reais.
      historico.recarregar();
    } catch (e) {
      // O texto continua no campo de propósito: é o rascunho da pessoa, e perder isso é pior que
      // mostrar o erro.
      setFalha(e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          paddingHorizontal: space[3],
          paddingVertical: space[3],
          backgroundColor: c.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={c.ink} />
        </Pressable>

        <Pressable
          onPress={() => conversa && router.push(`/contatos/${conversa.id}`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flex: 1 }}
        >
          <Avatar iniciais={conversa?.iniciais ?? '?'} tamanho={38} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
              {conversa?.nome ?? 'Conversa'}
            </Text>
            <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.xs, marginTop: 1 }}>
              {conversa ? `${conversa.canal} · ${conversa.responsavel || 'sem responsável'}` : 'Carregando…'}
            </Text>
          </View>
        </Pressable>

        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={19} color={c.ink} />
        </Pressable>
      </View>

      {conversa ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[2],
            paddingHorizontal: space[4],
            paddingVertical: space[2],
            backgroundColor: c.surfaceRaised2,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: c.line,
          }}
        >
          <TagOrigem origem={conversa.origem} />
          <View style={{ flex: 1 }} />
          <Selo texto={linha?.status ?? ''} />
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        {erro ? (
          <FalhaAoCarregar
            mensagem={erro}
            aoTentar={() => {
              conversas.recarregar();
              historico.recarregar();
            }}
          />
        ) : carregando && mensagens.length === 0 ? (
          <Carregando texto="Buscando a conversa" />
        ) : (
          <ScrollView
            ref={listaRef}
            contentContainerStyle={{ padding: space[4], gap: space[2], flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {mensagens.length === 0 ? (
              <ListaVazia
                icone="chatbubble-outline"
                titulo="Nenhuma mensagem ainda"
                descricao="Escreva abaixo para começar a conversa."
              />
            ) : null}

            {mensagens.map((m, i) => {
              if (m.tipo === 'system') {
                return (
                  <View key={m.id ?? `s${i}`} style={{ alignItems: 'center', paddingVertical: space[2] }}>
                    <View
                      style={{
                        paddingHorizontal: space[3],
                        paddingVertical: 5,
                        borderRadius: radius.pill,
                        backgroundColor: c.gray100,
                      }}
                    >
                      <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>{m.texto}</Text>
                    </View>
                  </View>
                );
              }

              const minha = m.tipo === 'out';
              return (
                <View
                  key={m.id ?? `m${i}`}
                  style={{
                    maxWidth: '82%',
                    alignSelf: minha ? 'flex-end' : 'flex-start',
                    backgroundColor: minha ? c.acao : c.surface,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: minha ? c.acaoBorda : c.line,
                    borderRadius: radius.lg,
                    borderBottomRightRadius: minha ? 4 : radius.lg,
                    borderBottomLeftRadius: minha ? radius.lg : 4,
                    paddingHorizontal: space[3],
                    paddingVertical: space[2],
                    gap: 4,
                  }}
                >
                  <Text style={{ color: minha ? c.acaoTexto : c.ink, fontSize: fontSize.base, lineHeight: 20 }}>
                    {m.texto}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' }}>
                    <Text style={{ color: minha ? 'rgba(255,255,255,0.6)' : c.textFaint, fontSize: 10 }}>
                      {m.hora}
                    </Text>
                    {minha ? <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.75)" /> : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {falha ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[2],
              marginHorizontal: space[4],
              marginBottom: space[2],
              padding: space[3],
              borderRadius: radius.md,
              backgroundColor: c.dangerSoft,
            }}
          >
            <Ionicons name="alert-circle-outline" size={16} color={c.danger} />
            <Text style={{ flex: 1, color: c.danger, fontSize: fontSize.sm }}>{falha}</Text>
            <Pressable onPress={() => setFalha(null)} hitSlop={8}>
              <Ionicons name="close" size={16} color={c.danger} />
            </Pressable>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4], paddingBottom: space[2] }}
        >
          {ACOES_RAPIDAS.map((a) => (
            <Chip key={a} texto={a} />
          ))}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: space[2],
            paddingHorizontal: space[3],
            paddingTop: space[2],
            paddingBottom: space[2],
            backgroundColor: c.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: c.line,
          }}
        >
          <Pressable hitSlop={8} style={{ paddingBottom: 10 }}>
            <Ionicons name="add-circle-outline" size={24} color={c.textMuted} />
          </Pressable>

          <View
            style={{
              flex: 1,
              minHeight: 42,
              maxHeight: 110,
              justifyContent: 'center',
              paddingHorizontal: space[3],
              borderRadius: radius.xl,
              backgroundColor: c.gray100,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.lineSoft,
            }}
          >
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreva uma mensagem"
              placeholderTextColor={c.textFaint}
              multiline
              editable={!enviando}
              style={{ color: c.ink, fontSize: fontSize.base, paddingVertical: space[2] }}
            />
          </View>

          <Pressable
            onPress={enviar}
            disabled={!texto.trim() || enviando || !conversa}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: c.acao,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.acaoBorda,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !texto.trim() || enviando || !conversa ? 0.5 : 1,
            }}
          >
            {enviando ? (
              <ActivityIndicator color={c.acaoTexto} size="small" />
            ) : (
              <Ionicons name="send" size={17} color={c.acaoTexto} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
