import React from 'react';

import {Layout} from '@uikit/components/Layout';

import styles from './styles.module.scss';

export const MyStreamsPage = () => {
  const a = 'My streams Page';
  return (
    <div className={styles.root}>
      <Layout>
        {a}
      </Layout>
    </div>

  );
};

export default MyStreamsPage;

