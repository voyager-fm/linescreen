import type { ParsedPreset, FilterParams } from './filter-params.ts';
import { parsePreset, serializePreset, PRESET_STORAGE_KEY, LEGACY_PRESET_STORAGE_KEY, sanitizePresetName } from './filter-params.ts';

/** Minimal storage surface the preset store needs (real `Storage` or a stub). */
export type PresetStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Storage surface key migration needs: the preset surface plus enumeration. */
export type PresetMigrationStorage = PresetStorage & Pick<Storage, 'key' | 'length'>;

/** Recoverable result of a storage-mutating preset operation (save/delete). */
export type PresetMutationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: 'invalid-name' }
  | { readonly ok: false; readonly error: 'duplicate'; readonly existingName: string }
  | { readonly ok: false; readonly error: 'quota' | 'storage' };

/** Result of loading or importing a preset (parse only for import). */
export type PresetLoadResult =
  | { readonly ok: true; readonly preset: ParsedPreset }
  | { readonly ok: false; readonly error: string };

/** Options for {@link savePreset}. */
export interface SavePresetOptions {
  /** Overwrite an existing preset of the same sanitized name. */
  readonly replace?: boolean;
  /** Storage backend; defaults to `localStorage`. */
  readonly storage?: PresetStorage;
}

function storageKey(name: string): string { return PRESET_STORAGE_KEY + '.' + sanitizePresetName(name); }

/**
 * One-time storage rename for the Linescreen transition: moves every
 * `coarse-grid.presets.v1*` entry (index plus per-preset payloads) to the
 * `linescreen.presets.v1*` keys and deletes the legacy keys. Idempotent and
 * best-effort — new keys are written before old keys are removed, and an
 * existing new-key entry is never overwritten.
 */
export function migrateLegacyPresetStorage(storage: PresetMigrationStorage = localStorage): void {
  try {
    const legacyPrefix = LEGACY_PRESET_STORAGE_KEY + '.';
    const legacyEntries: Array<[key: string, raw: string]> = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key !== null && key.startsWith(legacyPrefix)) legacyEntries.push([key, storage.getItem(key) ?? '']);
    }
    const legacyIndex = storage.getItem(LEGACY_PRESET_STORAGE_KEY);
    if (legacyIndex === null && legacyEntries.length === 0) return;

    const names = listPresets(storage);
    const known = new Set(names.map((n) => sanitizePresetName(n)));
    for (const [key, raw] of legacyEntries) {
      const suffix = key.slice(legacyPrefix.length);
      let displayName = suffix;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (typeof (parsed as { name?: unknown })?.name === 'string' && (parsed as { name: string }).name.trim()) displayName = (parsed as { name: string }).name.trim();
      } catch { /* fall back to the key suffix */ }
      const target = PRESET_STORAGE_KEY + '.' + suffix;
      if (storage.getItem(target) === null) storage.setItem(target, raw);
      if (!known.has(suffix)) { names.push(displayName); known.add(suffix); }
      storage.removeItem(key);
    }
    if (legacyIndex !== null) {
      try {
        const parsed: unknown = JSON.parse(legacyIndex);
        if (Array.isArray(parsed)) {
          for (const entry of parsed) {
            if (typeof entry !== 'string') continue;
            const suffix = sanitizePresetName(entry);
            if (!known.has(suffix)) { names.push(entry); known.add(suffix); }
          }
        }
      } catch { /* ignore a malformed legacy index */ }
    }
    storage.setItem(PRESET_STORAGE_KEY, JSON.stringify(names));
    if (legacyIndex !== null) storage.removeItem(LEGACY_PRESET_STORAGE_KEY);
  } catch { /* migration is best-effort; preset features keep their per-call error handling */ }
}

export function listPresets(storage: PresetStorage = localStorage): string[] {
  try {
    const raw = storage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

export function savePreset(name: string, params: FilterParams, { replace = false, storage = localStorage }: SavePresetOptions = {}): PresetMutationResult {
  try {
    const sanitized = sanitizePresetName(name); if (!sanitized) return { ok: false, error: 'invalid-name' };
    const names = listPresets(storage); const idx = names.findIndex((n) => sanitizePresetName(n) === sanitized);
    if (idx !== -1 && !replace) return { ok: false, error: 'duplicate', existingName: names[idx] };
    storage.setItem(storageKey(name), serializePreset(name, params));
    if (idx === -1) names.push(name.trim()); else names[idx] = name.trim();
    storage.setItem(PRESET_STORAGE_KEY, JSON.stringify(names));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof DOMException && e.name === 'QuotaExceededError' ? 'quota' : 'storage' };
  }
}

export function loadPreset(name: string, storage: PresetStorage = localStorage): PresetLoadResult {
  try {
    const raw = storage.getItem(storageKey(name));
    if (!raw) return { ok: false, error: 'not-found' };
    return { ok: true, preset: parsePreset(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function deletePreset(name: string, storage: PresetStorage = localStorage): PresetMutationResult {
  try {
    storage.removeItem(storageKey(name));
    const names = listPresets(storage).filter((n) => sanitizePresetName(n) !== sanitizePresetName(name));
    storage.setItem(PRESET_STORAGE_KEY, JSON.stringify(names));
    return { ok: true };
  } catch {
    return { ok: false, error: 'storage' };
  }
}

export function exportPresetJson(name: string, params: FilterParams): string { return serializePreset(name, params); }

export function importPresetJson(jsonString: string): PresetLoadResult {
  try {
    return { ok: true, preset: parsePreset(jsonString) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
