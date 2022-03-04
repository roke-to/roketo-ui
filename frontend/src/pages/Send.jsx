import React from 'react';
import {useNear} from '../features/near-connect/useNear';
import {TokenFormatter} from '../lib/formatting.js';
import {CreateStreamForm} from '../features/create-stream/CreateStreamForm';
import {generatePath} from 'react-router';

const redirectUrl = generatePath('streams');
const returnPath = window.location.origin + '/#/' + redirectUrl;

function SendPage() {
  const near = useNear();
  async function createStreamClick(values) {
    const {receiver, autoDeposit, autoStart, comment, deposit, speed, token} =
      values;
    const formatter = TokenFormatter(near.tokens.get(token).metadata.decimals);

    await near.contractApi.createStream(
      {
        deposit: formatter.toInt(deposit),
        description: comment,
        receiverId: receiver,
        token: token,
        speed: String(speed),
        autoDepositEnabled: autoDeposit,
        isAutoStartEnabled: autoStart,
      },
      {
        callbackUrl: returnPath,
      },
    );
  }

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

export default SendPage;
