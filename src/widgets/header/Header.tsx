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

const ROUTES_TO_DISPLAY = [ROUTES_MAP.streams];

export const Header = () => {
  const signedIn = useStore($isSignedIn);
  const withSecondFloor = !useMediaQuery('(min-width: 1280px)');
  const showLegacyStreams = useShowLegacyStreams();

  return (
    <>
      <div className={styles.wrapper}>
        <Layout className={styles.root}>
          <div className={styles.left}>
            <Link to="/" className={styles.unshrinkable}>
              <Logo className={styles.logo} />
            </Link>
            {signedIn && (
              <PageList
                pageRoutes={
                  showLegacyStreams
                    ? [...ROUTES_TO_DISPLAY, LEGACY_ROUTES_MAP.legacyStreams]
                    : ROUTES_TO_DISPLAY
                }
              />
            )}
          </div>

          <div className={styles.right}>
            {signedIn && !withSecondFloor && <FinancialActivity className={styles.marginRight} />}
            {signedIn && <Profile />}
            {signedIn && !withSecondFloor && <Notifications />}
            {!withSecondFloor && <Authorization />}
          </div>
        </Layout>
      </div>
      {signedIn && withSecondFloor && (
        <div className={styles.secondWrapper}>
          <Layout className={styles.secondRoot}>
            <FinancialActivity className={styles.marginRight} />
            <div className={styles.right}>
              <Notifications />
              <Authorization />
            </div>
          </Layout>
        </div>
      )}
    </>
  );
};
