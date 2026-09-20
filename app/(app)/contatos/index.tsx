import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { contatoNaTela } from '@/api/adaptar';
import { criarContato, useContatos } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { LinhaContato } from '@/components/cards';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { FolhaDeCriacao } from '@/components/FolhaDeCriacao';
import { BarraBusca, BotaoIcone, Cabecalho, Campo, Chip, ListaVazia } from '@/components/ui';
import { filtrosContatos } from '@/mock/dados';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/** Base de contatos do workspace, lendo `/api/contatos`. */
export default function ContatosScreen() {
  const { pode } = usePermissoes();
  if (!pode('contatos')) return <TelaSemPermissao titulo="Contatos" modulo="contatos" voltar={true} />;

  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useContatos(aoPerderSessao);

  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  async function salvar() {
    if (!nome.trim()) {
      setFalha('O nome é obrigatório.');
      return;
    }
    setSalvando(true);
    setFalha(null);
    try {
      await criarContato(nome.trim(), { whatsapp: whatsapp.trim(), email: email.trim() });
      setCriando(false);
      setNome('');
      setWhatsapp('');
      setEmail('');
      recarregar();
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Não foi possível salvar o contato.');
    } finally {
      setSalvando(false);
    }
  }

  const contatos = (dados ?? []).map(contatoNaTela);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Contatos"
        sub={carregando ? 'Carregando…' : `${contatos.length} pessoas nesta visão`}
        voltar
        acao={<BotaoIcone icone="person-add-outline" cor={c.acaoTexto} fundo={c.acao} onPress={() => setCriando(true)} />}
      />

      <View style={{ backgroundColor: c.surface, paddingHorizontal: space[4], paddingTop: space[3], gap: space[3] }}>
        <BarraBusca placeholder="Buscar por nome, e-mail ou telefone" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingBottom: space[3] }}
        >
          {filtrosContatos.map((f, i) => (
            <Chip key={f} texto={f} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && contatos.length === 0 ? (
        <Carregando texto="Buscando seus contatos" />
      ) : (
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LinhaContato contato={item} onPress={() => router.push(`/contatos/${item.id}`)} />
          )}
          contentContainerStyle={{ padding: space[4], gap: 7 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
          ListEmptyComponent={
            <ListaVazia
              icone="people-outline"
              titulo="Nenhum contato ainda"
              descricao="Contato entra sozinho quando um lead chama por um canal conectado ou responde um formulário."
            />
          }
        />
      )}

      <FolhaDeCriacao
        aberta={criando}
        titulo="Novo contato"
        descricao="Ele passa a existir no CRM para todo mundo da equipe."
        salvando={salvando}
        erro={falha}
        aoFechar={() => setCriando(false)}
        aoSalvar={salvar}
        rotuloSalvar="Criar contato"
      >
        <Campo rotulo="Nome" placeholder="Nome completo" valor={nome} aoMudar={setNome} />
        <Campo
          rotulo="WhatsApp"
          placeholder="(00) 00000-0000"
          valor={whatsapp}
          aoMudar={setWhatsapp}
          teclado="phone-pad"
        />
        <Campo
          rotulo="E-mail"
          placeholder="opcional"
          valor={email}
          aoMudar={setEmail}
          teclado="email-address"
        />
      </FolhaDeCriacao>
    </SafeAreaView>
  );
}
