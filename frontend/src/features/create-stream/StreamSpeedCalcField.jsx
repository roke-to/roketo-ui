import {useEffect, useState} from 'react';
import {usePrev} from '../../lib/usePrev';
import {useTokenFormatter} from '../../lib/useTokenFormatter';

export function StreamSpeedCalcField({onChange, deposit = 0, token}) {
  const formatter = useTokenFormatter(token);

  const [days, setDays] = useState(0.0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  const SECONDS_IN_MINUTE = 60;
  const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
  const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;

  const durationInSeconds =
    days * SECONDS_IN_DAY +
    minutes * SECONDS_IN_MINUTE +
    hours * SECONDS_IN_HOUR;

  let tokensPerTick = Math.round(
    deposit / formatter.secondsToTicks(durationInSeconds),
  );

  if (isNaN(tokensPerTick)) {
    tokensPerTick = 0;
  } else if (tokensPerTick === Infinity) {
    tokensPerTick = 0;
  }

  const prevSpeed = usePrev(tokensPerTick);

  useEffect(() => {
    if (prevSpeed !== tokensPerTick) {
      onChange(tokensPerTick);
    }
  }, [tokensPerTick, onChange, prevSpeed]);

  return (
    <div className="flex" label="Stream duration">
      <label className="w-1/3 input font-semibold flex p-4 rounded-l-lg border-border border bg-input text-white focus-within:border-blue hover:border-blue">
        <input
          className="focus:outline-none input bg-input w-1/3"
          placeholder="0"
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
          }}
        />
        <div className="right-2 opacity-100 w-1/3">days</div>
      </label>
      <label className="w-1/3 input font-semibold flex p-4 border-border border bg-input text-white focus-within:border-blue hover:border-blue">
        <input
          className="focus:outline-none input bg-input w-1/3"
          placeholder="0"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <div className="right-2 opacity-100 w-1/3">hours</div>
      </label>
      <label className="w-1/3 input font-semibold flex p-4 rounded-r-lg border-border border bg-input text-white focus-within:border-blue hover:border-blue">
        <input
          className="focus:outline-none input bg-input w-1/3"
          placeholder="0"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <div className="right-2 opacity-100 w-1/3">mins</div>
      </label>
    </div>
  );
}
