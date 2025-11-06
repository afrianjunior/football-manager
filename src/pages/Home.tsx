import { Link } from "react-router";

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🏈 Football Manager</h1>
        <p className="hero-subtitle">Your AI-powered football analysis companion</p>
        
        <div className="feature-cards">
          <Link to="/screenshot-ai" className="feature-card">
            <div className="card-icon">📸</div>
            <h3>Screenshot AI</h3>
            <p>Capture and analyze football screenshots with AI</p>
          </Link>
          
          <Link to="/key-monitor" className="feature-card">
            <div className="card-icon">⌨️</div>
            <h3>Key Monitor</h3>
            <p>Monitor key presses and interactions</p>
          </Link>
          
          <div className="feature-card coming-soon">
            <div className="card-icon">📊</div>
            <h3>Analytics</h3>
            <p>Coming soon - Advanced football analytics</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .hero-section {
          text-align: center;
          max-width: 800px;
        }
        
        .hero-title {
          font-size: 4rem;
          font-weight: bold;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero-subtitle {
          font-size: 1.5rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 3rem;
        }
        
        .feature-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .feature-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .feature-card.coming-soon {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .feature-card p {
          font-size: 1rem;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}