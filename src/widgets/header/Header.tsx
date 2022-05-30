import React from 'react';
import { Link } from 'react-router-dom';

import {Logo} from '@ui/icons/Logo';
import {Layout} from '@ui/components/Layout';
import {Authorization} from 'features/authorization';
import { useRoketoContext } from 'app/roketo-context';
import { LEGACY_ROUTES_MAP, useShowLegacyStreams } from 'features/legacy';

import {ROUTES_MAP} from 'shared/helpers/routing';
import { useMediaQuery } from 'shared/hooks/useMatchQuery';

import {PageList} from './ui/PagesList';
import {FinancialActivity} from './ui/FinancialActivity';

import { Profile } from '../profile';
import { Notifications } from '../notifications';

import styles from './styles.module.scss';

const ROUTES_TO_DISPLAY = [ROUTES_MAP.streams];

export const Header = () => {
  const { auth } = useRoketoContext();
  const withSecondFloor = !useMediaQuery('(min-width: 1280px)');
  const showLegacyStreams = useShowLegacyStreams();

  return (
    <>
      <div className={styles.wrapper}>
        <Layout className={styles.root}>

          <div className={styles.left}>
            <Link to="/" className={styles.unshrinkable}>
              <Logo className={styles.logo}/>
            </Link>
            {auth.signedIn && <PageList pageRoutes={
              showLegacyStreams
                ? [...ROUTES_TO_DISPLAY, LEGACY_ROUTES_MAP.legacyStreams]
                : ROUTES_TO_DISPLAY
            } />}
          </div>

          <div className={styles.right}>
            {auth.signedIn && !withSecondFloor && <FinancialActivity className={styles.marginRight} />}
            {auth.signedIn && <Profile />}
            {auth.signedIn && !withSecondFloor && <Notifications />}
            {!withSecondFloor && <Authorization />}
          </div>
        </Layout>
      </div>
      {auth.signedIn && withSecondFloor && (
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
