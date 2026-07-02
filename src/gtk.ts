// bun:ffi bindings to GTK3 — only what's proven useful for a tabbed terminal
// so far. Extend as callers need more. Every function keeps the exact upstream
// signature so C reference docs work verbatim.

import { dlopen, FFIType } from 'bun:ffi';

// GtkPolicyType (scrolled window scroll-bar policies)
export const GTK_POLICY_ALWAYS    = 0;
export const GTK_POLICY_AUTOMATIC = 1;
export const GTK_POLICY_NEVER     = 2;
export const GTK_POLICY_EXTERNAL  = 3;
// GtkAlign
export const GTK_ALIGN_FILL     = 0;
export const GTK_ALIGN_START    = 1;
export const GTK_ALIGN_END      = 2;
export const GTK_ALIGN_CENTER   = 3;
export const GTK_ALIGN_BASELINE = 4;
// GtkStyleProvider priorities
export const GTK_STYLE_PROVIDER_PRIORITY_FALLBACK    = 1;
export const GTK_STYLE_PROVIDER_PRIORITY_THEME       = 200;
export const GTK_STYLE_PROVIDER_PRIORITY_SETTINGS    = 400;
export const GTK_STYLE_PROVIDER_PRIORITY_APPLICATION = 600;
export const GTK_STYLE_PROVIDER_PRIORITY_USER        = 800;
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
  gtk_widget_set_size_request:  { args: [FFIType.ptr, FFIType.i32, FFIType.i32], returns: FFIType.void },
  gtk_widget_set_tooltip_text:  { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },

  // Image (GdkPixbuf-backed; supports PNG/JPEG/etc through gdk-pixbuf loaders)
  gtk_image_new:                { args: [], returns: FFIType.ptr },
  gtk_image_new_from_pixbuf:    { args: [FFIType.ptr], returns: FFIType.ptr },
  gtk_image_new_from_file:      { args: [FFIType.cstring], returns: FFIType.ptr },
  gtk_image_set_from_file:      { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  gtk_image_set_from_pixbuf:    { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },

  // Overlay + event box for an in-window modal-style viewer. GtkOverlay
  // stacks child widgets over a base child; GtkEventBox gives an otherwise
  // invisible container something to catch button-press-events on (used for
  // click-outside-to-dismiss and for eating clicks on the image itself).
  gtk_overlay_new:              { args: [], returns: FFIType.ptr },
  gtk_overlay_add_overlay:      { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  gtk_event_box_new:            { args: [], returns: FFIType.ptr },

  // Alignment / expand — needed for centering the image and packing the
  // carousel across the bottom of the overlay.
  gtk_widget_set_halign:        { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_widget_set_valign:        { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_widget_set_hexpand:       { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_widget_set_vexpand:       { args: [FFIType.ptr, FFIType.i32], returns: FFIType.void },
  gtk_widget_set_name:          { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  gtk_widget_get_allocated_width:  { args: [FFIType.ptr], returns: FFIType.i32 },
  gtk_widget_get_allocated_height: { args: [FFIType.ptr], returns: FFIType.i32 },

  // CSS provider — the only sane way to give a widget a translucent
  // background in GTK3. Load a stylesheet keyed on widget names we set
  // via gtk_widget_set_name, then attach to the affected style context.
  gtk_css_provider_new:               { args: [], returns: FFIType.ptr },
  gtk_css_provider_load_from_data:    { args: [FFIType.ptr, FFIType.cstring, FFIType.i64, FFIType.ptr], returns: FFIType.i32 },
  gtk_widget_get_style_context:       { args: [FFIType.ptr], returns: FFIType.ptr },
  gtk_style_context_add_provider:     { args: [FFIType.ptr, FFIType.ptr, FFIType.u32], returns: FFIType.void },
  gtk_style_context_add_class:        { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  gtk_style_context_remove_class:     { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },

  // Scrolled window (for a horizontal thumbnail strip)
  gtk_scrolled_window_new:      { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
  gtk_scrolled_window_set_policy: { args: [FFIType.ptr, FFIType.i32, FFIType.i32], returns: FFIType.void },

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

  // Menu (used mostly for tray menus, but any popup will do)
  gtk_menu_new:                   { args: [], returns: FFIType.ptr },
  gtk_menu_shell_append:          { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void },
  gtk_menu_item_new:              { args: [], returns: FFIType.ptr },
  gtk_menu_item_new_with_label:   { args: [FFIType.cstring], returns: FFIType.ptr },
  gtk_menu_item_set_label:        { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.void },
  gtk_separator_menu_item_new:    { args: [], returns: FFIType.ptr },
} as const);
