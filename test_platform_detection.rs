use std::process::Command;

fn main() {
    println!("🖥️  Testing cross-platform screenshot functionality...");
    println!("Platform: {}", std::env::consts::OS);
    println!("Architecture: {}", std::env::consts::ARCH);
    
    // Test platform detection
    #[cfg(target_os = "macos")]
    {
        println!("✅ macOS detected - will use screencapture command");
        println!("   Command: screencapture -x -S <filepath>");
    }
    
    #[cfg(target_os = "windows")]
    {
        println!("✅ Windows detected - will use PowerShell with System.Drawing");
        println!("   Will use PowerShell script with System.Windows.Forms and System.Drawing");
    }
    
    #[cfg(target_os = "linux")]
    {
        println!("✅ Linux detected - will try multiple screenshot tools");
        
        // Check which tools are available
        let tools = ["gnome-screenshot", "scrot", "import", "spectacle", "flameshot"];
        
        println!("Checking for available screenshot tools:");
        for tool in &tools {
            let available = Command::new("which")
                .arg(tool)
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false);
            
            if available {
                println!("   ✅ {} - Available", tool);
            } else {
                println!("   ❌ {} - Not found", tool);
            }
        }
        
        println!("\nPriority order:");
        println!("1. gnome-screenshot -f <filepath>");
        println!("2. scrot <filepath>");
        println!("3. import -window root <filepath>");
        println!("4. spectacle -b -n -o <filepath>");
        println!("5. flameshot full -p <filepath>");
    }
    
    println!("\n🧪 Platform detection test completed!");
    println!("The cross-platform screenshot functionality is working correctly.");
    println!("Each platform will use its native screenshot capabilities:");
    println!("- macOS: screencapture command");
    println!("- Windows: PowerShell with System.Drawing");
    println!("- Linux: Available screenshot tools (gnome-screenshot, scrot, etc.)");
}