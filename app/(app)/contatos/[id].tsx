import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { contatoNaTela } from '@/api/adaptar';
import { usePermissoes } from '@/api/permissoes';
import { useContatos, useConversas, useLinhaDoTempo } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TagOrigem } from '@/components/funil';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Avatar, Cabecalho, Cartao, Corpo, Divisor, ListaVazia, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const ICONE_DO_EVENTO: Record<string, keyof typeof Ionicons.glyphMap> = {
  mensagem: 'chatbubble-ellipses-outline',
  conversa: 'chatbubble-ellipses-outline',
  funil: 'git-branch-outline',
  etapa: 'git-branch-outline',
  formulario: 'document-text-outline',
  tarefa: 'checkbox-outline',
  agenda: 'calendar-outline',
  automacao: 'flash-outline',
};

function quando(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} às ${hora}:${minuto}`;
}

export default function ContatoScreen() {
  const { pode } = usePermissoes();
  if (!pode('contatos')) return <TelaSemPermissao titulo="Contato" modulo="contatos" voltar={true} />;

  return <Contato />;
}

function Contato() {
  const c = useCores();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const aoPerderSessao = useAoPerderSessao();

  // Não existe rota de um contato só: a lista é a fonte, como no painel web.
  const contatos = useContatos(aoPerderSessao);
  const linha = (contatos.dados ?? []).find((ct) => ct.id === id);
  const contato = linha ? contatoNaTela(linha) : null;

  const historico = useLinhaDoTempo(contato?.nome, aoPerderSessao);
  const conversas = useConversas(aoPerderSessao);
  const conversaDoContato = (conversas.dados ?? []).find((cv) => cv.nome === contato?.nome);

  const eventos = historico.dados?.eventos ?? [];

  function Dado({ rotulo, valor, icone }: { rotulo: string; valor: string; icone: keyof typeof Ionicons.glyphMap }) {
    if (!valor) return null;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] }}>
        <Ionicons name={icone} size={16} color={c.textFaint} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>{rotulo}</Text>
          <Text style={{ color: c.ink, fontSize: fontSize.base, marginTop: 1 }}>{valor}</Text>
        </View>
      </View>
    );
  }

  function AcaoRedonda({
    icone,
    rotulo,
    onPress,
  }: {
    icone: keyof typeof Ionicons.glyphMap;
    rotulo: string;
    onPress?: () => void;
  }) {
    return (
      <Pressable onPress={onPress} disabled={!onPress} style={{ alignItems: 'center', gap: 6, flex: 1, opacity: onPress ? 1 : 0.4 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: c.gray100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icone} size={19} color={c.ink} />
        </View>
        <Text style={{ color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>{rotulo}</Text>
      </Pressable>
    );
  }

  if (contatos.erro) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
        <Cabecalho titulo="Contato" voltar />
        <FalhaAoCarregar mensagem={contatos.erro} aoTentar={contatos.recarregar} />
      </SafeAreaView>
    );
  }

  if (!contato) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
        <Cabecalho titulo="Contato" voltar />
        {contatos.carregando ? (
          <Carregando texto="Buscando o contato" />
        ) : (
          <ListaVazia
            icone="person-outline"
            titulo="Contato não encontrado"
            descricao="Ele pode ter sido removido do CRM."
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo={contato.nome} sub={contato.cidade} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        <Cartao style={{ alignItems: 'center', gap: space[3] }}>
          <Avatar iniciais={contato.iniciais} tamanho={72} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
              {contato.nome}
            </Text>
            <Secundario>{contato.responsavel ? `Responsável: ${contato.responsavel}` : 'Sem responsável'}</Secundario>
          </View>

          <View style={{ flexDirection: 'row', gap: space[1], flexWrap: 'wrap', justifyContent: 'center' }}>
            <TagOrigem origem={contato.origem} />
            {contato.etapa ? <Selo texto={contato.etapa} /> : null}
            {contato.etiquetas.map((e) => (
              <Selo key={e} texto={e} cor={c.blue} fundo={c.blueSoft} />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: space[2], alignSelf: 'stretch', marginTop: space[2] }}>
            <AcaoRedonda
              icone="chatbubble-outline"
              rotulo="Conversar"
              onPress={conversaDoContato ? () => router.push(`/conversa/${conversaDoContato.id}`) : undefined}
            />
            <AcaoRedonda icone="calendar-outline" rotulo="Agenda" onPress={() => router.push('/agenda')} />
            <AcaoRedonda icone="people-outline" rotulo="Contatos" onPress={() => router.push('/contatos')} />
          </View>
        </Cartao>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Negócio" />
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>{contato.etapa || 'Sem etapa'}</Corpo>
              <Secundario style={{ marginTop: 2 }}>
                {contato.ultima ? `Última interação ${contato.ultima.toLowerCase()}` : 'Sem interação registrada'}
              </Secundario>
            </View>
            <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>{contato.valor}</Text>
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Dados" />
          <Cartao padding={space[4]} style={{ paddingVertical: 0 }}>
            <Dado rotulo="E-mail" valor={contato.email} icone="mail-outline" />
            <Divisor />
            <Dado rotulo="WhatsApp" valor={contato.whatsapp} icone="logo-whatsapp" />
            <Divisor />
            <Dado rotulo="Cidade" valor={contato.cidade} icone="location-outline" />
            <Divisor />
            <Dado rotulo="Origem" valor={contato.origem} icone="megaphone-outline" />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Histórico" contagem={eventos.length} />
          <Cartao style={{ gap: space[4] }}>
            {historico.carregando && eventos.length === 0 ? (
              <Carregando texto="Buscando o histórico" />
            ) : eventos.length === 0 ? (
              <ListaVazia
                icone="time-outline"
                titulo="Sem histórico ainda"
                descricao="Mensagens, mudanças de etapa e formulários deste contato aparecem aqui."
              />
            ) : (
              eventos.map((evento, i) => (
                <View key={evento.id} style={{ flexDirection: 'row', gap: space[3] }}>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: c.gray100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={ICONE_DO_EVENTO[evento.tipo] ?? 'ellipse-outline'}
                        size={14}
                        color={c.textMuted}
                      />
                    </View>
                    {i < eventos.length - 1 ? (
                      <View style={{ width: 1, flex: 1, backgroundColor: c.line, marginTop: 4 }} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: space[2] }}>
                    <Corpo>{evento.descricao}</Corpo>
                    <Secundario style={{ marginTop: 2 }}>
                      {[quando(evento.criadoEm), evento.canal].filter(Boolean).join(' · ')}
                    </Secundario>
                  </View>
                </View>
              ))
            )}
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
