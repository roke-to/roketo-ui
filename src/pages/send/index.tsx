import React from 'react';
import { generatePath } from 'react-router-dom';

import { TokenFormatter } from 'shared/helpers/formatting';
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

    const currentToken = tokens[token];

    const formatter = TokenFormatter(currentToken.meta.decimals);

    const handleTransferStream = currentToken.api.transfer;
    const commissionOnCreate = currentToken.roketoMeta.commission_on_create;

    await roketo.api.createStream(
      {
        deposit: formatter.toInt(deposit),
        description: comment,
        receiverId: receiver,
        tokenAccountId: token,
        commissionOnCreate,
        tokensPerSec: speed,
        isAutoStart: autoStart,
        callbackUrl: returnPath,
        handleTransferStream,
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
