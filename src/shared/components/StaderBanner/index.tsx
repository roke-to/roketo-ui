import {RoketoLogoIcon} from './RoketoLogoIcon';
import {StaderLogoIcon} from './StaderLogoIcon';
import styles from './styles.module.scss';

export const StaderBanner = ({onClick}: {onClick?: (event: any) => void}) => (
  <div className={styles.layout}>
    <RoketoLogoIcon />
    <span className={styles.symbol}>+</span>
    <StaderLogoIcon />

    <div className={styles.text}>
      Glad to anounce our partnership with&nbsp;
      <a className={styles.link} href="https://staderlabs.com/" target="_blank" rel="noreferrer">
        Stader — a multichain staking platform
      </a>
    </div>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
    <span className={styles.close} onClick={onClick} />
  </div>
);
