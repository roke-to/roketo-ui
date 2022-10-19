import {Breadcrumb} from '~/shared/kit/Breadcrumb';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {ArchivedStreamFilters} from './ArchivedStreamFilters';
import {ArchivedStreamsList} from './ArchivedStreamsList';
import styles from './styles.module.scss';

export const ArchivedStreamsPage = () => (
  <div className={styles.layout}>
    <Breadcrumb parentPage="Streams" currentPage="Archive" link={ROUTES_MAP.streams.path} />
    <ArchivedStreamFilters className={styles.streamFilters} />
    <ArchivedStreamsList className={styles.streamListBlock} />
  </div>
);
