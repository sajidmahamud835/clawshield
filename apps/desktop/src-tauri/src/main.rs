// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Runtime,
    Emitter,
};
use std::process::Command;
use std::{thread, time::Duration};

// Define custom commands here in the future
#[tauri::command]
fn restart_agent() {
    println!("Restarting agent-core...");
    // Future: implement child process management in Rust if node watchdog fails
}

fn check_docker_daemon() -> bool {
    let output = Command::new("docker")
        .arg("info")
        .output();

    match output {
        Ok(out) => out.status.success(),
        Err(_) => false,
    }
}

fn check_gateway_health() -> String {
    let output = Command::new("curl")
        .arg("-f")
        .arg("http://localhost:4000/health")
        .output();

    match output {
        Ok(out) if out.status.success() => "green".to_string(),
        Ok(_) => "yellow".to_string(), // Starting/Unhealthy
        Err(_) => "red".to_string(),   // Failed/Down
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, Some(vec!["--minimized"])))
        .invoke_handler(tauri::generate_handler![restart_agent])
        .setup(|app| {
            // 1. Check Docker and Start Containers
            if !check_docker_daemon() {
                println!("Error: Docker daemon not detected. Please start Docker Desktop.");
            } else {
                let _ = Command::new("docker-compose")
                    .arg("up")
                    .arg("-d")
                    .spawn();
            }

            // 2. Tray Icon and Status Polling
            let handle = app.handle().clone();
            thread::spawn(move || {
                loop {
                    let status = check_gateway_health();
                    let _ = handle.emit("agent:status", status);
                    thread::sleep(Duration::from_secs(5));
                }
            });

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
