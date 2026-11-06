export const title = 'Authorization must remain active until execution';

export function state(v) {
  if (v.executed) return v.authorized
    ? 'Completed with active authorization'
    : 'Completed after authorization was canceled';
  if (v.authorized) return v.prepared
    ? 'Prepared and authorized'
    : 'Authorized; waiting to prepare';
  return v.prepared
    ? 'Canceled after prepare'
    : 'Canceled before prepare';
}

export function step(action) {
  return ({
    Prepare: 'Prepare the operation',
    Cancel: 'Cancel authorization',
    Execute: 'Attempt execution',
    Done: 'Operation is terminal',
  })[action] ?? action;
}
