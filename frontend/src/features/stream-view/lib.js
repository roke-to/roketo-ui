export function streamDirection({stream, account}) {
  if (!account) return '';

  if (stream.owner_id === account.account_id) {
    return 'out';
  } else if (stream.receiver_id === account.account_id) {
    return 'in';
  } else {
    return '';
  }
}
