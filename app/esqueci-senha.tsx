import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marca } from '@/components/Marca';
import { Botao, Campo, Cartao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Recuperação de senha por e-mail. */
export default function EsqueciSenhaScreen() {
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

            <Campo rotulo="E-mail" placeholder="voce@empresa.com.br" icone="mail-outline" teclado="email-address" />

            <Botao titulo="Enviar link" bloco onPress={() => router.back()} />

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
