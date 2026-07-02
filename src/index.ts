// Public API surface. Callers usually want:
//   import { gtk, vte, cstr, connect, vteFeed } from 'node-gtk-vte';

export * from './gtk.ts';
export * from './gdkpixbuf.ts';
export * from './vte.ts';
export * from './gobject.ts';
export * from './helpers.ts';
export * from './notify.ts';
export * from './appindicator.ts';

// Re-export the FFI types callers need for signal descriptors, so they don't
// each have to import from 'bun:ffi' too.
export { FFIType, JSCallback, ptr } from 'bun:ffi';
export type { Pointer, CString } from 'bun:ffi';
