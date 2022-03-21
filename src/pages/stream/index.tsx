import React from 'react';
import { useParams, Link } from 'react-router-dom';
import copy from 'clipboard-copy';
import classNames from 'classnames';
import { useRoketoContext } from 'app/roketo-context';
import {
  streamViewData,
  StreamOverviewCard,
  StreamActionHistory,
} from 'features/stream-view';
import {
  useAccount,
  useSingleStream,
  useSingleStreamHistory,
} from 'features/roketo-resource';
import { StreamDashboard } from 'features/stream-view/StreamDashboard';
import { LinkIcon } from 'shared/icons/Link';
import { ArrowLeftIcon } from 'shared/icons/ArrowLeft';
import { routes } from 'shared/helpers/routing';
import { PageError } from 'shared/components/PageError';
import { useTokenFormatter } from 'shared/hooks/useTokenFormatter';
import type { RoketoAccount, RoketoStream } from 'shared/api/roketo/interfaces/entities';

function BackButton({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className={classNames('group flex items-center')}
    >
      <div className="flex items-center justify-center h-11 w-11 rounded-full border-border border group-hover:bg-border mr-4">
        <ArrowLeftIcon />
      </div>
      <span className="uppercase text-gray text-xs"> Back </span>
    </Link>
  );
}

function StreamCopyUrlBlock({ className, link }: { className: string, link: string }) {
  return (
    <div className={className}>
      <div className="mb-4 text-gray text-center">
        Public link to view the stream:
      </div>
      <div className="border border-border bg-input py-4 px-5 rounded-2xl flex items-center">
        <div className="break-all select-all">{link}</div>
        <div className="w-px bg-border mx-6 self-stretch flex-shrink-0" />
        <button
          type="button"
          className="whitespace-nowrap text-blue py-2 px-3 font-semibold text-sm inline-flex bg-transparent hover:bg-hover active:bg-input rounded-lg transition"
          onClick={() => copy(link)}
        >
          <LinkIcon className="mr-2" />
          Copy Link
        </button>
      </div>
    </div>
  );
}

export function StreamPage() {
  const { auth, roketo } = useRoketoContext();
  const params = useParams() as { id: string };

  const accountSWR = useAccount({ auth, roketo });
  const streamSWR = useSingleStream(params.id, {
      roketo,
      account: accountSWR.data,
    },
  );

  const PAGE_SIZE = 10;

  const {
    swr: streamHistorySWR,
    nextPage,
    prevPage,
    maxPage,
    currentPage,
  } = useSingleStreamHistory(
    { pageSize: 10 },
    {
      roketo,
      account: accountSWR.data,
      stream: streamSWR.data,
    },
  );

  const maybeAccount = accountSWR.data;
  const maybeStream = streamSWR.data;
  console.log('stream', maybeStream)
  const tf = useTokenFormatter(maybeStream ? maybeStream.ticker : '');

  const streamHistory = streamHistorySWR.data || [];

  const pageError = streamSWR.error || accountSWR.error;

  const renderStreamData = (stream: RoketoStream, account: RoketoAccount) => {
    const { link } = streamViewData(stream, tf);
    return (
      <>
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="flex flex-col items-center flex-grow">
            <StreamDashboard stream={stream} account={account} />
            <StreamCopyUrlBlock link={link} className="max-w-xl w-full mt-28" />
          </div>
          <StreamOverviewCard
            className="mt-10 w-full lg:mt-0 lg:w-1/3 self-start"
            stream={stream}
            account={account}
          />
        </div>
        <StreamActionHistory
          pageSize={PAGE_SIZE}
          loading={!streamHistorySWR.data}
          stream={stream}
          history={streamHistory}
          className="mx-auto max-w-6xl my-24 w-full"
          onPrevPageClick={prevPage}
          onNextPageClick={nextPage}
          maxPage={maxPage}
          currentPage={currentPage}
        />
      </>
    );
  };

  return (
    <div className="container mx-auto p-12">
      <div className="mb-10">
        <BackButton to={routes.streams} />
      </div>
      {pageError ? (
        <PageError
          className="max-w-2xl mx-auto py-32"
          message={pageError.message}
          onRetry={() => {
            accountSWR.mutate();
            streamSWR.mutate();
          }}
        />
      ) : !maybeStream ? (
        <div>
          <h1 className="text-center my-32 text-2xl text-semibold">
            {' '}
            Stream does not exists
            {' '}
          </h1>
        </div>
      ) : !maybeAccount ? (
        <div className="py-32 text-center text-gray text-2xl">Loading...</div>
      ) : (
        renderStreamData(maybeStream, maybeAccount)
      )}
    </div>
  );
}
