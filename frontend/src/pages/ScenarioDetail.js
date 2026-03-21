import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scenarioAPI, aiAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function ScenarioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedActions, setSelectedActions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeTab, setActiveTab] = useState('scenario');

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const res = await scenarioAPI.getById(id);
        setScenario(res.data.scenario);
        setTimeLeft(res.data.scenario.time_limit);
      } catch (err) {
        console.error('Failed to fetch scenario:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenario();
  }, [id]);

  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, submitted]);

  const toggleAction = (action) => {
    if (submitted) return;
    setSelectedActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const handleSubmit = async () => {
    if (selectedActions.length === 0) return;
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await scenarioAPI.submit(id, { actions: selectedActions, timeTaken, hintsUsed });
      setResults(res.data.results);
      setSubmitted(true);
      setActiveTab('results');
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    try {
      const res = await aiAPI.chat({ message: userMessage, scenarioId: parseInt(id) });
      setChatMessages(prev => [...prev, { role: 'ai', content: res.data.message }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble responding right now.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleHint = async () => {
    setChatLoading(true);
    try {
      const res = await aiAPI.getHint(parseInt(id));
      setHintsUsed(prev => prev + 1);
      setChatMessages(prev => [...prev, { role: 'ai', content: `💡 Hint #${res.data.hintNumber}: ${res.data.hint}` }]);
      setActiveTab('ai');
    } catch (err) {
      console.error('Failed to get hint:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getActionLabel = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="loading">Loading scenario...</div>
    </div>
  );

  if (!scenario) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="loading">Scenario not found</div>
    </div>
  );

  const allActions = [
    ...scenario.correct_actions,
    'investigate_logs', 'check_threat_intel', 'scan_network',
    'update_firewall', 'contact_vendor', 'run_antivirus',
    'backup_data', 'patch_system', 'monitor_traffic', 'create_ticket'
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="container" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/scenarios')}>
            ← Back to Scenarios
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!submitted && (
              <div style={{
                padding: '8px 16px',
                background: timeLeft < 60 ? '#fff5f5' : '#f0fff4',
                border: `1px solid ${timeLeft < 60 ? '#feb2b2' : '#9ae6b4'}`,
                borderRadius: '8px',
                fontWeight: '700',
                color: timeLeft < 60 ? '#c53030' : '#276749',
                fontSize: '16px'
              }}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            )}
            <span style={{ fontSize: '12px', padding: '4px 10px', background: '#ebf8ff', color: '#2b6cb0', borderRadius: '6px', fontWeight: '600' }}>
              Hints Used: {hintsUsed}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#2d3748', marginBottom: '8px' }}>
                    {scenario.title}
                  </h1>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className={`badge badge-${scenario.difficulty}`}>
                      {scenario.difficulty}
                    </span>
                    <span className={`badge ${scenario.role === 'soc_analyst' ? 'badge-soc' : 'badge-pentest'}`}>
                      {scenario.role === 'soc_analyst' ? 'SOC Analyst' : 'Pen Tester'}
                    </span>
                    {scenario.mitre_technique && (
                      <span style={{ padding: '4px 10px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>
                        MITRE: {scenario.mitre_technique}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#3182ce' }}>{scenario.max_score}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>Max Score</div>
                </div>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                {['scenario', 'data', submitted ? 'results' : null].filter(Boolean).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: activeTab === tab ? '#3182ce' : '#718096',
                      borderBottom: activeTab === tab ? '2px solid #3182ce' : '2px solid transparent',
                      marginBottom: '-1px'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'scenario' && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '10px' }}>
                    📋 Scenario Description
                  </h3>
                  <p style={{ color: '#4a5568', lineHeight: '1.8', fontSize: '14px', marginBottom: '24px' }}>
                    {scenario.description}
                  </p>

                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '12px' }}>
                    🎯 Select Your Response Actions
                  </h3>
                  <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
                    Select all actions you would take to respond to this incident
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    {allActions.map((action) => (
                      <div
                        key={action}
                        onClick={() => toggleAction(action)}
                        style={{
                          padding: '12px 14px',
                          border: `2px solid ${selectedActions.includes(action) ? '#3182ce' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: submitted ? 'default' : 'pointer',
                          background: selectedActions.includes(action) ? '#ebf8ff' : '#ffffff',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div style={{
                          width: '18px', height: '18px',
                          borderRadius: '4px',
                          border: `2px solid ${selectedActions.includes(action) ? '#3182ce' : '#cbd5e0'}`,
                          background: selectedActions.includes(action) ? '#3182ce' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {selectedActions.includes(action) && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '13px', color: '#2d3748', fontWeight: '500' }}>
                          {getActionLabel(action)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!submitted && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={selectedActions.length === 0}
                        style={{ flex: 1, padding: '12px' }}
                      >
                        Submit Response ({selectedActions.length} actions selected)
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleHint}
                        disabled={chatLoading}
                      >
                        💡 Get Hint
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'data' && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '16px' }}>
                    📊 Scenario Data & Evidence
                  </h3>
                  <div style={{
                    background: '#1a202c',
                    borderRadius: '10px',
                    padding: '20px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#68d391',
                    overflowX: 'auto',
                    lineHeight: '1.8'
                  }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(scenario.scenario_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'results' && results && (
                <div>
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    background: results.allCorrect ? '#f0fff4' : '#fffbeb',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: `1px solid ${results.allCorrect ? '#9ae6b4' : '#fbd38d'}`
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                      {results.allCorrect ? '🏆' : results.percentage >= 70 ? '✅' : '📚'}
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: '#2d3748' }}>
                      {results.score}
                    </div>
                    <div style={{ fontSize: '16px', color: '#718096' }}>out of {results.maxScore} points</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: results.allCorrect ? '#276749' : '#744210', marginTop: '8px' }}>
                      {results.allCorrect ? '🎉 Perfect Score!' : `${Math.round(results.percentage)}% Accuracy`}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '12px' }}>
                    📋 Action Feedback
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {results.feedback.map((item, index) => (
                      <div key={index} style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: item.correct ? '#f0fff4' : '#fff5f5',
                        border: `1px solid ${item.correct ? '#9ae6b4' : '#feb2b2'}`,
                        display: 'flex', alignItems: 'center', gap: '10px'
                      }}>
                        <span>{item.correct ? '✅' : '❌'}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>
                          {getActionLabel(item.action)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {results.missingActions.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '12px' }}>
                        ⚠️ Missed Actions
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {results.missingActions.map((action, index) => (
                          <div key={index} style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: '#fffbeb',
                            border: '1px solid #fbd38d',
                            display: 'flex', alignItems: 'center', gap: '10px'
                          }}>
                            <span>⚠️</span>
                            <span style={{ fontSize: '13px', color: '#744210' }}>
                              {getActionLabel(action)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/scenarios')}
                    style={{ width: '100%', marginTop: '20px', padding: '12px' }}
                  >
                    Try Another Scenario →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' }}>
              🤖 AI Security Assistant
            </h3>
            <p style={{ fontSize: '12px', color: '#718096', marginBottom: '16px' }}>
              Ask questions about this scenario
            </p>

            <div style={{
              height: '350px',
              overflowY: 'auto',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '4px'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a0aec0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🤖</div>
                  <p style={{ fontSize: '13px' }}>Ask me anything about this scenario!</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Or click "Get Hint" for guidance</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: msg.role === 'user' ? '#ebf8ff' : '#f7fafc',
                    border: `1px solid ${msg.role === 'user' ? '#bee3f8' : '#e2e8f0'}`,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: msg.role === 'user' ? '#2b6cb0' : '#4a5568', marginBottom: '4px' }}>
                      {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#2d3748', lineHeight: '1.6' }}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f7fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: '#718096' }}>🤖 Thinking...</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                style={{ flex: 1, fontSize: '13px' }}
              />
              <button
                className="btn btn-primary"
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                style={{ padding: '10px 14px' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}