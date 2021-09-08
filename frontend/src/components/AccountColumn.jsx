import classNames from 'classnames';
import React from 'react';
import {StreamIn, StreamOut, StreamWithdraw} from './icons';
import {intervalToDuration, formatDuration} from 'date-fns';
import {TokenFormatter} from '../lib/formatting';
import {StreamCard} from '../components/StreamCard';
import {TokenPreview} from '../components/TokenPreview';
import useSWR from 'swr';
import {useNear} from '../features/near-connect/useNear';

const streamType = {
  auto_deposit_enabled: false,
  available_to_withdraw: '1664007039581600000000000',
  balance: '10000000000000000000000000',
  description: 'blabla',
  owner_id: 'pinkinice.testnet',
  receiver_id: 'pinkinice2.testnet',
  status: 'ACTIVE',
  stream_id: '14px69Go9gwxmmZQ3aWjdEyUeQgAYHRByJf23vLaDe82',
  timestamp_created: '1630936004627180400',
  token_name: 'NEAR',
  tokens_per_tick: '400000000000',
};

export function AccountColumn({header, icon, streamsIds}) {
  // const near = useNear();
  //
  // streamsIds = streamsIds || [];
  //
  // let streams = [];
  //
  // streamsIds.forEach((streamId) => {
  //   const stream = GetStream(streamId);
  //   streams.push(stream);
  //
  //   console.log('stream', stream);
  // });
  //
  // function GetStream(streamId) {
  //   const {data: stream_data} = useSWR(
  //     ['stream', streamId],
  //     near.contractApi.getStream,
  //     {
  //       errorRetryInterval: 1000,
  //     },
  //   );
  //
  //   return stream_data || streamType;
  // }
  //
  // const groupedStreams = streams.reduce((groupedStreams, item) => {
  //   const group = groupedStreams[item.token_name] || [];
  //   group.push(item);
  //   groupedStreams[item.token_name] = group;
  //   return groupedStreams;
  // }, {});
  //
  // console.log(Object.entries(groupedStreams));

  return (
    <div>
      <h2 className="twind-text-xl twind-mb-6 twind-flex twind-items-center">
        <span className="twind-mr-3">{icon}</span>
        {header}
      </h2>
      <div>
        <div className="twind-w-full twind-h-24 twind-rounded-lg twind-bg-card2 twind-flex twind-items-center twind-width-full twind-p-6 twind-mr-4">
          <div className="twind-w-full twind-flex twind-items-center">
            <div className="twind-w-12 twind-mr-12">icon</div>
            <div className="">
              <div className="twind-font-bold">Bitcoin, BTC</div>
              <div className="twind-text-gray twind-text-sm">from 2 steams</div>
            </div>
            <div className="twind-ml-auto">
              <span className=" twind-text-3xl">16.405</span>
              <span>/sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
