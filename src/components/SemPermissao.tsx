import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

/** Mostrado quando o papel da pessoa não inclui o módulo que ela tentou abrir. */
export function SemPermissao({ modulo }: { modulo: string }) {
  const c = useCores();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[5], gap: space[3] }}>
      <Ionicons name="lock-closed-outline" size={28} color={c.textFaint} />
      <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
        Você não tem acesso a {modulo}
      </Text>
      <Text style={{ color: c.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 280 }}>
        O administrador do workspace define quais módulos cada pessoa vê. Peça a ele se precisar
        deste.
      </Text>
    </View>
  );
}
