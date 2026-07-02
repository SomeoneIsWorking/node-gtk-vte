# node-gtk-vte

`bun:ffi` bindings for **GTK 3** + **VTE 2.91** + **GObject** — build native Linux terminal UIs in TypeScript with no C++ compilation and no build step. Point Bun at `libgtk-3.so.0` and `libvte-2.91.so.0` directly.

The reason this exists: VTE is a real, complete terminal emulator (VT100/xterm/256color, cursor, scrollback, selection, click-to-open, hardware-accelerated) that you can **drive from outside** via `vte_terminal_feed()`. Unlike xterm.js, it's a native widget. Unlike QTermWidget, its API cleanly accepts external bytes and emits user keystrokes as a signal — you plug in whatever process (or remote pty over a socket) you like.

## Install

```bash
bun add node-gtk-vte
# or as a submodule:
git submodule add https://github.com/SomeoneIsWorking/node-gtk-vte.git vendor/node-gtk-vte
```

Runtime prereqs (Linux):

- Bun >= 1.2
- `libgtk-3` and `libvte-2.91` installed (they come with GNOME/Xfce; on Fedora minimally: `gtk3 vte291`).

Nothing to compile. `dlopen` finds the `.so`s at runtime.

## Hello, terminal

```ts
import {
  gtk, vte, connect, cstr, anchor, vteFeed,
  GTK_WINDOW_TOPLEVEL, FFIType,
} from 'node-gtk-vte';

gtk.symbols.gtk_init(null as any, null as any);

const win = gtk.symbols.gtk_window_new(GTK_WINDOW_TOPLEVEL)!;
gtk.symbols.gtk_window_set_title(win, anchor(cstr('hello')) as any);
gtk.symbols.gtk_window_set_default_size(win, 900, 600);

const term = vte.symbols.vte_terminal_new()!;
gtk.symbols.gtk_container_add(win, term);

vteFeed(term, Buffer.from('\x1b[1;32mhello, world\x1b[0m\r\n'));

connect(win, 'destroy',
  { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  () => gtk.symbols.gtk_main_quit());

gtk.symbols.gtk_widget_show_all(win);
gtk.symbols.gtk_main();
```

Try it: `bun run examples/smoke.ts`.

## Driving a remote PTY

VTE's `commit` signal fires with the bytes the user typed (already translated — arrow keys become escape sequences, Ctrl+C is `0x03`, IME output is UTF-8). Wire it to your transport of choice:

```ts
connect(term, 'commit',
  { args: [FFIType.ptr, FFIType.cstring, FFIType.u32, FFIType.ptr], returns: FFIType.void },
  (_term, textPtr, len) => {
    const bytes = Buffer.from(new Uint8Array((textPtr as any).buffer, 0, Number(len)));
    myRemote.send({ kind: 'stdin', bytes: bytes.toString('base64') });
  });

// output bytes from the remote → VTE
myRemote.onOutput(chunk => vteFeed(term, chunk));
```

That's the entire "terminal display + input capture" surface. Everything else — tabs, notebook, buttons, close icons — is regular GTK, and this package binds enough of it (`gtk_notebook_*`, `gtk_box_*`, `gtk_label_*`, `gtk_button_*`) to build a decent tabbed terminal without pulling in extra deps.

## GTK/Bun event-loop wiring

Calling `gtk_main()` blocks Bun's async I/O forever. Two workable patterns:

**A. GTK owns the loop.** Do all your socket work inside GTK signal handlers or a `g_io_add_watch` on the fd (not exposed here yet; PR welcome).

**B. Poll GTK from Bun's loop.** Simplest for apps that already have their I/O in Bun:

```ts
async function pumpForever() {
  while (running) {
    while (gtk.symbols.gtk_events_pending()) {
      gtk.symbols.gtk_main_iteration_do(0);   // non-blocking
    }
    await new Promise(r => setTimeout(r, 10));
  }
}
```

10 ms is imperceptible for a terminal.

## The two things everyone gets wrong

**1. `FFIType.cstring` wants a NUL-terminated UTF-8 buffer, not a JS string.** Use `cstr('hello')`. Keep the returned `Buffer` alive as long as native code holds the pointer (window title, label text, tab labels). Use `anchor()` to park it in the module's GC-safe set:

```ts
gtk.symbols.gtk_window_set_title(win, anchor(cstr('cci')) as any);
```

**2. Bun's GC will happily free your `JSCallback` while GTK still has its pointer.** The next signal fires → segfault. `connect()` in `./helpers` parks each callback in a `Set` so the GC leaves it alone; call the returned `.disconnect()` to release the callback and the signal handler together.

## What's bound today

- **GTK 3**: `gtk_init`, `gtk_main`, `gtk_main_iteration_do`, `gtk_events_pending`, window (title/size/present/icon), widget show/hide/destroy/focus, container add/remove, box (new + pack_start/end), notebook (append/remove/current/n/page_num/nth/scrollable/reorderable), label (new/set_text/set_markup), button (new/label/icon/relief), menu (new/shell_append/item_new_with_label/separator).
- **VTE 2.91**: `vte_terminal_new`, `feed`, `feed_child`, `set_size`, `get_column_count`, `get_row_count`, `set_scrollback_lines`, `set_allow_hyperlink`, `set_cursor_blink_mode`.
- **GObject**: `g_signal_connect_data`, `g_signal_handler_disconnect`, `g_object_ref`, `g_object_unref`.
- **libnotify**: `notify_init`, `notify_uninit`, `notify_notification_new`/`show`/`close`/`update`/`set_urgency`/`set_timeout`, plus a `notifyShow({...})` one-shot wrapper.
- **libayatana-appindicator3**: `app_indicator_new`, `set_status`, `set_label`, `set_menu`, `set_icon`, `set_title`. Loads from either `libayatana-appindicator3.so.1` or the older `libappindicator3.so.1`; `trayAvailable` tells you whether either was found so you can degrade to no-tray gracefully.

```ts
// Notifications
import { notifyShow, NOTIFY_URGENCY_NORMAL } from 'node-gtk-vte';
notifyShow({ appName: 'my-app', summary: 'Build done',
             body: 'PASS in 8.4 s', urgency: NOTIFY_URGENCY_NORMAL });

// Tray icon (guarded)
import {
  trayAvailable, appIndicator, cstr,
  APP_INDICATOR_CATEGORY_APPLICATION_STATUS, APP_INDICATOR_STATUS_ACTIVE,
} from 'node-gtk-vte';
if (trayAvailable) {
  const { symbols: ai } = appIndicator();
  const ind = ai.app_indicator_new(cstr('my-app') as any,
    cstr('utilities-terminal') as any, APP_INDICATOR_CATEGORY_APPLICATION_STATUS)!;
  ai.app_indicator_set_status(ind, APP_INDICATOR_STATUS_ACTIVE);
  // attach a GtkMenu via ai.app_indicator_set_menu(ind, menu)
}
```

Adding a symbol is one line in the matching `dlopen({...})` block — send a PR when you hit something missing.

## Portability

Linux only. Windows and macOS need their own webview-y story (xterm.js in a webview is the usual answer there). This project won't grow those.

## License

MIT.
