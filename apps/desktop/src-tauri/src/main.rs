// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Runtime,
};

// Define custom commands here in the future
#[tauri::command]
fn restart_agent() {
    println!("Restarting agent-core...");
    // Future: implement child process management in Rust if node watchdog fails
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![restart_agent])
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let restart_i = MenuItem::with_id(app, "restart", "Restart Agent", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&restart_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "restart" => {
                        // Trigger internal command
                    }
                    _ => {}
                })
                .on_tray_icon_event(|_tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        // Maybe focus window
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
