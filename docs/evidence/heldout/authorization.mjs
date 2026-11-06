// Synthetic implementations of the supplied semantics, not production code.
// Every operation respects the requested completed-operation terminal boundary.
export const initialState = () => ({ authorized: true, prepared: false, executed: false });

export function prepare(state) {
  if (state.executed) return;
  if (state.authorized) state.prepared = true;
}

export function cancel(state) {
  if (state.executed) return;
  state.authorized = false;
}

export function executeA(state) {
  if (state.executed) return;
  if (state.prepared) state.executed = true;
}

export function executeB(state) {
  if (state.executed) return;
  if (state.prepared && state.authorized) state.executed = true;
}
