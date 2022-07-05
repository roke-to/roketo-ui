import {format} from 'date-fns';

import {env} from '~/shared/config';

import {GithubLogo} from '@ui/icons/Github';
import {DisplayType, Logo} from '@ui/icons/Logo';
import {TelegramLogo} from '@ui/icons/Telegram';
import {TwitterLogo} from '@ui/icons/Twitter';

import PrivacyPolicyDoc from './assets/Privacy_policy.pdf';
import styles from './styles.module.scss';

const BUILD_INFO = getBuildInfo();

export function Footer() {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Logo className={styles.roketo} type={DisplayType.CURRENT_COLOR} />
        </div>
        <div className={styles.links}>
          <a href="https://www.roke.to/#page-top" target="_blank" rel="noreferrer">
            About
          </a>
          <a href={PrivacyPolicyDoc} target="_blank" rel="noreferrer">
            Privacy Policy
          </a>

          <a
            href="https://uploads-ssl.webflow.com/6136222580031d054842f5d6/617993de0d09ef005611beac_Cookie_Policy_of_Roketo.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Cookie Policy
          </a>
        </div>
        <div className={styles.socials}>
          <a href="https://github.com/roke-to" target="_blank" rel="noreferrer">
            <GithubLogo />
          </a>
          <a href="https://twitter.com/roketostream" target="_blank" rel="noreferrer">
            <TwitterLogo />
          </a>
          <a href="https://t.me/roketochat" target="_blank" rel="noreferrer">
            <TelegramLogo />
          </a>
        </div>
        <div className={styles.build}>
          <span>{BUILD_INFO}</span>
        </div>
      </div>
    </div>
  );
}

function getBuildInfo() {
  if (import.meta.env.MODE === 'development') {
    return 'Development build';
  }

  try {
    const buildDate = format(Date.parse(env.BUILD_TIME ?? new Date()), "PP 'at' p");

    return `Built from ${env.COMMIT_HASH ?? 'unknown'} at ${buildDate}`;
  } catch (error) {
    console.error(error);
    return `Build info unavailable`;
  }
}
