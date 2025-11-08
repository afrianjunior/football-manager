use chrono::Local;
use dirs;
use serde_json;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::Emitter;
use tauri_plugin_global_shortcut::GlobalShortcutExt;
// use screenshots::Screen; // Disabled due to linking issues

// Global cooldown tracker to prevent rapid screenshot spam
static SCREENSHOT_COOLDOWN: Mutex<Option<Instant>> = Mutex::new(None);
const COOLDOWN_DURATION: Duration = Duration::from_millis(1000); // 1 second cooldown

#[tauri::command]
fn key_pressed(key: String) {
    if key == ",+." {
        println!("📸 Taking quick screenshot of entire screen...");
        take_quick_screenshot(None);
    } else if key == "." {
        println!("📝 Period key pressed!");
        take_quick_screenshot(None);
    }
}

fn take_quick_screenshot(app_handle: Option<tauri::AppHandle>) {
    // Check cooldown to prevent rapid screenshot spam
    let mut cooldown = SCREENSHOT_COOLDOWN.lock().unwrap();

    if let Some(last_screenshot) = *cooldown {
        if last_screenshot.elapsed() < COOLDOWN_DURATION {
            println!("⏱️ Screenshot on cooldown - please wait a moment");
            return;
        }
    }

    // Update cooldown timestamp
    *cooldown = Some(Instant::now());
    drop(cooldown); // Release the lock early

    // Create screenshots directory in a specific location (Documents folder)
    let mut screenshot_dir = dirs::document_dir().unwrap_or_else(|| PathBuf::from("."));
    screenshot_dir.push("FootballManagerScreenshots");
    fs::create_dir_all(&screenshot_dir).unwrap();

    // Generate filename with timestamp
    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("quick_screenshot_{}.png", timestamp);
    let filepath = screenshot_dir.join(filename);

    // Cross-platform screenshot using platform-specific commands
    println!("📸 Taking screenshot using platform-specific method...");

    #[cfg(target_os = "macos")]
    let result = take_screenshot_macos(&filepath);

    #[cfg(target_os = "windows")]
    let result = take_screenshot_windows(&filepath);

    #[cfg(target_os = "linux")]
    let result = take_screenshot_linux(&filepath);

    match result {
        Ok(_) => {
            println!(
                "✅ Cross-platform screenshot saved to: {}",
                filepath.display()
            );

            // Send the screenshot path to frontend
            if let Some(handle) = app_handle {
                let screenshot_path = filepath.to_string_lossy().to_string();
                let _ = handle.emit(
                    "screenshot-taken",
                    serde_json::json!({
                        "path": screenshot_path,
                        "success": true
                    }),
                );
            }
        }
        Err(e) => {
            println!("❌ Failed to take screenshot: {}", e);

            // Send error to frontend
            if let Some(handle) = app_handle {
                let _ = handle.emit(
                    "screenshot-taken",
                    serde_json::json!({
                        "error": format!("Failed to take screenshot: {}", e),
                        "success": false
                    }),
                );
            }
        }
    }
}

#[cfg(target_os = "macos")]
fn take_screenshot_macos(filepath: &PathBuf) -> Result<(), String> {
    use std::process::Command;

    let output = Command::new("screencapture")
        .arg("-x") // No sound
        .arg("-S") // Capture entire screen
        .arg(filepath)
        .output()
        .map_err(|e| format!("Failed to execute screencapture: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(format!(
            "screencapture failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

#[cfg(target_os = "windows")]
fn take_screenshot_windows(filepath: &PathBuf) -> Result<(), String> {
    use std::process::Command;

    // Use PowerShell to capture screenshot on Windows
    let ps_script = format!(
        "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width, [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bmp); $graphics.CopyFromScreen(0, 0, 0, 0, $bmp.Size); $bmp.Save('{}'); $graphics.Dispose(); $bmp.Dispose()",
        filepath.to_string_lossy()
    );

    let output = Command::new("powershell")
        .arg("-Command")
        .arg(&ps_script)
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(format!(
            "PowerShell screenshot failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

#[cfg(target_os = "linux")]
fn take_screenshot_linux(filepath: &PathBuf) -> Result<(), String> {
    use std::process::Command;

    // Try multiple screenshot tools commonly available on Linux
    let tools = [
        ("gnome-screenshot", vec!["-f", filepath.to_str().unwrap()]),
        ("scrot", vec![filepath.to_str().unwrap()]),
        (
            "import",
            vec!["-window", "root", filepath.to_str().unwrap()],
        ),
        (
            "spectacle",
            vec!["-b", "-n", "-o", filepath.to_str().unwrap()],
        ),
        ("flameshot", vec!["full", "-p", filepath.to_str().unwrap()]),
    ];

    for (tool, args) in &tools {
        if Command::new("which")
            .arg(tool)
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            let output = Command::new(tool)
                .args(args)
                .output()
                .map_err(|e| format!("Failed to execute {}: {}", tool, e))?;

            if output.status.success() {
                return Ok(());
            } else {
                println!("⚠️ {} failed, trying next tool...", tool);
            }
        }
    }

    Err("No suitable screenshot tool found. Please install gnome-screenshot, scrot, imagemagick, spectacle, or flameshot.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![key_pressed])
        .setup(|app| {
            println!("✅ Application started successfully!");
            println!("📋 Global shortcut registered - works system-wide!");
            println!("");
            println!("💡 Press Ctrl+Shift+S for quick screenshot (entire screen)");
            println!("💡 Works even when app window is closed!");

            // Register global shortcut for screenshot (Ctrl+Shift+S)
            let app_handle = app.handle().clone();
            app.global_shortcut()
                .on_shortcut("ctrl+shift+s", move |_shortcut, _event, _api| {
                    println!("📸 Global shortcut triggered - taking quick screenshot...");
                    take_quick_screenshot(Some(app_handle.clone()));
                })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
