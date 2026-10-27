import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  LEGACY_PRESET_STORAGE_KEY,
  PRESET_STORAGE_KEY,
  DEFAULT_FILTER_PARAMS,
  serializePreset,
} from '../src/filter-params.ts';
import {
  migrateLegacyPresetStorage,
  listPresets,
  loadPreset,
  type PresetMigrationStorage,
} from '../src/preset-store.ts';

/** In-memory Storage stub covering the migration surface. */
function stubStorage(initial: Record<string, string> = {}): PresetMigrationStorage & { dump(): Record<string, string> } {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key: string, value: string) => { map.set(key, String(value)); },
    removeItem: (key: string) => { map.delete(key); },
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() { return map.size; },
    dump: () => Object.fromEntries(map.entries()),
  };
}

test('migrateLegacyPresetStorage moves legacy presets to the linescreen keys and removes the old ones', () => {
  const payload = serializePreset('My Look', DEFAULT_FILTER_PARAMS);
  const storage = stubStorage({
    [LEGACY_PRESET_STORAGE_KEY]: JSON.stringify(['My Look']),
    [`${LEGACY_PRESET_STORAGE_KEY}.My_Look`]: payload,
  });

  migrateLegacyPresetStorage(storage);

  const dump = storage.dump();
  assert.deepEqual(Object.keys(dump).sort(), [PRESET_STORAGE_KEY, `${PRESET_STORAGE_KEY}.My_Look`]);
  assert.equal(dump[`${PRESET_STORAGE_KEY}.My_Look`], payload);
  assert.deepEqual(listPresets(storage), ['My Look']);
  const loaded = loadPreset('My Look', storage);
  assert.ok(loaded.ok);
});

test('migrateLegacyPresetStorage is a no-op when no legacy keys exist', () => {
  const storage = stubStorage({
    [PRESET_STORAGE_KEY]: JSON.stringify(['Existing']),
    [`${PRESET_STORAGE_KEY}.Existing`]: serializePreset('Existing', DEFAULT_FILTER_PARAMS),
  });
  const before = storage.dump();

  migrateLegacyPresetStorage(storage);

  assert.deepEqual(storage.dump(), before);
});

test('migrateLegacyPresetStorage never overwrites an already-migrated preset', () => {
  const legacyPayload = serializePreset('Clash', { ...DEFAULT_FILTER_PARAMS, posterization: 0.1 });
  const newPayload = serializePreset('Clash', { ...DEFAULT_FILTER_PARAMS, posterization: 0.9 });
  const storage = stubStorage({
    [LEGACY_PRESET_STORAGE_KEY]: JSON.stringify(['Clash']),
    [`${LEGACY_PRESET_STORAGE_KEY}.Clash`]: legacyPayload,
    [`${PRESET_STORAGE_KEY}.Clash`]: newPayload,
  });

  migrateLegacyPresetStorage(storage);

  const dump = storage.dump();
  assert.equal(dump[`${PRESET_STORAGE_KEY}.Clash`], newPayload);
  assert.ok(!(`${LEGACY_PRESET_STORAGE_KEY}.Clash` in dump));
  assert.ok(!(LEGACY_PRESET_STORAGE_KEY in dump));
});

test('migrateLegacyPresetStorage is idempotent across repeated runs', () => {
  const storage = stubStorage({
    [LEGACY_PRESET_STORAGE_KEY]: JSON.stringify(['My Look']),
    [`${LEGACY_PRESET_STORAGE_KEY}.My_Look`]: serializePreset('My Look', DEFAULT_FILTER_PARAMS),
  });

  migrateLegacyPresetStorage(storage);
  const afterFirst = storage.dump();
  migrateLegacyPresetStorage(storage);

  assert.deepEqual(storage.dump(), afterFirst);
  assert.deepEqual(listPresets(storage), ['My Look']);
});

test('migrateLegacyPresetStorage recovers display names from payloads and tolerates a malformed legacy index', () => {
  const storage = stubStorage({
    [LEGACY_PRESET_STORAGE_KEY]: 'not json',
    [`${LEGACY_PRESET_STORAGE_KEY}.Second_Look`]: serializePreset('Second Look', DEFAULT_FILTER_PARAMS),
  });

  migrateLegacyPresetStorage(storage);

  assert.deepEqual(listPresets(storage), ['Second Look']);
  assert.ok(loadPreset('Second Look', storage).ok);
  assert.ok(!(LEGACY_PRESET_STORAGE_KEY in storage.dump()));
});

test('migrateLegacyPresetStorage merges legacy presets with presets already saved under the new keys', () => {
  const storage = stubStorage({
    [PRESET_STORAGE_KEY]: JSON.stringify(['New Look']),
    [`${PRESET_STORAGE_KEY}.New_Look`]: serializePreset('New Look', DEFAULT_FILTER_PARAMS),
    [LEGACY_PRESET_STORAGE_KEY]: JSON.stringify(['Old Look']),
    [`${LEGACY_PRESET_STORAGE_KEY}.Old_Look`]: serializePreset('Old Look', DEFAULT_FILTER_PARAMS),
  });

  migrateLegacyPresetStorage(storage);

  assert.deepEqual(listPresets(storage), ['New Look', 'Old Look']);
  assert.ok(loadPreset('New Look', storage).ok);
  assert.ok(loadPreset('Old Look', storage).ok);
});
