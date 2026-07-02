// bun:ffi bindings to libayatana-appindicator3 — modern SNI-based tray icons
// (KDE, XFCE, GNOME with the extension, sway with waybar).
//
// The library ships with different soname on some distros
// (libappindicator3 vs libayatana-appindicator3). We try Ayatana first,
// fall back to the older name. If neither is installed, callers get
// `TrayLibraryMissing` and can degrade gracefully — a tabbed terminal
// shouldn't refuse to run just because the tray backend is absent.

import { dlopen, FFIType, type FFIFunction } from 'bun:ffi';

// AppIndicatorCategory
export const APP_INDICATOR_CATEGORY_APPLICATION_STATUS = 0;
export const APP_INDICATOR_CATEGORY_COMMUNICATIONS     = 1;
export const APP_INDICATOR_CATEGORY_SYSTEM_SERVICES    = 2;
export const APP_INDICATOR_CATEGORY_HARDWARE           = 3;
export const APP_INDICATOR_CATEGORY_OTHER              = 4;

// AppIndicatorStatus
export const APP_INDICATOR_STATUS_PASSIVE  = 0;
export const APP_INDICATOR_STATUS_ACTIVE   = 1;
export const APP_INDICATOR_STATUS_ATTENTION = 2;

const SYMBOLS: Record<string, FFIFunction> = {
  app_indicator_new: {
    args: [FFIType.cstring, FFIType.cstring, FFIType.i32], returns: FFIType.ptr,
  },
  app_indicator_set_status: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  app_indicator_set_label:  {
    args: [FFIType.ptr, FFIType.cstring, FFIType.cstring], returns: FFIType.void,
  },
  app_indicator_set_menu:   { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  app_indicator_set_icon:   { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  app_indicator_set_title:  { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
};

export class TrayLibraryMissing extends Error {
  constructor() { super('neither libayatana-appindicator3.so.1 nor libappindicator3.so.1 is available'); }
}

function tryLoad() {
  for (const name of ['libayatana-appindicator3.so.1', 'libappindicator3.so.1']) {
    try { return dlopen(name, SYMBOLS as any); }
    catch { /* try next */ }
  }
  return null;
}

const loaded = tryLoad();

/** True when a supported tray library is present. Check before touching
 *  `appIndicator` — the getter throws when nothing is loaded, on purpose. */
export const trayAvailable: boolean = loaded !== null;

/** Underlying dlopen result, or throws TrayLibraryMissing if unavailable. */
export function appIndicator() {
  if (!loaded) throw new TrayLibraryMissing();
  return loaded;
}
