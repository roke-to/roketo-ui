import React from 'react';

import {Layout} from '@ui/components/Layout';
import {Logo} from '@ui/icons/Logo';
import {Button, DisplayMode} from '@ui/components/Button';

import styles from './styles.module.scss';

export const CookiePolicy = () => (
  <div className={styles.root}>
    <Layout className={styles.wrapper}>
      <Logo className={styles.logo}/>

      <p className={styles.disclaimer}>
        We use cookies to provide, improve, protect, and promote our services. Visit
        <a
          className={styles.link}
          href="https://uploads-ssl.webflow.com/6136222580031d054842f5d6/617993de0d09ef005611beac_Cookie_Policy_of_Roketo.pdf"
          target="_blank"
          rel="noreferrer"
        >
          our Cookie Policy
        </a>
        to learn more.
      </p>

      <div className={styles.buttons}>
        <Button displayMode={DisplayMode.simple}>Decline</Button>
        <Button displayMode={DisplayMode.action}>Accept All</Button>
      </div>
    </Layout>
  </div>
);
