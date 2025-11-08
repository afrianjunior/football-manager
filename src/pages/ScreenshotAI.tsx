import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ImageAnalyzer } from "../components/ImageAnalyzer";

export default function ScreenshotAI() {
  const [keyPresses, setKeyPresses] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [latestScreenshot, setLatestScreenshot] = useState<string>("");
  const [screenshotAnalyses, setScreenshotAnalyses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'screenshots' | 'keypress'>('screenshots');

  console.log(activeTab)

  // Listen for key presses
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "," || key === ".") {
        // Call the Rust command to log the key press
        invoke("key_pressed", { key });
        
        // Update UI to show key press
        setKeyPresses(prev => [...prev, `Pressed: ${key}`].slice(-5)); // Keep last 5
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Listen for screenshot events from backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;

    const setupListener = async () => {
      try {
          const unsubscribe = await listen("screenshot-taken", (event) => {
            console.log(event)
            const payload = event.payload as { path?: string; success: boolean; error?: string };
            
            if (!isMounted) return; // Prevent state updates on unmounted component
            
            if (payload.success && payload.path) {
              setScreenshots(prev => [payload.path, ...prev].slice(-10));
              setLatestScreenshot(payload.path);
            } else {
              setScreenshots(prev => [`❌ Screenshot failed: ${payload.error || "Unknown error"}`, ...prev].slice(-10));
            }
          });
          
          if (isMounted) {
            unlisten = unsubscribe;
          } else {
            // Component unmounted before listen completed
            unsubscribe();
          }
      } catch (error) {
        if (isMounted) {
          console.log("Screenshot listener setup failed:", error);
          setScreenshots(prev => [`❌ Screenshot listener setup failed`, ...prev].slice(-10));
        }
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">📸 Screenshot AI</h1>
          <p className="app-subtitle">Capture, Analyze, Understand</p>
        </div>
        <div className="header-actions">
          <div className="shortcut-indicator">
            <span className="shortcut-key">Ctrl</span> + 
            <span className="shortcut-key">Shift</span> + 
            <span className="shortcut-key">S</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'screenshots' ? 'active' : ''}`}
            onClick={() => setActiveTab('screenshots')}
          >
            📸 Screenshots
          </button>
          <button 
            className={`tab-button ${activeTab === 'keypress' ? 'active' : ''}`}
            onClick={() => setActiveTab('keypress')}
          >
            ⌨️ Key Monitor
          </button>
        </div>

        {activeTab === 'screenshots' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2>Screenshot Gallery</h2>
              <div className="screenshot-count">
                {screenshots.length} {screenshots.length === 1 ? 'screenshot' : 'screenshots'}
              </div>
            </div>
            
            {screenshots.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📷</div>
                <h3>No screenshots yet</h3>
                <p>Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> to capture your first screenshot</p>
              </div>
            ) : (
              <div className="screenshot-grid">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="screenshot-card">
                    <div className="screenshot-info">
                      <div className="screenshot-path">{screenshot}</div>
                      <div className="screenshot-time">Just now</div>
                    </div>
                    {index === 0 && (
                      <div className="latest-badge">Latest</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {latestScreenshot && (
              <div className="ai-analysis-panel">
                <div className="panel-header">
                  <h3>🤖 AI Analysis</h3>
                  <div className="ai-status">Ready</div>
                </div>
                <ImageAnalyzer 
                  imagePath={latestScreenshot} 
                  onAnalysisComplete={(analysis) => {
                    setScreenshotAnalyses(prev => [analysis, ...prev].slice(-5));
                  }} 
                />
              </div>
            )}

            {screenshotAnalyses.length > 0 && (
              <div className="analysis-history">
                <h3>📊 Analysis History</h3>
                <div className="analysis-timeline">
                  {screenshotAnalyses.map((analysis, index) => (
                    <div key={index} className="analysis-item">
                      <div className="analysis-header">
                        <span className="analysis-number">#{index + 1}</span>
                        <span className="analysis-time">Recent</span>
                      </div>
                      <div className="analysis-content">{analysis}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'keypress' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2>Key Press Monitor</h2>
              <div className="keypress-hint">
                Press <kbd>,</kbd> (comma) or <kbd>.</kbd> (period) to test
              </div>
            </div>
            
            {keyPresses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⌨️</div>
                <h3>Waiting for key presses</h3>
                <p>Press comma (,) or period (.) to see them appear here</p>
              </div>
            ) : (
              <div className="keypress-timeline">
                {keyPresses.map((press, index) => (
                  <div key={index} className="keypress-item">
                    <div className="keypress-badge">{press}</div>
                    <div className="keypress-time">Just now</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}