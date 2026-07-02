// GdkPixbuf bindings — the "load an image file, scale it, hand to GtkImage"
// path. GTK's `gtk_image_new_from_file` also loads via GdkPixbuf, but doesn't
// take a size — so thumbnails need this module.
//
// `_at_scale` signature (C):
//   GdkPixbuf *gdk_pixbuf_new_from_file_at_scale(
//     const gchar *filename, gint width, gint height,
//     gboolean preserve_aspect_ratio, GError **error);
// We pass NULL for `error` — a load failure returns NULL and we fall through
// to a placeholder in the caller. Do NOT let GLib populate a GError we then
// leak.

import { dlopen, FFIType } from 'bun:ffi';

export const gdkPixbuf = dlopen('libgdk_pixbuf-2.0.so.0', {
  gdk_pixbuf_new_from_file:          { args: [FFIType.cstring, FFIType.ptr], returns: FFIType.ptr },
  gdk_pixbuf_new_from_file_at_scale: { args: [FFIType.cstring, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.ptr], returns: FFIType.ptr },
  gdk_pixbuf_get_width:              { args: [FFIType.ptr], returns: FFIType.i32 },
  gdk_pixbuf_get_height:             { args: [FFIType.ptr], returns: FFIType.i32 },
} as const);
