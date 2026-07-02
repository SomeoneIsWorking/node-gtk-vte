// bun:ffi bindings to GTK3 — only what's proven useful for a tabbed terminal
// so far. Extend as callers need more. Every function keeps the exact upstream
// signature so C reference docs work verbatim.

import { dlopen, FFIType } from 'bun:ffi';

// GtkWindowType
export const GTK_WINDOW_TOPLEVEL = 0;
export const GTK_WINDOW_POPUP    = 1;
// GtkOrientation
export const GTK_ORIENTATION_HORIZONTAL = 0;
export const GTK_ORIENTATION_VERTICAL   = 1;
// GtkReliefStyle
export const GTK_RELIEF_NORMAL = 0;
export const GTK_RELIEF_NONE   = 1;
// GtkIconSize (menu size fits inside a tab label — everything else in the list
// is here for callers who want it)
export const GTK_ICON_SIZE_INVALID       = 0;
export const GTK_ICON_SIZE_MENU          = 1;
export const GTK_ICON_SIZE_SMALL_TOOLBAR = 2;
export const GTK_ICON_SIZE_LARGE_TOOLBAR = 3;
export const GTK_ICON_SIZE_BUTTON        = 4;
export const GTK_ICON_SIZE_DND           = 5;
export const GTK_ICON_SIZE_DIALOG        = 6;

export const gtk = dlopen('libgtk-3.so.0', {
  // App loop
  gtk_init:                     { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  gtk_main:                     { args: [], returns: FFIType.void },
  gtk_main_quit:                { args: [], returns: FFIType.void },
  gtk_main_iteration_do:        { args: [FFIType.i32], returns: FFIType.i32 },
  gtk_events_pending:           { args: [], returns: FFIType.i32 },

  // Window
  gtk_window_new:               { args: [FFIType.i32], returns: FFIType.ptr },
  gtk_window_set_title:         { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  gtk_window_set_default_size:  { args: [FFIType.ptr, FFIType.i32, FFIType.i32], returns: FFIType.void },
  gtk_window_present:           { args: [FFIType.ptr], returns: FFIType.void },
  gtk_window_set_icon_name:     { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },

  // Widget lifecycle
  gtk_widget_show_all:          { args: [FFIType.ptr], returns: FFIType.void },
  gtk_widget_show:              { args: [FFIType.ptr], returns: FFIType.void },
  gtk_widget_hide:              { args: [FFIType.ptr], returns: FFIType.void },
  gtk_widget_destroy:           { args: [FFIType.ptr], returns: FFIType.void },
  gtk_widget_grab_focus:        { args: [FFIType.ptr], returns: FFIType.void },

  // Container / box
  gtk_container_add:            { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  gtk_container_remove:         { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  gtk_box_new:                  { args: [FFIType.i32, FFIType.i32], returns: FFIType.ptr },
  gtk_box_pack_start:           { args: [FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32], returns: FFIType.void },
  gtk_box_pack_end:             { args: [FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32], returns: FFIType.void },

  // Notebook (tabs)
  gtk_notebook_new:             { args: [], returns: FFIType.ptr },
  gtk_notebook_append_page:     { args: [FFIType.ptr, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
  gtk_notebook_remove_page:     { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_notebook_set_current_page:{ args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_notebook_get_current_page:{ args: [FFIType.ptr], returns: FFIType.i32 },
  gtk_notebook_get_n_pages:     { args: [FFIType.ptr], returns: FFIType.i32 },
  gtk_notebook_page_num:        { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
  gtk_notebook_get_nth_page:    { args: [FFIType.ptr, FFIType.i32], returns: FFIType.ptr },
  gtk_notebook_set_scrollable:  { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_notebook_set_tab_reorderable: { args: [FFIType.ptr, FFIType.ptr, FFIType.i32], returns: FFIType.void },

  // Label
  gtk_label_new:                { args: [FFIType.cstring], returns: FFIType.ptr },
  gtk_label_set_text:           { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  gtk_label_set_markup:         { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },

  // Button
  gtk_button_new:                 { args: [], returns: FFIType.ptr },
  gtk_button_new_with_label:      { args: [FFIType.cstring], returns: FFIType.ptr },
  gtk_button_new_from_icon_name:  { args: [FFIType.cstring, FFIType.i32], returns: FFIType.ptr },
  gtk_button_set_relief:          { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_button_set_label:           { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
} as const);
