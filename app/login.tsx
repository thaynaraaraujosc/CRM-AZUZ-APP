import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessao } from '@/api/sessao';
import { Marca } from '@/components/Marca';
import { Botao, Campo, Cartao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/**
 * Entrada no CRM, contra a API de verdade (`/api/auth`, a mesma do painel web).
 *
 * Não existe cadastro aqui, de propósito. Conta nova e assinatura acontecem só no site: app de
 * loja que abre caminho para vender assinatura digital cai na regra de compra da Apple, que
 * exigiria pagamento pelo sistema dela. O app atende quem já é cliente.
 *
 * Quem já tem sessão válida no aparelho não vê esta tela: o provedor confere ao abrir o app e
 * este efeito manda direto para dentro.
 */
export default function LoginScreen() {
  const c = useCores();
  const router = useRouter();
  const { entrar, estado } = useSessao();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    if (estado === 'dentro') router.replace('/conversas');
  }, [estado, router]);

  async function enviar() {
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setErro(null);
    setEntrando(true);
    const resultado = await entrar(email.trim(), senha);
    setEntrando(false);
    if (!resultado.ok) setErro(resultado.erro ?? 'Não foi possível entrar.');
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
              <Ionicons name="log-in-outline" size={20} color={c.blue} />
            </View>

            <View style={{ gap: space[1] }}>
              <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
                Acesse sua conta
              </Text>
              <Text style={{ color: c.textMuted, fontSize: fontSize.base }}>
                Entre para continuar de onde parou no seu CRM.
              </Text>
            </View>

            <Campo
              rotulo="E-mail"
              placeholder="voce@empresa.com.br"
              icone="mail-outline"
              teclado="email-address"
              valor={email}
              aoMudar={setEmail}
              autoCompletar="email"
            />
            <Campo
              rotulo="Senha"
              placeholder="Sua senha"
              icone="lock-closed-outline"
              seguro
              valor={senha}
              aoMudar={setSenha}
              autoCompletar="current-password"
              aoEnviar={enviar}
            />

            {erro ? (
              <View
                style={{
                  padding: space[3],
                  borderRadius: radius.md,
                  backgroundColor: c.dangerSoft,
                }}
              >
                <Text style={{ color: c.danger, fontSize: fontSize.sm }}>{erro}</Text>
              </View>
            ) : null}

            <Link href="/esqueci-senha" asChild>
              <Pressable hitSlop={6} style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: c.blue, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  Esqueci minha senha
                </Text>
              </Pressable>
            </Link>

            {entrando || estado === 'verificando' ? (
              <View
                style={{
                  height: 44,
                  borderRadius: radius.md,
                  backgroundColor: c.acao,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color={c.acaoTexto} />
              </View>
            ) : (
              <Botao titulo="Entrar" bloco onPress={enviar} />
            )}

            <Text style={{ color: c.textFaint, fontSize: fontSize.sm, textAlign: 'center' }}>
              O aplicativo é para quem já tem conta no AZUZ CRM.
            </Text>
          </Cartao>

          <Text style={{ color: c.textFaint, fontSize: fontSize.xs, textAlign: 'center' }}>
            Ao entrar você concorda com a política de privacidade do AZUZ CRM.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
