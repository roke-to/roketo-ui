import React from 'react';
import { generatePath } from 'react-router-dom';

import { TokenFormatter } from 'shared/helpers/formatting';
import { useRoketoContext } from 'app/roketo-context';
import { CreateStreamForm } from 'features/create-stream/CreateStreamForm';

const redirectUrl = generatePath('streams');
const returnPath = `${window.location.origin}/#/${redirectUrl}`;

export function SendPage() {
  const { roketo, tokens } = useRoketoContext();
  const createStreamClick = async (values: any) => {
    const {
      receiver,
      autoDeposit,
      autoStart,
      comment,
      deposit,
      speed,
      token
    } = values;

    console.log('values', values)

    const formatter = TokenFormatter(tokens.get(token).metadata.decimals);

    await roketo.api.createStream(
      {
        deposit: formatter.toInt(deposit),
        description: comment,
        receiverId: receiver,
        token,
        speed: String(speed),
        autoDepositEnabled: autoDeposit,
        isAutoStartEnabled: autoStart,
      },
      {
        callbackUrl: returnPath,
      },
    );
  };

  return (
    <div className="container m-auto px-5 py-12">
      <div className="text-center">
        <h1 className="text-5xl mb-4 text-center">Create a stream</h1>
        <p className="text-gray">Stream your tokens to the receiver directly</p>
      </div>
      <CreateStreamForm onSubmit={createStreamClick} />
    </div>
  );
}
