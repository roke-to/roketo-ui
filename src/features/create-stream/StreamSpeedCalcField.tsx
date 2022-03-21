import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { differenceInDays, addMonths } from 'date-fns';

import { usePrev } from 'shared/hooks/usePrev';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import { SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE } from 'shared/api/roketo/constants';

type SpeedInputProps = {
  className?: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
};

function SpeedInput({ className, value, onChange, label }: SpeedInputProps) {
  return (
    <label className={classNames('w-1/4 input font-semibold flex p-4 border-border border bg-input text-white focus-within:border-blue hover:border-blue', className)}>
      <input
        className="focus:outline-none input bg-input w-1/3"
        placeholder="0"
        value={value}
        onChange={onChange}
      />
      <div className="right-2 opacity-100 w-1/4">{label}</div>
    </label>
  );
}

type StreamSpeedCalcFieldProps = {
  onChange: (speed: number) => void;
  deposit: number;
  token: string;
};

export function StreamSpeedCalcField({ onChange, deposit = 0, token }: StreamSpeedCalcFieldProps) {
  const formatter = useTokenFormatter(token);

  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  const daysInMonths = differenceInDays(addMonths(new Date(), months), new Date());

  const durationInSeconds = (daysInMonths + days) * SECONDS_IN_DAY
    + minutes * SECONDS_IN_MINUTE
    + hours * SECONDS_IN_HOUR;

  const tokensPerTick = (() => {
    const value = Math.round(
      deposit / formatter.secondsToTicks(durationInSeconds),
    );

    return !Number.isNaN(value) && value !== Infinity ? value : 0;
  })();

  const prevSpeed = usePrev(tokensPerTick);

  useEffect(() => {
    if (prevSpeed !== tokensPerTick) {
      onChange(tokensPerTick);
    }
  }, [tokensPerTick, onChange, prevSpeed]);

  return (
    <div className="flex">
      <SpeedInput
        value={months}
        onChange={(e) => {
          setMonths(Number(e.target.value));
        }}
        label="months"
        className="rounded-l-lg"
      />
      <SpeedInput
        value={days}
        onChange={(e) => {
          setDays(Number(e.target.value));
        }}
        label="days"
      />
      <SpeedInput
        value={hours}
        onChange={(e) => {
          setHours(Number(e.target.value));
        }}
        label="hours"
      />
      <SpeedInput
        value={minutes}
        onChange={(e) => {
          setMinutes(Number(e.target.value));
        }}
        label="mins"
        className="rounded-r-lg"
      />
    </div>
  );
}