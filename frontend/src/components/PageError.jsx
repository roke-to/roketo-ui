import classNames from 'classnames';
import React from 'react';
import {Button} from './kit/Button';
import hackImage from '../images/RUSSIANS_HACK.gif';
import crabImage from '../images/crab.gif';

export function PageError({message, onRetry, className, ...rest}) {
  const rand = React.useRef(Math.random());

  return (
    <div className={classNames('text-center', className)}>
      {rand.current > 0.5 ? (
        <img
          src={hackImage}
          className="mx-auto"
          alt="funny hackers gif with bird dancing around"
        />
      ) : (
        <img
          src={crabImage}
          className="mx-auto"
          alt="crab with a knife tries to hurt people"
        />
      )}

      <h1 className="text-4xl font-semibold mb-6 mt-10">
        Something is broken.
      </h1>
      <p className="text-gray mb-4">Finally we have something to fix</p>
      {message && (
        <code className="p-4 border-special-inactive border block text-special-inactive text-xs mb-4">
          {message}
        </code>
      )}
      <Button
        variant="outlined"
        color="dark"
        className="mt-10"
        onClick={onRetry}
      >
        Try again
      </Button>
      <p className="text-xs text-gray mt-2">(that probably wont help)</p>
    </div>
  );
}
