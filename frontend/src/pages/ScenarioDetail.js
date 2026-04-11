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

  const getRoleLabel = (role) => {
    if (!role) return 'SOC Analyst';
    if (role === 'soc_analyst' || role === 'SOC Analyst') return 'SOC Analyst';
    if (role === 'penetration_tester' || role === 'Penetration Tester') return 'Penetration Tester';
    return role;
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'soc_analyst' || role === 'SOC Analyst') return { bg: '#ebf8ff', color: '#2b6cb0', border: '#90cdf4' };
    return { bg: '#faf5ff', color: '#6b46c1', border: '#d6bcfa' };
  };

  const getDifficultyStyle = (diff) => {
    if (diff === 'beginner') return { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' };
    if (diff === 'intermediate') return { bg: '#fffbeb', color: '#744210', border: '#fbd38d' };
    return { bg: '#fff5f5', color: '#742a2a', border: '#feb2b2' };
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

  const distractors = [
    'Investigate Logs', 'Check Threat Intel', 'Scan Network',
    'Update Firewall', 'Contact Vendor', 'Run Antivirus',
    'Backup Data', 'Patch System', 'Monitor Traffic', 'Create Ticket'
  ];

  const correctLabels = scenario.correct_actions.map(a => getActionLabel(a));
  const allOptions = [...new Set([...correctLabels, ...distractors])];

  const roleStyle = getRoleBadgeColor(scenario.role);
  const diffStyle = getDifficultyStyle(scenario.difficulty);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="container" style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/scenarios')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            ← Back to Scenarios
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!submitted && (
              <div style={{
                padding: '8px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '15px',
                background: timeLeft < 60 ? '#fff5f5' : '#f0fff4',
                border: `1px solid ${timeLeft < 60 ? '#feb2b2' : '#9ae6b4'}`,
                color: timeLeft < 60 ? '#c53030' : '#276749',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
            <div style={{ padding: '8px 14px', background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#2b6cb0' }}>
              Hints Used: {hintsUsed}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

          {/* Left Panel */}
          <div>
            {/* Header Card */}
            <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #3182ce' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c', marginBottom: '12px', lineHeight: '1.3' }}>
                    {scenario.title}
                  </h1>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.03em', background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}` }}>
                      {scenario.difficulty?.toUpperCase()}
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
                      {getRoleLabel(scenario.role)}
                    </span>
                    {scenario.category && (
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#f7fafc', color: '#4a5568', border: '1px solid #e2e8f0' }}>
                        {scenario.category}
                      </span>
                    )}
                    {scenario.mitre_technique && (
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#fff8f0', color: '#c05621', border: '1px solid #fbd38d' }}>
                        🔗 {scenario.mitre_technique}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginLeft: '20px', background: '#ebf8ff', borderRadius: '12px', padding: '12px 20px', border: '1px solid #bee3f8' }}>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#3182ce' }}>{scenario.max_score}</div>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', letterSpacing: '0.05em' }}>MAX SCORE</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card" style={{ padding: '0' }}>
              <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
                {['scenario', 'data', submitted ? 'results' : null].filter(Boolean).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '14px 24px', border: 'none', background: 'none', cursor: 'pointer',
                    fontWeight: '700', fontSize: '13px', letterSpacing: '0.03em',
                    color: activeTab === tab ? '#3182ce' : '#718096',
                    borderBottom: activeTab === tab ? '3px solid #3182ce' : '3px solid transparent',
                    marginBottom: '-2px', transition: 'all 0.15s', textTransform: 'uppercase'
                  }}>
                    {tab === 'scenario' ? '📋 Scenario' : tab === 'data' ? '📊 Evidence' : '🏆 Results'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px' }}>

                {/* SCENARIO TAB */}
                {activeTab === 'scenario' && (
                  <div>
                    {/* Objective Box */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginBottom: '28px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#718096', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Mission Objective
                      </div>
                      <p style={{ color: '#2d3748', lineHeight: '1.8', fontSize: '14px', margin: 0 }}>
                        {scenario.description}
                      </p>
                    </div>

                    {/* MCQ Section */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a202c' }}>
                          Response Actions — Select All That Apply
                        </h3>
                        <span style={{ fontSize: '12px', color: '#718096', background: '#f7fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: '600' }}>
                          {selectedActions.length} selected
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '16px', fontStyle: 'italic' }}>
                        As an analyst responding to this incident, which of the following actions would you take?
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                        {allOptions.map((label, index) => {
                          const isSelected = selectedActions.includes(label);
                          const letter = String.fromCharCode(65 + index); // A, B, C...
                          return (
                            <div
                              key={label}
                              onClick={() => toggleAction(label)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '13px 16px',
                                border: `2px solid ${isSelected ? '#3182ce' : '#e2e8f0'}`,
                                borderRadius: '10px',
                                cursor: submitted ? 'default' : 'pointer',
                                background: isSelected ? '#ebf8ff' : '#ffffff',
                                transition: 'all 0.15s',
                                boxShadow: isSelected ? '0 0 0 3px rgba(49,130,206,0.1)' : 'none'
                              }}
                            >
                              {/* Letter Badge */}
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '800', fontSize: '12px',
                                background: isSelected ? '#3182ce' : '#f7fafc',
                                color: isSelected ? 'white' : '#718096',
                                border: `2px solid ${isSelected ? '#3182ce' : '#e2e8f0'}`,
                                transition: 'all 0.15s'
                              }}>
                                {isSelected ? '✓' : letter}
                              </div>
                              <span style={{ fontSize: '14px', color: isSelected ? '#1a202c' : '#4a5568', fontWeight: isSelected ? '600' : '400', flex: 1 }}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit */}
                    {!submitted && (
                      <div style={{ display: 'flex', gap: '12px', paddingTop: '4px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          className="btn btn-primary"
                          onClick={handleSubmit}
                          disabled={selectedActions.length === 0}
                          style={{ flex: 1, padding: '13px', fontSize: '14px', fontWeight: '700' }}
                        >
                          Submit Response ({selectedActions.length} selected)
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleHint}
                          disabled={chatLoading}
                          style={{ padding: '13px 20px', fontWeight: '600' }}
                        >
                          💡 Get Hint
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* EVIDENCE TAB */}
                {activeTab === 'data' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '4px', height: '20px', background: '#3182ce', borderRadius: '2px' }} />
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a202c' }}>
                        Scenario Evidence & Data
                      </h3>
                    </div>
                    <div style={{ background: '#0f1117', borderRadius: '12px', padding: '20px', fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#7ee787', overflowX: 'auto', lineHeight: '1.8', border: '1px solid #2d3748' }}>
                      <div style={{ color: '#8b949e', fontSize: '11px', marginBottom: '10px', letterSpacing: '0.1em' }}>// CLASSIFIED INCIDENT DATA — ANALYST ACCESS ONLY</div>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(scenario.scenario_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* RESULTS TAB */}
                {activeTab === 'results' && results && (
                  <div>
                    {/* Score Banner */}
                    <div style={{
                      textAlign: 'center', padding: '28px',
                      background: results.allCorrect ? 'linear-gradient(135deg, #f0fff4, #c6f6d5)' : results.percentage >= 70 ? 'linear-gradient(135deg, #fffbeb, #fefcbf)' : 'linear-gradient(135deg, #fff5f5, #fed7d7)',
                      borderRadius: '14px', marginBottom: '24px',
                      border: `1px solid ${results.allCorrect ? '#9ae6b4' : results.percentage >= 70 ? '#fbd38d' : '#feb2b2'}`
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                        {results.allCorrect ? '🏆' : results.percentage >= 70 ? '✅' : '📋'}
                      </div>
                      <div style={{ fontSize: '52px', fontWeight: '900', color: '#1a202c', lineHeight: 1 }}>
                        {results.score}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>out of {results.maxScore} points</div>
                      <div style={{
                        display: 'inline-block', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                        background: results.allCorrect ? '#276749' : results.percentage >= 70 ? '#744210' : '#c53030',
                        color: 'white'
                      }}>
                        {results.allCorrect ? '🎉 Perfect Score!' : `${Math.round(results.percentage)}% Accuracy`}
                      </div>
                    </div>

                    {/* Correct Actions */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#718096', letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase' }}>
                        Your Answers
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {results.feedback.map((item, index) => (
                          <div key={index} style={{
                            padding: '11px 16px', borderRadius: '8px',
                            background: item.correct ? '#f0fff4' : '#fff5f5',
                            border: `1px solid ${item.correct ? '#9ae6b4' : '#feb2b2'}`,
                            display: 'flex', alignItems: 'center', gap: '12px'
                          }}>
                            <span style={{ fontSize: '16px' }}>{item.correct ? '✅' : '❌'}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>
                              {getActionLabel(item.action)}
                            </span>
                            <span style={{ marginLeft: 'auto', fontSize: '11px', color: item.correct ? '#276749' : '#c53030', fontWeight: '700' }}>
                              {item.correct ? 'CORRECT' : 'INCORRECT'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missed */}
                    {results.missingActions.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#718096', letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase' }}>
                          ⚠️ Actions You Missed
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {results.missingActions.map((action, index) => (
                            <div key={index} style={{
                              padding: '11px 16px', borderRadius: '8px',
                              background: '#fffbeb', border: '1px solid #fbd38d',
                              display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                              <span>⚠️</span>
                              <span style={{ fontSize: '13px', color: '#744210', fontWeight: '500' }}>
                                {getActionLabel(action)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button className="btn btn-primary" onClick={() => navigate('/scenarios')}
                      style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: '700' }}>
                      Try Another Scenario →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '80px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                🤖
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a202c', margin: 0 }}>AI Security Assistant</h3>
                <p style={{ fontSize: '11px', color: '#a0aec0', margin: 0 }}>Ask questions about this scenario</p>
              </div>
            </div>

            <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

            <div style={{ height: '340px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '2px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#a0aec0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>Ask me anything about this scenario!</p>
                  <p style={{ fontSize: '12px', marginTop: '4px', color: '#a0aec0' }}>Or click "Get Hint" for guidance</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} style={{
                    padding: '10px 13px', borderRadius: '10px',
                    background: msg.role === 'user' ? '#ebf8ff' : '#f7fafc',
                    border: `1px solid ${msg.role === 'user' ? '#bee3f8' : '#e2e8f0'}`,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: msg.role === 'user' ? '#2b6cb0' : '#4a5568', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#2d3748', lineHeight: '1.6' }}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ padding: '10px 13px', borderRadius: '10px', background: '#f7fafc', border: '1px solid #e2e8f0', alignSelf: 'flex-start' }}>
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
              <button className="btn btn-primary" onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                style={{ padding: '10px 14px', fontWeight: '700' }}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
