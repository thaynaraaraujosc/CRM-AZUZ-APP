import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { convidarMembro, FUNCOES_DE_EQUIPE, useEquipe } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { FolhaDeCriacao } from '@/components/FolhaDeCriacao';
import {
  Avatar,
  BotaoIcone,
  Cabecalho,
  Campo,
  Cartao,
  Chip,
  Indicador,
  ListaVazia,
  Secundario,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

function iniciaisDe(nome: string) {
  return (
    nome
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || '?'
  );
}

/**
 * Quem trabalha no workspace, lendo `/api/equipe`.
 *
 * A API não expõe presença em tempo real, então a tela mostra o que existe de verdade: conta
 * ativa ou convite ainda não aceito. Antes havia "2 online", que era número inventado.
 */
export default function EquipeScreen() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useEquipe(aoPerderSessao);

  const [convidando, setConvidando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState<(typeof FUNCOES_DE_EQUIPE)[number]>(FUNCOES_DE_EQUIPE[0]);
  const [salvando, setSalvando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  async function convidar() {
    if (!nome.trim() || !email.trim()) {
      setFalha('Nome e e-mail são obrigatórios.');
      return;
    }
    setSalvando(true);
    setFalha(null);
    try {
      await convidarMembro({ nome: nome.trim(), email: email.trim(), funcao });
      setConvidando(false);
      setNome('');
      setEmail('');
      recarregar();
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Não foi possível convidar.');
    } finally {
      setSalvando(false);
    }
  }

  const membros = (dados ?? []).map((m) => ({
    id: m.id,
    nome: m.nome,
    email: m.email,
    iniciais: m.initials || iniciaisDe(m.nome),
    cargo: m.cargo ?? '',
    papel: m.role ?? 'Membro',
    ativa: m.ativo !== false,
  }));

  const ativos = membros.filter((m) => m.ativa);
  const pendentes = membros.filter((m) => !m.ativa);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Equipe"
        sub={carregando ? 'Carregando…' : `${membros.length} pessoas · ${ativos.length} com acesso`}
        voltar
        acao={<BotaoIcone icone="person-add-outline" cor={c.acaoTexto} fundo={c.acao} onPress={() => setConvidando(true)} />}
      />

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && membros.length === 0 ? (
        <Carregando texto="Buscando a equipe" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={membros.length} rotulo="Pessoas" />
            <Indicador numero={ativos.length} rotulo="Com acesso" cor={c.success} />
            <Indicador numero={pendentes.length} rotulo="Pendentes" cor={c.warning} />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Membros" contagem={ativos.length} />
            {ativos.length === 0 ? (
              <ListaVazia
                icone="people-outline"
                titulo="Ninguém com acesso ainda"
                descricao="Convide alguém para dividir o atendimento e o funil com você."
              />
            ) : (
              ativos.map((m) => (
                <Cartao key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <Avatar iniciais={m.iniciais} tamanho={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.inkNome, fontSize: 14, fontWeight: fontWeight.bold }}>{m.nome}</Text>
                    <Secundario numberOfLines={1}>{m.cargo || m.email}</Secundario>
                  </View>
                  <Selo
                    texto={m.papel}
                    cor={m.papel.toLowerCase().includes('admin') ? c.blue : c.textMuted}
                    fundo={m.papel.toLowerCase().includes('admin') ? c.blueSoft : c.gray100}
                  />
                </Cartao>
              ))
            )}
          </View>

          {pendentes.length > 0 ? (
            <View style={{ gap: space[3] }}>
              <TituloSecao titulo="Convites pendentes" contagem={pendentes.length} />
              {pendentes.map((m) => (
                <Cartao key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <Avatar iniciais="?" tamanho={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.inkNome, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                      {m.email}
                    </Text>
                    <Secundario>Convite ainda não aceito · papel {m.papel}</Secundario>
                  </View>
                  <Selo texto="Pendente" cor={c.warning} fundo={c.warningSoft} />
                </Cartao>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}

      <FolhaDeCriacao
        aberta={convidando}
        titulo="Convidar para a equipe"
        descricao="A pessoa entra sem acesso até aceitar o convite e criar a senha."
        salvando={salvando}
        erro={falha}
        aoFechar={() => setConvidando(false)}
        aoSalvar={convidar}
        rotuloSalvar="Enviar convite"
      >
        <Campo rotulo="Nome" placeholder="Nome completo" valor={nome} aoMudar={setNome} />
        <Campo rotulo="E-mail" placeholder="email@empresa.com.br" valor={email} aoMudar={setEmail} teclado="email-address" />

        <View style={{ gap: space[2] }}>
          <Secundario>Função</Secundario>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {FUNCOES_DE_EQUIPE.map((f) => (
              <Chip key={f.id} texto={f.nome} ativo={funcao.id === f.id} onPress={() => setFuncao(f)} />
            ))}
          </View>
        </View>
      </FolhaDeCriacao>
    </SafeAreaView>
  );
}
