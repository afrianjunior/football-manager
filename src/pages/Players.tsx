import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { extractPlayerDataFromScreenshot, type FootballPlayer } from "../lib/player-ai-service";
import db from "@/lib/db";
export default function PlayersPage () {
  const [playerData, setPlayerData] = useState<FootballPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;

    const setupListener = async () => {
      try {
          const unsubscribe = await listen("screenshot-taken", async (event) => {
            console.log(event)
            const payload = event.payload as { path?: string; success: boolean; error?: string };
            
            if (!isMounted) return; // Prevent state updates on unmounted component
            
            if (payload.success && payload.path) {
              console.log("GOTCHA", __dirname, payload.path)
                // Extract player data using AI
                setIsLoading(true);
                setError(null);
                
                const result = await extractPlayerDataFromScreenshot(payload.path);
                
                if (isMounted) {
                  if (result.success && result.data) {
                    setPlayerData(result.data);
                  } else {
                    setError(result.error || "Failed to extract player data");
                  }
                  setIsLoading(false);
                }
            } else {
              if (isMounted) {
                setError(payload.error || "Screenshot capture failed");
              }
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
          setError("Failed to set up screenshot listener");
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
    <div>
      <h1>Players</h1>
      
      {isLoading && (
        <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '4px', margin: '1rem 0' }}>
          <p>Analyzing screenshot and extracting player data...</p>
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', background: '#ffe6e6', borderRadius: '4px', margin: '1rem 0', color: '#d32f2f' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {playerData && (
        <div style={{ margin: '1rem 0' }}>
          <h2>Extracted Player Data</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px', 
            overflow: 'auto',
            fontSize: '0.9rem',
            border: '1px solid #ddd'
          }}>
            {JSON.stringify(playerData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}