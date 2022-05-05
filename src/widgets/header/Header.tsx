import React from 'react';

import {DarkLogo} from '@ui/icons/Logo';
import {Layout} from '@ui/components/Layout';
import {Authorization} from 'features/authorization';

import {ROUTES_MAP} from 'shared/helpers/routing';

import {PageList} from './ui/PagesList';
import {FinancialActivity} from './ui/FinancialActivity';

import styles from './styles.module.scss';

const ROUTES_TO_DISPLAY = [ROUTES_MAP.streams];

export const Header = () => (
    <div className={styles.wrapper}>
      <Layout className={styles.root}>

        <div className={styles.left}>
          <DarkLogo className={styles.logo}/>
          <PageList pageRoutes={ROUTES_TO_DISPLAY}/>
        </div>

        <div className={styles.right}>
          <FinancialActivity />
          <Authorization />
        </div>
      </Layout>
    </div>
  )

export default Header;
