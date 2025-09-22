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
    ? Object.entries(regionalNews) 
    : [[selectedRegion, regionalNews[selectedRegion]]];

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
          {filteredNews.map(([regionId, regionData]) => (
            <div key={regionId} className="region-section">
              <div className="region-header">
                <h3>{regionData.title}</h3>
                <p className="region-subtitle">{regionData.subtitle}</p>
              </div>
              
              <div className="region-content">
                <div className="latest-reports">
                  <h4>📰 Latest Reports</h4>
                  {regionData.reports.map((report, index) => (
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
                          {report.tags.map(tag => (
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
                    {regionData.keyDevelopments.map((development, index) => (
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
  const [selectedUser, setSelectedUser] = useState(null);
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
                  rows="3"
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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isSignup) {
        // Simulate successful signup
        alert('Account created successfully! Please log in.');
        setIsSignup(false);
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          organization: ''
        });
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
        
        // Update global state (this would normally be handled by context)
        window.dispatchEvent(new Event('authStateChange'));
        alert('Login successful!');
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
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
          
          {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
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

function UserDashboard() {
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
        
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📊 Your Impact</h3>
          </div>
          <div className="impact-metrics">
            <div className="impact-item">
              <div className="impact-number">247</div>
              <div className="impact-label">People reached through your shares</div>
            </div>
            <div className="impact-item">
              <div className="impact-number">12</div>
              <div className="impact-label">Comments contributed to discussions</div>
            </div>
            <div className="impact-item">
              <div className="impact-number">3</div>
              <div className="impact-label">Tips submitted to investigations</div>
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
    // Redirect to home after logout
    if (!newAuthState.isLoggedIn) {
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
      case 'login': 
        if (isLoggedIn) {
          setCurrentPage('dashboard');
          return <UserDashboard />;
        }
        return <LoginPage />;
      case 'dashboard': 
        if (!isLoggedIn) {
          setCurrentPage('login');
          return <LoginPage />;
        }
        return <UserDashboard />;
      default: return <HomePage />;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // For demo, redirect to archives page when searching
    if (searchQuery.trim()) {
      setCurrentPage('archives');
    }
  };

  const handleNavigation = (page) => {
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
    <div className="App">
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
              <button onClick={() => handleNavigation('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>
                👤 {user?.firstName || 'Dashboard'}
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