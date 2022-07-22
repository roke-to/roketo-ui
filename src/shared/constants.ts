export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
export const SECONDS_IN_MONTH = SECONDS_IN_WEEK * 4;
export const SECONDS_IN_YEAR = SECONDS_IN_MONTH * 12;

export enum TimePeriod {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
}

export const TIME_PERIOD_SIGNS = {
  [TimePeriod.Hour]: '/h',
  [TimePeriod.Day]: '/d',
  [TimePeriod.Minute]: '/m',
  [TimePeriod.Second]: '/s',
};

export const testIds = {
  signInButton: 'signInButton',
  signOutButton: 'signOutButton',
  availableForWithdrawalCaption: 'availableForWithdrawalCaption',
  withdrawAllButton: 'withdrawAllButton',
  createStreamButton: 'createStreamButton',
  withdrawButton: 'withdrawButton',
  withdrawTooltip: 'withdrawTooltip',
  withdrawLoadingCaption: 'withdrawLoadingCaption',
  streamProgressCaption: 'streamProgressCaption',
  streamControlsDropdown: 'streamControlsDropdown',
  streamStartButton: 'streamStartButton',
  streamPauseButton: 'streamPauseButton',
  streamStopButton: 'streamStopButton',
  streamModalStopButton: 'streamModalStopButton',
  createStreamReceiverInput: 'createStreamReceiverInput',
  createStreamAmountInput: 'createStreamAmountInput',
  createStreamMonthsInput: 'createStreamMonthsInput',
  createStreamDaysInput: 'createStreamDaysInput',
  createStreamHoursInput: 'createStreamHoursInput',
  createStreamMinutesInput: 'createStreamMinutesInput',
  createStreamCommentInput: 'createStreamCommentInput',
  createStreamDelayedCheckbox: 'createStreamDelayedCheckbox',
  createStreamLockedCheckbox: 'createStreamLockedCheckbox',
  createStreamCancelButton: 'createStreamCancelButton',
  createStreamSubmitButton: 'createStreamSubmitButton',
  openNotificationsButton: 'openNotificationsButton',
  notificationsLoader: 'notificationsLoader',
  notificationsContainer: 'notificationsContainer',
  addFunds: 'addFunds',
  addFundsSubmit: 'addFundsSubmit',
} as const;

const testIdsKeys = Object.keys(testIds) as Array<keyof typeof testIds>;

export const testSelectors = testIdsKeys.reduce(
  (selectors, key) => ({...selectors, [key]: `[data-testid="${testIds[key]}"]`}),
  {} as Record<keyof typeof testIds, string>,
);
