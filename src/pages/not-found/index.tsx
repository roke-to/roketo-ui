import {Button, DisplayMode as ButtonDisplayMode} from '@ui/components/Button';

import styles from './styles.module.scss';

export function NotFoundPage() {
  return (
    <div className={styles.root}>
      <div className={styles.big404}>
        4<span className={styles.big0}>0</span>4
      </div>
      <div className={styles.pageNotFound}>Page not found</div>
      <div className={styles.weAreSorry}>
        We're sorry the page
        <br />
        you requested was not found.
      </div>
      <Button
        className={styles.backButton}
        displayMode={ButtonDisplayMode.action}
        onClick={() => window.history.back()}
      >
        Back
      </Button>
    </div>
  );
}
