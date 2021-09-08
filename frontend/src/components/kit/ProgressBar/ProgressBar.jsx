import React from 'react';
import classNames from 'classnames';

const COLORS = [
  'linear-gradient(270deg, #C750FF 0%, #4743FB 100%)',
  'linear-gradient(270deg, #FFCC69 0%, #FF8469 100%)',
];

export function ProgressBar({progresses, className, ...rest}) {
  let p = [...progresses];
  p.sort((a, b) => b - a);
  return (
    <div
      className={classNames(
        'twind-relative twind-h-3 twind-rounded-r-md twind-rounded-l-lg twind-bg-progressBar',
        className,
      )}
      {...rest}
    >
      {p.map((progress, i) => (
        <div
          key={i}
          className="twind-absolute twind-left-0 twind-h-full twind-rounded-lg"
          style={{
            width: progress * 100 + '%',
            background: COLORS[i],
          }}
        ></div>
      ))}
    </div>
  );
}
