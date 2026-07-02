// bun:ffi bindings to libvte-2.91 — the terminal widget from Xfce/GNOME.
//
// The whole reason this package exists: VTE is a real, complete terminal
// emulator (VT100/xterm/256color, hardware-accelerated with cairo/gl,
// scrollback, selection, click-to-open — all of it) that YOU DRIVE from
// outside. Unlike xterm.js, it's a native widget. Unlike QTermWidget, its
// API cleanly accepts external bytes via `vte_terminal_feed()` and emits
// child input via the `commit` signal, so you can plug in whatever process
// (or remote pty) you like.

import { dlopen, FFIType, ptr, type Pointer } from 'bun:ffi';

export const vte = dlopen('libvte-2.91.so.0', {
  // Constructor / geometry
  vte_terminal_new:                  { args: [], returns: FFIType.ptr },
  vte_terminal_set_size:             { args: [FFIType.ptr, FFIType.i64, FFIType.i64], returns: FFIType.void },
  vte_terminal_get_column_count:     { args: [FFIType.ptr], returns: FFIType.i64 },
  vte_terminal_get_row_count:        { args: [FFIType.ptr], returns: FFIType.i64 },
  vte_terminal_set_scrollback_lines: { args: [FFIType.ptr, FFIType.i64], returns: FFIType.void },

  // Byte I/O — the whole point.
  //   feed:       DISPLAY-BOUND bytes; VTE parses ANSI/xterm sequences and
  //               paints them onto the widget. Use for output coming FROM
  //               whatever process (or remote pty) you're representing.
  //   feed_child: WRITE bytes to the child stream. Callers rarely need this
  //               when driving from outside — the widget's `commit` signal
  //               already carries user keystrokes as bytes.
  vte_terminal_feed:                 { args: [FFIType.ptr, FFIType.ptr, FFIType.i64], returns: FFIType.void },
  vte_terminal_feed_child:           { args: [FFIType.ptr, FFIType.ptr, FFIType.i64], returns: FFIType.void },

  // Cosmetics
  vte_terminal_set_allow_hyperlink:  { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  vte_terminal_set_cursor_blink_mode:{ args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
} as const);

// VteCursorBlinkMode
export const VTE_CURSOR_BLINK_SYSTEM = 0;
export const VTE_CURSOR_BLINK_ON     = 1;
export const VTE_CURSOR_BLINK_OFF    = 2;

/** Feed display-bound bytes. Buffer contents are copied by VTE. */
export function vteFeed(term: Pointer, buf: Buffer): void {
  vte.symbols.vte_terminal_feed(term, ptr(buf), BigInt(buf.length));
}

/** Feed bytes into the child stream (rarely needed when driving remotely). */
export function vteFeedChild(term: Pointer, buf: Buffer): void {
  vte.symbols.vte_terminal_feed_child(term, ptr(buf), BigInt(buf.length));
}
