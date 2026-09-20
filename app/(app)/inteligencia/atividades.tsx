import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { atividadePorPessoa } from '@/api/metricas';
import { usePermissoes } from '@/api/permissoes';
import { useAgenda, useConversas, useTarefas } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  Avatar,
  BarraProgresso,
  Cabecalho,
  Cartao,
  Corpo,
  Indicador,
  ListaVazia,
  Secundario,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

function iniciaisDe(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/** Esforço comercial por pessoa — quantidade de trabalho, não resultado. */
export default function AtividadesScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Atividades" modulo="relatórios" voltar={true} />;

  return <Atividades />;
}

function Atividades() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();

  const tarefas = useTarefas(aoPerderSessao);
  const agenda = useAgenda(aoPerderSessao);
  const conversas = useConversas(aoPerderSessao);

  const colunas = tarefas.dados ?? [];
  const compromissos = agenda.dados ?? [];
  const pessoas = atividadePorPessoa(colunas, compromissos);

  const todasAsTarefas = colunas.flatMap((co) => co.cards);
  const concluidas = todasAsTarefas.filter((t) => t.concluida).length;
  const atrasadas = todasAsTarefas.filter((t) => t.atrasada && !t.concluida).length;
  const maior = Math.max(1, ...pessoas.map((p) => p.tarefas + p.compromissos));

  const carregando = tarefas.carregando || agenda.carregando;

  function recarregar() {
    tarefas.recarregar();
    agenda.recarregar();
    conversas.recarregar();
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Atividades de vendas" sub="Tudo que está em aberto agora" voltar />

      {tarefas.erro ? (
        <FalhaAoCarregar mensagem={tarefas.erro} aoTentar={recarregar} />
      ) : carregando && !tarefas.dados ? (
        <Carregando texto="Somando o trabalho da equipe" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={todasAsTarefas.length} rotulo="Tarefas" />
            <Indicador numero={compromissos.length} rotulo="Compromissos" />
            <Indicador numero={(conversas.dados ?? []).length} rotulo="Conversas" cor={c.blue} />
          </View>

          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={concluidas} rotulo="Tarefas concluídas" cor={c.success} />
            <Indicador numero={atrasadas} rotulo="Tarefas atrasadas" cor={atrasadas > 0 ? c.danger : undefined} />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Por pessoa" contagem={pessoas.length} />
            {pessoas.length === 0 ? (
              <ListaVazia
                icone="pulse-outline"
                titulo="Nada atribuído ainda"
                descricao="Quando as tarefas e os compromissos tiverem responsável, o esforço de cada pessoa aparece aqui."
              />
            ) : null}
            {pessoas.map((p) => (
              <Cartao key={p.nome} style={{ gap: space[3] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <Avatar iniciais={iniciaisDe(p.nome)} tamanho={36} />
                  <View style={{ flex: 1 }}>
                    <Corpo style={{ fontWeight: fontWeight.bold }}>{p.nome}</Corpo>
                    <Secundario>
                      {`${p.tarefas} tarefa(s) · ${p.concluidas} concluída(s) · ${p.compromissos} compromisso(s)`}
                    </Secundario>
                  </View>
                  <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                    {p.tarefas + p.compromissos}
                  </Text>
                </View>
                <BarraProgresso valor={Math.round(((p.tarefas + p.compromissos) / maior) * 100)} />
              </Cartao>
            ))}
          </View>

          <Secundario>
            O CRM conta o trabalho registrado: tarefa criada e compromisso marcado. Ligação feita
            fora do CRM não entra porque não há como saber.
          </Secundario>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
