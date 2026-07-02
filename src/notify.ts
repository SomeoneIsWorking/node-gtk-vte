// bun:ffi bindings to libnotify — desktop notifications via
// org.freedesktop.Notifications (works on GNOME, KDE, dunst, everything).
//
// Minimal API: create, set body, set icon, show, close. Extend when needed.

import { dlopen, FFIType, type Pointer } from 'bun:ffi';
import { cstr } from './helpers.ts';

export const notify = dlopen('libnotify.so.4', {
  notify_init:                { args: [FFIType.cstring], returns: FFIType.i32 },
  notify_uninit:              { args: [], returns: FFIType.void },
  notify_is_initted:          { args: [], returns: FFIType.i32 },

  notify_notification_new:    { args: [FFIType.cstring, FFIType.cstring, FFIType.cstring],
                                returns: FFIType.ptr },
  notify_notification_show:   { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
  notify_notification_close:  { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
  notify_notification_update: { args: [FFIType.ptr, FFIType.cstring, FFIType.cstring, FFIType.cstring],
                                returns: FFIType.i32 },
  notify_notification_set_urgency: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  notify_notification_set_timeout: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
} as const);

// NotifyUrgency
export const NOTIFY_URGENCY_LOW      = 0;
export const NOTIFY_URGENCY_NORMAL   = 1;
export const NOTIFY_URGENCY_CRITICAL = 2;

// NotifyNotificationTimeout
export const NOTIFY_EXPIRES_DEFAULT = -1;
export const NOTIFY_EXPIRES_NEVER   = 0;

let inited = false;
function ensureInit(appName: string) {
  if (inited) return;
  const name = cstr(appName);
  notify.symbols.notify_init(name as any);
  inited = true;
}

/**
 * Fire a one-shot desktop notification. Returns the underlying Notification
 * pointer so callers can update/close it later if they wish; pass null on
 * failure. First call auto-initializes libnotify with `appName`.
 */
export function notifyShow(opts: {
  appName: string;
  summary: string;
  body?: string;
  icon?: string;
  urgency?: number;
  timeoutMs?: number;
}): Pointer | null {
  ensureInit(opts.appName);
  const summary = cstr(opts.summary);
  const body = cstr(opts.body ?? '');
  const icon = cstr(opts.icon ?? '');
  const n = notify.symbols.notify_notification_new(summary as any, body as any, icon as any);
  if (!n) return null;
  if (opts.urgency !== undefined) {
    notify.symbols.notify_notification_set_urgency(n, opts.urgency);
  }
  if (opts.timeoutMs !== undefined) {
    notify.symbols.notify_notification_set_timeout(n, opts.timeoutMs);
  }
  notify.symbols.notify_notification_show(n, null as any);
  return n;
}
