// Smoke: shows a GTK window with a VTE inside, fed some colored bytes so you
// can verify the FFI, GC discipline, and terminal rendering all work.
// Run with: bun run examples/smoke.ts
//
// No PTY. The whole point is that VTE renders any bytes you feed it; where
// they come from is your problem, not the widget's.

import {
  gtk, vte, connect, cstr, anchor, vteFeed,
  GTK_WINDOW_TOPLEVEL,
  FFIType,
} from '../src/index.ts';

gtk.symbols.gtk_init(null as any, null as any);

const win = gtk.symbols.gtk_window_new(GTK_WINDOW_TOPLEVEL)!;
gtk.symbols.gtk_window_set_title(win, anchor(cstr('node-gtk-vte smoke')) as any);
gtk.symbols.gtk_window_set_default_size(win, 900, 600);

const term = vte.symbols.vte_terminal_new()!;
vte.symbols.vte_terminal_set_scrollback_lines(term, -1n);
gtk.symbols.gtk_container_add(win, term);

vteFeed(term, Buffer.from(
  '\x1b[1;32m*** node-gtk-vte smoke ***\x1b[0m\r\n' +
  'if you can read this in \x1b[36mcyan\x1b[0m,\r\n' +
  'the FFI, GC discipline, and terminal rendering all work.\r\n' +
  '\r\nclose the window to exit.\r\n', 'utf8'));

connect(win, 'destroy',
  { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  () => gtk.symbols.gtk_main_quit());

gtk.symbols.gtk_widget_show_all(win);
gtk.symbols.gtk_main();
