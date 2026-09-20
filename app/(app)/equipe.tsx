import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEquipe } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import {
  Avatar,
  BotaoIcone,
  Cabecalho,
  Cartao,
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
        acao={<BotaoIcone icone="person-add-outline" cor={c.acaoTexto} fundo={c.acao} />}
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
    </SafeAreaView>
  );
}
