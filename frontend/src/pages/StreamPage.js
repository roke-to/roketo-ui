import React from 'react';
import {useParams} from 'react-router';
import {DurationTimer} from '../components/DurationTimer';
import {TokenImage} from '../components/kit/TokenImage/TokenImage';
import {useNear} from '../features/near-connect/useNear';
import {streamViewData, StreamingSpeed} from '../features/stream-view';
import {useAccount, useSingleStream} from '../features/xyiming-resources';
import {format} from 'date-fns';
import numbro from 'numbro';
import classNames from 'classnames';
import {
  StreamControls,
  StreamDepositButtonOutlined,
} from '../features/stream-control';

const streamType = {
  stream_id: 'FnVkAYZu4XED3o44pZPvrnghVEMxo3GiHszUT4orjYST',
  description: 'test stream',
  owner_id: 'kpr.testnet',
  receiver_id: 'pinkinice.testnet',
  token_name: 'NEAR',
  timestamp_created: '1630964802206727665',
  balance: '3472735225910300000000000',
  tokens_per_tick: '100000000000',
  auto_deposit_enabled: false,
  status: 'ACTIVE',
  tokens_total_withdrawn: '27264774089700000000000',
  available_to_withdraw: '3472735225910300000000000',
  history: [
    {
      actor: 'dev-1630964633889-96006156236045',
      action_type: 'Deposit',
      amount: '3500000000000000000000000',
      timestamp: '1630964802206727665',
    },
  ],
  direction: 'in',
};

const VerticalData = ({label, children}) => (
  <div>
    <div className="twind-text-gray twind-text-sm">{label}</div>
    <div className="twind-font-semibold twind-text-lg">{children}</div>
  </div>
);

const HorizontalData = ({label, children}) => (
  <div className="twind-flex twind-justify-between twind-my-3">
    <div className="twind-text-gray twind-text-sm">{label}</div>
    <div className="twind-text-sm twind-text-right">{children}</div>
  </div>
);

function StreamOverviewCard({
  stream = streamType,
  account,
  className,
  ...rest
}) {
  const {
    dateEnd,
    tf,
    percentages,
    progress: {full, streamed, withdrawn, left, available},
    progresses,
  } = streamViewData(stream);

  console.log(progresses);
  return (
    <div
      className={classNames(
        'twind-pt-10 twind-p-9 twind-bg-input twind-rounded-3xl',
        className,
      )}
    >
      <div className="twind-flex twind-text-center twind-justify-between">
        <VerticalData label="Receiver:">{stream.receiver_id}</VerticalData>

        <VerticalData label="Time Remaining:">
          <DurationTimer untilDate={dateEnd} />
        </VerticalData>
      </div>
      <div className="twind-border-t twind-border-border twind-mt-8 twind-mb-9" />
      <HorizontalData label="Stream Created:">
        {format(new Date(stream.timestamp_created / 1000000), 'Yo')}
      </HorizontalData>
      <HorizontalData label="Token:">{stream.token_name}</HorizontalData>
      <HorizontalData label="Total:">
        {tf.amount(full)} {stream.token_name}
      </HorizontalData>
      <HorizontalData label="Tokens Transferred:">
        <span>
          {tf.amount(streamed)} {stream.token_name}{' '}
          <span className="twind-text-gray">
            (
            {numbro(percentages.streamed).format({
              output: 'percent',
              mantissa: 2,
            })}
            )
          </span>
        </span>
      </HorizontalData>
      <HorizontalData label="Tokens Left:">
        <span>
          {tf.amount(left)} {stream.token_name}{' '}
          <span className="twind-text-gray">
            (
            {numbro(percentages.left).format({
              output: 'percent',
              mantissa: 2,
            })}
            )
          </span>
        </span>
      </HorizontalData>
      <HorizontalData label="Tokens Available:">
        {tf.amount(available)} {stream.token_name}
      </HorizontalData>
      <HorizontalData label="Speed:">
        {tf.tokensPerS(stream.tokens_per_tick)} {stream.token_name}
      </HorizontalData>

      {stream.direction === 'in' ? (
        <HorizontalData label="Latest Withdrawal:">
          {format(new Date(account.last_action / 1000000), 'MMM dd, Yo  H:m')}
        </HorizontalData>
      ) : (
        ''
      )}

      <HorizontalData label="Stream ID:">
        {tf.amount(full)} {stream.token_name}
      </HorizontalData>
    </div>
  );
}
export function StreamPage() {
  const near = useNear();
  const params = useParams();

  const accountSWR = useAccount({near});
  const streamSWR = useSingleStream(
    {streamId: params.id},
    {
      near,
      accountSWR,
    },
  );
  const account = accountSWR.data;
  const stream = streamSWR.data;
  console.log(account, stream);
  if (streamSWR.error || accountSWR.error) {
    return <div>Erro!</div>;
  }
  if (!stream || !account) {
    return <div>Loading</div>;
  }
  const isIncoming = stream.direction === 'in';
  const isOutgoing = stream.direction === 'out';

  const {
    tf,
    progresses,
    isDead,
    progress: {full, withdrawn, streamed},
  } = streamViewData(stream);

  return (
    <div className="twind-container twind-mx-auto twind-p-12">
      <div>Header</div>

      <div className="twind-flex twind-justify-between">
        <div className="twind-flex twind-flex-col twind-items-center twind-flex-grow">
          <TokenImage
            size={14}
            tokenName={stream.token_name}
            className="twind-mb-8"
          />
          <div className="twind-text-6xl twind-font-semibold">
            {tf.amount(streamed)}
          </div>
          <div className="twind-text-gray twind-font-semibold">
            of {tf.amount(full)}
          </div>
          <StreamingSpeed stream={stream} className="twind-mt-6 twind-mb-6" />
          {isDead ? (
            ''
          ) : (
            <div className="twind-flex">
              <StreamControls stream={stream} className="twind-mr-2" />
              {isOutgoing ? (
                <StreamDepositButtonOutlined
                  variant="outlined"
                  stream={stream}
                />
              ) : null}
            </div>
          )}
        </div>
        <StreamOverviewCard
          className="twind-w-1/3"
          stream={stream}
          account={account}
        />
      </div>
    </div>
  );
}
