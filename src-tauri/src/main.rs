// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// fn main() {
//     football_manager_lib::run()
// }

use std::{
    sync::{Arc, Mutex},
    thread,
};
use rdev::{listen, EventType, Key};
use screenshots::Screen;
use chrono::Local;
use tauri::{AppHandle, Emitter};
use tauri_plugin_log::{Builder as LogBuilder, Target, TargetKind};
use log::{info, warn, error};

fn take_screenshot() -> Option<String> {
    let mut screens = Screen::all().ok()?;
    let screen = screens.pop()?;
    let image = screen.capture().ok()?;

    let filename = format!("screenshot-{}.png", Local::now().format("%Y%m%d-%H%M%S"));
    let mut path = std::env::temp_dir();
    path.push(filename);
    image.save(&path).ok()?;
    Some(path.to_string_lossy().into_owned())
}

fn start_key_listener(app_handle: AppHandle) {
    thread::spawn(move || {
        let ctrl = Arc::new(Mutex::new(false));
        let q = Arc::new(Mutex::new(false));
        let w = Arc::new(Mutex::new(false));

        if let Err(err) = listen(move |event| {
            match event.event_type {
                EventType::KeyPress(key) => {
                    match key {
                        Key::ControlLeft | Key::ControlRight => *ctrl.lock().unwrap() = true,
                        Key::KeyW => *w.lock().unwrap() = true,
                        _ => {}
                    }

                    if *ctrl.lock().unwrap() && *q.lock().unwrap() && *w.lock().unwrap() {
                        if let Some(path) = take_screenshot() {
                            println!("📸 Screenshot saved at {}", path);
                            let _ = app_handle.emit("screenshot_taken", path);
                        }
                    }
                }
                EventType::KeyRelease(key) => {
                    match key {
                        Key::ControlLeft | Key::ControlRight => *ctrl.lock().unwrap() = false,
                        Key::KeyW => *w.lock().unwrap() = false,
                        _ => {}
                    }
                }
                _ => {}
            }
        }) {
            eprintln!("Error listening to events: {:?}", err);
        }
    });
}

fn main() {
    tauri::Builder::default()
        .plugin(
        LogBuilder::default()
            .clear_targets()
            .target(Target::new(TargetKind::Stdout))
            .target(Target::new(TargetKind::Webview))
            .build()
        )
        .setup(|app| {
            // 👇 clone the owned handle (static lifetime)
            let handle = app.handle();
            start_key_listener(handle.clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
