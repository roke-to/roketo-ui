import React from 'react';

import {Layout} from '@ui/components/Layout';
import {DisplayType, Logo} from '@ui/icons/Logo';
import {TelegramLogo} from '@ui/icons/Telegram';
import {TwitterLogo} from '@ui/icons/Twitter';
import {GithubLogo} from '@ui/icons/Github';

// @ts-ignore
import PrivacyPolicyDoc from './assets/Privacy_policy.pdf';

import styles from './styles.module.scss';

export const Footer = () => (
  <footer className={styles.root}>
    <Layout className={styles.layout}>
      <section className={styles.section}>
        <Logo className={styles.logo} type={DisplayType.CURRENT_COLOR}/>

        <div className={styles.links}>
          <a
            href="https://www.roke.to/#page-top"
            target="_blank" rel="noreferrer"
          >
            About
          </a>
          <a
            href="https://www.roke.to/#how-work"
            target="_blank" rel="noreferrer"
          >
            Features
          </a>
          <a
            href="https://www.roke.to/#used-technologies"
            target="_blank" rel="noreferrer"
          >
            Docs
          </a>
          <a
            href="https://www.roke.to/#team"
            target="_blank" rel="noreferrer"
          >
            Team
          </a>
          <a
            href="https://www.roke.to/#blog"
            target="_blank" rel="noreferrer"
          >
            Blog
          </a>
          <a
            href="https://kikimora-labs.notion.site/Jobs-68acb030fcac42a18ae7c62a56779d5b"
            target="_blank" rel="noreferrer"
          >
            Jobs
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.legal}>
          <a
            href={PrivacyPolicyDoc}
            target="_blank" rel="noreferrer"
          >
            Privacy Policy
          </a>
        </div>

        <div className={styles.socials}>
          <a
            href="https://twitter.com/roketostream"
            target="_blank" rel="noreferrer"
          >
            <TwitterLogo/>
          </a>
          <a
            href="https://t.me/roketochat"
            target="_blank" rel="noreferrer"
          >
            <TelegramLogo/>
          </a>
          <a
            href="https://github.com/roke-to"
            target="_blank" rel="noreferrer"
          >
            <GithubLogo/>
          </a>
        </div>
      </section>

      <section className={styles.jurInfo}>
        ROKETO LABS LTD
        <br/>
        Registered address: Intershore Chambers, Road Town, Tortola, British Virgin Islands
        <br/>
        Registration number: 2089289
      </section>
    </Layout>
  </footer>
);
