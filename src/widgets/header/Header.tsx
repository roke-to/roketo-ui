import classNames from 'classnames';
import {useStore} from 'effector-react';
import {Link} from 'react-router-dom';

import {Authorization} from '~/features/authorization';
import {LEGACY_ROUTES_MAP, useShowLegacyStreams} from '~/features/legacy';

import {$isSignedIn} from '~/entities/wallet';

import {useMediaQuery} from '~/shared/hooks/useMatchQuery';
import {ROUTES_MAP} from '~/shared/lib/routing';

import {Layout} from '@ui/components/Layout';
import {Logo} from '@ui/icons/Logo';

import {Notifications} from '../notifications';
import {Profile} from '../profile';
import styles from './styles.module.scss';
import {FinancialActivity} from './ui/FinancialActivity';
import {PageList} from './ui/PagesList';
import {ReactComponent as Warning} from './warning.svg';

const ROUTES_TO_DISPLAY = [ROUTES_MAP.streams];

export const Header = () => {
  const showLegacyStreams = useShowLegacyStreams();
  const signedIn = useStore($isSignedIn);

  const withSecondFloor = !useMediaQuery('(min-width: 1280px)');
  const isCompact = useMediaQuery('(max-width: 767px)');

  return (
    <div className={styles.wrapper}>
      {showLegacyStreams && (
        <Link to={LEGACY_ROUTES_MAP.legacyStreams.path}>
          <Layout className={styles.legacyStreamsBar}>
            <Warning className={classNames(styles.warningIcon, styles.unshrinkable)} />
            <div>
              You can see your previously created streams in the{' '}
              <span className={styles.tabName}>Streams (legacy)</span> tab now.
              <br />
              Stop or re-create your legacy streams with this Roketo version before they will be
              stopped on August 15.
              <br />
              Otherwise all unstreamed funds will be returned to the Sender, and the sent part to
              the Recipient.
            </div>
          </Layout>
        </Link>
      )}
      <Layout className={styles.root}>
        <div className={styles.left}>
          <Link to="/" className={styles.unshrinkable}>
            <Logo className={styles.logo} />
          </Link>
          {signedIn && !isCompact && (
            <PageList
              pageRoutes={
                showLegacyStreams
                  ? [...ROUTES_TO_DISPLAY, LEGACY_ROUTES_MAP.legacyStreams]
                  : ROUTES_TO_DISPLAY
              }
            />
          )}
          {signedIn && isCompact && <PageList pageRoutes={[ROUTES_TO_DISPLAY[0]]} />}
        </div>

        <div className={styles.right}>
          {signedIn && !withSecondFloor && <FinancialActivity className={styles.marginRight} />}
          {signedIn && <Profile arrowClassName={styles.profileNotificationsArrow} />}
          {signedIn && <Notifications arrowClassName={styles.profileNotificationsArrow} />}
          {!isCompact && <Authorization />}
        </div>
      </Layout>
      {signedIn && withSecondFloor && (
        <Layout className={styles.secondRoot}>
          {!isCompact && <FinancialActivity className={styles.marginRight} />}
          {isCompact && (
            <PageList
              className={styles.compactNavigation}
              activeClassName={styles.compactNavigationActive}
              pageRoutes={
                showLegacyStreams
                  ? [...ROUTES_TO_DISPLAY, LEGACY_ROUTES_MAP.legacyStreams]
                  : ROUTES_TO_DISPLAY
              }
            />
          )}
        </Layout>
      )}
    </div>
  );
};
