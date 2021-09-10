import classNames from 'classnames';
import React from 'react';
import {Button} from './kit';
import hackImage from '../images/RUSSIANS_HACK.gif';
import crabImage from '../images/crab.gif';

export function PageError({message, onRetry, className, ...rest}) {
  const rand = React.useRef(Math.random());

  return (
    <div className={classNames('twind-text-center', className)}>
      {rand.current > 0.5 ? (
        <img
          src={hackImage}
          className="twind-mx-auto"
          alt="funny hackers gif with bird dancing around"
        />
      ) : (
        <img
          src={crabImage}
          className="twind-mx-auto"
          alt="crab with a knife tries to hurt people"
        />
      )}

      <h1 className="twind-text-4xl twind-font-semibold twind-mb-6">
        Something is broken! Thanks you!
      </h1>
      <p className="twind-text-gray twind-mb-4">
        Finally we have something to fix!
      </p>
      {message && (
        <code className="twind-p-4 twind-border-special-inactive twind-border twind-block twind-text-special-inactive twind-text-xs twind-mb-4">
          {message}
        </code>
      )}
      <Button
        variant="outlined"
        color="dark"
        className="twind-mt-10"
        onClick={onRetry}
      >
        Try again!
      </Button>
      <p className="twind-text-xs twind-text-gray twind-mt-2">
        (that probably wont help)
      </p>
    </div>
  );
}
