import { Redirect } from 'expo-router';

/** A primeira tela do app é o login — ainda não existe sessão para decidir outra coisa. */
export default function Raiz() {
  return <Redirect href="/login" />;
}
