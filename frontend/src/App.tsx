import React, { useState } from 'react';
import './App.css';

// Page Components
function HomePage() {
  return (
    <div className="page">
      <div className="hero-section">
        <h1>🛡️ Sovereign Media Platform</h1>
        <p>Independent journalism with uncompromising integrity</p>
        <div className="hero-stats">
          <div className="stat"><span>150+</span> Investigations</div>
          <div className="stat"><span>50+</span> Contributors</div>
          <div className="stat"><span>25+</span> Countries</div>
        </div>
      </div>
      
      <div className="featured-content">
        <h2>Latest Investigations</h2>
        <div className="content-grid">
          <div className="content-card">
            <h3>Corporate Accountability Report</h3>
            <p>Deep dive into corporate governance and transparency...</p>
            <span className="tag">INVESTIGATIONS</span>
          </div>
          <div className="content-card">
            <h3>Global Supply Chain Analysis</h3>
            <p>Examining international trade and ethical sourcing...</p>
            <span className="tag">GEOPOLITICS</span>
          </div>
          <div className="content-card">
            <h3>Legal Framework Review</h3>
            <p>Analysis of regulatory changes and compliance...</p>
            <span className="tag">LEGAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvestigationsPage() {
  return (
    <div className="page">
      <h1>📰 Investigations</h1>
      <div className="page-description">
        <p>In-depth investigative reports exposing corruption, corporate malfeasance, and systemic issues.</p>
      </div>
      
      <div className="filter-bar">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Corporate</button>
        <button className="filter-btn">Government</button>
        <button className="filter-btn">Environmental</button>
        <button className="filter-btn">Financial</button>
      </div>
      
      <div className="investigations-list">
        <div className="investigation-item">
          <h3>The Shadow Banking Network</h3>
          <p>A comprehensive investigation into offshore financial structures...</p>
          <div className="meta">Published: Sept 15, 2025 | Status: Ongoing</div>
        </div>
        <div className="investigation-item">
          <h3>Corporate Data Mining Practices</h3>
          <p>How major corporations collect and monetize personal data...</p>
          <div className="meta">Published: Sept 10, 2025 | Status: Complete</div>
        </div>
        <div className="investigation-item">
          <h3>Supply Chain Transparency Report</h3>
          <p>Tracking ethical sourcing across global supply chains...</p>
          <div className="meta">Published: Sept 8, 2025 | Status: Under Review</div>
        </div>
      </div>
    </div>
  );
}

function LegalPage() {
  return (
    <div className="page">
      <h1>⚖️ Legal Briefs</h1>
      <div className="page-description">
        <p>Expert legal analysis, regulatory updates, and compliance frameworks.</p>
      </div>
      
      <div className="legal-sections">
        <div className="legal-section">
          <h3>Recent Legal Updates</h3>
          <div className="legal-item">
            <h4>Privacy Regulation Changes 2025</h4>
            <p>New data protection requirements across jurisdictions...</p>
            <span className="jurisdiction">EU | US | APAC</span>
          </div>
          <div className="legal-item">
            <h4>Corporate Transparency Act Implementation</h4>
            <p>Requirements for beneficial ownership reporting...</p>
            <span className="jurisdiction">US Federal</span>
          </div>
        </div>
        
        <div className="legal-section">
          <h3>Compliance Frameworks</h3>
          <div className="framework-item">
            <h4>🔒 Data Protection Compliance</h4>
            <p>GDPR, CCPA, and emerging privacy regulations</p>
          </div>
          <div className="framework-item">
            <h4>📋 Financial Reporting Standards</h4>
            <p>IFRS, GAAP, and transparency requirements</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeopoliticsPage() {
  return (
    <div className="page">
      <h1>🌍 Geopolitics</h1>
      <div className="page-description">
        <p>Analysis of global political and economic trends affecting media and information freedom.</p>
      </div>
      
      <div className="geopolitics-content">
        <div className="region-analysis">
          <h3>Regional Analysis</h3>
          <div className="region-grid">
            <div className="region-card">
              <h4>🇪🇺 European Union</h4>
              <p>Digital Services Act impact on media platforms</p>
            </div>
            <div className="region-card">
              <h4>🇺🇸 Americas</h4>
              <p>First Amendment protections in digital age</p>
            </div>
            <div className="region-card">
              <h4>🌏 Asia-Pacific</h4>
              <p>Emerging data sovereignty frameworks</p>
            </div>
            <div className="region-card">
              <h4>🌍 Global South</h4>
              <p>Information access and infrastructure development</p>
            </div>
          </div>
        </div>
        
        <div className="trend-analysis">
          <h3>Current Trends</h3>
          <div className="trend-item">
            <h4>Digital Sovereignty</h4>
            <p>Nations asserting control over digital infrastructure and data flows</p>
          </div>
          <div className="trend-item">
            <h4>Information Warfare</h4>
            <p>State and non-state actors influencing information landscapes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributorsPage() {
  return (
    <div className="page">
      <h1>👥 Contributors</h1>
      <div className="page-description">
        <p>Meet our network of investigative journalists, legal experts, and security researchers.</p>
      </div>
      
      <div className="contributors-grid">
        <div className="contributor-card">
          <div className="contributor-avatar">JD</div>
          <h3>Jane Doe</h3>
          <p>Investigative Journalist</p>
          <div className="expertise">Corporate Finance, Anti-Corruption</div>
          <div className="stats">25 Reports | 5 Years</div>
        </div>
        
        <div className="contributor-card">
          <div className="contributor-avatar">MS</div>
          <h3>Michael Smith</h3>
          <p>Legal Analyst</p>
          <div className="expertise">Data Privacy, Constitutional Law</div>
          <div className="stats">18 Briefs | 8 Years</div>
        </div>
        
        <div className="contributor-card">
          <div className="contributor-avatar">AR</div>
          <h3>Alex Rodriguez</h3>
          <p>Security Researcher</p>
          <div className="expertise">Cybersecurity, Digital Rights</div>
          <div className="stats">12 Reports | 3 Years</div>
        </div>
        
        <div className="contributor-card">
          <div className="contributor-avatar">LW</div>
          <h3>Lisa Wang</h3>
          <p>Geopolitical Analyst</p>
          <div className="expertise">International Relations, Trade Policy</div>
          <div className="stats">22 Reports | 6 Years</div>
        </div>
      </div>
      
      <div className="join-section">
        <h3>Join Our Network</h3>
        <p>Interested in contributing to independent journalism? We're looking for experienced professionals.</p>
        <button className="cta-button">Apply to Contribute</button>
      </div>
    </div>
  );
}

function ArchivesPage() {
  return (
    <div className="page">
      <h1>� Archives</h1>
      <div className="page-description">
        <p>Comprehensive archive of all published reports, searchable by topic, date, and contributor.</p>
      </div>
      
      <div className="archive-search">
        <div className="search-filters">
          <input type="text" placeholder="Search archives..." className="archive-search-input" />
          <select className="filter-select">
            <option>All Categories</option>
            <option>Investigations</option>
            <option>Legal Briefs</option>
            <option>Geopolitics</option>
          </select>
          <select className="filter-select">
            <option>All Years</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      </div>
      
      <div className="archive-timeline">
        <div className="timeline-year">
          <h3>2025</h3>
          <div className="timeline-items">
            <div className="timeline-item">
              <div className="date">Sept 15</div>
              <div className="title">The Shadow Banking Network</div>
              <div className="category">Investigation</div>
            </div>
            <div className="timeline-item">
              <div className="date">Sept 10</div>
              <div className="title">Corporate Data Mining Report</div>
              <div className="category">Investigation</div>
            </div>
            <div className="timeline-item">
              <div className="date">Sept 8</div>
              <div className="title">Privacy Regulation Analysis</div>
              <div className="category">Legal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscribePage() {
  return (
    <div className="page">
      <h1>📧 Subscribe</h1>
      <div className="page-description">
        <p>Stay informed with our latest investigations and analysis. Choose your subscription level.</p>
      </div>
      
      <div className="subscription-tiers">
        <div className="tier-card">
          <h3>Free Access</h3>
          <div className="price">$0/month</div>
          <ul className="features">
            <li>✓ Weekly newsletter</li>
            <li>✓ Public investigations</li>
            <li>✓ Basic legal briefs</li>
            <li>✗ Premium reports</li>
            <li>✗ Early access</li>
          </ul>
          <button className="subscribe-btn">Sign Up Free</button>
        </div>
        
        <div className="tier-card premium">
          <h3>Premium</h3>
          <div className="price">$15/month</div>
          <ul className="features">
            <li>✓ All free features</li>
            <li>✓ Premium investigations</li>
            <li>✓ Detailed legal analysis</li>
            <li>✓ Early access to reports</li>
            <li>✓ Contributor Q&A sessions</li>
          </ul>
          <button className="subscribe-btn">Subscribe</button>
        </div>
        
        <div className="tier-card">
          <h3>Institutional</h3>
          <div className="price">Custom</div>
          <ul className="features">
            <li>✓ All premium features</li>
            <li>✓ Custom research requests</li>
            <li>✓ Direct contributor access</li>
            <li>✓ White-label reports</li>
            <li>✓ API access</li>
          </ul>
          <button className="subscribe-btn">Contact Sales</button>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="page">
      <div className="login-container">
        <h1>🔐 Login</h1>
        <div className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Password" />
          </div>
          <button className="login-btn">Sign In</button>
          
          <div className="login-options">
            <a href="/forgot-password">Forgot Password?</a>
            <span>|</span>
            <a href="/register">Create Account</a>
          </div>
          
          <div className="security-note">
            <p>🔒 All communications encrypted with post-quantum cryptography</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="page">
      <h1>📊 User Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Reports Read</h3>
          <div className="stat-number">47</div>
        </div>
        <div className="stat-card">
          <h3>Bookmarks</h3>
          <div className="stat-number">12</div>
        </div>
        <div className="stat-card">
          <h3>Subscription</h3>
          <div className="stat-number">Premium</div>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Reading History</h3>
          <div className="history-item">
            <div className="item-title">The Shadow Banking Network</div>
            <div className="item-date">Read Sept 16, 2025</div>
          </div>
          <div className="history-item">
            <div className="item-title">Corporate Data Mining Report</div>
            <div className="item-date">Read Sept 12, 2025</div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h3>Bookmarked Reports</h3>
          <div className="bookmark-item">
            <div className="item-title">Privacy Regulation Analysis</div>
            <div className="item-category">Legal Brief</div>
          </div>
          <div className="bookmark-item">
            <div className="item-title">Supply Chain Transparency</div>
            <div className="item-category">Investigation</div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h3>Account Settings</h3>
          <button className="settings-btn">Update Profile</button>
          <button className="settings-btn">Notification Preferences</button>
          <button className="settings-btn">Subscription Management</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'investigations': return <InvestigationsPage />;
      case 'legal': return <LegalPage />;
      case 'geopolitics': return <GeopoliticsPage />;
      case 'contributors': return <ContributorsPage />;
      case 'archives': return <ArchivesPage />;
      case 'subscribe': return <SubscribePage />;
      case 'login': return <LoginPage />;
      case 'dashboard': return <UserDashboard />;
      default: return <HomePage />;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Search functionality will be implemented later
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo" onClick={() => setCurrentPage('home')}>
          AtonixCorp Media
        </div>
        <ul className="nav-links">
          <li><button onClick={() => setCurrentPage('home')} className={currentPage === 'home' ? 'active' : ''}>Home</button></li>
          <li><button onClick={() => setCurrentPage('investigations')} className={currentPage === 'investigations' ? 'active' : ''}>Investigations</button></li>
          <li><button onClick={() => setCurrentPage('legal')} className={currentPage === 'legal' ? 'active' : ''}>Legal Briefs</button></li>
          <li><button onClick={() => setCurrentPage('geopolitics')} className={currentPage === 'geopolitics' ? 'active' : ''}>Geopolitics</button></li>
          <li><button onClick={() => setCurrentPage('contributors')} className={currentPage === 'contributors' ? 'active' : ''}>Contributors</button></li>
          <li><button onClick={() => setCurrentPage('archives')} className={currentPage === 'archives' ? 'active' : ''}>Archives</button></li>
          <li><button onClick={() => setCurrentPage('subscribe')} className={currentPage === 'subscribe' ? 'active' : ''}>Subscribe</button></li>
          {isLoggedIn ? (
            <li><button onClick={() => setCurrentPage('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>Dashboard</button></li>
          ) : (
            <li><button onClick={() => setCurrentPage('login')} className={currentPage === 'login' ? 'active' : ''}>Login</button></li>
          )}
        </ul>
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>AtonixCorp Media</h4>
            <p>Independent journalism with uncompromising integrity</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@atonixcorp.org</p>
            <p>security@atonixcorp.org</p>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AtonixCorp. Built with ❤️ for a more transparent world.</p>
          <p>Licensed under AGPL-3.0 | Powered by post-quantum cryptography</p>
        </div>
      </footer>
    </div>
  );
}

export default App;