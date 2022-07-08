import chalk from 'chalk';
import {execSync} from 'child_process';

import {testIds} from './src/shared/constants';

const testIdsArray = Object.keys(testIds);

const IS_UNUSED = true;

const unusedTestIds = testIdsArray.filter((testId) => {
  try {
    execSync(`grep -r testIds.${testId} src`);
    return !IS_UNUSED;
  } catch {
    return IS_UNUSED;
  }
});

if (unusedTestIds.length > 0) {
  console.error(
    chalk.bold.redBright(
      `There are unused testIds in src/shared/constants: ${unusedTestIds.join(
        ', ',
      )}. It may be a regression, or they should be deleted if obsolete.`,
    ),
  );
  process.exit(1);
}
