import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marca } from '@/components/Marca';
import { Botao, Campo, Cartao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Entrada no CRM. Espelha `/login` do web: e-mail, senha, recuperação e link para cadastro. */
export default function LoginScreen() {
  const c = useCores();
  const router = useRouter();

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

            <Campo rotulo="E-mail" placeholder="voce@empresa.com.br" icone="mail-outline" teclado="email-address" />
            <Campo rotulo="Senha" placeholder="Sua senha" icone="lock-closed-outline" seguro />

            <Link href="/esqueci-senha" asChild>
              <Pressable hitSlop={6} style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: c.blue, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  Esqueci minha senha
                </Text>
              </Pressable>
            </Link>

            <Botao titulo="Entrar" bloco onPress={() => router.replace('/(tabs)/inicio')} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>Não possui conta?</Text>
              <Link href="/cadastro" asChild>
                <Pressable hitSlop={6}>
                  <Text style={{ color: c.blue, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>Criar conta</Text>
                </Pressable>
              </Link>
            </View>
          </Cartao>

          <Text style={{ color: c.textFaint, fontSize: fontSize.xs, textAlign: 'center' }}>
            Ao entrar você concorda com a política de privacidade do AZUZ CRM.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
