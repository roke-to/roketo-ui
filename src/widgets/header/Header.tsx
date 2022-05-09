import React from 'react';
import { Link } from 'react-router-dom';

import {DarkLogo} from '@ui/icons/Logo';
import {Layout} from '@ui/components/Layout';
import {Authorization} from 'features/authorization';
import { useRoketoContext } from 'app/roketo-context';

import {ROUTES_MAP} from 'shared/helpers/routing';

import {PageList} from './ui/PagesList';
import {FinancialActivity} from './ui/FinancialActivity';

import styles from './styles.module.scss';

const ROUTES_TO_DISPLAY = [ROUTES_MAP.streams];

export const Header = () => {
  const { auth } = useRoketoContext();

  return (
    <div className={styles.wrapper}>
      <Layout className={styles.root}>

        <div className={styles.left}>
          <Link to="/">
            <DarkLogo className={styles.logo}/>
          </Link>
          {auth.signedIn && <PageList pageRoutes={ROUTES_TO_DISPLAY} />}
        </div>

        <div className={styles.right}>
          {auth.signedIn && <FinancialActivity />}
          <Authorization />
        </div>
      </Layout>
    </div>
  );
};
