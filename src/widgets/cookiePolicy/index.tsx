import React, {useState, useCallback} from 'react';

import {Layout} from '@ui/components/Layout';
import {Logo} from '@ui/icons/Logo';
import {Button, DisplayMode} from '@ui/components/Button';

import styles from './styles.module.scss';

const COOKIE_POLICY_KEY = 'cookie-policy';
const COOKIE_POLICY_ACCEPTED = 'accepted';
const COOKIE_POLICY_DECLINED = 'declined';

export const CookiePolicy = () => {
  const alreadyAcceptedPolicy = localStorage.getItem(COOKIE_POLICY_KEY) === COOKIE_POLICY_ACCEPTED;

  const [isDisplayed, setIsDisplayed] = useState(!alreadyAcceptedPolicy);

  const handleAcceptPolicy = useCallback(
    () => {
      setIsDisplayed(false);

      localStorage.setItem(COOKIE_POLICY_KEY, COOKIE_POLICY_ACCEPTED);
    },
    [setIsDisplayed]
  );

  const handleDeclinePolicy = useCallback(
    () => {
      setIsDisplayed(false);

      localStorage.setItem(COOKIE_POLICY_KEY, COOKIE_POLICY_DECLINED);
    },
    [setIsDisplayed]);

  if (!isDisplayed) {
    return null;
  }

  return (
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
          <Button
            displayMode={DisplayMode.simple}
            onClick={handleDeclinePolicy}
          >
            Decline
          </Button>
          <Button
            displayMode={DisplayMode.action}
            onClick={handleAcceptPolicy}
          >
            Accept All
          </Button>
        </div>
      </Layout>
    </div>
  );
};
