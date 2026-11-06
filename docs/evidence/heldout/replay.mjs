import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialState, prepare, cancel, executeA, executeB } from './authorization.mjs';

const holds = state => !state.executed || state.authorized;
const snapshot = state => ({ ...state });
const records = [];
const originalTlc = readFileSync(new URL('./result-A/tlc.out', import.meta.url), 'utf8');
const trace = [...originalTlc.matchAll(/^State (\d+): <([^\n]+)>\n([\s\S]*?)(?=\nState \d+:|\n\d+ states generated)/gm)]
  .map(([, number, description, body]) => ({
    number: Number(number),
    action: description.startsWith('Initial predicate') ? 'Init' : description.split(' ')[0],
    state: Object.fromEntries([...body.matchAll(/\/\\ (\w+) = (TRUE|FALSE)/g)]
      .map(([, name, value]) => [name, value === 'TRUE'])),
  }));
assert.equal(trace.length, 4, 'Expected initial state and every reported counterexample step');
assert.deepEqual(trace.map(step => step.action), ['Init', 'Prepare', 'Cancel', 'Execute']);
const a = initialState();
const aActions = { Prepare: prepare, Cancel: cancel, Execute: executeA };
for (const step of trace) {
  if (step.action !== 'Init') aActions[step.action](a);
  assert.deepEqual(a, step.state, `Implementation A must match TLC state ${step.number}`);
  records.push({ scenario: 'A exact TLC replay', modelState: step.number, action: step.action, state: snapshot(a), ruleHolds: holds(a) });
}
assert.equal(holds(a), false, 'The counterexample must reproduce unauthorized execution');

function guardedScenario(name, actions, expected) {
  const state = initialState();
  const functions = { Prepare: prepare, Cancel: cancel, Execute: executeB };
  records.push({ scenario: name, action: 'Init', state: snapshot(state), ruleHolds: holds(state) });
  for (const action of actions) {
    functions[action](state);
    assert.equal(holds(state), true, `${name}: authorization invariant after ${action}`);
    records.push({ scenario: name, action, state: snapshot(state), ruleHolds: holds(state) });
  }
  assert.deepEqual(state, expected, name);
}
guardedScenario('B same counterexample actions', trace.slice(1).map(step => step.action),
  { authorized: false, prepared: true, executed: false });
guardedScenario('B successful operation stays terminal', ['Prepare', 'Execute', 'Cancel', 'Prepare', 'Execute'],
  { authorized: true, prepared: true, executed: true });
guardedScenario('B cancellation before preparation', ['Cancel', 'Prepare', 'Execute'],
  { authorized: false, prepared: false, executed: false });
guardedScenario('B execution requires preparation', ['Execute'],
  { authorized: true, prepared: false, executed: false });
console.log(JSON.stringify({ status: 'passed', counterexampleSource: 'result-A/tlc.out', replay: records }, null, 2));
