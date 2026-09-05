const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { test } = require('node:test');

function load(relative, dependencies = {}) {
  const filename = path.join(__dirname, '..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => dependencies[name] ?? require(name), module, module.exports);
  return module.exports;
}
const utils = load('src/utils/execution.ts');
const { protocolSteps } = load('src/constants/cim-cbm-protocol.ts');
const activeKey = '@sciflow:active-execution';
const historyKey = '@sciflow:history';
function fixture(protocolId = 'cim-cbm') {
  return { id: 'test-1', protocolId, protocolName: protocolId, status: 'in_progress', startedAt: '2026-09-05T12:00:00Z', updatedAt: '2026-09-05T12:00:00Z', currentStepIndex: 0, notes: {}, timers: {}, completedSteps: [] };
}
function storage(initial = {}) {
  const data = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]));
  let failKey;
  const fake = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => { if (key === failKey) throw new Error('disk full'); data.set(key, value); },
    removeItem: async key => { if (key === failKey) throw new Error('disk full'); data.delete(key); },
  };
  const service = load('src/services/storage.ts', { '@react-native-async-storage/async-storage': fake });
  return { service, data, fail: key => { failKey = key; } };
}

test('all ten sections preserve the supplied POP including formulas and caveats', () => {
  const source = fs.readFileSync(path.join(__dirname, '../docs/pop-cim-cbm.txt'), 'utf8').replaceAll('\r\n', '\n');
  assert.equal(protocolSteps.length, 10);
  for (let i = 0; i < protocolSteps.length; i++) {
    const step = protocolSteps[i];
    const header = `${i + 1}. ${step.title}\n`;
    const start = source.indexOf(header) + header.length;
    const end = i < 9 ? source.indexOf(`${i + 2}. ${protocolSteps[i + 1].title}\n`) : source.length;
    const original = source.slice(start, end).replace(/\n---\s*$/, '').trim()
      .replace('[\nUFC/mL=\\frac{\\text{nº de colônias}}{\\text{volume semeado (mL)}\\times\\text{diluição}}\n]', 'UFC/mL = nº de colônias / (volume semeado em mL × diluição)')
      .replace('[\nL=N_0\\times0,1\\times0,001\n]', 'L = N₀ × 0,1 × 0,001').replaceAll('\uE001N_0\uE001', 'N₀');
    assert.equal(step.instruction, original);
  }
});
test('preparation numbers reject invalid values and respect decimal commas', () => {
  for (const value of ['', ' ', 'NaN', 'Infinity', '-2', '0', '1,2.3', '2ml', '1e309']) assert.equal(utils.parsePositive(value), null);
  assert.equal(utils.parsePositive('0,85'), 0.85);
  assert.equal(utils.mediumMass(100, 38), 3.8);
  assert.equal(utils.mediumMass(500, 21), 10.5);
  assert.equal(utils.mediumMass(100, 8.5), 0.85);
});
test('timer follows wall time across screen changes, pause and expiry', () => {
  assert.equal(utils.remainingSeconds({ isRunning: true, endAt: 100000, remainingSeconds: 90 }, 40000), 60);
  assert.equal(utils.remainingSeconds({ isRunning: true, endAt: 100000, remainingSeconds: 90 }, 110000), 0);
  assert.equal(utils.remainingSeconds({ isRunning: false, endAt: null, remainingSeconds: 37 }, 110000), 37);
  assert.equal(utils.formatTime(24 * 3600 + 1), '24:00:01');
});
test('legacy active execution is archived once without overwriting completed history', async () => {
  const legacy = { ...fixture('cfs'), notes: { old: 'preserve me' }, numberOfCultures: 4 };
  const completed = { ...fixture(), id: 'older', status: 'completed' };
  const { service } = storage({ [activeKey]: legacy, [historyKey]: [completed] });
  assert.equal(await service.getActiveExecution(), null);
  assert.equal(await service.getActiveExecution(), null);
  const history = await service.getHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].status, 'archived');
  assert.equal(history[0].notes.old, 'preserve me');
  assert.equal(history[0].numberOfCultures, 4);
  assert.deepEqual(history[1], completed);
});
test('failed migration leaves original active data untouched and can be retried', async () => {
  const legacy = fixture('cfs');
  const { service, data, fail } = storage({ [activeKey]: legacy });
  fail(historyKey);
  await assert.rejects(service.getActiveExecution());
  assert.deepEqual(JSON.parse(data.get(activeKey)), legacy);
  fail(null);
  assert.equal(await service.getActiveExecution(), null);
});
test('concurrent notes, timers and result writes all survive reload', async () => {
  const { service } = storage();
  await service.startExecution(fixture());
  await Promise.all([
    service.updateExecution('test-1', record => ({ ...record, notes: { ...record.notes, first: 'note' } })),
    service.updateExecution('test-1', record => ({ ...record, timers: { ...record.timers, first: { isRunning: true, endAt: Date.now() + 60000, remainingSeconds: 60 } } })),
    service.updateExecution('test-1', record => ({ ...record, results: { mic: 'registered result' } })),
  ]);
  const restored = await service.getActiveExecution();
  assert.equal(restored.notes.first, 'note');
  assert.equal(restored.results.mic, 'registered result');
  assert.equal(restored.timers.first.isRunning, true);
  await assert.rejects(service.startExecution({ ...fixture(), id: 'new' }));
  await assert.rejects(service.updateExecution('stale-id', record => record));
});
test('finalization saves all records before clearing active and stops timers', async () => {
  const record = { ...fixture(), results: { controls: 'not adequate' }, notes: { first: 'keep' }, timers: { first: { isRunning: true, endAt: Date.now() + 60000, remainingSeconds: 60 } } };
  const { service, fail } = storage({ [activeKey]: record });
  fail(historyKey);
  await assert.rejects(service.finishExecution(record.id));
  assert.equal((await service.getActiveExecution()).notes.first, 'keep');
  fail(null);
  await service.finishExecution(record.id);
  assert.equal(await service.getActiveExecution(), null);
  const history = await service.getHistory();
  assert.equal(history[0].status, 'completed');
  assert.equal(history[0].results.controls, 'not adequate');
  assert.equal(history[0].timers.first.isRunning, false);
});
test('retrying after a failed clear does not duplicate history', async () => {
  const { service, fail } = storage({ [activeKey]: fixture() });
  fail(activeKey);
  await assert.rejects(service.finishExecution('test-1'));
  fail(null);
  await service.finishExecution('test-1');
  assert.equal((await service.getHistory()).length, 1);
});
