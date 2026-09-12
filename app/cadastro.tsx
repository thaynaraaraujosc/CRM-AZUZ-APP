import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marca } from '@/components/Marca';
import { Botao, Campo, Cartao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Criação de conta — mesma sequência de campos do `/cadastro` do web. */
export default function CadastroScreen() {
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
              <Ionicons name="person-add-outline" size={20} color={c.blue} />
            </View>

            <View style={{ gap: space[1] }}>
              <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
                Criar sua conta
              </Text>
              <Text style={{ color: c.textMuted, fontSize: fontSize.base }}>
                Sete dias de teste. Sem cartão para começar.
              </Text>
            </View>

            <Campo rotulo="Nome completo" placeholder="Como você se chama" icone="person-outline" />
            <Campo rotulo="Nome da empresa" placeholder="Sua empresa" icone="business-outline" />
            <Campo rotulo="E-mail" placeholder="voce@empresa.com.br" icone="mail-outline" teclado="email-address" />
            <Campo rotulo="WhatsApp" placeholder="(00) 00000-0000" icone="logo-whatsapp" teclado="phone-pad" />
            <Campo rotulo="Senha" placeholder="Mínimo de 8 caracteres" icone="lock-closed-outline" seguro />

            <Botao titulo="Criar conta" bloco onPress={() => router.replace('/(tabs)/conversas')} />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>Já tem conta?</Text>
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
