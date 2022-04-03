import React from 'react';

import {DarkLogo} from '@uikit/icons/Logo';
import {Layout} from '@uikit/components/Layout';
import {Authorization} from '@app/features/authorization';

import {ROUTES_MAP} from '@app/shared/helpers/routing';

import {PageList} from './ui/PagesList';
import {FinancialActivity} from './ui/FinancialActivity';

import styles from './styles.module.scss';

const ROUTES_TO_DISPLAY = [ROUTES_MAP.myStreams, ROUTES_MAP.account];

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
