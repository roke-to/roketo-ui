import {EventType, makeSignatureString, NearPay, WidgetEvent} from '@nearpay/nearpay-sdk';
import {WidgetParams} from '@nearpay/nearpay-sdk/dist/interfaces/widget-parameters';
import {useLayoutEffect, useRef, useState} from 'react';
import useSWR from 'swr';

import {env} from '~/shared/config';

import {signTopUpParametersLocally} from './local-sign';

export function MunzenWidget({
  params,
  onEvent,
}: {
  params: WidgetParams & {
    email?: string;
    sumsub_token?: string;
  };
  onEvent?: (e: WidgetEvent) => void;
}) {
  const signatureString = makeSignatureString(params);
  const [isContainerMounted, setIsContainerMounted] = useState(false);
  const mountElement = useRef<HTMLDivElement | null>(null);
  const nearpay = useRef<NearPay | null>(null);

  const signedLink = useSWR(`sign-${signatureString}`, () => signTopUpParametersLocally(params), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useLayoutEffect(() => {
    if (!mountElement.current) {
      return;
    }

    if (!signedLink.data) {
      return;
    }

    const signedParams = {
      ...params,
      signature: signedLink.data,
    };

    const instance = new NearPay({
      mountElement: mountElement.current,
      environment: env.NEAR_NETWORK_ID === 'testnet' ? 'stage' : 'production',
      params: signedParams,
    });

    const safeOnEvent = onEvent || (() => {});
    instance.addListener(EventType.Any, safeOnEvent);

    nearpay.current = instance;
    try {
      nearpay.current.init();
    } catch (error) {
      // ignore
    }

    // eslint-disable-next-line consistent-return
    return () => {
      instance.removeListener(EventType.Any, safeOnEvent);
    };
  }, [signedLink.data, isContainerMounted, onEvent, params]);

  if (!signedLink.data) {
    return <div>loading...</div>;
  }

  return (
    <div
      ref={(element) => {
        mountElement.current = element;
        setIsContainerMounted(true);
      }}
    />
  );
}
