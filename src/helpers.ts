// Ergonomic wrappers over the raw FFI. These solve the two things every caller
// gets wrong on the first try:
//
//   1. FFIType.cstring wants a NUL-terminated UTF-8 buffer, NOT a JS string.
//      cstr() gives you one; keep it alive as long as native code holds the
//      pointer (labels, window titles) — see the anchor pattern below.
//
//   2. bun's GC has no idea native code is still using a JSCallback or a
//      char* buffer. If it collects them, the next GTK signal or property
//      access segfaults. connect() and anchor() park those references in a
//      module-level Set so the GC leaves them alone.

import { JSCallback, type FFIType, type CString, type Pointer } from 'bun:ffi';
import { gobject } from './gobject.ts';

/** UTF-8 NUL-terminated buffer suitable for FFIType.cstring. */
export function cstr(s: string): Buffer {
  return Buffer.from(s + '\0', 'utf8');
}

// Anchors: anything we've handed to native code lives here so bun's GC can't
// reclaim it. Long-lived by design; a call site that needs release semantics
// should manage its own set instead.
const liveCallbacks = new Set<JSCallback>();
const liveAnchors: unknown[] = [];

/** Keep a JS-side reference alive forever — for cstr buffers whose pointer
 *  GTK will read across ticks (window title, label text set once, tab labels). */
export function anchor<T>(x: T): T { liveAnchors.push(x); return x; }

export interface SignalHandle {
  disconnect(): void;
}

/**
 * Connect a signal handler with GC-safe callback lifetime.
 *
 *   const h = connect(button, 'clicked',
 *     { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
 *     () => console.log('clicked'));
 *
 *   // when you're done with the widget:
 *   h.disconnect();
 *
 * You MUST match the C signal's argument list in fnDesc — the wrong shape
 * silently corrupts the stack and eventually crashes.
 */
export function connect(
  instance: Pointer,
  signal: string,
  fnDesc: { args: FFIType[]; returns: FFIType },
  fn: (...args: unknown[]) => unknown,
): SignalHandle {
  const cb = new JSCallback(fn, fnDesc);
  liveCallbacks.add(cb);
  const sigName = cstr(signal);
  const handlerId = gobject.symbols.g_signal_connect_data(
    instance, sigName as unknown as CString, cb.ptr, null as any, null as any, 0);
  return {
    disconnect() {
      gobject.symbols.g_signal_handler_disconnect(instance, handlerId);
      liveCallbacks.delete(cb);
      cb.close();
    },
  };
}
