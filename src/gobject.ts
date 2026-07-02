// bun:ffi bindings to libgobject-2.0 — enough for connecting signal handlers
// and holding/releasing GObject references.

import { dlopen, FFIType } from 'bun:ffi';

export const gobject = dlopen('libgobject-2.0.so.0', {
  g_signal_connect_data: {
    args: [FFIType.ptr, FFIType.cstring, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.i32],
    returns: FFIType.u64,
  },
  g_signal_handler_disconnect: { args: [FFIType.ptr, FFIType.u64], returns: FFIType.void },
  g_object_ref:                { args: [FFIType.ptr], returns: FFIType.ptr },
  g_object_unref:              { args: [FFIType.ptr], returns: FFIType.void },
} as const);

// GConnectFlags
export const G_CONNECT_AFTER   = 1 << 0;
export const G_CONNECT_SWAPPED = 1 << 1;
