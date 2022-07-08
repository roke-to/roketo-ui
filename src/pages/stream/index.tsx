import cn from 'classnames';
import copy from 'clipboard-copy';
import {useGate, useStore} from 'effector-react';
import React, {ReactNode} from 'react';
import {Link, useParams} from 'react-router-dom';

import {AddFunds} from '~/features/add-funds';
import {StreamControls} from '~/features/stream-control/StreamControls';
import {WithdrawButton} from '~/features/stream-control/WithdrawButton';

import {Badge} from '~/shared/components/Badge';
import {PageError} from '~/shared/components/PageError';
import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {ColorDot} from '~/shared/kit/ColorDot';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {Layout} from '@ui/components/Layout';
import {ProgressBar} from '@ui/components/ProgressBar';
import {LinkIcon} from '@ui/icons/Link';

import {BreadcrumbIcon} from './BreadcrumbIcon';
import {$link, $loading, $pageError, $stream, $streamInfo, pageGate} from './model';
import styles from './styles.module.scss';

export function StreamPage() {
  const {id} = useParams() as {id: string};
  useGate(pageGate, id);
  const loading = useStore($loading);
  const stream = useStore($stream);
  const pageError = useStore($pageError);
  const link = useStore($link);
  const {
    active,
    amount,
    tokenSymbol,
    tokensAvailable,
    remaining,
    cliff,
    sender,
    receiver,
    progressText,
    progressInUSD,
    cliffPercent,
    withdrawn,
    withdrawnText,
    streamed,
    total,
    isLocked,
    speed,
    color,
    comment,
    showControls,
    showAddFundsButton,
    showWithdrawButton,
    subheader,
    direction,
  } = useStore($streamInfo);
  const compact = useMediaQuery('(max-width: 767px)');
  if (!active) return null;
  const addWithdrawControls = stream && (
    <>
      {showAddFundsButton && (
        <AddFunds
          stream={stream}
          className={cn(styles.button, styles.buttonPrimary, styles.addFundsButton)}
        />
      )}
      {showWithdrawButton && (
        <WithdrawButton
          stream={stream}
          className={cn(styles.button, styles.buttonPrimary, styles.withdrawButton)}
        />
      )}
    </>
  );
  return (
    <div className={styles.root}>
      <Layout>
        <div className={styles.breadbrumbs}>
          <Link to={ROUTES_MAP.streams.path} className={styles.streamsLink}>
            Streams
          </Link>
          <BreadcrumbIcon className={styles.breadbrumb} />
          <span className={styles.id}>{id}</span>
        </div>
        {pageError && (
          <PageError className="max-w-2xl mx-auto py-32" message={pageError} onRetry={() => {}} />
        )}
        {loading && <div className="py-32 text-center text-gray text-2xl">Loading...</div>}

        {!pageError && stream && (
          <main
            className={styles.stream}
            style={{'--controls-column': compact ? '1 / span 2' : 2} as any}
          >
            {isLocked && (
              <Badge isOrange className={styles.closeBadge}>
                Locked
              </Badge>
            )}
            <div className={cn(styles.progressBlock, styles.blockLarge)}>
              <span className={styles.blockTitle}>{subheader}</span>
              <div className={styles.numericProgress}>
                <span>{progressText}</span>&nbsp;
                <span className={styles.tokenName}>{tokenSymbol}</span>
              </div>
              <div className={styles.progressInUSD}>{progressInUSD}</div>
              <ProgressBar
                total={total}
                streamed={streamed}
                withdrawn={withdrawn}
                cliffPercent={cliffPercent}
                withBigCliffMark
                className={styles.progressBar}
                direction={direction}
              />
              {showControls && (
                <>
                  {!compact && addWithdrawControls}
                  <StreamControls
                    stream={stream}
                    className={styles.streamControls}
                    openerClassName={cn(styles.button, compact && styles.buttonPrimary)}
                    additionalControls={compact && addWithdrawControls}
                    openerText={compact && <span>Stream actions</span>}
                    needToUseBlur={compact}
                  />
                </>
              )}
            </div>

            <BlockLarge className={styles.availableBlock} title="Available">
              {tokensAvailable} of {amount} {tokenSymbol}
            </BlockLarge>
            <BlockLarge className={styles.remainingBlock} title="Remaining">
              {remaining}
            </BlockLarge>
            {cliff && (
              <BlockLarge className={styles.cliffBlock} title={cliff.title}>
                {cliff.value}
              </BlockLarge>
            )}
            <BlockLarge className={styles.withdrawnBlock} title="Withdrawn">
              {withdrawnText} {tokenSymbol}
            </BlockLarge>
            {speed && (
              <BlockLarge className={styles.speedBlock} title="Speed">
                {speed}
              </BlockLarge>
            )}
            {color && (
              <div className={cn(styles.colorBlock, styles.blockLarge)}>
                <span className={styles.blockTitle}>Tag color</span>
                <ColorDot color={color} className={styles.blockBody} />
              </div>
            )}

            {comment && (
              <div className={cn(styles.commentBlock, styles.blockLarge)}>
                <span className={styles.blockTitle}>Comment</span>
                <div className={styles.blockBody}>{comment}</div>
              </div>
            )}
            {link && (
              <div className={cn(styles.linkBlock, styles.blockLarge)}>
                <div className={cn(styles.copyTitle, styles.blockTitle)}>
                  Public link to view the stream
                  <button type="button" className={styles.copyButton} onClick={() => copy(link)}>
                    <LinkIcon className={styles.linkIcon} />
                  </button>
                </div>
                <div className={cn(styles.link, styles.blockBody)}>{link}</div>
              </div>
            )}

            <div className={cn(styles.senderBlock, styles.blockSmall)}>
              <span className={styles.blockTitle}>Sender</span>
              <span className={styles.blockBody}>{sender}</span>
            </div>
            <div className={cn(styles.receiverBlock, styles.blockSmall)}>
              <span className={styles.blockTitle}>Receiver</span>
              <span className={styles.blockBody}>{receiver}</span>
            </div>
          </main>
        )}
      </Layout>
    </div>
  );
}

function BlockLarge({
  className,
  title,
  children,
}: {
  className: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn(className, styles.blockLarge)}>
      <span className={styles.blockTitle}>{title}</span>
      <div className={styles.blockBody}>{children}</div>
    </div>
  );
}
