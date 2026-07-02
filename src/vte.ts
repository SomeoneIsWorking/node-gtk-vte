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

  // Regex-based click-to-open. Register a PCRE2 pattern with the terminal;
  // on each button press, ask VTE whether the click landed on a match, and
  // if so it returns the matched string (`g_free`d by the caller).
  //
  // See `vte/vte.h` — `vte_terminal_match_add_regex` returns a `tag`, which
  // you can use to distinguish matches when you have several patterns.
  vte_regex_new_for_match:           { args: [FFIType.cstring, FFIType.i64, FFIType.u32, FFIType.ptr], returns: FFIType.ptr },
  vte_regex_unref:                   { args: [FFIType.ptr], returns: FFIType.ptr },
  vte_terminal_match_add_regex:      { args: [FFIType.ptr, FFIType.ptr, FFIType.u32], returns: FFIType.i32 },
  vte_terminal_match_check_event:    { args: [FFIType.ptr, FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
  vte_terminal_match_set_cursor_name:{ args: [FFIType.ptr, FFIType.i32, FFIType.cstring], returns: FFIType.void },
} as const);

// PCRE2 compile-time flags relevant to `vte_regex_new_for_match`. `MULTILINE`
// makes `^`/`$` line-anchored (the terminal buffer is one long stream) and
// `CASELESS` gives case-insensitive matching. Neither is required for the
// image pattern but callers usually want at least MULTILINE.
export const PCRE2_CASELESS  = 0x00000008;
export const PCRE2_MULTILINE = 0x00000400;
export const PCRE2_UTF       = 0x00080000;

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
