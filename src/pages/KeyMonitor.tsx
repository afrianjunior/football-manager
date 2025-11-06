import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function KeyMonitor() {
  const [keyPresses, setKeyPresses] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Listen for key presses
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "," || key === ".") {
        // Call the Rust command to log the key press
        invoke("key_pressed", { key });
        
        // Update UI to show key press
        setKeyPresses(prev => [...prev, `Pressed: ${key}`].slice(-10)); // Keep last 10
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    setIsListening(true);
    
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      setIsListening(false);
    };
  }, []);

  return (
    <div className="key-monitor-container">
      <div className="monitor-header">
        <h1>⌨️ Key Monitor</h1>
        <p>Real-time key press monitoring with Tauri integration</p>
        
        <div className="status-indicator">
          <div className={`status-dot ${isListening ? 'active' : 'inactive'}`}></div>
          <span>{isListening ? 'Listening' : 'Stopped'}</span>
        </div>
      </div>

      <div className="monitor-content">
        <div className="instructions">
          <h3>Instructions:</h3>
          <p>Press <kbd>,</kbd> (comma) or <kbd>.</kbd> (period) to test the key monitoring</p>
          <div className="key-hints">
            <span className="key-hint">Comma key</span>
            <span className="key-hint">Period key</span>
          </div>
        </div>

        <div className="keypress-display">
          <h3>Recent Key Presses:</h3>
          {keyPresses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>Waiting for key presses...</p>
            </div>
          ) : (
            <div className="keypress-list">
              {keyPresses.map((press, index) => (
                <div key={index} className="keypress-item">
                  <div className="keypress-badge">{press}</div>
                  <div className="timestamp">Just now</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats-panel">
          <h3>Statistics:</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Presses:</span>
              <span className="stat-value">{keyPresses.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Comas Pressed:</span>
              <span className="stat-value">{keyPresses.filter(p => p.includes(',')).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Periods Pressed:</span>
              <span className="stat-value">{keyPresses.filter(p => p.includes('.')).length}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .key-monitor-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          padding: 2rem;
        }
        
        .monitor-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .monitor-header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .monitor-header p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e74c3c;
          animation: pulse 2s infinite;
        }
        
        .status-dot.active {
          background: #27ae60;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .monitor-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .instructions {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .instructions h3 {
          margin-bottom: 1rem;
          color: #3498db;
        }
        
        .key-hints {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }
        
        .key-hint {
          background: #3498db;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
        }
        
        .keypress-display {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .keypress-display h3 {
          margin-bottom: 1rem;
          color: #e74c3c;
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .keypress-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .keypress-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 10px;
          border-left: 4px solid #e74c3c;
        }
        
        .keypress-badge {
          font-weight: bold;
          color: #f39c12;
        }
        
        .timestamp {
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        .stats-panel {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
        }
        
        .stats-panel h3 {
          margin-bottom: 1rem;
          color: #f39c12;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }
        
        .stat-label {
          font-weight: bold;
        }
        
        .stat-value {
          color: #27ae60;
          font-weight: bold;
        }
        
        kbd {
          background: #34495e;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          border: 1px solid #2c3e50;
          font-family: monospace;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}