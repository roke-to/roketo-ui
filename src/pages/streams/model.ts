import {generatePath} from 'react-router-dom';
import {attach} from 'effector';
import {$roketoWallet} from 'services/wallet';
import type {FormValues} from 'features/create-stream/CreateStream';
import {ROUTES_MAP} from 'shared/helpers/routing';

const redirectUrl = generatePath(ROUTES_MAP.streams.path);
const returnPath = `${window.location.origin}/#${redirectUrl}`;

export const handleCreateStreamFx = attach({
  source: $roketoWallet,
  async effect(wallet, values: FormValues) {
    if (!wallet) throw Error('no roketo wallet exists');
    const {roketo, tokens} = wallet;
    const {receiver, autoStart, comment, deposit, speed, token} = values;

    const {formatter, api, roketoMeta} = tokens[token];

    await roketo.api.createStream({
      deposit: formatter.toYocto(deposit),
      comment,
      receiverId: receiver,
      tokenAccountId: token,
      commissionOnCreate: roketoMeta.commission_on_create,
      tokensPerSec: speed,
      isAutoStart: autoStart,
      callbackUrl: returnPath,
      handleTransferStream: api.transfer,
    });
  },
});
