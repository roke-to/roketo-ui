import {Link} from 'react-router-dom';

import {BreadcrumbIcon} from './BreadcrumbIcon';
import styles from './styles.module.scss';

type BreadcrumbProps = {
  parentPage: string;
  currentPage: string;
  link: string;
};

export const Breadcrumb = ({parentPage, currentPage, link}: BreadcrumbProps) => (
  <div className={styles.breadbrumbs}>
    <Link to={link} className={styles.parentLink}>
      {parentPage}
    </Link>
    <BreadcrumbIcon className={styles.breadbrumb} />
    <span className={styles.currentPage}>{currentPage}</span>
  </div>
);
