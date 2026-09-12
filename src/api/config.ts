/**
 * Endereço do CRM que o app consome.
 *
 * A API é exatamente a mesma que o painel web usa — nenhuma rota foi criada para o aplicativo.
 * Trocar de ambiente é só definir `EXPO_PUBLIC_API_URL` (por exemplo, `http://192.168.0.10:3000`
 * apontando para o `next dev` da sua máquina). Precisa ser o IP da rede, não `localhost`: no
 * celular, `localhost` é o próprio aparelho.
 */
export const URL_DA_API = process.env.EXPO_PUBLIC_API_URL ?? 'https://azuzcrm.com.br';
