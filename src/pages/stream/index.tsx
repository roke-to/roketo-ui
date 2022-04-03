import React from 'react';
import { useParams, Link } from 'react-router-dom';
import copy from 'clipboard-copy';
import classNames from 'classnames';

import { StreamOverviewCard } from 'features/stream-view/StreamOverviewCard';
import { useSingleStream } from 'features/roketo-resource';
import { StreamDashboard } from 'features/stream-view/StreamDashboard';
import { LinkIcon } from 'shared/icons/Link';
import { ArrowLeftIcon } from 'shared/icons/ArrowLeft';
import { getStreamLink, ROUTES_MAP } from 'shared/helpers/routing';
import { PageError } from 'shared/components/PageError';

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
  const params = useParams() as { id: string };
  const streamSWR = useSingleStream(params.id);

  const maybeStream = streamSWR.data;
  const pageError = streamSWR.error;

  const link = getStreamLink(maybeStream?.id);

  return (
    <div className="container mx-auto p-12">
      <div className="mb-10">
        <BackButton to={ROUTES_MAP.streams.path} />
      </div>
      {pageError &&
        <PageError
          className="max-w-2xl mx-auto py-32"
          message={pageError.message}
          onRetry={() => {
            streamSWR.mutate();
          }}
        />
      }
      {!pageError && !maybeStream &&
        <div className="py-32 text-center text-gray text-2xl">Loading...</div>
      }

      {maybeStream &&
        <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex flex-col items-center flex-grow">
          <StreamDashboard stream={maybeStream} />
          <StreamCopyUrlBlock link={link} className="max-w-xl w-full mt-28" />
        </div>
        <StreamOverviewCard
          className="mt-10 w-full lg:mt-0 lg:w-1/3 self-start"
          stream={maybeStream}
        />
        </div>
      }
    </div>
  );
}
