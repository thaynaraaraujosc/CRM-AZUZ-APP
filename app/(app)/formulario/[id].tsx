import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { useFormulario, useRespostasDeFormularios } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  Cabecalho,
  Cartao,
  Corpo,
  Divisor,
  Indicador,
  ListaVazia,
  Secundario,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

function quando(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Um formulário aberto: as perguntas que ele faz e o que as pessoas responderam. */
export default function FormularioScreen() {
  const { pode } = usePermissoes();
  if (!pode('formularios')) return <TelaSemPermissao titulo="Formulário" modulo="formulários" voltar={true} />;

  return <Formulario />;
}

function Formulario() {
  const c = useCores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const aoPerderSessao = useAoPerderSessao();

  const formulario = useFormulario(id, aoPerderSessao);
  const respostas = useRespostasDeFormularios(aoPerderSessao);

  const dados = formulario.dados;
  const paginas = dados?.paginas ?? [];
  const perguntas = paginas.flatMap((p) => p.perguntas ?? []).filter((p) => !p.oculta);

  /** As respostas vêm com o id da pergunta como chave; aqui viram o rótulo que a pessoa leu. */
  const rotuloDaPergunta = new Map(perguntas.map((p) => [p.id, p.rotulo]));

  const minhas = (respostas.dados ?? [])
    .filter((r) => r.formularioId === id)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  const publicado = dados?.status?.toLowerCase() === 'publicado';
  const carregando = formulario.carregando || respostas.carregando;

  function recarregar() {
    formulario.recarregar();
    respostas.recarregar();
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo={dados?.nome ?? 'Formulário'}
        sub={carregando && !dados ? 'Carregando…' : publicado ? 'Publicado' : 'Rascunho'}
        voltar
      />

      {formulario.erro ? (
        <FalhaAoCarregar mensagem={formulario.erro} aoTentar={recarregar} />
      ) : carregando && !dados ? (
        <Carregando texto="Abrindo o formulário" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={minhas.length} rotulo="Respostas" cor={minhas.length > 0 ? c.success : undefined} />
            <Indicador numero={perguntas.length} rotulo="Perguntas" />
            <Indicador numero={paginas.length} rotulo="Páginas" />
          </View>

          {dados?.descricao ? <Secundario>{dados.descricao}</Secundario> : null}

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Respostas" contagem={minhas.length} />

            {minhas.length === 0 ? (
              <ListaVazia
                icone="chatbox-ellipses-outline"
                titulo="Ninguém respondeu ainda"
                descricao={
                  publicado
                    ? 'Quando alguém preencher o link deste formulário, a resposta aparece aqui.'
                    : 'Este formulário ainda é rascunho — publique no CRM pelo computador para começar a receber.'
                }
              />
            ) : null}

            {minhas.map((resposta) => (
              <Cartao key={resposta.id} style={{ gap: space[3] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                  <Ionicons name="time-outline" size={14} color={c.textMuted} />
                  <Secundario>{quando(resposta.criadoEm)}</Secundario>
                </View>
                <Divisor />
                {Object.entries(resposta.valores).map(([chave, valor]) => (
                  <View key={chave} style={{ gap: 2 }}>
                    <Text style={{ color: c.textMuted, fontSize: fontSize.xs }}>
                      {rotuloDaPergunta.get(chave) ?? chave}
                    </Text>
                    <Corpo>{String(valor) || '—'}</Corpo>
                  </View>
                ))}
              </Cartao>
            ))}
          </View>

          {perguntas.length > 0 ? (
            <View style={{ gap: space[3] }}>
              <TituloSecao titulo="O que ele pergunta" contagem={perguntas.length} />
              <Cartao style={{ gap: space[3] }}>
                {perguntas.map((p, i) => (
                  <View key={p.id} style={{ flexDirection: 'row', gap: space[3] }}>
                    <Text
                      style={{ color: c.textFaint, fontSize: fontSize.sm, fontWeight: fontWeight.bold, width: 16 }}
                    >
                      {i + 1}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Corpo>{p.rotulo}</Corpo>
                      {p.opcoes && p.opcoes.length > 0 ? (
                        <Secundario numberOfLines={2}>{p.opcoes.join(' · ')}</Secundario>
                      ) : null}
                    </View>
                    {p.obrigatoria ? <Selo texto="Obrigatória" /> : null}
                  </View>
                ))}
              </Cartao>
            </View>
          ) : null}

          <Secundario>Mudar as perguntas é feito no CRM pelo computador.</Secundario>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
