import React from 'react';
import classNames from 'classnames';
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';

const GRADIENT_STOP = [
  ['#4743FB', '#C750FF'],
  ['#FFCC69', '#FF8469'],
];
const GRADIENTS = [
  `linear-gradient(270deg, ${GRADIENT_STOP[0][0]} 0%, ${GRADIENT_STOP[0][1]} 100%)`,
  `linear-gradient(270deg, ${GRADIENT_STOP[1][0]} 0%, ${GRADIENT_STOP[1][1]} 100%)`,
];

type ProgressBarProps = {
  progresses: number[];
  className: string;
};

export function ProgressBar({ progresses, className }: ProgressBarProps) {
  const p = [...progresses];
  p.sort((a, b) => b - a);

  return (
    <div
      className={classNames(
        'relative h-3 rounded-r-md rounded-l-lg bg-progressBar',
        className,
      )}
    >
      {p.map((progress, i) => (
        <div
          key={i} // eslint-disable-line react/no-array-index-key
          className="absolute left-0 h-full rounded-lg"
          style={{
            width: `${progress * 100}%`,
            background: GRADIENTS[i],
          }}
        />
      ))}
    </div>
  );
}

type GradientSVGProps = {
  endColor: string;
  startColor: string;
  progressValue: number;
  idCSS: string;
  rotation: number;
};

function GradientSVG({
  endColor, startColor, progressValue, idCSS, rotation,
}: GradientSVGProps) {
  const gradientTransform = `rotate(${rotation})`;

  return (
    <svg style={{ height: 0 }}>
      <defs>
        <linearGradient id={idCSS} gradientTransform={gradientTransform}>
          <stop offset="0%" stopColor={startColor} />
          {progressValue > 0 && progressValue < 100 ? (
            <stop offset={`${progressValue}%"`} stopColor={endColor} />
          ) : null}
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
    </svg>
  );
}

type ArcProgressBarProps = {
  progresses: number[];
  className: string;
};

export function ArcProgressBar({ progresses, className }: ArcProgressBarProps) {
  progresses.sort((a, b) => b - a);
  const rotation = 3 / 4;

  return (
    <div className={classNames(className)}>
      <CircularProgressbarWithChildren
        circleRatio={0.5}
        styles={buildStyles({
          rotation,
          pathColor: '#0D0B26',
          strokeLinecap: 'round',
        })}
        value={1}
        minValue={0}
        maxValue={1}
      >
        {GRADIENT_STOP.map((colors, i) => (
          <GradientSVG
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            progressValue={0}
            idCSS={`__arcProgressBar_grad_${i}`}
            rotation={i === 0 ? 90 : 90}
            startColor={colors[0]}
            endColor={colors[1]}
          />
        ))}
        {progresses.map((progress, i) => (
          <CircularProgressbar
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            circleRatio={0.5}
            className="absolute inset-0"
            value={progress}
            styles={buildStyles({
              rotation,
              trailColor: 'transparent',
              pathColor: `url(#__arcProgressBar_grad_${i})`,
              strokeLinecap: 'round',
            })}
            minValue={0}
            maxValue={1}
          />
        ))}
      </CircularProgressbarWithChildren>
    </div>
  );
}
