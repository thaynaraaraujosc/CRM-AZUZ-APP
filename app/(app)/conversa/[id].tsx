import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
import { criarNegocio, enviarMensagem, mudarConversa, useConversas, useFunis, useHistoricoDeMensagens } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import type { Mensagem } from '@/api/tipos';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TagOrigem } from '@/components/funil';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Avatar, Aviso, Chip, Divisor, LinhaMenu, ListaVazia, Selo } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';



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
  const funis = useFunis(aoPerderSessao);

  /** Ações do rodapé e do menu de três pontos. */
  const [menuAberto, setMenuAberto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

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

  // Abrir a conversa é ler a conversa: o contador de não lidas zera no CRM, como no web.
  const naoLidas = linha?.naoLidas ?? 0;
  useEffect(() => {
    if (!id || naoLidas === 0) return;
    mudarConversa(id, { naoLidas: 0 })
      .then(() => conversas.recarregar())
      .catch(() => {
        // Não vale interromper a leitura por causa do contador.
      });
    // Só quando a conversa abre com mensagem nova.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, naoLidas > 0]);

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

  async function mudarStatus(status: string) {
    if (!id) return;
    setMenuAberto(false);
    setOcupado(status);
    try {
      await mudarConversa(id, { status });
      conversas.recarregar();
      setAviso(`Conversa marcada como "${status}".`);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não deu para mudar o status.');
    } finally {
      setOcupado(null);
    }
  }

  async function alternarFavorita() {
    if (!id || !linha) return;
    setMenuAberto(false);
    try {
      await mudarConversa(id, { favorita: !linha.favorita });
      conversas.recarregar();
      setAviso(linha.favorita ? 'Saiu dos favoritos.' : 'Conversa favoritada.');
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não deu para favoritar.');
    }
  }

  async function arquivar() {
    if (!id || !linha) return;
    setMenuAberto(false);
    try {
      await mudarConversa(id, { arquivada: !linha.arquivada });
      conversas.recarregar();
      setAviso(linha.arquivada ? 'Conversa de volta à lista.' : 'Conversa arquivada.');
      if (!linha.arquivada) router.back();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não deu para arquivar.');
    }
  }

  /** Põe o contato no funil: um negócio novo na primeira etapa do primeiro funil. */
  async function levarParaOFunil() {
    if (!conversa) return;
    const lista = funis.dados ?? [];
    const primeiro = lista[0];
    const etapa = primeiro?.colunas[0];
    if (!primeiro || !etapa) {
      setAviso('Nenhum funil com etapa ainda. Crie um funil primeiro.');
      return;
    }

    setMenuAberto(false);
    setOcupado('funil');
    try {
      await criarNegocio(lista, { nome: conversa.nome, origem: conversa.origem, etapaId: etapa.id });
      funis.recarregar();
      setAviso(`${conversa.nome} entrou no ${primeiro.nome}, na etapa ${etapa.titulo}.`);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não deu para criar o negócio.');
    } finally {
      setOcupado(null);
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

        <Pressable hitSlop={8} onPress={() => setMenuAberto(true)}>
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
          <Chip
            texto={ocupado === 'funil' ? 'Levando ao funil…' : 'Levar para o funil'}
            onPress={levarParaOFunil}
            desabilitado={ocupado !== null}
          />
          <Chip
            texto={ocupado === 'Finalizado' ? 'Finalizando…' : 'Finalizar conversa'}
            onPress={() => mudarStatus('Finalizado')}
            desabilitado={ocupado !== null}
          />
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

      {aviso ? (
        <View style={{ position: 'absolute', left: space[4], right: space[4], bottom: 86 }}>
          <Pressable onPress={() => setAviso(null)}>
            <Aviso texto={aviso} />
          </Pressable>
        </View>
      ) : null}

      {/* Menu de três pontos: o que dá para fazer com a conversa inteira. */}
      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <Pressable
          onPress={() => setMenuAberto(false)}
          style={{ flex: 1, backgroundColor: 'rgba(11, 21, 51, 0.35)', justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: c.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingVertical: space[3],
              paddingBottom: space[6],
            }}
          >
            <LinhaMenu
              icone={linha?.favorita ? 'star' : 'star-outline'}
              titulo={linha?.favorita ? 'Tirar dos favoritos' : 'Favoritar'}
              onPress={alternarFavorita}
            />
            <Divisor />
            <LinhaMenu icone="swap-horizontal-outline" titulo="Marcar como em conversa" onPress={() => mudarStatus('Em conversa')} />
            <Divisor />
            <LinhaMenu
              icone="hourglass-outline"
              titulo="Marcar como aguardando cliente"
              onPress={() => mudarStatus('Aguardando cliente')}
            />
            <Divisor />
            <LinhaMenu
              icone={linha?.arquivada ? 'arrow-undo-outline' : 'archive-outline'}
              titulo={linha?.arquivada ? 'Desarquivar' : 'Arquivar conversa'}
              onPress={arquivar}
            />
            <Divisor />
            <LinhaMenu
              icone="person-outline"
              titulo="Abrir ficha do contato"
              onPress={() => {
                setMenuAberto(false);
                if (conversa) router.push(`/contatos/${conversa.id}`);
              }}
            />
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}
