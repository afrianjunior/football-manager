use std::process::Command;
use std::path::PathBuf;
use std::fs;
use chrono::Local;

#[cfg(target_os = "macos")]
fn take_screenshot_macos(filepath: &PathBuf) -> Result<(), String> {
    let output = Command::new("screencapture")
        .arg("-x")  // No sound
        .arg("-S")  // Capture entire screen
        .arg(filepath)
        .output()
        .map_err(|e| format!("Failed to execute screencapture: {}", e))?;
    
    if output.status.success() {
        Ok(())
    } else {
        Err(format!("screencapture failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

#[cfg(target_os = "windows")]
fn take_screenshot_windows(filepath: &PathBuf) -> Result<(), String> {
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
        Err(format!("PowerShell screenshot failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
}

#[cfg(target_os = "linux")]
fn take_screenshot_linux(filepath: &PathBuf) -> Result<(), String> {
    // Try multiple screenshot tools commonly available on Linux
    let tools = [
        ("gnome-screenshot", vec!["-f", filepath.to_str().unwrap()]),
        ("scrot", vec![filepath.to_str().unwrap()]),
        ("import", vec!["-window", "root", filepath.to_str().unwrap()]),
        ("spectacle", vec!["-b", "-n", "-o", filepath.to_str().unwrap()]),
        ("flameshot", vec!["full", "-p", filepath.to_str().unwrap()]),
    ];
    
    for (tool, args) in &tools {
        if Command::new("which").arg(tool).output().map(|o| o.status.success()).unwrap_or(false) {
            println!("Trying {}...", tool);
            let output = Command::new(tool)
                .args(args)
                .output()
                .map_err(|e| format!("Failed to execute {}: {}", tool, e))?;
            
            if output.status.success() {
                println!("✅ {} succeeded!", tool);
                return Ok(());
            } else {
                println!("⚠️ {} failed: {}", tool, String::from_utf8_lossy(&output.stderr));
            }
        } else {
            println!("{} not found", tool);
        }
    }
    
    Err("No suitable screenshot tool found. Please install gnome-screenshot, scrot, imagemagick, spectacle, or flameshot.".to_string())
}

fn main() {
    println!("🖥️  Testing cross-platform screenshot functionality...");
    println!("Platform: {}", std::env::consts::OS);
    
    // Create test screenshots directory
    let mut screenshot_dir = PathBuf::from("test_screenshots");
    fs::create_dir_all(&screenshot_dir).unwrap();
    
    // Generate filename with timestamp
    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("test_screenshot_{}.png", timestamp);
    let filepath = screenshot_dir.join(filename);
    
    println!("📸 Taking screenshot...");
    
    #[cfg(target_os = "macos")]
    let result = take_screenshot_macos(&filepath);
    
    #[cfg(target_os = "windows")]
    let result = take_screenshot_windows(&filepath);
    
    #[cfg(target_os = "linux")]
    let result = take_screenshot_linux(&filepath);
    
    match result {
        Ok(_) => {
            println!("✅ Screenshot saved to: {}", filepath.display());
            
            // Check if file exists and get size
            if filepath.exists() {
                let metadata = fs::metadata(&filepath).unwrap();
                println!("📁 File size: {} bytes", metadata.len());
            }
        }
        Err(e) => {
            println!("❌ Failed to take screenshot: {}", e);
        }
    }
    
    println!("\n🧪 Test completed!");
}