import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pedirLinkDeNovaSenha } from '@/api/recursos';
import { Marca } from '@/components/Marca';
import { Aviso, Botao, Campo, Cartao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Recuperação de senha por e-mail. */
export default function EsqueciSenhaScreen() {
  const c = useCores();

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<{ tom: 'sucesso' | 'erro'; texto: string } | null>(null);

  async function enviar() {
    if (!email.trim()) {
      setAviso({ tom: 'erro', texto: 'Escreva o e-mail da sua conta.' });
      return;
    }

    setEnviando(true);
    setAviso(null);
    try {
      const resposta = await pedirLinkDeNovaSenha(email.trim());
      setAviso({
        tom: 'sucesso',
        texto:
          resposta?.mensagem ??
          'Se esse e-mail tiver conta no CRM AZUZ, o link de nova senha já está a caminho.',
      });
    } catch (e) {
      setAviso({ tom: 'erro', texto: e instanceof Error ? e.message : 'Não deu para enviar agora.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.canvas }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space[5], gap: space[5] }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center' }}>
            <Marca />
          </View>

          <Cartao padding={space[5]} style={{ gap: space[4] }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: radius.md,
                backgroundColor: c.blueSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="key-outline" size={20} color={c.blue} />
            </View>

            <View style={{ gap: space[1] }}>
              <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
                Recuperar acesso
              </Text>
              <Text style={{ color: c.textMuted, fontSize: fontSize.base }}>
                Informe o e-mail da conta e enviaremos um link para criar uma senha nova.
              </Text>
            </View>

            <Campo
              rotulo="E-mail"
              placeholder="voce@empresa.com.br"
              icone="mail-outline"
              teclado="email-address"
              valor={email}
              aoMudar={setEmail}
              aoEnviar={enviar}
              autoCompletar="email"
            />

            {aviso ? <Aviso tom={aviso.tom} texto={aviso.texto} /> : null}

            <Botao titulo={enviando ? 'Enviando…' : 'Enviar link'} bloco onPress={enviar} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>Lembrou a senha?</Text>
              <Link href="/login" asChild>
                <Pressable hitSlop={6}>
                  <Text style={{ color: c.blue, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>Entrar</Text>
                </Pressable>
              </Link>
            </View>
          </Cartao>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
