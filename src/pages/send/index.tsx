import React from 'react';
import { generatePath } from 'react-router-dom';

import { useRoketoContext } from 'app/roketo-context';
import { CreateStreamForm, CreateStreamFormValues } from 'features/create-stream/CreateStreamForm';

const redirectUrl = generatePath('streams');
const returnPath = `${window.location.origin}/#/${redirectUrl}`;

export function SendPage() {
  const { roketo, tokens } = useRoketoContext();

  const handleClick = async (values: CreateStreamFormValues) => {
    const {
      receiver,
      autoStart,
      comment,
      deposit,
      speed,
      token,
    } = values;

    const { formatter, api, roketoMeta } = tokens[token];

    await roketo.api.createStream({
      deposit: formatter.toYocto(deposit),
      description: comment,
      receiverId: receiver,
      tokenAccountId: token,
      commissionOnCreate: roketoMeta.commission_on_create,
      tokensPerSec: speed,
      isAutoStart: autoStart,
      callbackUrl: returnPath,
      handleTransferStream: api.transfer,
    });
  };

  return (
    <div className="container m-auto px-5 py-12">
      <div className="text-center">
        <h1 className="text-5xl mb-4 text-center">Create a stream</h1>
        <p className="text-gray">Stream your tokens to the receiver directly</p>
      </div>
      <CreateStreamForm onSubmit={handleClick} />
    </div>
  );
}
