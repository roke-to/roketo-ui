import {WidgetParams} from '@nearpay/nearpay-sdk/dist/interfaces/widget-parameters';

import {env} from '~/shared/config';

async function hmacSha256(data: string, secret: string) {
  const enc = new TextEncoder();
  const algo = {
    name: 'HMAC',
    hash: 'SHA-256',
  };

  const key = await crypto.subtle.importKey('raw', enc.encode(secret), algo, false, [
    'sign',
    'verify',
  ]);

  const signature = await crypto.subtle.sign(algo.name, key, enc.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));

  const digest = hashArray.reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '');

  return digest;
}

export async function signTopUpParametersLocally(
  parameters: WidgetParams & {
    email?: string;
    sumsub_token?: string;
  },
): Promise<string> {
  const signatureString = Object.keys(parameters)
    .sort()
    // @ts-ignore
    .map((key) => {
      if (key === 'apiKey') {
        return null;
      }
      // @ts-ignore
      return `${key}:${parameters[key]}`;
    })
    .filter((x) => !!x)
    .join('');

  const signature = await hmacSha256(signatureString, env.MUNZEN_SECRET_KEY);

  return signature;
}
