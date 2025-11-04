import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrent } from "@tauri-apps/api/window";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [keyPresses, setKeyPresses] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

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

    const setupListener = async () => {
      try {
        // Check if we're running in Tauri
        const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;
        
        if (isTauri) {
          const unsubscribe = await listen("screenshot-taken", (event) => {
            const payload = event.payload as { path?: string; success: boolean; error?: string };
            
            if (payload.success && payload.path) {
              setScreenshots(prev => [...prev, `Screenshot saved: ${payload.path}`].slice(-5)); // Keep last 5
            } else {
              setScreenshots(prev => [...prev, `Screenshot failed: ${payload.error || "Unknown error"}`].slice(-5)); // Keep last 5
            }
          });
          
          unlisten = unsubscribe;
        }
      } catch (error) {
        console.log("Screenshot listener setup failed:", error);
        setScreenshots(prev => [...prev, `Screenshot listener setup failed`].slice(-5));
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
        <h3>Key Press Monitor</h3>
        <p>Press Comma (,) or Period (.) keys to test!</p>
        <div style={{ marginTop: "1rem" }}>
          {keyPresses.length === 0 ? (
            <p style={{ color: "#666" }}>No keys pressed yet...</p>
          ) : (
            keyPresses.map((press, index) => (
              <div key={index} style={{ margin: "0.25rem 0" }}>{press}</div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#e8f5e8", borderRadius: "8px" }}>
        <h3>Screenshot Monitor</h3>
        <p>Use Ctrl+Shift+S to take screenshots!</p>
        <div style={{ marginTop: "1rem" }}>
          {screenshots.length === 0 ? (
            <p style={{ color: "#666" }}>No screenshots taken yet...</p>
          ) : (
            screenshots.map((screenshot, index) => (
              <div key={index} style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>{screenshot}</div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
