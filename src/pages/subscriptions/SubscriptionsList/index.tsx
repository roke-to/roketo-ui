import cn from 'classnames';
import {useList, useStore, useStoreMap} from 'effector-react';
import React, {memo} from 'react';

import {StreamListControls} from '~/features/stream-control/StreamControls';

import {ApplicationResponseDto} from '~/shared/api/rb';

import {StatusIcon} from '@ui/icons/StatusIcon';

import {subscriptionCardDataDefaults} from '../constants';
import {$filteredSubscriptions, $selectedSubscription, $subscriptionCardsData} from '../model';
import {SubscriptionProgress} from '../SubscriptionProgress';
import menuDotsIcon from './menuDots.svg';
import styles from './styles.module.scss';

const SubscriptionServiceName = memo(({subscriptionId}: {subscriptionId: string}) => {
  const {serviceIcon, serviceName} = useStoreMap({
    store: $subscriptionCardsData,
    keys: [subscriptionId],
    fn: (items) => items[subscriptionId],
    defaultValue: subscriptionCardDataDefaults,
  });
  return (
    <span className={styles.serviceCell}>
      <img src={serviceIcon} alt={serviceName} className={styles.serviceIcon} /> {serviceName}
    </span>
  );
});

const SubscriptionDate = memo(({subscriptionId}: {subscriptionId: string}) => {
  const {endDate, timeLeft} = useStoreMap({
    store: $subscriptionCardsData,
    keys: [subscriptionId],
    fn: (items) => items[subscriptionId],
    defaultValue: subscriptionCardDataDefaults,
  });
  return (
    <span className={styles.dateCell}>
      {endDate} * {timeLeft}
    </span>
  );
});

const CollapsedSubscriptionRow = ({subscription}: {subscription: ApplicationResponseDto}) => {
  const {id: subscriptionId} = subscription;
  const {showAddFundsButton, showStartButton, showPauseButton, iconType, stream} = useStoreMap({
    store: $subscriptionCardsData,
    keys: [subscriptionId],
    fn: (items) => items[subscriptionId],
    defaultValue: subscriptionCardDataDefaults,
  });
  return (
    <>
      <div className={cn(styles.statusCell)}>
        <img src={StatusIcon(iconType)} alt={iconType} className={styles.streamStatusIcon} />
      </div>
      <SubscriptionProgress
        streamId={stream.id}
        className={cn(styles.progressCell, styles.leftStickyCell)}
      />

      <SubscriptionServiceName subscriptionId={subscription.id} />
      <SubscriptionDate subscriptionId={subscription.id} />

      <div className={cn(styles.controlCell)}>
        <StreamListControls
          stream={stream}
          dropdownClassName={styles.controlDropdown}
          showAddFundsButton={showAddFundsButton}
          showWithdrawButton={false}
          showStartButton={showStartButton}
          showPauseButton={showPauseButton}
          openerClassName={styles.streamActionsButton}
          openerContent={
            <img
              src={menuDotsIcon}
              alt="Open stream actions"
              className={styles.streamActionsIcon}
            />
          }
        />
      </div>
    </>
  );
};

const ExpandedSubscriptionCard = ({subscription}: {subscription: ApplicationResponseDto}) => {
  const {id: subscriptionId} = subscription;
  const {serviceName, serviceIcon, endDate, timeLeft} = useStoreMap({
    store: $subscriptionCardsData,
    keys: [subscriptionId],
    fn: (items) => items[subscriptionId],
    defaultValue: subscriptionCardDataDefaults,
  });
  return (
    <div className={styles.expandedInfo}>
      <div className={styles.serviceCell}>
        {serviceIcon} {serviceName}
      </div>
      <div className={styles.dateCell}>
        {endDate} * {timeLeft}
      </div>
    </div>
  );
};

const Placeholder = () => (
  // const {subscriptionsLoading, hasSubscriptions} = useStore($subscriptionListData);
  // if (subscriptionsLoading) return <Spinner wrapperClassName={styles.loader} />;
  // if (!hasSubscriptions) {
  //   return <div>You don't have any archived subscriptions yet.</div>;
  // }
  <div>No subscriptions matching your filters. Try selecting different ones</div>
);
export const SubscriptionsList = ({className}: {className: string}) => {
  console.log(useStore($filteredSubscriptions));

  return (
    <div className={cn(styles.container, className)}>
      <section className={styles.subscriptionGrid}>
        <h3 className={cn(styles.leftStickyCell, styles.title)}>Amount to subscription</h3>
        <h3 className={styles.title}>Service name</h3>
        <h3 className={styles.title}>Subscription end date</h3>

        {useList($filteredSubscriptions, {
          getKey: ({id}) => id,
          fn(subscription) {
            const {id: subscriptionId} = subscription;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const isSelected = useStoreMap({
              store: $selectedSubscription,
              keys: [subscriptionId],
              fn: (selected) => selected === subscriptionId,
            });
            return isSelected ? (
              <ExpandedSubscriptionCard subscription={subscription} />
            ) : (
              <CollapsedSubscriptionRow subscription={subscription} />
            );
          },
          placeholder: (
            <div className={styles.emptyState}>
              <Placeholder />
            </div>
          ),
        })}
      </section>
    </div>
  );
};
