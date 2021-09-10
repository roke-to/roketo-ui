import {useEffect, useState} from 'react';
import {TokenFormatter} from '../../lib/formatting';
import {usePrev} from '../../lib/usePrev';

export function StreamSpeedCalcField({onChange, deposit = 0, token}) {
  const formatter = TokenFormatter(token);

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
    <div className="twind-flex" label="Stream duration">
      <label className="twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-l-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue">
        <input
          className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
          placeholder="0"
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
          }}
        />
        <div className="twind-right-2 twind-opacity-100 twind-w-1/3">days</div>
      </label>
      <label className="twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue">
        <input
          className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
          placeholder="0"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <div className="twind-right-2 twind-opacity-100 twind-w-1/3">hours</div>
      </label>
      <label className="twind-w-1/3 input twind-font-semibold twind-flex twind-p-4 twind-rounded-r-lg twind-border-border twind-border twind-bg-input twind-text-white focus-within:twind-border-blue hover:twind-border-blue">
        <input
          className="focus:twind-outline-none input twind-bg-input twind-w-1/3"
          placeholder="0"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <div className="twind-right-2 twind-opacity-100 twind-w-1/3">mins</div>
      </label>
    </div>
  );
}
