import React from 'react';

import {useRoketoContext} from 'app/roketo-context';

type Props = {
  tokenAccountId: string,

  className?: string,
}

export const FeeDisclaimer = ({tokenAccountId, className}: Props) => {
  const {tokens} = useRoketoContext();

  const token = tokens[tokenAccountId];
  const {meta: tokenMeta, formatter, roketoMeta} = token;

  return (tokenMeta &&
    <div className={className}>
      {`You will be charged 
        ${formatter.amount(roketoMeta.commission_on_create)} 
        ${tokenMeta.symbol} fee for the stream`
      }
    </div>
  );
};
