import styles from './styles.module.scss';
import {SubscriptionFilters} from './SubscriptionFilters';
import {SubscriptionsList} from './SubscriptionsList';

export const SubscriptionsPage = () => (
  <div className={styles.layout}>
    <SubscriptionFilters className={styles.streamFilters} />
    <SubscriptionsList className={styles.streamListBlock} />
  </div>
);
