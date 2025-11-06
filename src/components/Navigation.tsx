import { Link, useLocation } from "react-router";

export default function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🏈 Football Manager
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            🏠 Home
          </Link>
          <Link 
            to="/screenshot-ai" 
            className={`nav-link ${isActive('/screenshot-ai') ? 'active' : ''}`}
          >
            📸 Screenshot AI
          </Link>
          <Link 
            to="/key-monitor" 
            className={`nav-link ${isActive('/key-monitor') ? 'active' : ''}`}
          >
            ⌨️ Key Monitor
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .navigation {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(10px);
          z-index: 1000;
          padding: 1rem 0;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }
        
        .nav-logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        
        .nav-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }
        
        .nav-link.active {
          color: white;
          background: rgba(255,255,255,0.2);
          font-weight: bold;
        }
      `}</style>
    </nav>
  );
}