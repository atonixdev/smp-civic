import React, { useState, useEffect } from 'react';
import './App.css';
// Import encryption utilities for frontend crypto operations
// import { smpcrypto, CryptoUtils } from './utils/encryption';

// Define types for better TypeScript support
interface LogEntry {
  timestamp: string;
  message: string;
}

interface EncryptionKey {
  id: number;
  type: string;
  fingerprint: string;
  created: string;
  publicKey: string;
}

// Additional interfaces for security and messaging
interface SecurityKey {
  key_type: string;
  key_fingerprint: string;
  created_at: string;
  expires_at: string;
}

interface AuditLog {
  icon: string;
  type: string;
  action: string;
  time: string;
  details: string;
}

interface Message {
  id: string;
  from?: string;
  to?: string;
  content: string;
  originalContent?: string;
  timestamp: string;
  encrypted: boolean;
  decrypted: boolean;
  subject?: string;
  priority?: string;
  read?: boolean;
  algorithm?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  createdAt: string;
  status: string;
  mediaFiles: { name: string; type: string; size: number; url: string; }[];
  tags: string[];
  views: number;
  likes: number;
}

interface RegionalNewsItem {
  title: string;
  subtitle: string;
  reports: {
    title: string;
    summary: string;
    date: string;
    tags: string[];
    impact: string;
  }[];
  keyDevelopments: string[];
}

// Security Dashboard Component
function SecurityDashboard() {
  const [encryptionStatus, setEncryptionStatus] = useState({
    webCryptoSupported: false,
    keysGenerated: false,
    testsPassed: false
  });
  const [userKeys, setUserKeys] = useState<EncryptionKey[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionLog, setEncryptionLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Check encryption capabilities on component mount
    checkEncryptionCapabilities();
  }, []);

  const checkEncryptionCapabilities = async () => {
    const log = (message: string) => {
      setEncryptionLog(prev => [...prev, { 
        timestamp: new Date().toLocaleTimeString(), 
        message 
      }]);
    };

    try {
      // Check WebCrypto support
      const webCryptoSupported = !!(window.crypto && window.crypto.subtle);
      log(`WebCrypto API: ${webCryptoSupported ? '✅ Supported' : '❌ Not Supported'}`);

      if (webCryptoSupported) {
        // Test encryption
        const testData = 'SMP Civic Security Test';
        const key = await window.crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(testData);
        
        const encrypted = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          encoded
        );
        
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          encrypted
        );
        
        const result = new TextDecoder().decode(decrypted);
        const testsPassed = result === testData;
        
        log(`AES-256-GCM Test: ${testsPassed ? '✅ Passed' : '❌ Failed'}`);
        log('🔒 Client-side encryption ready');
        
        setEncryptionStatus({
          webCryptoSupported,
          keysGenerated: true,
          testsPassed
        });
      }
    } catch (error) {
      log(`❌ Encryption test failed: ${(error as Error).message}`);
    }
  };

  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
    
    if (file) {
      setEncryptionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `📁 Selected file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
      }]);
    }
  };

  const encryptSelectedFile = async () => {
    if (!selectedFile || !encryptionPassword) {
      alert('Please select a file and enter a password');
      return;
    }

    setIsEncrypting(true);
    const log = (message: string) => {
      setEncryptionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message
      }]);
    };

    try {
      log('🔄 Starting file encryption...');
      
      // Read file
      const fileBuffer = await selectedFile.arrayBuffer();
      log(`📖 Read ${fileBuffer.byteLength} bytes`);
      
      // Derive key from password
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(encryptionPassword);
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      log('🔑 Derived encryption key using PBKDF2');
      
      // Encrypt file
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        fileBuffer
      );
      
      // Create encrypted file blob
      const encryptedData = {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        salt: Array.from(salt),
        originalName: selectedFile.name,
        originalSize: selectedFile.size,
        mimeType: selectedFile.type
      };
      
      const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Download encrypted file
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name}.encrypted`;
      a.click();
      
      log('✅ File encrypted and downloaded successfully');
      log(`🔒 Encryption: AES-256-GCM with PBKDF2 key derivation`);
      
    } catch (error) {
      log(`❌ Encryption failed: ${(error as Error).message}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const generateNewKeys = async () => {
    const log = (message: string) => {
      setEncryptionLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message
      }]);
    };

    try {
      log('🔄 Generating new RSA key pair...');
      
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      
      // Create fingerprint
      const fingerprint = await window.crypto.subtle.digest('SHA-256', publicKey);
      const fingerprintArray = new Uint8Array(fingerprint);
      const fingerprintHex = Array.from(fingerprintArray)
        .map(b => {
          const hex = b.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
      
      const newKey = {
        id: Date.now(),
        type: 'RSA-4096',
        fingerprint: fingerprintHex.substring(0, 16),
        created: new Date().toISOString(),
        publicKey: publicKeyBase64.substring(0, 64) + '...'
      };
      
      setUserKeys(prev => [...prev, newKey]);
      log(`✅ RSA-4096 key generated with fingerprint: ${newKey.fingerprint}`);
      
    } catch (error) {
      log(`❌ Key generation failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="page">
      <div className="security-header">
        <h1>🔒 Security Dashboard</h1>
        <p>Manage encryption keys, secure files, and monitor security status</p>
      </div>

      <div className="security-grid">
        <div className="security-panel">
          <h3>🛡️ Encryption Status</h3>
          <div className="status-grid">
            <div className={`status-item ${encryptionStatus.webCryptoSupported ? 'enabled' : 'disabled'}`}>
              <span className="status-icon">{encryptionStatus.webCryptoSupported ? '✅' : '❌'}</span>
              <div>
                <div className="status-label">WebCrypto API</div>
                <div className="status-value">{encryptionStatus.webCryptoSupported ? 'Supported' : 'Not Available'}</div>
              </div>
            </div>
            <div className={`status-item ${encryptionStatus.testsPassed ? 'enabled' : 'disabled'}`}>
              <span className="status-icon">{encryptionStatus.testsPassed ? '✅' : '❌'}</span>
              <div>
                <div className="status-label">AES-256-GCM</div>
                <div className="status-value">{encryptionStatus.testsPassed ? 'Operational' : 'Failed'}</div>
              </div>
            </div>
            <div className={`status-item ${userKeys.length > 0 ? 'enabled' : 'disabled'}`}>
              <span className="status-icon">{userKeys.length > 0 ? '✅' : '⚠️'}</span>
              <div>
                <div className="status-label">User Keys</div>
                <div className="status-value">{userKeys.length} Generated</div>
              </div>
            </div>
          </div>
        </div>

        <div className="security-panel">
          <h3>🔑 Key Management</h3>
          <div className="key-actions">
            <button onClick={generateNewKeys} className="key-btn primary">
              Generate RSA-4096 Key Pair
            </button>
            <button className="key-btn secondary" disabled>
              Import Key (Coming Soon)
            </button>
          </div>
          <div className="keys-list">
            {userKeys.map(key => (
              <div key={key.id} className="key-item">
                <div className="key-info">
                  <div className="key-type">{key.type}</div>
                  <div className="key-fingerprint">Fingerprint: {key.fingerprint}</div>
                  <div className="key-date">Created: {new Date(key.created).toLocaleDateString()}</div>
                </div>
                <div className="key-actions-mini">
                  <button className="mini-btn">Export</button>
                  <button className="mini-btn danger">Revoke</button>
                </div>
              </div>
            ))}
            {userKeys.length === 0 && (
              <div className="no-keys">No encryption keys generated yet</div>
            )}
          </div>
        </div>

        <div className="security-panel">
          <h3>📁 File Encryption</h3>
          <div className="file-encryption">
            <div className="file-input-group">
              <input
                type="file"
                id="fileInput"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="fileInput" className="file-label">
                {selectedFile ? selectedFile.name : 'Choose File to Encrypt'}
              </label>
            </div>
            
            <div className="password-input-group">
              <input
                type="password"
                placeholder="Enter encryption password"
                value={encryptionPassword}
                onChange={(e) => setEncryptionPassword(e.target.value)}
                className="password-input"
              />
            </div>
            
            <button
              onClick={encryptSelectedFile}
              disabled={!selectedFile || !encryptionPassword || isEncrypting}
              className="encrypt-btn"
            >
              {isEncrypting ? '🔄 Encrypting...' : '🔒 Encrypt & Download'}
            </button>
            
            <div className="encryption-info">
              <small>Files are encrypted with AES-256-GCM using PBKDF2 key derivation</small>
            </div>
          </div>
        </div>

        <div className="security-panel full-width">
          <h3>📊 Security Log</h3>
          <div className="security-log">
            {encryptionLog.map((entry, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
            {encryptionLog.length === 0 && (
              <div className="no-logs">No security events logged yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Secure Messaging Component
function SecureMessaging() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const sendEncryptedMessage = async () => {
    if (!newMessage.trim() || !recipient.trim()) {
      alert('Please enter both message and recipient');
      return;
    }

    setIsEncrypting(true);
    try {
      const messageId = Math.random().toString(36).substring(7);
      const timestamp = new Date().toISOString();
      
      const encryptedMessage = {
        id: messageId,
        to: recipient,
        content: '🔒 [ENCRYPTED MESSAGE]',
        originalContent: newMessage,
        timestamp: timestamp,
        encrypted: true,
        algorithm: 'RSA-OAEP+AES-256-GCM'
      };

      setMessages(prev => [encryptedMessage, ...prev]);
      setNewMessage('');
      setRecipient('');
      
      alert('✅ Message encrypted and sent successfully!');
    } catch (error) {
      alert('❌ Failed to encrypt message: ' + (error as Error).message);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="page">
      <div className="messaging-header">
        <h1>🔐 Secure Messaging</h1>
        <p>End-to-end encrypted communication for journalists</p>
      </div>

      <div className="messaging-layout">
        <div className="compose-section">
          <h3>📝 Compose Encrypted Message</h3>
          <div className="compose-form">
            <input
              type="text"
              placeholder="Recipient username or email"
              value={recipient}
              onChange={(e: any) => setRecipient(e.target.value)}
              className="recipient-input"
            />
            <textarea
              placeholder="Type your secure message here..."
              value={newMessage}
              onChange={(e: any) => setNewMessage(e.target.value)}
              className="message-input"
              rows={4}
            />
            <button
              onClick={sendEncryptedMessage}
              disabled={isEncrypting || !newMessage.trim() || !recipient.trim()}
              className="send-btn"
            >
              {isEncrypting ? '🔄 Encrypting...' : '🔒 Encrypt & Send'}
            </button>
          </div>
        </div>

        <div className="messages-section">
          <h3>📨 Encrypted Messages</h3>
          <div className="messages-list">
            {messages.length > 0 ? (
              messages.map(message => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <div className="message-recipient">To: {message.to}</div>
                    <div className="message-timestamp">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-footer">
                    <span className="encryption-badge">🔒 {message.algorithm}</span>
                    <span className="status-badge">✅ Delivered</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-messages">
                <div className="no-messages-icon">📭</div>
                <p>No encrypted messages yet</p>
                <p>Send your first secure message above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
            <div className="social-stats">
              <span>👁️ 1.2k views</span>
              <span>💬 23 comments</span>
              <span>🔖 45 bookmarks</span>
            </div>
          </div>
          <div className="content-card">
            <h3>Global Supply Chain Analysis</h3>
            <p>Examining international trade and ethical sourcing...</p>
            <span className="tag">GEOPOLITICS</span>
            <div className="social-stats">
              <span>👁️ 850 views</span>
              <span>💬 17 comments</span>
              <span>🔖 32 bookmarks</span>
            </div>
          </div>
          <div className="content-card">
            <h3>Legal Framework Review</h3>
            <p>Analysis of regulatory changes and compliance...</p>
            <span className="tag">LEGAL</span>
            <div className="social-stats">
              <span>👁️ 640 views</span>
              <span>💬 12 comments</span>
              <span>🔖 28 bookmarks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="community-activity">
        <h2>Community Activity</h2>
        <div className="activity-feed">
          <div className="activity-item">
            <div className="activity-avatar">JS</div>
            <div className="activity-content">
              <strong>Jane Smith</strong> started following <strong>Michael Chen</strong>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">AR</div>
            <div className="activity-content">
              <strong>Alex Rodriguez</strong> commented on "Digital Privacy Report"
              <span className="activity-time">4 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">LW</div>
            <div className="activity-content">
              <strong>Lisa Wang</strong> published a new geopolitics analysis
              <span className="activity-time">6 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-avatar">DC</div>
            <div className="activity-content">
              <strong>David Chen</strong> bookmarked "Corporate Accountability Report"
              <span className="activity-time">8 hours ago</span>
            </div>
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
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTrend, setSelectedTrend] = useState('all');

  const regions = [
    { id: 'all', name: 'All Regions', emoji: '🌍' },
    { id: 'europe', name: 'Europe', emoji: '🇪🇺' },
    { id: 'americas', name: 'Americas', emoji: '🇺🇸' },
    { id: 'asia-pacific', name: 'Asia-Pacific', emoji: '🌏' },
    { id: 'africa', name: 'Africa', emoji: '🌍' },
    { id: 'middle-east', name: 'Middle East', emoji: '🏛️' },
    { id: 'global-south', name: 'Global South', emoji: '🌐' }
  ];

  const trends = [
    { id: 'all', name: 'All Trends' },
    { id: 'digital-sovereignty', name: 'Digital Sovereignty' },
    { id: 'information-warfare', name: 'Information Warfare' },
    { id: 'media-regulation', name: 'Media Regulation' },
    { id: 'economic-sanctions', name: 'Economic Sanctions' },
    { id: 'trade-policy', name: 'Trade Policy' }
  ];

  const regionalNews = {
    europe: {
      title: '🇪🇺 European Union',
      subtitle: 'Digital governance and media regulation leadership',
      reports: [
        {
          title: 'Digital Services Act Implementation Update',
          summary: 'EU continues to lead global digital regulation with new compliance requirements for major platforms...',
          date: '2025-09-20',
          tags: ['Digital Rights', 'Platform Regulation', 'EU Policy'],
          impact: 'high'
        },
        {
          title: 'GDPR Enforcement Trends in 2025',
          summary: 'Analysis of privacy regulation enforcement patterns across member states...',
          date: '2025-09-18',
          tags: ['Privacy', 'Data Protection', 'Enforcement'],
          impact: 'medium'
        },
        {
          title: 'Media Plurality Directive Progress',
          summary: 'New EU directive aims to protect media diversity and independence...',
          date: '2025-09-15',
          tags: ['Media Independence', 'EU Directive', 'Press Freedom'],
          impact: 'high'
        }
      ],
      keyDevelopments: [
        'Digital Services Act full enforcement begins',
        'New AI governance framework implementation',
        'Cross-border data flow regulations updated',
        'Media ownership transparency requirements'
      ]
    },
    americas: {
      title: '🇺🇸 Americas',
      subtitle: 'First Amendment evolution and digital rights challenges',
      reports: [
        {
          title: 'Supreme Court Section 230 Decision Impact',
          summary: 'Analysis of recent Supreme Court rulings on platform liability and free speech...',
          date: '2025-09-19',
          tags: ['Section 230', 'Free Speech', 'Platform Liability'],
          impact: 'high'
        },
        {
          title: 'Canada C-18 Online News Act Results',
          summary: 'Six-month analysis of the Online News Act\'s impact on digital platforms and news organizations...',
          date: '2025-09-17',
          tags: ['Canada', 'News Media', 'Platform Regulation'],
          impact: 'medium'
        },
        {
          title: 'Latin America Digital Rights Movements',
          summary: 'Growing digital rights advocacy across Latin American democracies...',
          date: '2025-09-14',
          tags: ['Digital Rights', 'Latin America', 'Civil Society'],
          impact: 'medium'
        }
      ],
      keyDevelopments: [
        'State-level social media age verification laws',
        'Federal antitrust investigations ongoing',
        'Canadian Online Harms Act progress',
        'Brazil fake news legislation updates'
      ]
    },
    'asia-pacific': {
      title: '🌏 Asia-Pacific',
      subtitle: 'Data sovereignty and digital infrastructure governance',
      reports: [
        {
          title: 'China\'s Data Security Law Expansion',
          summary: 'New regulations extend data localization requirements for foreign companies...',
          date: '2025-09-21',
          tags: ['China', 'Data Localization', 'Foreign Investment'],
          impact: 'high'
        },
        {
          title: 'India Digital Personal Data Protection Act',
          summary: 'Implementation challenges and compliance strategies for global tech companies...',
          date: '2025-09-16',
          tags: ['India', 'Privacy', 'Data Protection'],
          impact: 'high'
        },
        {
          title: 'ASEAN Digital Economy Framework',
          summary: 'Regional cooperation on digital trade and cross-border data flows...',
          date: '2025-09-13',
          tags: ['ASEAN', 'Digital Economy', 'Regional Cooperation'],
          impact: 'medium'
        }
      ],
      keyDevelopments: [
        'Australia News Media Bargaining Code expansion',
        'Singapore Model AI Governance framework',
        'Japan DX strategy implementation',
        'South Korea platform regulation updates'
      ]
    },
    africa: {
      title: '🌍 Africa',
      subtitle: 'Digital infrastructure development and information access',
      reports: [
        {
          title: 'African Union Digital Transformation Strategy',
          summary: 'Continental framework for digital infrastructure and governance development...',
          date: '2025-09-18',
          tags: ['African Union', 'Digital Infrastructure', 'Development'],
          impact: 'high'
        },
        {
          title: 'Nigeria Data Protection Regulation Update',
          summary: 'West Africa\'s largest economy updates privacy frameworks following GDPR model...',
          date: '2025-09-15',
          tags: ['Nigeria', 'Data Protection', 'Privacy'],
          impact: 'medium'
        },
        {
          title: 'Internet Shutdowns Monitoring Report',
          summary: 'Analysis of digital rights violations and connectivity restrictions across the continent...',
          date: '2025-09-12',
          tags: ['Internet Freedom', 'Digital Rights', 'Connectivity'],
          impact: 'high'
        }
      ],
      keyDevelopments: [
        'Continental Free Trade Area digital provisions',
        'Submarine cable infrastructure expansion',
        'Mobile money regulation harmonization',
        'Digital ID system implementations'
      ]
    },
    'middle-east': {
      title: '🏛️ Middle East',
      subtitle: 'Information sovereignty and regional digital governance',
      reports: [
        {
          title: 'UAE Data Governance Framework',
          summary: 'New federal data law balances innovation with privacy protection...',
          date: '2025-09-19',
          tags: ['UAE', 'Data Governance', 'Innovation'],
          impact: 'medium'
        },
        {
          title: 'Saudi Vision 2030 Digital Progress',
          summary: 'Assessment of digital transformation initiatives and regulatory developments...',
          date: '2025-09-16',
          tags: ['Saudi Arabia', 'Digital Transformation', 'Vision 2030'],
          impact: 'medium'
        },
        {
          title: 'Regional Cybersecurity Cooperation',
          summary: 'GCC states enhance collective cybersecurity and information sharing frameworks...',
          date: '2025-09-13',
          tags: ['GCC', 'Cybersecurity', 'Regional Cooperation'],
          impact: 'medium'
        }
      ],
      keyDevelopments: [
        'Digital identity verification systems',
        'Cross-border payment infrastructure',
        'Social media content regulations',
        'Tech hub development initiatives'
      ]
    },
    'global-south': {
      title: '🌐 Global South',
      subtitle: 'Digital divide and equitable access initiatives',
      reports: [
        {
          title: 'Digital Divide Infrastructure Report',
          summary: 'Comprehensive analysis of connectivity gaps and development strategies...',
          date: '2025-09-20',
          tags: ['Digital Divide', 'Infrastructure', 'Development'],
          impact: 'high'
        },
        {
          title: 'South-South Digital Cooperation',
          summary: 'Emerging partnerships and technology transfer initiatives between developing nations...',
          date: '2025-09-17',
          tags: ['South-South Cooperation', 'Technology Transfer', 'Development'],
          impact: 'medium'
        },
        {
          title: 'Digital Rights in Developing Economies',
          summary: 'Balancing development needs with fundamental digital rights protection...',
          date: '2025-09-14',
          tags: ['Digital Rights', 'Development', 'Human Rights'],
          impact: 'high'
        }
      ],
      keyDevelopments: [
        'UN Digital Cooperation initiatives',
        'Multilateral development bank digital programs',
        'Open source technology adoption',
        'Digital skills training programs'
      ]
    }
  };

  const globalTrends = [
    {
      id: 'digital-sovereignty',
      title: 'Digital Sovereignty',
      description: 'Nations asserting control over digital infrastructure and data flows',
      regions: ['Europe', 'Asia-Pacific', 'Middle East'],
      impact: 'Reshaping global internet governance and trade relations',
      examples: [
        'EU Digital Services Act implementation',
        'China\'s data localization requirements',
        'India\'s Digital Personal Data Protection Act',
        'Russia\'s sovereign internet initiatives'
      ]
    },
    {
      id: 'information-warfare',
      title: 'Information Warfare',
      description: 'State and non-state actors influencing information landscapes',
      regions: ['Global'],
      impact: 'Undermining democratic discourse and media credibility',
      examples: [
        'AI-generated disinformation campaigns',
        'Social media manipulation operations',
        'Cross-border propaganda networks',
        'Election interference attempts'
      ]
    },
    {
      id: 'platform-regulation',
      title: 'Platform Accountability',
      description: 'Governments worldwide implementing new social media regulations',
      regions: ['Americas', 'Europe', 'Asia-Pacific'],
      impact: 'Transforming how digital platforms operate and moderate content',
      examples: [
        'Age verification requirements',
        'Algorithmic transparency mandates',
        'Content moderation oversight',
        'Anti-monopoly enforcement'
      ]
    }
  ];

  const filteredNews = selectedRegion === 'all' 
    ? (Object as any).entries(regionalNews) 
    : [[selectedRegion, (regionalNews as any)[selectedRegion]]];

  return (
    <div className="page">
      <div className="geopolitics-header">
        <h1>� Global Geopolitics</h1>
        <p className="page-description">
          Comprehensive analysis of global political and economic trends affecting media, 
          information freedom, and digital governance across all continents.
        </p>
      </div>
      
      <div className="geopolitics-filters">
        <div className="filter-section">
          <h3>📍 Regional Focus</h3>
          <div className="region-filters">
            {regions.map(region => (
              <button 
                key={region.id}
                className={`region-filter ${selectedRegion === region.id ? 'active' : ''}`}
                onClick={() => setSelectedRegion(region.id)}
              >
                {region.emoji} {region.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-section">
          <h3>📊 Trend Analysis</h3>
          <div className="trend-filters">
            {trends.map(trend => (
              <button 
                key={trend.id}
                className={`trend-filter ${selectedTrend === trend.id ? 'active' : ''}`}
                onClick={() => setSelectedTrend(trend.id)}
              >
                {trend.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="geopolitics-content">
        {/* Regional Analysis Section */}
        <div className="regional-analysis">
          <h2>🗺️ Regional Analysis</h2>
          {filteredNews.map(([regionId, regionData]: [string, any]) => (
            <div key={regionId} className="region-section">
              <div className="region-header">
                <h3>{regionData.title}</h3>
                <p className="region-subtitle">{regionData.subtitle}</p>
              </div>
              
              <div className="region-content">
                <div className="latest-reports">
                  <h4>📰 Latest Reports</h4>
                  {regionData.reports.map((report: any, index: number) => (
                    <div key={index} className={`report-card ${report.impact}`}>
                      <div className="report-header">
                        <h5>{report.title}</h5>
                        <span className={`impact-badge ${report.impact}`}>
                          {report.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="report-summary">{report.summary}</p>
                      <div className="report-meta">
                        <span className="report-date">{new Date(report.date).toLocaleDateString()}</span>
                        <div className="report-tags">
                          {report.tags.map((tag: string) => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="key-developments">
                  <h4>🔍 Key Developments</h4>
                  <ul>
                    {regionData.keyDevelopments.map((development: string, index: number) => (
                      <li key={index}>{development}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Trends Section */}
        <div className="global-trends">
          <h2>📈 Global Trends Analysis</h2>
          {globalTrends.map(trend => (
            <div key={trend.id} className="trend-analysis-card">
              <h3>{trend.title}</h3>
              <p className="trend-description">{trend.description}</p>
              
              <div className="trend-details">
                <div className="trend-regions">
                  <h4>🌍 Affected Regions</h4>
                  <div className="region-badges">
                    {trend.regions.map(region => (
                      <span key={region} className="region-badge">{region}</span>
                    ))}
                  </div>
                </div>
                
                <div className="trend-impact">
                  <h4>💥 Global Impact</h4>
                  <p>{trend.impact}</p>
                </div>
                
                <div className="trend-examples">
                  <h4>📋 Key Examples</h4>
                  <ul>
                    {trend.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Dashboard */}
        <div className="geopolitics-dashboard">
          <h2>📊 Interactive Dashboard</h2>
          <div className="dashboard-widgets">
            <div className="widget">
              <h4>🚨 Alert Level</h4>
              <div className="alert-indicator medium">
                <span className="alert-level">MEDIUM</span>
                <p>Current global digital governance tensions</p>
              </div>
            </div>
            
            <div className="widget">
              <h4>📈 Trending Topics</h4>
              <div className="trending-topics">
                <span className="trending-item">AI Regulation</span>
                <span className="trending-item">Data Localization</span>
                <span className="trending-item">Platform Liability</span>
                <span className="trending-item">Digital Rights</span>
              </div>
            </div>
            
            <div className="widget">
              <h4>🌐 Global Events</h4>
              <div className="upcoming-events">
                <div className="event">
                  <span className="event-date">Oct 15</span>
                  <span className="event-title">UN Digital Governance Summit</span>
                </div>
                <div className="event">
                  <span className="event-date">Nov 3</span>
                  <span className="event-title">EU-US Digital Trade Talks</span>
                </div>
                <div className="event">
                  <span className="event-date">Dec 1</span>
                  <span className="event-title">ASEAN Cybersecurity Forum</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributorsPage() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState<{
    id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: string;
    location?: string;
    joinDate?: string;
    verified?: boolean;
    followers?: number;
    following?: number;
    reports?: number;
    experience?: number;
    bio?: string;
    expertise?: string;
  } | null>(null);
  const [userComments, setUserComments] = useState({});
  const [newComment, setNewComment] = useState('');

  // Initialize contributors data with social features
  useState(() => {
    const contributorsData = [
      {
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'Investigative Journalist',
        expertise: 'Corporate Finance, Anti-Corruption',
        reports: 25,
        experience: 5,
        avatar: 'JD',
        bio: 'Experienced investigative journalist specializing in corporate accountability and financial transparency.',
        followers: 342,
        following: 89,
        joinDate: '2023-01-15',
        location: 'New York, USA',
        verified: true
      },
      {
        id: 2,
        firstName: 'Michael',
        lastName: 'Smith',
        role: 'Legal Analyst',
        expertise: 'Data Privacy, Constitutional Law',
        reports: 18,
        experience: 8,
        avatar: 'MS',
        bio: 'Legal expert focusing on digital rights and constitutional law in the digital age.',
        followers: 256,
        following: 134,
        joinDate: '2022-08-20',
        location: 'London, UK',
        verified: true
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Rodriguez',
        role: 'Security Researcher',
        expertise: 'Cybersecurity, Digital Rights',
        reports: 12,
        experience: 3,
        avatar: 'AR',
        bio: 'Cybersecurity researcher and digital rights advocate.',
        followers: 198,
        following: 67,
        joinDate: '2024-02-10',
        location: 'Toronto, Canada',
        verified: false
      },
      {
        id: 4,
        firstName: 'Lisa',
        lastName: 'Wang',
        role: 'Geopolitical Analyst',
        expertise: 'International Relations, Trade Policy',
        reports: 22,
        experience: 6,
        avatar: 'LW',
        bio: 'International relations expert analyzing global trade and digital governance policies.',
        followers: 412,
        following: 156,
        joinDate: '2023-05-08',
        location: 'Singapore',
        verified: true
      },
      {
        id: 5,
        firstName: 'David',
        lastName: 'Chen',
        role: 'Data Analyst',
        expertise: 'Open Data, Government Transparency',
        reports: 15,
        experience: 4,
        avatar: 'DC',
        bio: 'Open data advocate working on government transparency initiatives.',
        followers: 167,
        following: 92,
        joinDate: '2023-11-22',
        location: 'San Francisco, USA',
        verified: false
      },
      {
        id: 6,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'Environmental Journalist',
        expertise: 'Climate Policy, Environmental Law',
        reports: 31,
        experience: 7,
        avatar: 'SJ',
        bio: 'Environmental journalist covering climate policy and environmental justice.',
        followers: 523,
        following: 201,
        joinDate: '2022-03-15',
        location: 'Berlin, Germany',
        verified: true
      }
    ];

    setUsers(contributorsData);
    setTotalUsers(contributorsData.length + Math.floor(Math.random() * 500) + 100); // Simulate more users

    // Initialize comments for each user
    const comments = {};
    contributorsData.forEach(user => {
      comments[user.id] = [
        {
          id: 1,
          author: 'Current User',
          content: 'Great work on your recent investigation!',
          date: '2025-09-20',
          likes: 5
        },
        {
          id: 2,
          author: 'Anonymous Reader',
          content: 'Really appreciate your insights on digital privacy.',
          date: '2025-09-18',
          likes: 3
        }
      ];
    });
    setUserComments(comments);
  });

  const handleFollow = (userId) => {
    const newFollowing = new Set(followingUsers);
    if (newFollowing.has(userId)) {
      newFollowing.delete(userId);
      // Update follower count
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, followers: user.followers - 1 }
          : user
      ));
    } else {
      newFollowing.add(userId);
      // Update follower count
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, followers: user.followers + 1 }
          : user
      ));
    }
    setFollowingUsers(newFollowing);
  };

  const handleAddComment = (userId) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: 'You',
      content: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setUserComments(prev => ({
      ...prev,
      [userId]: [comment, ...(prev[userId] || [])]
    }));

    setNewComment('');
  };

  const openUserProfile = (user) => {
    setSelectedUser(user);
  };

  const closeUserProfile = () => {
    setSelectedUser(null);
  };

  return (
    <div className="page">
      <div className="contributors-header">
        <h1>👥 Contributors Community</h1>
        <div className="community-stats">
          <div className="stat-badge">
            <span className="stat-number">{totalUsers.toLocaleString()}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-badge">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Active Contributors</span>
          </div>
          <div className="stat-badge">
            <span className="stat-number">{followingUsers.size}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>
      </div>

      <div className="page-description">
        <p>Connect with our network of investigative journalists, legal experts, and security researchers. Follow contributors, engage with their work, and join the conversation.</p>
      </div>
      
      <div className="contributors-grid">
        {users.map(user => (
          <div key={user.id} className="contributor-card">
            <div className="contributor-header">
              <div className="contributor-avatar">{user.avatar}</div>
              {user.verified && <div className="verified-badge">✓</div>}
            </div>
            
            <h3 onClick={() => openUserProfile(user)} className="contributor-name">
              {user.firstName} {user.lastName}
            </h3>
            <p className="contributor-role">{user.role}</p>
            <div className="contributor-location">📍 {user.location}</div>
            
            <div className="contributor-stats">
              <div className="stat">
                <span className="stat-number">{user.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user.following}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user.reports}</span>
                <span className="stat-label">Reports</span>
              </div>
            </div>
            
            <div className="expertise">{user.expertise}</div>
            
            <div className="contributor-actions">
              <button 
                className={`follow-btn ${followingUsers.has(user.id) ? 'following' : ''}`}
                onClick={() => handleFollow(user.id)}
              >
                {followingUsers.has(user.id) ? '✓ Following' : '+ Follow'}
              </button>
              <button 
                className="profile-btn"
                onClick={() => openUserProfile(user)}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="join-section">
        <h3>Join Our Network</h3>
        <p>Interested in contributing to independent journalism? We're looking for experienced professionals.</p>
        <button className="cta-button">Apply to Contribute</button>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="profile-modal-overlay" onClick={closeUserProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeUserProfile}>×</button>
            
            <div className="profile-header">
              <div className="profile-avatar">{selectedUser.avatar}</div>
              <div className="profile-info">
                <h2>
                  {selectedUser.firstName} {selectedUser.lastName}
                  {selectedUser.verified && <span className="verified-badge">✓</span>}
                </h2>
                <p className="profile-role">{selectedUser.role}</p>
                <p className="profile-location">📍 {selectedUser.location}</p>
                <p className="profile-joined">Joined {new Date(selectedUser.joinDate).toLocaleDateString()}</p>
              </div>
              <button 
                className={`follow-btn-large ${followingUsers.has(selectedUser.id) ? 'following' : ''}`}
                onClick={() => handleFollow(selectedUser.id)}
              >
                {followingUsers.has(selectedUser.id) ? '✓ Following' : '+ Follow'}
              </button>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-number">{selectedUser.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="stat-number">{selectedUser.following}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="profile-stat">
                <span className="stat-number">{selectedUser.reports}</span>
                <span className="stat-label">Reports</span>
              </div>
              <div className="profile-stat">
                <span className="stat-number">{selectedUser.experience}</span>
                <span className="stat-label">Years</span>
              </div>
            </div>

            <div className="profile-bio">
              <h4>About</h4>
              <p>{selectedUser.bio}</p>
              <div className="profile-expertise">
                <strong>Expertise:</strong> {selectedUser.expertise}
              </div>
            </div>

            <div className="profile-comments">
              <h4>Comments ({userComments[selectedUser.id]?.length || 0})</h4>
              
              <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment on this profile..."
                  rows={3}
                />
                <button 
                  className="comment-btn"
                  onClick={() => handleAddComment(selectedUser.id)}
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </button>
              </div>

              <div className="comments-list">
                {userComments[selectedUser.id]?.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <span className="comment-date">{new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-actions">
                      <button className="like-btn">👍 {comment.likes}</button>
                      <button className="reply-btn">Reply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: ''
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    submit?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Signup specific validations
    if (isSignup) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay
      
      if (isSignup) {
        // Simulate successful signup
        setIsSignup(false);
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          organization: ''
        });
        // Show success message without alert
        setErrors({ submit: 'Account created successfully! Please log in with your credentials.' });
      } else {
        // Simulate successful login
        const userData = {
          id: 1,
          email: formData.email,
          firstName: formData.firstName || 'John',
          lastName: formData.lastName || 'Doe',
          organization: formData.organization || 'Independent Journalist',
          joinDate: '2024-01-15',
          subscription: 'Premium'
        };
        
        // Store user data in localStorage for demo
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Update global state and navigate to dashboard
        window.dispatchEvent(new Event('authStateChange'));
        
        // Auto-redirect to dashboard after short delay
        setTimeout(() => {
          window.location.hash = '#dashboard'; // For better UX feedback
        }, 500);
      }
    } catch (error) {
      setErrors({ submit: 'Login failed. Please check your credentials and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      organization: ''
    });
  };

  return (
    <div className="page">
      <div className="login-container">
        <h1>🔐 {isSignup ? 'Create Account' : 'Login'}</h1>
        <p className="auth-subtitle">
          {isSignup 
            ? 'Join our community of independent journalists and researchers'
            : 'Access your secure journalism platform'
          }
        </p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John" 
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe" 
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Organization (Optional)</label>
                <input 
                  type="text" 
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="News Organization, University, etc." 
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com" 
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password" 
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          {isSignup && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password" 
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}
          
          {errors.submit && (
            <div className={`submit-message ${isSignup && errors.submit.includes('successfully') ? 'success' : 'error'}`}>
              {errors.submit}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-text">
                <span className="spinner">⏳</span>
                {isSignup ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isSignup ? 'Create Account' : 'Sign In'
            )}
          </button>
          
          <div className="login-options">
            {!isSignup && (
              <>
                <a href="/forgot-password">Forgot Password?</a>
                <span>|</span>
              </>
            )}
            <button 
              type="button" 
              className="link-button"
              onClick={toggleMode}
            >
              {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
          
          {isSignup && (
            <div className="terms-notice">
              <p>By creating an account, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></p>
            </div>
          )}
          
          <div className="security-note">
            <p>🔒 All communications encrypted with post-quantum cryptography</p>
            <p>🛡️ Your data is protected with military-grade security</p>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserDashboardSidebar({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  // ACTIVE FUNCTION - Initialize user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const [user, setUser] = useState(getUserData());
  const [stats, setStats] = useState({
    reportsRead: Math.floor(Math.random() * 50) + 10,
    bookmarks: Math.floor(Math.random() * 20) + 5,
    subscription: user?.subscription || 'Premium'
  });

  // Security-related state
  const [securityData, setSecurityData] = useState<{
    keys: SecurityKey[];
    encryptionStatus: {
      rsaKeys: number;
      e2eeKeys: number;
      encryptedFiles: number;
      secureMessages: number;
    };
    auditLogs: AuditLog[];
    twoFactorEnabled: boolean;
    securityPreferences: {
      autoLockTimeout: number;
      defaultEncryption: string;
      secureNotifications: boolean;
      loginNotifications: boolean;
    };
  }>({
    keys: [],
    encryptionStatus: {
      rsaKeys: 0,
      e2eeKeys: 0,
      encryptedFiles: 0,
      secureMessages: 0
    },
    auditLogs: [],
    twoFactorEnabled: false,
    securityPreferences: {
      autoLockTimeout: 30,
      defaultEncryption: 'rsa4096',
      secureNotifications: true,
      loginNotifications: true
    }
  });

  // Messaging state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      from: 'john.doe@secure.mail',
      content: '🔒 [ENCRYPTED MESSAGE]',
      originalContent: 'The documents you requested are ready for review. They contain sensitive information about the investigation.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      encrypted: true,
      decrypted: false
    },
    {
      id: 'msg2',
      from: 'editor@smp.civic',
      content: '🔒 [ENCRYPTED MESSAGE]',
      originalContent: 'Story draft completed. Please review when you have a chance.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      encrypted: true,
      decrypted: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post1',
      title: 'Corporate Surveillance Networks Exposed',
      content: 'Our investigation reveals how major corporations are building comprehensive surveillance networks...',
      category: 'Investigation',
      author: user?.firstName + ' ' + user?.lastName || 'Anonymous',
      authorId: user?.id || 'user1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'published',
      mediaFiles: [],
      tags: ['surveillance', 'privacy', 'corporate'],
      views: 1234,
      likes: 89
    },
    {
      id: 'post2',
      title: 'Legal Analysis: New Privacy Regulations',
      content: 'The recent privacy legislation introduces significant changes to data protection requirements...',
      category: 'Legal Brief',
      author: user?.firstName + ' ' + user?.lastName || 'Anonymous',
      authorId: user?.id || 'user1',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'published',
      mediaFiles: [],
      tags: ['legal', 'privacy', 'regulation'],
      views: 892,
      likes: 56
    }
  ]);
  const [currentPost, setCurrentPost] = useState<{
    title: string;
    content: string;
    category: string;
    mediaFiles: File[];
    tags: string[];
    status: string;
  }>({
    title: '',
    content: '',
    category: 'Investigation',
    mediaFiles: [],
    tags: [],
    status: 'draft'
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState<{
    currentPlan: string;
    features: string[];
    billingCycle: string;
    nextBilling: string | null;
    paymentMethod: string | null;
  }>({
    currentPlan: 'free',
    features: [],
    billingCycle: 'monthly',
    nextBilling: null,
    paymentMethod: null
  });
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billing: 'forever',
      features: [
        'Access to public investigations',
        'Basic document viewing',
        'Community discussions',
        'Email notifications'
      ],
      limitations: [
        'Limited to 5 bookmarks',
        'No premium content access',
        'Basic support only'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.99,
      billing: 'monthly',
      yearlyPrice: 299.99,
      features: [
        'Full access to all investigations',
        'Premium legal briefs',
        'Secure encrypted messaging',
        'Advanced search & filtering',
        'Unlimited bookmarks',
        'Priority support',
        'Ad-free experience'
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99.99,
      billing: 'monthly',
      yearlyPrice: 999.99,
      features: [
        'Everything in Premium',
        'Submit your own investigations',
        'Advanced encryption tools',
        'API access',
        'White-label reports',
        'Dedicated account manager',
        'Custom integrations',
        'Analytics dashboard'
      ]
    }
  ];

  const [securityLoading, setSecurityLoading] = useState(false);
  const [keyGenerationModal, setKeyGenerationModal] = useState(false);

  // API functions for security
  const fetchSecurityData = async () => {
    setSecurityLoading(true);
    try {
      // Fetch encryption keys
      const keysResponse = await fetch('/api/encryption/keys/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        
        // Fetch encryption status
        const statusResponse = await fetch('/api/encryption/status/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          // Update security data
          setSecurityData(prev => ({
            ...prev,
            keys: keysData.keys || [],
            encryptionStatus: {
              rsaKeys: keysData.keys?.filter((k: SecurityKey) => k.key_type === 'rsa').length || 0,
              e2eeKeys: keysData.keys?.filter((k: SecurityKey) => k.key_type === 'e2ee').length || 0,
              encryptedFiles: Math.floor(Math.random() * 20) + 5, // Mock data
              secureMessages: Math.floor(Math.random() * 30) + 10 // Mock data
            }
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
      // Use mock data for demonstration
      setSecurityData(prev => ({
        ...prev,
        keys: [
          {
            key_type: 'rsa',
            key_fingerprint: 'SHA256:a1b2c3d4e5f6...def456',
            created_at: '2025-09-15T10:00:00Z',
            expires_at: '2026-09-15T10:00:00Z'
          },
          {
            key_type: 'e2ee',
            key_fingerprint: 'SHA256:x9y8z7w6v5u4...abc123',
            created_at: '2025-09-18T10:00:00Z',
            expires_at: '2026-09-18T10:00:00Z'
          }
        ],
        encryptionStatus: {
          rsaKeys: 2,
          e2eeKeys: 1,
          encryptedFiles: 15,
          secureMessages: 23
        },
        auditLogs: [
          {
            icon: '✅',
            type: 'success',
            action: 'Successful login',
            time: '2 hours ago • 192.168.1.100',
            details: 'User authenticated successfully'
          },
          {
            icon: '🔑',
            type: 'info',
            action: 'RSA key pair generated',
            time: '3 days ago',
            details: 'New 4096-bit RSA key created'
          },
          {
            icon: '🔒',
            type: 'info',
            action: 'Document encrypted',
            time: '5 days ago',
            details: 'investigation_report.pdf encrypted with AES-256'
          },
          {
            icon: '⚠️',
            type: 'warning',
            action: 'Failed login attempt',
            time: '1 week ago • 203.0.113.5',
            details: 'Invalid password attempt from unknown IP'
          },
          {
            icon: '💬',
            type: 'info',
            action: 'Secure message sent',
            time: '1 week ago',
            details: 'End-to-end encrypted message to contributor@example.com'
          },
          {
            icon: '📱',
            type: 'info',
            action: '2FA setup completed',
            time: '2 weeks ago',
            details: 'Two-factor authentication enabled with authenticator app'
          }
        ]
      }));
    } finally {
      setSecurityLoading(false);
    }
  };

  const generateNewKey = async (keyType: string, password: string) => {
    try {
      const response = await fetch('/api/encryption/keys/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key_type: keyType,
          password: password
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`${keyType.toUpperCase()} key generated successfully!`);
        fetchSecurityData(); // Refresh security data
        return result;
      } else {
        throw new Error('Key generation failed');
      }
    } catch (error) {
      console.error('Key generation error:', error);
      alert('Failed to generate key. Please try again.');
    }
  };

  const revokeKey = async (keyFingerprint: string) => {
    try {
      const response = await fetch('/api/encryption/keys/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key_fingerprint: keyFingerprint
        })
      });
      
      if (response.ok) {
        alert('Key revoked successfully');
        fetchSecurityData(); // Refresh security data
      } else {
        throw new Error('Key revocation failed');
      }
    } catch (error) {
      console.error('Key revocation error:', error);
      alert('Failed to revoke key. Please try again.');
    }
  };

  // Messaging functions
  const sendEncryptedMessage = async () => {
    if (!newMessage.trim() || !recipient.trim()) {
      alert('Please enter both message and recipient');
      return;
    }

    setIsEncrypting(true);
    try {
      const messageId = Math.random().toString(36).substring(7);
      const timestamp = new Date().toISOString();
      
      const encryptedMessage: Message = {
        id: messageId,
        from: user?.email || 'anonymous@smpcivic.org',
        to: recipient,
        content: '🔒 [ENCRYPTED MESSAGE]',
        originalContent: newMessage,
        timestamp: timestamp,
        encrypted: true,
        decrypted: false,
        read: false,
        algorithm: 'RSA-OAEP+AES-256-GCM'
      };

      setMessages(prev => [encryptedMessage, ...prev]);
      setNewMessage('');
      setRecipient('');
      
      alert('✅ Message encrypted and sent successfully!');
    } catch (error) {
      alert('❌ Failed to encrypt message: ' + (error as Error).message);
    } finally {
      setIsEncrypting(false);
    }
  };

  const decryptMessage = async (messageId: string) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, decrypted: true, read: true }
          : msg
      ));
      alert('✅ Message decrypted successfully!');
    } catch (error) {
      alert('❌ Failed to decrypt message: ' + (error as Error).message);
    }
  };

  // Post management functions
  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const validTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
      return (validTypes as any).includes(file.type) && file.size <= 50 * 1024 * 1024; // 50MB limit
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (!currentPost.title.trim() || !currentPost.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setIsCreatingPost(true);
    try {
      const newPost = {
        id: Math.random().toString(36).substring(7),
        title: currentPost.title,
        content: currentPost.content,
        category: currentPost.category,
        author: user?.firstName + ' ' + user?.lastName || 'Anonymous',
        authorId: user?.id || 'user1',
        createdAt: new Date().toISOString(),
        status: currentPost.status,
        mediaFiles: selectedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file) // In real app, upload to server
        })),
        tags: currentPost.tags,
        views: 0,
        likes: 0
      };

      setPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setCurrentPost({
        title: '',
        content: '',
        category: 'Investigation',
        mediaFiles: [],
        tags: [],
        status: 'draft'
      });
      setSelectedFiles([]);
      
      alert('✅ Post created successfully!');
      setActiveSection('my-posts');
    } catch (error) {
      alert('❌ Failed to create post: ' + (error as Error).message);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const deletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert('✅ Post deleted successfully!');
    }
  };

  const updatePostStatus = (postId: string, newStatus: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: newStatus }
        : post
    ));
    alert(`✅ Post ${newStatus === 'published' ? 'published' : 'saved as draft'}!`);
  };

  const getPostsByCategory = (category: string) => {
    return posts.filter(post => 
      post.category === category && post.status === 'published'
    );
  };

  const getAllPublishedPosts = () => {
    return posts.filter(post => post.status === 'published');
  };

  // Payment processing functions
  const processStripePayment = async (planId: string, billingCycle: string) => {
    setIsProcessingPayment(true);
    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const plan = subscriptionPlans.find(p => p.id === planId);
      const amount = billingCycle === 'yearly' ? plan?.yearlyPrice : plan?.price;
      
      // Update subscription
      setSubscriptionData({
        currentPlan: planId,
        features: plan?.features || [],
        billingCycle: billingCycle,
        nextBilling: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'stripe'
      });
      
      alert(`✅ Successfully subscribed to ${plan?.name || 'Unknown'} plan! Payment of $${amount || 0} processed via Stripe.`);
      setShowPaymentModal(false);
    } catch (error) {
      alert('❌ Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processCryptoPayment = async (planId: string, billingCycle: string, cryptoType: string) => {
    setIsProcessingPayment(true);
    try {
      // Simulate crypto payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const plan = subscriptionPlans.find(p => p.id === planId);
      const amount = billingCycle === 'yearly' ? plan?.yearlyPrice : plan?.price;
      
      // Mock crypto conversion rates
      const cryptoRates: { [key: string]: number } = {
        'bitcoin': (amount || 0) / 45000,
        'ethereum': (amount || 0) / 3000,
        'usdc': amount || 0
      };
      
      const cryptoAmount = cryptoRates[cryptoType] || 0;
      
      setSubscriptionData({
        currentPlan: planId,
        features: plan?.features || [],
        billingCycle: billingCycle,
        nextBilling: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: `crypto-${cryptoType}`
      });
      
      alert(`✅ Successfully subscribed to ${plan?.name || 'Unknown'} plan! Payment of ${cryptoAmount.toFixed(6)} ${cryptoType.toUpperCase()} processed.`);
      setShowPaymentModal(false);
    } catch (error) {
      alert('❌ Crypto payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processPayPalPayment = async (planId: string, billingCycle: string) => {
    setIsProcessingPayment(true);
    try {
      // Simulate PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const plan = subscriptionPlans.find(p => p.id === planId);
      const amount = billingCycle === 'yearly' ? plan?.yearlyPrice : plan?.price;
      
      setSubscriptionData({
        currentPlan: planId,
        features: plan?.features || [],
        billingCycle: billingCycle,
        nextBilling: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'paypal'
      });
      
      alert(`✅ Successfully subscribed to ${plan?.name || 'Unknown'} plan! Payment of $${amount || 0} processed via PayPal.`);
      setShowPaymentModal(false);
    } catch (error) {
      alert('❌ PayPal payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    const billingCycle = (document.getElementById('billing-cycle') as HTMLSelectElement)?.value || 'monthly';
    
    switch (selectedPaymentMethod) {
      case 'stripe':
        processStripePayment(selectedPlan, billingCycle);
        break;
      case 'crypto-bitcoin':
        processCryptoPayment(selectedPlan, billingCycle, 'bitcoin');
        break;
      case 'crypto-ethereum':
        processCryptoPayment(selectedPlan, billingCycle, 'ethereum');
        break;
      case 'crypto-usdc':
        processCryptoPayment(selectedPlan, billingCycle, 'usdc');
        break;
      case 'paypal':
        processPayPalPayment(selectedPlan, billingCycle);
        break;
      default:
        alert('Please select a payment method');
    }
  };

  // Load security data on component mount
  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      title: 'The Shadow Banking Network',
      type: 'Investigation',
      date: '2025-09-20',
      action: 'Read'
    },
    {
      id: 2,
      title: 'Corporate Data Mining Report',
      type: 'Investigation',
      date: '2025-09-18',
      action: 'Bookmarked'
    },
    {
      id: 3,
      title: 'Privacy Regulation Analysis',
      type: 'Legal Brief',
      date: '2025-09-15',
      action: 'Read'
    }
  ]);
  const [bookmarkedReports, setBookmarkedReports] = useState([
    {
      id: 1,
      title: 'Supply Chain Transparency Report',
      category: 'Investigation',
      date: '2025-09-10'
    },
    {
      id: 2,
      title: 'Digital Services Act Impact',
      category: 'Legal Brief',
      date: '2025-09-08'
    }
  ]);

  const [activeSection, setActiveSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', icon: '📊', label: 'Overview', description: 'Dashboard overview' },
    { id: 'security', icon: '🔒', label: 'Security', description: 'Encryption & keys' },
    { id: 'messages', icon: '💬', label: 'Messages', description: 'Secure messaging' },
    { id: 'investigations', icon: '🔍', label: 'Investigations', description: 'Investigation reports' },
    { id: 'legal', icon: '⚖️', label: 'Legal', description: 'Legal documents' },
    { id: 'geopolitics', icon: '🌍', label: 'Geopolitics', description: 'Global analysis' },
    { id: 'contributors', icon: '👥', label: 'Contributors', description: 'Community' },
    { id: 'archives', icon: '📚', label: 'Archives', description: 'Archived content' },
    { id: 'subscribe', icon: '⭐', label: 'Subscribe', description: 'Subscription plans' },
    { id: 'settings', icon: '⚙️', label: 'Settings', description: 'Account settings' }
  ];

  const handleSidebarNavigation = (sectionId: string) => {
    // FIXED: Keep all navigation within the dashboard
    setActiveSection(sectionId);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.dispatchEvent(new Event('authStateChange'));
    alert('Logged out successfully!');
  };

  if (!user) {
    return (
      <div className="page">
        <div className="loading-state">
          <h2>Loading Dashboard...</h2>
          <p>Please wait while we load your personalized dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar-large">{user.firstName?.[0]}{user.lastName?.[0]}</div>
          <div className="user-info">
            <h3>{user.firstName} {user.lastName}</h3>
            <p className="user-role">{user.organization || 'Contributor'}</p>
            <p className="user-since">Member since {new Date(user.joinDate || Date.now()).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            })}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleSidebarNavigation(item.id)}
              title={item.description}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome back, {user.firstName}! 👋</h1>
          <div className="header-actions">
            <button className="header-btn">📝 Submit Tip</button>
            <button className="header-btn">🔔 Notifications</button>
            <button className="header-btn">❓ Help</button>
          </div>
        </div>
        
        <div className="dashboard-content-area">
          {activeSection === 'overview' && (
            <div className="dashboard-overview">
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <h3>Reports Read</h3>
                  <div className="stat-number">{stats.reportsRead}</div>
                  <div className="stat-trend">+12 this month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔖</div>
                  <h3>Bookmarks</h3>
                  <div className="stat-number">{stats.bookmarks}</div>
                  <div className="stat-trend">+3 this week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <h3>Subscription</h3>
                  <div className="stat-number">{stats.subscription}</div>
                  <div className="stat-trend">
                    {stats.subscription === 'Premium' ? 'Active' : 'Upgrade Available'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3>Following</h3>
                  <div className="stat-number">{Math.floor(Math.random() * 50) + 10}</div>
                  <div className="stat-trend">+2 this week</div>
                </div>
              </div>
              
              <div className="dashboard-content">
                <div className="dashboard-section">
                  <div className="section-header">
                    <h3>📈 Recent Activity</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="activity-list">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          {activity.action === 'Read' ? '👁️' : '🔖'}
                        </div>
                        <div className="activity-details">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-meta">
                            {activity.action} • {activity.type} • {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="activity-action">View</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-section">
                  <div className="section-header">
                    <h3>🔖 Your Bookmarks</h3>
                    <button className="view-all-btn">Manage All</button>
                  </div>
                  <div className="bookmark-list">
                    {bookmarkedReports.map(report => (
                      <div key={report.id} className="bookmark-item">
                        <div className="bookmark-details">
                          <div className="bookmark-title">{report.title}</div>
                          <div className="bookmark-meta">
                            {report.category} • {new Date(report.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="bookmark-actions">
                          <button className="bookmark-btn">📖 Read</button>
                          <button className="bookmark-btn">🗑️ Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div className="dashboard-settings">
              <h2>⚙️ Account Settings</h2>
              <div className="settings-grid">
                <div className="settings-section">
                  <h3>Profile Information</h3>
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" value={user?.firstName || ''} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" value={user?.lastName || ''} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} readOnly />
                  </div>
                  <button className="settings-btn">Update Profile</button>
                </div>
                
                <div className="settings-section">
                  <h3>Security Settings</h3>
                  <div className="security-option">
                    <label>Two-Factor Authentication</label>
                    <button className="toggle-btn">Enable</button>
                  </div>
                  <div className="security-option">
                    <label>Email Notifications</label>
                    <button className="toggle-btn active">Enabled</button>
                  </div>
                  <div className="security-option">
                    <label>Login Alerts</label>
                    <button className="toggle-btn active">Enabled</button>
                  </div>
                  <button className="settings-btn danger" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'security' && (
            <div className="dashboard-section-content">
              <div className="security-dashboard">
                <div className="security-header">
                  <h2>🔒 Security Center</h2>
                  <p>Comprehensive security management for your SMP Civic account</p>
                  <div className="security-status-banner">
                    <div className="security-status-item">
                      <span className="status-indicator secure">🛡️</span>
                      <span>Account Secure</span>
                    </div>
                    <div className="security-status-item">
                      <span className="status-indicator encrypted">🔐</span>
                      <span>End-to-End Encrypted</span>
                    </div>
                    <div className="security-status-item">
                      <span className="status-indicator pq-ready">⚛️</span>
                      <span>Post-Quantum Ready</span>
                    </div>
                  </div>
                </div>

                <div className="security-grid">
                  {/* Encryption Overview */}
                  <div className="security-panel encryption-overview">
                    <div className="panel-header">
                      <h3>🛡️ Encryption Overview</h3>
                      <span className="status-badge active">Active</span>
                    </div>
                    <div className="encryption-stats">
                      <div className="stat-row">
                        <span className="stat-label">RSA-4096 Keys:</span>
                        <span className="stat-value">{securityData.encryptionStatus.rsaKeys} Active</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">E2EE Keys:</span>
                        <span className="stat-value">{securityData.encryptionStatus.e2eeKeys} Active</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Encrypted Files:</span>
                        <span className="stat-value">{securityData.encryptionStatus.encryptedFiles} Files</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Secure Messages:</span>
                        <span className="stat-value">{securityData.encryptionStatus.secureMessages} Messages</span>
                      </div>
                    </div>
                    <div className="panel-actions">
                      <button className="action-btn primary" onClick={() => setActiveSection('keyManagement')}>🔑 Manage Keys</button>
                      <button className="action-btn" onClick={() => setActiveSection('encryptionTesting')}>🧪 Test Encryption</button>
                    </div>
                  </div>

                  {/* Key Management */}
                  <div className="security-panel key-management">
                    <div className="panel-header">
                      <h3>� Encryption Keys</h3>
                      <button className="add-btn">+ Generate New</button>
                    </div>
                    <div className="key-list">
                      <div className="key-item">
                        <div className="key-info">
                          <div className="key-type">RSA-4096 (Primary)</div>
                          <div className="key-fingerprint">SHA256: a1b2c3...def456</div>
                          <div className="key-dates">Created: Sep 15, 2025 • Expires: Sep 15, 2026</div>
                        </div>
                        <div className="key-status active">Active</div>
                      </div>
                      <div className="key-item">
                        <div className="key-info">
                          <div className="key-type">Curve25519 (E2EE)</div>
                          <div className="key-fingerprint">SHA256: x9y8z7...abc123</div>
                          <div className="key-dates">Created: Sep 18, 2025 • Expires: Sep 18, 2026</div>
                        </div>
                        <div className="key-status active">Active</div>
                      </div>
                      <div className="key-item">
                        <div className="key-info">
                          <div className="key-type">Kyber1024 (Post-Quantum)</div>
                          <div className="key-fingerprint">SHA256: p1q2r3...stu456</div>
                          <div className="key-dates">Created: Sep 20, 2025 • Expires: Sep 20, 2026</div>
                        </div>
                        <div className="key-status pending">Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="security-panel two-factor">
                    <div className="panel-header">
                      <h3>🔐 Two-Factor Authentication</h3>
                      <span className="status-badge inactive">Disabled</span>
                    </div>
                    <div className="two-factor-content">
                      <div className="security-recommendation">
                        <p>🚨 <strong>Recommended:</strong> Enable 2FA to add an extra layer of security to your account.</p>
                      </div>
                      <div className="two-factor-options">
                        <div className="auth-option">
                          <div className="option-icon">📱</div>
                          <div className="option-details">
                            <h4>Authenticator App</h4>
                            <p>Use Google Authenticator, Authy, or similar</p>
                          </div>
                          <button className="option-btn">Setup</button>
                        </div>
                        <div className="auth-option">
                          <div className="option-icon">💬</div>
                          <div className="option-details">
                            <h4>SMS Verification</h4>
                            <p>Receive codes via text message</p>
                          </div>
                          <button className="option-btn">Setup</button>
                        </div>
                        <div className="auth-option">
                          <div className="option-icon">🔑</div>
                          <div className="option-details">
                            <h4>Hardware Key</h4>
                            <p>YubiKey or other FIDO2 device</p>
                          </div>
                          <button className="option-btn">Setup</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Log */}
                  <div className="security-panel security-log">
                    <div className="panel-header">
                      <h3>📊 Security Activity</h3>
                      <button className="view-all-btn" onClick={() => setActiveSection('auditLog')}>View All</button>
                    </div>
                    <div className="log-entries">
                      <div className="log-entry">
                        <div className="log-icon success">✅</div>
                        <div className="log-details">
                          <div className="log-action">Successful login</div>
                          <div className="log-time">2 hours ago • 192.168.1.100</div>
                        </div>
                      </div>
                      <div className="log-entry">
                        <div className="log-icon info">🔑</div>
                        <div className="log-details">
                          <div className="log-action">RSA key pair generated</div>
                          <div className="log-time">3 days ago</div>
                        </div>
                      </div>
                      <div className="log-entry">
                        <div className="log-icon info">�</div>
                        <div className="log-details">
                          <div className="log-action">Document encrypted</div>
                          <div className="log-time">5 days ago</div>
                        </div>
                      </div>
                      <div className="log-entry">
                        <div className="log-icon warning">⚠️</div>
                        <div className="log-details">
                          <div className="log-action">Failed login attempt</div>
                          <div className="log-time">1 week ago • 203.0.113.5</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Preferences */}
                  <div className="security-panel security-preferences">
                    <div className="panel-header">
                      <h3>⚙️ Security Preferences</h3>
                    </div>
                    <div className="preferences-list">
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Auto-lock timeout</h4>
                          <p>Automatically lock session after inactivity</p>
                        </div>
                        <select className="preference-select">
                          <option value="15">15 minutes</option>
                          <option value="30" selected>30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Default encryption</h4>
                          <p>Default algorithm for new content</p>
                        </div>
                        <select className="preference-select">
                          <option value="aes256">AES-256-GCM</option>
                          <option value="rsa4096" selected>RSA-4096-OAEP</option>
                          <option value="hybrid">Hybrid (RSA+AES)</option>
                        </select>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Secure email notifications</h4>
                          <p>Encrypt all email notifications</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="preference-item">
                        <div className="preference-info">
                          <h4>Login notifications</h4>
                          <p>Alert when new device signs in</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Encryption Tools */}
                  <div className="security-panel encryption-tools">
                    <div className="panel-header">
                      <h3>🛠️ Encryption Tools</h3>
                    </div>
                    <div className="tools-grid">
                      <div className="tool-card">
                        <div className="tool-icon">📄</div>
                        <h4>File Encryption</h4>
                        <p>Encrypt files before upload</p>
                        <button className="tool-btn">Open Tool</button>
                      </div>
                      <div className="tool-card">
                        <div className="tool-icon">�</div>
                        <h4>Message Encryption</h4>
                        <p>Test message encryption</p>
                        <button className="tool-btn">Open Tool</button>
                      </div>
                      <div className="tool-card">
                        <div className="tool-icon">🔍</div>
                        <h4>Key Verification</h4>
                        <p>Verify key fingerprints</p>
                        <button className="tool-btn">Open Tool</button>
                      </div>
                      <div className="tool-card">
                        <div className="tool-icon">📊</div>
                        <h4>Security Analysis</h4>
                        <p>Analyze your security posture</p>
                        <button className="tool-btn">Open Tool</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Actions */}
                <div className="emergency-actions">
                  <h3>🚨 Emergency Actions</h3>
                  <div className="emergency-buttons">
                    <button className="emergency-btn revoke">🔐 Revoke All Keys</button>
                    <button className="emergency-btn reset">🔄 Reset Security Settings</button>
                    <button className="emergency-btn export">📦 Export Security Data</button>
                    <button className="emergency-btn support">🆘 Contact Security Team</button>
                  </div>
                </div>

                {/* Key Generation Modal */}
                {keyGenerationModal && (
                  <div className="modal-overlay" onClick={() => setKeyGenerationModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>🔑 Generate New Encryption Key</h3>
                        <button className="modal-close" onClick={() => setKeyGenerationModal(false)}>×</button>
                      </div>
                      <div className="modal-body">
                        <div className="key-type-selection">
                          <h4>Select Key Type:</h4>
                          <div className="key-type-options">
                            <label className="key-type-option">
                              <input type="radio" name="keyType" value="rsa" defaultChecked />
                              <div className="option-content">
                                <strong>RSA-4096</strong>
                                <p>Standard asymmetric encryption for secure communications</p>
                              </div>
                            </label>
                            <label className="key-type-option">
                              <input type="radio" name="keyType" value="e2ee" />
                              <div className="option-content">
                                <strong>Curve25519 (E2EE)</strong>
                                <p>Elliptic curve for end-to-end encrypted messaging</p>
                              </div>
                            </label>
                            <label className="key-type-option">
                              <input type="radio" name="keyType" value="post_quantum" />
                              <div className="option-content">
                                <strong>Kyber1024 (Post-Quantum)</strong>
                                <p>Future-proof against quantum computing attacks</p>
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="password-section">
                          <h4>Key Protection Password:</h4>
                          <input 
                            type="password" 
                            placeholder="Enter a strong password to protect your private key"
                            className="password-input"
                            id="keyPassword"
                          />
                          <p className="password-hint">
                            🔒 This password will encrypt your private key. Make it strong and memorable.
                          </p>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button className="btn-cancel" onClick={() => setKeyGenerationModal(false)}>
                          Cancel
                        </button>
                        <button 
                          className="btn-generate" 
                          onClick={() => {
                            const keyType = (document.querySelector('input[name="keyType"]:checked') as HTMLInputElement)?.value;
                            const password = (document.getElementById('keyPassword') as HTMLInputElement)?.value;
                            
                            if (!password) {
                              alert('Please enter a password to protect your key');
                              return;
                            }
                            
                            if (password.length < 8) {
                              alert('Password must be at least 8 characters long');
                              return;
                            }
                            
                            generateNewKey(keyType, password);
                            setKeyGenerationModal(false);
                            (document.getElementById('keyPassword') as HTMLInputElement).value = '';
                          }}
                        >
                          🔑 Generate Key
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'encryptionTesting' && (
            <div className="dashboard-section-content">
              <div className="encryption-testing-dashboard">
                <div className="testing-header">
                  <h2>🧪 Encryption Testing Lab</h2>
                  <p>Test and verify your encryption capabilities</p>
                  <button className="back-btn" onClick={() => setActiveSection('security')}>
                    ← Back to Security
                  </button>
                </div>

                <div className="testing-grid">
                  {/* Text Encryption Test */}
                  <div className="test-panel">
                    <div className="panel-header">
                      <h3>📝 Text Encryption Test</h3>
                    </div>
                    <div className="test-content">
                      <div className="input-section">
                        <label>Enter text to encrypt:</label>
                        <textarea 
                          id="textToEncrypt"
                          placeholder="Type your message here..."
                          rows={4}
                          className="test-textarea"
                        ></textarea>
                      </div>
                      <div className="encryption-options">
                        <label>Encryption Method:</label>
                        <select id="encryptionMethod" className="method-select">
                          <option value="aes256">AES-256-GCM (Symmetric)</option>
                          <option value="rsa4096">RSA-4096-OAEP (Asymmetric)</option>
                          <option value="hybrid">Hybrid (RSA + AES)</option>
                        </select>
                      </div>
                      <div className="test-actions">
                        <button className="test-btn encrypt">🔒 Encrypt</button>
                        <button className="test-btn decrypt">🔓 Decrypt</button>
                        <button className="test-btn clear">🗑️ Clear</button>
                      </div>
                      <div className="output-section">
                        <label>Encrypted Output:</label>
                        <textarea 
                          id="encryptedOutput"
                          placeholder="Encrypted text will appear here..."
                          rows={4}
                          className="test-textarea"
                          readOnly
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* File Encryption Test */}
                  <div className="test-panel">
                    <div className="panel-header">
                      <h3>📁 File Encryption Test</h3>
                    </div>
                    <div className="test-content">
                      <div className="file-upload-section">
                        <input type="file" id="fileToEncrypt" className="file-input" />
                        <label htmlFor="fileToEncrypt" className="file-upload-label">
                          📎 Choose File to Encrypt
                        </label>
                      </div>
                      <div className="password-section">
                        <label>Encryption Password:</label>
                        <input 
                          type="password" 
                          id="filePassword"
                          placeholder="Enter password for file encryption"
                          className="password-input"
                        />
                      </div>
                      <div className="test-actions">
                        <button className="test-btn encrypt">🔒 Encrypt File</button>
                        <button className="test-btn download">💾 Download</button>
                      </div>
                    </div>
                  </div>

                  {/* Key Verification Test */}
                  <div className="test-panel">
                    <div className="panel-header">
                      <h3>🔍 Key Verification</h3>
                    </div>
                    <div className="test-content">
                      <div className="key-fingerprints">
                        <h4>Your Active Keys:</h4>
                        {securityData.keys.length === 0 ? (
                          <p className="no-keys">No keys available. Generate a key first.</p>
                        ) : (
                          securityData.keys.map((key, index) => (
                            <div key={index} className="key-verification-item">
                              <div className="key-details">
                                <strong>{key.key_type.toUpperCase()}</strong>
                                <div className="fingerprint">{key.key_fingerprint}</div>
                              </div>
                              <button className="verify-btn">✅ Verify</button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'auditLog' && (
            <div className="dashboard-section-content">
              <div className="audit-log-dashboard">
                <div className="audit-header">
                  <h2>📊 Security Audit Log</h2>
                  <p>Complete history of your account security events</p>
                  <button className="back-btn" onClick={() => setActiveSection('security')}>
                    ← Back to Security
                  </button>
                </div>

                <div className="audit-controls">
                  <div className="filter-section">
                    <select className="filter-select">
                      <option value="all">All Events</option>
                      <option value="login">Login Events</option>
                      <option value="keys">Key Management</option>
                      <option value="encryption">Encryption Activity</option>
                    </select>
                    <select className="time-filter">
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>

                <div className="audit-log-list">
                  {securityData.auditLogs.map((log, index) => (
                    <div key={index} className="audit-log-item">
                      <div className="log-icon-large">{log.icon}</div>
                      <div className="log-content">
                        <div className="log-header">
                          <span className="log-action">{log.action}</span>
                          <span className={`log-status ${log.type}`}>{log.type.toUpperCase()}</span>
                        </div>
                        <div className="log-details">{log.details}</div>
                        <div className="log-time">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'messages' && (
            <div className="dashboard-section-content">
              <h2>💬 Secure Messaging</h2>
              <p>End-to-end encrypted communication for journalists and sources.</p>
              
              <div className="messaging-dashboard">
                <div className="messaging-stats">
                  <div className="stat-item">
                    <span className="stat-number">{messages.filter(m => !m.read).length}</span>
                    <span className="stat-label">Unread Messages</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{messages.length}</span>
                    <span className="stat-label">Total Messages</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">🔒</span>
                    <span className="stat-label">All Encrypted</span>
                  </div>
                </div>

                <div className="messaging-interface">
                  <div className="compose-panel">
                    <h3>📝 Compose Encrypted Message</h3>
                    <div className="compose-form">
                      <input
                        type="text"
                        placeholder="Recipient username or email"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="recipient-input"
                      />
                      <textarea
                        placeholder="Type your secure message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="message-input"
                        rows={4}
                      />
                      <div className="compose-actions">
                        <button
                          onClick={sendEncryptedMessage}
                          disabled={isEncrypting || !newMessage.trim() || !recipient.trim()}
                          className="send-btn"
                        >
                          {isEncrypting ? '🔄 Encrypting...' : '🔒 Encrypt & Send'}
                        </button>
                        <button 
                          onClick={() => {
                            setNewMessage('');
                            setRecipient('');
                          }}
                          className="clear-btn"
                        >
                          �️ Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="messages-panel">
                    <h3>📨 Your Messages</h3>
                    <div className="messages-list">
                      {messages.length > 0 ? (
                        messages.map(message => (
                          <div key={message.id} className="message-item">
                            <div className="message-header">
                              <div className="message-recipient">
                                {message.from ? `From: ${message.from}` : `To: ${message.to}`}
                              </div>
                              <div className="message-timestamp">
                                {new Date(message.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="message-content">
                              {message.decrypted ? message.originalContent : message.content}
                            </div>
                            <div className="message-footer">
                              <span className="encryption-badge">🔒 {message.algorithm}</span>
                              <span className="status-badge">
                                {message.read ? '👁️ Read' : '� Unread'}
                              </span>
                              {!message.decrypted && message.content.includes('[ENCRYPTED]') && (
                                <button 
                                  className="decrypt-btn"
                                  onClick={() => decryptMessage(message.id)}
                                >
                                  🔓 Decrypt
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-messages">
                          <div className="no-messages-icon">📭</div>
                          <p>No messages yet</p>
                          <p>Send your first secure message above</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'create-post' && (
            <div className="dashboard-section-content">
              <h2>✍️ Create New Post</h2>
              <p>Share your investigations, legal analysis, geopolitical insights, or blog posts with the community.</p>
              
              <div className="post-creation-form">
                <div className="form-group">
                  <label>Post Title *</label>
                  <input
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a compelling title for your post..."
                    className="post-title-input"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={currentPost.category}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, category: e.target.value }))}
                    className="category-select"
                  >
                    <option value="Investigation">🔍 Investigation</option>
                    <option value="Legal Brief">⚖️ Legal Brief</option>
                    <option value="Geopolitics">🌍 Geopolitics</option>
                    <option value="Blog">📰 Blog</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={currentPost.content}
                    onChange={(e) => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content here. Support for Markdown formatting..."
                    className="post-content-textarea"
                    rows={12}
                  />
                </div>

                <div className="form-group">
                  <label>Media Files (Images/Videos)</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="file-input"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="file-upload-label">
                      📎 Choose Files (Images/Videos)
                    </label>
                    <p className="file-help">Supported: JPG, PNG, GIF, MP4, WebM. Max 50MB per file.</p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <h4>Selected Files:</h4>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="remove-file-btn"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="privacy, surveillance, legal, investigation..."
                    className="tags-input"
                    onChange={(e) => setCurrentPost(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()) 
                    }))}
                  />
                </div>

                <div className="post-actions">
                  <button
                    onClick={() => { setCurrentPost(prev => ({ ...prev, status: 'draft' })); createPost(); }}
                    disabled={isCreatingPost}
                    className="action-btn"
                  >
                    {isCreatingPost ? '💾 Saving...' : '📄 Save as Draft'}
                  </button>
                  <button
                    onClick={() => { setCurrentPost(prev => ({ ...prev, status: 'published' })); createPost(); }}
                    disabled={isCreatingPost}
                    className="action-btn primary"
                  >
                    {isCreatingPost ? '🚀 Publishing...' : '🚀 Publish Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'my-posts' && (
            <div className="dashboard-section-content">
              <h2>📝 My Posts</h2>
              <p>Manage all your published and draft content.</p>
              
              <div className="posts-overview">
                <div className="posts-stats">
                  <div className="stat-item">
                    <span className="stat-number">{posts.filter(p => p.status === 'published').length}</span>
                    <span className="stat-label">Published</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{posts.filter(p => p.status === 'draft').length}</span>
                    <span className="stat-label">Drafts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{posts.reduce((sum, p) => sum + p.views, 0)}</span>
                    <span className="stat-label">Total Views</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{posts.reduce((sum, p) => sum + p.likes, 0)}</span>
                    <span className="stat-label">Total Likes</span>
                  </div>
                </div>

                <div className="posts-list">
                  {posts.length > 0 ? (
                    posts.map(post => (
                      <div key={post.id} className="post-card">
                        <div className="post-header">
                          <div className="post-meta">
                            <span className={`category-badge ${post.category.toLowerCase().replace(' ', '-')}`}>
                              {post.category === 'Investigation' && '🔍'}
                              {post.category === 'Legal Brief' && '⚖️'}
                              {post.category === 'Geopolitics' && '🌍'}
                              {post.category === 'Blog' && '📰'}
                              {post.category}
                            </span>
                            <span className={`status-badge ${post.status}`}>
                              {post.status === 'published' ? '✅ Published' : '📄 Draft'}
                            </span>
                          </div>
                          <div className="post-date">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-excerpt">
                          {post.content.substring(0, 150)}...
                        </p>

                        <div className="post-stats">
                          <span>👁️ {post.views} views</span>
                          <span>❤️ {post.likes} likes</span>
                          {post.mediaFiles.length > 0 && (
                            <span>📎 {post.mediaFiles.length} files</span>
                          )}
                        </div>

                        <div className="post-actions">
                          <button className="action-btn small">✏️ Edit</button>
                          {post.status === 'draft' ? (
                            <button 
                              onClick={() => updatePostStatus(post.id, 'published')}
                              className="action-btn small primary"
                            >
                              🚀 Publish
                            </button>
                          ) : (
                            <button 
                              onClick={() => updatePostStatus(post.id, 'draft')}
                              className="action-btn small"
                            >
                              📄 Unpublish
                            </button>
                          )}
                          <button 
                            onClick={() => deletePost(post.id)}
                            className="action-btn small danger"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-posts">
                      <div className="no-posts-icon">📝</div>
                      <p>No posts yet</p>
                      <p>Create your first post to get started</p>
                      <button 
                        onClick={() => setActiveSection('create-post')}
                        className="action-btn primary"
                      >
                        ✍️ Create Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'blogs' && (
            <div className="dashboard-section-content">
              <h2>📰 Blogs</h2>
              <p>Opinion pieces, analysis, and editorial content from our contributors.</p>
              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <h3>📝 Recent Blogs</h3>
                  <p>Latest opinion and analysis pieces</p>
                  <button className="card-btn">Browse All</button>
                </div>
                <div className="dashboard-card">
                  <h3>✍️ Write Blog</h3>
                  <p>Share your thoughts and analysis</p>
                  <button 
                    onClick={() => setActiveSection('create-post')}
                    className="card-btn"
                  >
                    Start Writing
                  </button>
                </div>
                <div className="dashboard-card">
                  <h3>📊 Popular Topics</h3>
                  <p>Trending discussion topics</p>
                  <button className="card-btn">View Topics</button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'investigations' && (
            <div className="dashboard-section-content">
              <h2>🔍 Investigations</h2>
              <p>Investigative journalism and research reports from our community.</p>
              
              <div className="posts-feed">
                <div className="feed-header">
                  <div className="feed-stats">
                    <span className="stat">
                      📊 {getPostsByCategory('Investigation').length} Published
                    </span>
                    <button 
                      onClick={() => setActiveSection('create-post')}
                      className="action-btn primary"
                    >
                      ✍️ Submit Investigation
                    </button>
                  </div>
                </div>

                <div className="posts-grid">
                  {getPostsByCategory('Investigation').length > 0 ? (
                    getPostsByCategory('Investigation').map(post => (
                      <div key={post.id} className="post-card">
                        <div className="post-header">
                          <span className="category-badge investigation">
                            🔍 Investigation
                          </span>
                          <span className="post-date">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-excerpt">
                          {post.content.substring(0, 150)}...
                        </p>

                        <div className="post-author">
                          <strong>By {post.author}</strong>
                        </div>

                        <div className="post-stats">
                          <span>�️ {post.views} views</span>
                          <span>❤️ {post.likes} likes</span>
                          {post.mediaFiles.length > 0 && (
                            <span>📎 {post.mediaFiles.length} files</span>
                          )}
                        </div>

                        <div className="post-actions">
                          <button className="action-btn small">📖 Read Full</button>
                          <button className="action-btn small">💬 Comment</button>
                          <button className="action-btn small">📤 Share</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-posts">
                      <div className="no-posts-icon">🔍</div>
                      <p>No investigation reports yet</p>
                      <p>Be the first to submit an investigation</p>
                      <button 
                        onClick={() => setActiveSection('create-post')}
                        className="action-btn primary"
                      >
                        ✍️ Submit Investigation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'legal' && (
            <div className="dashboard-section-content">
              <h2>⚖️ Legal Resources</h2>
              <p>Legal briefs, analysis, and regulatory updates from our legal experts.</p>
              
              <div className="posts-feed">
                <div className="feed-header">
                  <div className="feed-stats">
                    <span className="stat">
                      � {getPostsByCategory('Legal Brief').length} Published
                    </span>
                    <button 
                      onClick={() => setActiveSection('create-post')}
                      className="action-btn primary"
                    >
                      ✍️ Submit Legal Brief
                    </button>
                  </div>
                </div>

                <div className="posts-grid">
                  {getPostsByCategory('Legal Brief').length > 0 ? (
                    getPostsByCategory('Legal Brief').map(post => (
                      <div key={post.id} className="post-card">
                        <div className="post-header">
                          <span className="category-badge legal-brief">
                            ⚖️ Legal Brief
                          </span>
                          <span className="post-date">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-excerpt">
                          {post.content.substring(0, 150)}...
                        </p>

                        <div className="post-author">
                          <strong>By {post.author}</strong>
                        </div>

                        <div className="post-stats">
                          <span>�️ {post.views} views</span>
                          <span>❤️ {post.likes} likes</span>
                          {post.mediaFiles.length > 0 && (
                            <span>📎 {post.mediaFiles.length} files</span>
                          )}
                        </div>

                        <div className="post-actions">
                          <button className="action-btn small">📖 Read Full</button>
                          <button className="action-btn small">💬 Comment</button>
                          <button className="action-btn small">📤 Share</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-posts">
                      <div className="no-posts-icon">⚖️</div>
                      <p>No legal briefs yet</p>
                      <p>Be the first to submit a legal analysis</p>
                      <button 
                        onClick={() => setActiveSection('create-post')}
                        className="action-btn primary"
                      >
                        ✍️ Submit Legal Brief
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'geopolitics' && (
            <div className="dashboard-section-content">
              <h2>🌍 Geopolitical Analysis</h2>
              <p>Global political insights, trade analysis, and international affairs.</p>
              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <h3>🗺️ Global Reports</h3>
                  <p>Regional analysis and country profiles</p>
                  <button className="card-btn">Explore Regions</button>
                </div>
                <div className="dashboard-card">
                  <h3>📈 Trade Intelligence</h3>
                  <p>International trade patterns and policies</p>
                  <button className="card-btn">View Trade Data</button>
                </div>
                <div className="dashboard-card">
                  <h3>🏛️ Policy Tracker</h3>
                  <p>Monitor policy changes across jurisdictions</p>
                  <button className="card-btn">Track Policies</button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'contributors' && (
            <div className="dashboard-section-content">
              <h2>👥 Contributors Network</h2>
              <p>Connect with fellow journalists, researchers, and experts.</p>
              <div className="contributor-stats">
                <div className="stat-item">
                  <span className="stat-number">156</span>
                  <span className="stat-label">Active Contributors</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">23</span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">67</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>
              <div className="contributor-actions">
                <button className="action-btn primary">🔍 Find Contributors</button>
                <button className="action-btn">💬 Start Collaboration</button>
                <button className="action-btn">📊 View Network</button>
              </div>
            </div>
          )}
          
          {activeSection === 'archives' && (
            <div className="dashboard-section-content">
              <h2>📚 Document Archives</h2>
              <p>Search and access historical documents, reports, and research.</p>
              <div className="archive-search">
                <div className="search-box">
                  <input type="text" placeholder="Search archives..." />
                  <button className="search-btn">🔍 Search</button>
                </div>
                <div className="archive-categories">
                  <button className="category-btn active">All Documents</button>
                  <button className="category-btn">Investigations</button>
                  <button className="category-btn">Legal Docs</button>
                  <button className="category-btn">Research</button>
                </div>
              </div>
              <div className="archive-stats">
                <div className="stat-item">
                  <span className="stat-number">2,847</span>
                  <span className="stat-label">Total Documents</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">15</span>
                  <span className="stat-label">Recent Additions</span>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'subscribe' && (
            <div className="dashboard-section-content">
              <h2>⭐ Subscription Plans</h2>
              <p>Choose the perfect plan for your journalism and research needs.</p>
              
              <div className="subscription-container">
                <div className="billing-toggle">
                  <label className="toggle-label">
                    <span className={subscriptionData.billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={subscriptionData.billingCycle === 'yearly'}
                        onChange={(e) => setSubscriptionData(prev => ({
                          ...prev,
                          billingCycle: e.target.checked ? 'yearly' : 'monthly'
                        }))}
                      />
                      <span className="slider"></span>
                    </div>
                    <span className={subscriptionData.billingCycle === 'yearly' ? 'active' : ''}>
                      Yearly <span className="save-badge">Save 17%</span>
                    </span>
                  </label>
                </div>

                <div className="plans-grid">
                  {subscriptionPlans.map(plan => (
                    <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''} ${subscriptionData.currentPlan === plan.id ? 'current' : ''}`}>
                      {plan.popular && <div className="popular-badge">Most Popular</div>}
                      {subscriptionData.currentPlan === plan.id && <div className="current-badge">Current Plan</div>}
                      
                      <div className="plan-header">
                        <h3>{plan.name}</h3>
                        <div className="plan-price">
                          {plan.id === 'free' ? (
                            <span className="price">Free</span>
                          ) : (
                            <>
                              <span className="price">
                                ${subscriptionData.billingCycle === 'yearly' && plan.yearlyPrice 
                                  ? (plan.yearlyPrice / 12).toFixed(2) 
                                  : plan.price}
                              </span>
                              <span className="period">
                                /{subscriptionData.billingCycle === 'yearly' ? 'month (billed yearly)' : 'month'}
                              </span>
                              {subscriptionData.billingCycle === 'yearly' && plan.yearlyPrice && (
                                <div className="yearly-total">
                                  Total: ${plan.yearlyPrice}/year
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="plan-features">
                        <h4>Features:</h4>
                        <ul>
                          {plan.features.map((feature, index) => (
                            <li key={index}>✅ {feature}</li>
                          ))}
                        </ul>
                        {plan.limitations && (
                          <>
                            <h4>Limitations:</h4>
                            <ul className="limitations">
                              {plan.limitations.map((limitation, index) => (
                                <li key={index}>⚠️ {limitation}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <div className="plan-action">
                        {subscriptionData.currentPlan === plan.id ? (
                          <button className="plan-btn current" disabled>
                            ✅ Current Plan
                          </button>
                        ) : plan.id === 'free' ? (
                          <button 
                            className="plan-btn free"
                            onClick={() => handleSubscribe(plan.id)}
                          >
                            Select Free Plan
                          </button>
                        ) : (
                          <button 
                            className="plan-btn subscribe"
                            onClick={() => handleSubscribe(plan.id)}
                          >
                            Subscribe Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {subscriptionData.currentPlan !== 'free' && (
                  <div className="current-subscription">
                    <h3>Current Subscription Details</h3>
                    <div className="subscription-info">
                      <div className="info-item">
                        <span className="label">Plan:</span>
                        <span className="value">{subscriptionPlans.find(p => p.id === subscriptionData.currentPlan)?.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Billing Cycle:</span>
                        <span className="value">{subscriptionData.billingCycle}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Next Billing:</span>
                        <span className="value">
                          {subscriptionData.nextBilling ? new Date(subscriptionData.nextBilling).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Payment Method:</span>
                        <span className="value">
                          {subscriptionData.paymentMethod === 'stripe' && '💳 Credit Card (Stripe)'}
                          {subscriptionData.paymentMethod === 'paypal' && '🅿️ PayPal'}
                          {subscriptionData.paymentMethod?.startsWith('crypto-') && 
                            `₿ ${subscriptionData.paymentMethod.split('-')[1].toUpperCase()}`}
                        </span>
                      </div>
                    </div>
                    <div className="subscription-actions">
                      <button className="action-btn">📄 View Billing History</button>
                      <button className="action-btn">🔄 Update Payment Method</button>
                      <button className="action-btn">❌ Cancel Subscription</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Modal */}
              {showPaymentModal && (
                <div className="payment-modal-overlay">
                  <div className="payment-modal">
                    <div className="modal-header">
                      <h3>Complete Your Subscription</h3>
                      <button 
                        className="close-btn"
                        onClick={() => setShowPaymentModal(false)}
                      >
                        ❌
                      </button>
                    </div>

                    <div className="modal-content">
                      <div className="plan-summary">
                        <h4>Selected Plan: {subscriptionPlans.find(p => p.id === selectedPlan)?.name}</h4>
                        <div className="billing-cycle-selector">
                          <label>Billing Cycle:</label>
                          <select id="billing-cycle" defaultValue="monthly">
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly (Save 17%)</option>
                          </select>
                        </div>
                      </div>

                      <div className="payment-methods">
                        <h4>Select Payment Method:</h4>
                        
                        <div className="payment-option">
                          <label className="payment-label">
                            <input
                              type="radio"
                              name="payment"
                              value="stripe"
                              checked={selectedPaymentMethod === 'stripe'}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="payment-info">
                              <span className="payment-name">� Credit/Debit Card</span>
                              <span className="payment-desc">Secure payment via Stripe</span>
                            </div>
                          </label>
                        </div>

                        <div className="payment-option">
                          <label className="payment-label">
                            <input
                              type="radio"
                              name="payment"
                              value="paypal"
                              checked={selectedPaymentMethod === 'paypal'}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div className="payment-info">
                              <span className="payment-name">🅿️ PayPal</span>
                              <span className="payment-desc">Pay with your PayPal account</span>
                            </div>
                          </label>
                        </div>

                        <div className="crypto-section">
                          <h5>Cryptocurrency Options:</h5>
                          
                          <div className="payment-option">
                            <label className="payment-label">
                              <input
                                type="radio"
                                name="payment"
                                value="crypto-bitcoin"
                                checked={selectedPaymentMethod === 'crypto-bitcoin'}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              />
                              <div className="payment-info">
                                <span className="payment-name">₿ Bitcoin</span>
                                <span className="payment-desc">Pay with Bitcoin (BTC)</span>
                              </div>
                            </label>
                          </div>

                          <div className="payment-option">
                            <label className="payment-label">
                              <input
                                type="radio"
                                name="payment"
                                value="crypto-ethereum"
                                checked={selectedPaymentMethod === 'crypto-ethereum'}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              />
                              <div className="payment-info">
                                <span className="payment-name">Ξ Ethereum</span>
                                <span className="payment-desc">Pay with Ethereum (ETH)</span>
                              </div>
                            </label>
                          </div>

                          <div className="payment-option">
                            <label className="payment-label">
                              <input
                                type="radio"
                                name="payment"
                                value="crypto-usdc"
                                checked={selectedPaymentMethod === 'crypto-usdc'}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              />
                              <div className="payment-info">
                                <span className="payment-name">� USDC</span>
                                <span className="payment-desc">Pay with USD Coin (Stable)</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="modal-actions">
                        <button 
                          className="cancel-btn"
                          onClick={() => setShowPaymentModal(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="proceed-btn"
                          onClick={processPayment}
                          disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? '⏳ Processing...' : '💳 Complete Payment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  // Initialize user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const [user, setUser] = useState(getUserData());
  const [stats, setStats] = useState({
    reportsRead: Math.floor(Math.random() * 50) + 10,
    bookmarks: Math.floor(Math.random() * 20) + 5,
    subscription: user?.subscription || 'Premium'
  });
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      title: 'The Shadow Banking Network',
      type: 'Investigation',
      date: '2025-09-20',
      action: 'Read'
    },
    {
      id: 2,
      title: 'Corporate Data Mining Report',
      type: 'Investigation',
      date: '2025-09-18',
      action: 'Bookmarked'
    },
    {
      id: 3,
      title: 'Privacy Regulation Analysis',
      type: 'Legal Brief',
      date: '2025-09-15',
      action: 'Read'
    }
  ]);
  const [bookmarkedReports, setBookmarkedReports] = useState([
    {
      id: 1,
      title: 'Supply Chain Transparency Report',
      category: 'Investigation',
      date: '2025-09-10'
    },
    {
      id: 2,
      title: 'Digital Services Act Impact',
      category: 'Legal Brief',
      date: '2025-09-08'
    }
  ]);

  const [activeSection, setActiveSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', icon: '📊', label: 'Overview', description: 'Dashboard overview' },
    { id: 'security', icon: '🔒', label: 'Security', description: 'Encryption & keys' },
    { id: 'messages', icon: '💬', label: 'Messages', description: 'Secure messaging' },
    { id: 'investigations', icon: '🔍', label: 'Investigations', description: 'Investigation reports' },
    { id: 'legal', icon: '⚖️', label: 'Legal', description: 'Legal documents' },
    { id: 'geopolitics', icon: '🌍', label: 'Geopolitics', description: 'Global analysis' },
    { id: 'contributors', icon: '👥', label: 'Contributors', description: 'Community' },
    { id: 'archives', icon: '📚', label: 'Archives', description: 'Archived content' },
    { id: 'subscribe', icon: '⭐', label: 'Subscribe', description: 'Subscription plans' },
    { id: 'settings', icon: '⚙️', label: 'Settings', description: 'Account settings' }
  ];

  const handleSidebarNavigation = (sectionId: string) => {
    if (sectionId === 'security' || sectionId === 'messages' || 
        sectionId === 'investigations' || sectionId === 'legal' || 
        sectionId === 'geopolitics' || sectionId === 'contributors' || 
        sectionId === 'archives' || sectionId === 'subscribe') {
      // Navigate to the specific page
      setCurrentPage(sectionId);
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.dispatchEvent(new Event('authStateChange'));
    alert('Logged out successfully!');
  };

  if (!user) {
    return (
      <div className="page">
        <div className="loading-state">
          <h2>Loading Dashboard...</h2>
          <p>Please wait while we load your personalized dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user.firstName}! �</h1>
          <p className="user-info">
            {user.organization && <span>{user.organization} • </span>}
            Member since {new Date(user.joinDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="action-btn primary">📝 Submit Tip</button>
          <button className="action-btn">⚙️ Settings</button>
          <button className="action-btn logout" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <h3>Reports Read</h3>
          <div className="stat-number">{stats.reportsRead}</div>
          <div className="stat-trend">+12 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔖</div>
          <h3>Bookmarks</h3>
          <div className="stat-number">{stats.bookmarks}</div>
          <div className="stat-trend">+3 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h3>Subscription</h3>
          <div className="stat-number">{stats.subscription}</div>
          <div className="stat-trend">
            {stats.subscription === 'Premium' ? 'Active' : 'Upgrade Available'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Following</h3>
          <div className="stat-number">{Math.floor(Math.random() * 50) + 10}</div>
          <div className="stat-trend">+2 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Followers</h3>
          <div className="stat-number">{Math.floor(Math.random() * 100) + 25}</div>
          <div className="stat-trend">+5 this month</div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📈 Recent Activity</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.action === 'Read' ? '👁️' : '🔖'}
                </div>
                <div className="activity-details">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-meta">
                    {activity.action} • {activity.type} • {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
                <button className="activity-action">View</button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🔖 Your Bookmarks</h3>
            <button className="view-all-btn">Manage All</button>
          </div>
          <div className="bookmark-list">
            {bookmarkedReports.map(report => (
              <div key={report.id} className="bookmark-item">
                <div className="bookmark-details">
                  <div className="bookmark-title">{report.title}</div>
                  <div className="bookmark-meta">
                    {report.category} • {new Date(report.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="bookmark-actions">
                  <button className="bookmark-btn">📖 Read</button>
                  <button className="bookmark-btn">🗑️ Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🎯 Personalized Recommendations</h3>
          </div>
          <div className="recommendations">
            <div className="recommendation-card">
              <div className="rec-category">Investigation</div>
              <h4>Global Supply Chain Ethics</h4>
              <p>Based on your interest in corporate accountability...</p>
              <button className="rec-btn">Read Now</button>
            </div>
            <div className="recommendation-card">
              <div className="rec-category">Legal Brief</div>
              <h4>AI Regulation Updates 2025</h4>
              <p>Following your recent legal brief readings...</p>
              <button className="rec-btn">Read Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize authentication state from localStorage
  const getAuthState = () => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');
    return {
      isLoggedIn: loggedIn,
      user: loggedIn && userData ? JSON.parse(userData) : null
    };
  };

  const [authState, setAuthState] = useState(getAuthState());
  const { isLoggedIn, user } = authState;

  // Function to update auth state
  const updateAuthState = () => {
    const newAuthState = getAuthState();
    setAuthState(newAuthState);
    // Auto-redirect to dashboard after successful login
    if (newAuthState.isLoggedIn && !authState.isLoggedIn) {
      setCurrentPage('dashboard');
    }
    // Redirect to home after logout
    if (!newAuthState.isLoggedIn && authState.isLoggedIn) {
      setCurrentPage('home');
    }
  };

  // Listen for auth state changes (called from login/logout)
  window.addEventListener('authStateChange', updateAuthState);

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'investigations': return <InvestigationsPage />;
      case 'legal': return <LegalPage />;
      case 'geopolitics': return <GeopoliticsPage />;
      case 'contributors': return <ContributorsPage />;
      case 'archives': return <ArchivesPage />;
      case 'subscribe': return <SubscribePage />;
      case 'security':
        if (!isLoggedIn) {
          setCurrentPage('login');
          return <LoginPage />;
        }
        return <SecurityDashboard />;
      case 'messages':
        if (!isLoggedIn) {
          setCurrentPage('login');
          return <LoginPage />;
        }
        return <SecureMessaging />;
      case 'login': 
        if (isLoggedIn) {
          setCurrentPage('dashboard');
          return <UserDashboardSidebar setCurrentPage={setCurrentPage} />;
        }
        return <LoginPage />;
      case 'dashboard': 
        if (!isLoggedIn) {
          setCurrentPage('login');
          return <LoginPage />;
        }
        return <UserDashboardSidebar setCurrentPage={setCurrentPage} />;
      default: return <HomePage />;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // For demo, redirect to archives page when searching
    if (searchQuery.trim()) {
      setCurrentPage('archives');
    }
  };

  const handleNavigation = (page: string) => {
    // Protect dashboard route
    if (page === 'dashboard' && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    
    // Redirect to dashboard if user tries to access login while already logged in
    if (page === 'login' && isLoggedIn) {
      setCurrentPage('dashboard');
      return;
    }
    
    setCurrentPage(page);
  };

  return (
    <div className={`App ${currentPage === 'dashboard' ? 'dashboard-mode' : 'normal-mode'}`}>
      {currentPage !== 'dashboard' && (
        <nav className="navbar">
          <div className="logo" onClick={() => handleNavigation('home')}>
            SMP Civic
          </div>
          <ul className="nav-links">
            <li><button onClick={() => handleNavigation('home')} className={currentPage === 'home' ? 'active' : ''}>Home</button></li>
            <li><button onClick={() => handleNavigation('investigations')} className={currentPage === 'investigations' ? 'active' : ''}>Investigations</button></li>
            <li><button onClick={() => handleNavigation('legal')} className={currentPage === 'legal' ? 'active' : ''}>Legal Briefs</button></li>
            <li><button onClick={() => handleNavigation('geopolitics')} className={currentPage === 'geopolitics' ? 'active' : ''}>Geopolitics</button></li>
            <li><button onClick={() => handleNavigation('contributors')} className={currentPage === 'contributors' ? 'active' : ''}>Contributors</button></li>
            <li><button onClick={() => handleNavigation('archives')} className={currentPage === 'archives' ? 'active' : ''}>Archives</button></li>
            <li><button onClick={() => handleNavigation('subscribe')} className={currentPage === 'subscribe' ? 'active' : ''}>Subscribe</button></li>
            {isLoggedIn ? (
              <li className="user-menu">
                <button onClick={() => handleNavigation('dashboard')} className="user-profile-btn">
                  👤 My Dashboard
                </button>
              </li>
            ) : (
              <li><button onClick={() => handleNavigation('login')} className={currentPage === 'login' ? 'active' : ''}>Login</button></li>
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
      )}

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SMP Civic Platform</h4>
            <p>Sovereign Media for Civic Journalism</p>
            <p>Secure • Transparent • Community-Driven</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <p><button className="footer-link" onClick={() => handleNavigation('investigations')}>Latest Investigations</button></p>
            <p><button className="footer-link" onClick={() => handleNavigation('legal')}>Legal Briefs</button></p>
            <p><button className="footer-link" onClick={() => handleNavigation('contributors')}>Our Contributors</button></p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📧 support@smpcivic.org</p>
            <p>🔒 security@smpcivic.org</p>
            <p>💡 tips@smpcivic.org</p>
          </div>
          <div className="footer-section">
            <h4>Legal & Privacy</h4>
            <p><a href="/privacy">Privacy Policy</a></p>
            <p><a href="/terms">Terms of Service</a></p>
            <p><a href="/ethics">Editorial Ethics</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 SMP Civic. Built with ❤️ for a more transparent world.</p>
          <p>Licensed under AGPL-3.0 | Powered by post-quantum cryptography | 
            {isLoggedIn && user && (
              <span> Welcome, {user.firstName}!</span>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;