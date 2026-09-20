import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErroDeSessao } from '@/api/cliente';
import { pedirLinkDeNovaSenha, salvarMeuPerfil, useSessoesAtivas } from '@/api/recursos';
import { useAoPerderSessao, useSessao } from '@/api/sessao';
import { Avatar, Aviso, Botao, Cabecalho, Campo, Cartao, Divisor, LinhaMenu, Secundario, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

/** Perfil de quem está logado: dados pessoais, acesso e sessão. */
export default function PerfilScreen() {
  const c = useCores();
  const router = useRouter();
  const { usuario, sair } = useSessao();
  const aoPerderSessao = useAoPerderSessao();
  const { dados: sessoes } = useSessoesAtivas(aoPerderSessao);

  const workspace = usuario?.workspaceNome ?? '';
  const papel = usuario?.role ?? '';
  const email = usuario?.email ?? '';
  const meuId = usuario?.id;

  const [nome, setNome] = useState(usuario?.name ?? '');
  const [foto, setFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tom: 'ok' | 'erro'; texto: string } | null>(null);

  const iniciais = usuario?.initials ?? (usuario?.name || '?').slice(0, 2).toUpperCase();
  const abertas = sessoes?.length ?? 0;

  async function encerrar() {
    await sair();
    router.replace('/login');
  }

  async function trocarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      setAviso({ tom: 'erro', texto: 'Para trocar a foto, libere o acesso às suas fotos nos ajustes do aparelho.' });
      return;
    }

    const escolha = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      // O CRM guarda a foto como texto dentro do registro, então ela precisa ser pequena.
      quality: 0.4,
      base64: true,
    });
    if (escolha.canceled) return;

    const arquivo = escolha.assets[0];
    if (!arquivo.base64) {
      setAviso({ tom: 'erro', texto: 'Não deu para ler essa imagem. Tente outra.' });
      return;
    }
    setFoto(`data:${arquivo.mimeType ?? 'image/jpeg'};base64,${arquivo.base64}`);
    setAviso({ tom: 'ok', texto: 'Foto escolhida. Toque em "Salvar alterações" para gravar.' });
  }

  async function salvar() {
    if (!meuId) {
      setAviso({ tom: 'erro', texto: 'Entre de novo para editar o seu perfil.' });
      return;
    }
    if (!nome.trim()) {
      setAviso({ tom: 'erro', texto: 'O nome não pode ficar vazio.' });
      return;
    }

    setSalvando(true);
    setAviso(null);
    try {
      await salvarMeuPerfil(meuId, { nome: nome.trim(), ...(foto ? { foto } : {}) });
      setAviso({ tom: 'ok', texto: 'Perfil salvo. O novo nome aparece no CRM no próximo login.' });
    } catch (e) {
      if (e instanceof ErroDeSessao) {
        aoPerderSessao();
        return;
      }
      setAviso({ tom: 'erro', texto: e instanceof Error ? e.message : 'Não deu para salvar agora.' });
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha() {
    if (!email) return;
    setAviso(null);
    try {
      await pedirLinkDeNovaSenha(email);
      setAviso({ tom: 'ok', texto: `Enviamos um link de nova senha para ${email}. Ele vale por uma hora.` });
    } catch (e) {
      setAviso({ tom: 'erro', texto: e instanceof Error ? e.message : 'Não deu para enviar o link agora.' });
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Meu perfil" sub={workspace} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Cartao style={{ alignItems: 'center', gap: space[3] }}>
          {foto ? (
            <Image source={{ uri: foto }} style={{ width: 76, height: 76, borderRadius: 38 }} />
          ) : (
            <Avatar iniciais={iniciais} tamanho={76} />
          )}
          <View style={{ alignItems: 'center', gap: 3 }}>
            <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
              {nome}
            </Text>
            <Secundario>{[papel, workspace].filter(Boolean).join(' · ')}</Secundario>
          </View>
          <Botao titulo="Trocar foto" variante="secundario" icone="camera-outline" onPress={trocarFoto} />
        </Cartao>

        {aviso ? <Aviso tom={aviso.tom === 'ok' ? 'sucesso' : 'erro'} texto={aviso.texto} /> : null}

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Dados pessoais" />
          <Cartao style={{ gap: space[4] }}>
            <Campo rotulo="Nome" valor={nome} aoMudar={setNome} autoCompletar="name" />
            <Campo rotulo="E-mail" valor={email} teclado="email-address" />
            <Campo rotulo="Papel" valor={papel} />
            <Secundario>
              E-mail e papel são definidos por quem administra o workspace, no CRM pelo computador.
            </Secundario>
            <Botao titulo={salvando ? 'Salvando…' : 'Salvar alterações'} bloco onPress={salvar} />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Acesso" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="lock-closed-outline"
              titulo="Alterar senha"
              sub="Enviamos um link para o seu e-mail"
              onPress={trocarSenha}
            />
            <Divisor />
            <LinhaMenu
              icone="phone-portrait-outline"
              titulo="Aparelhos conectados"
              sub={abertas === 1 ? '1 sessão aberta' : `${abertas} sessões abertas`}
              onPress={() => router.push('/configuracoes/seguranca')}
            />
          </Cartao>
        </View>

        <Botao titulo="Sair da conta" variante="perigo" icone="log-out-outline" bloco onPress={encerrar} />
      </ScrollView>
    </SafeAreaView>
  );
}
