# Project state

## Current focus

S005 is the current focus.

## Capability inventory

| ID | Capability or outcome | State | Factual dependency | Goals |
| --- | --- | --- | --- | --- |
| S001 | Bun loads GTK 3, VTE 2.91, and GObject directly and can construct a native terminal window | partial | — | G001 |
| S002 | Applications can feed terminal output and receive translated user input bytes | partial | S001 | G001 |
| S003 | GTK window, container, notebook, label, button, menu, image, overlay, alignment, and CSS bindings support application composition | partial | S001 | G001 |
| S004 | Helpers retain native strings and callbacks and release connected handlers explicitly | partial | S001 | G001 |
| S005 | Automated controls verify the FFI surface, lifecycle helpers, and failure behavior on a real Linux runtime | missing | S001, S002, S003, S004 | G001 |

## Capability details

### S001 — Native GTK/VTE construction

The package and `examples/smoke.ts` open the documented shared libraries and construct a GTK window
containing a VTE terminal without a compiled addon.

Gap: this path is demonstrated by an example and consumer use but has no automated real-runtime gate.

### S002 — Terminal transport seam

`vteFeed` routes external bytes into VTE and the documented `commit` signal delivers translated UTF-8
and terminal control bytes to the application's own transport.

Gap: terminal input/output behavior and VTE-inherited protocol capabilities are not independently tested
by this package.

### S003 — UI composition bindings

The exported FFI tables cover the documented GTK composition, tray, notification, image, overlay,
event-box, alignment, and CSS surfaces used by the extracted consumer.

Gap: symbol availability, optional-library refusal, and widget lifecycle behavior lack runtime controls.

### S004 — Native lifetime helpers

`cstr`, `anchor`, and `connect` keep NUL strings and callbacks alive and expose explicit signal
disconnect behavior instead of relying on Bun garbage-collector timing.

Gap: callback retention, disconnect, and native object lifetime behavior are not stress-tested against
Bun garbage collection.

### S005 — Runtime verification

Missing capability: the repository has no automated positive and negative runtime suite that exercises
symbol loading, callback retention/disconnect, invalid library availability, and terminal input/output
through the shipping bindings.
