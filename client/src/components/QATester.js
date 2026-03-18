import React, { useState, useEffect } from 'react';
import { FiActivity, FiPlay, FiRefreshCw, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';

function QATester({ repoId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (repoId) fetchReport();
  }, [repoId]); // eslint-disable-line

  const fetchReport = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/qa/${repoId}/report`);
      setReport(r.data.report || r.data);
    } catch {}
    setLoading(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const r = await api.post(`/qa/${repoId}/analyze`);
      setReport(r.data.report || r.data);
    } catch {}
    setAnalyzing(false);
  };

  const scoreColor = score => {
    if (score >= 80) return '#3fb950';
    if (score >= 60) return '#e3b341';
    return '#f85149';
  };

  const ScoreCircle = ({ score, label }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', border: `4px solid ${scoreColor(score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: scoreColor(score), fontWeight: 700, fontSize: 18 }}>
        {score}
      </div>
      <div style={{ color: '#8b949e', fontSize: 12 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiActivity size={18} color="#58a6ff" />
          <h3 style={{ color: '#c9d1d9', fontSize: 16, margin: 0 }}>QA Analysis</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchReport} disabled={loading} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiRefreshCw size={13} /> Refresh
          </button>
          <button onClick={runAnalysis} disabled={analyzing} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlay size={13} /> {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {loading && <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>Loading report...</div>}

      {!loading && !report && (
        <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>
          <FiActivity size={32} style={{ marginBottom: 12 }} />
          <div style={{ marginBottom: 16 }}>No QA report yet.</div>
          <button onClick={runAnalysis} disabled={analyzing} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            {analyzing ? 'Analyzing...' : 'Run first analysis'}
          </button>
        </div>
      )}

      {report && (
        <>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ color: '#c9d1d9', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Quality Scores</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ScoreCircle score={report.overallScore || 0} label="Overall" />
              <ScoreCircle score={report.codeQuality || 0} label="Code Quality" />
              <ScoreCircle score={report.testCoverage || 0} label="Test Coverage" />
              <ScoreCircle score={report.security || 0} label="Security" />
            </div>
          </div>

          {report.issues && report.issues.length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ color: '#c9d1d9', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Issues Found ({report.issues.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.issues.map((issue, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#0d1117', borderRadius: 6 }}>
                    {issue.severity === 'error' ? (
                      <FiAlertTriangle size={14} color="#f85149" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <FiCheckCircle size={14} color="#e3b341" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ color: '#c9d1d9', fontSize: 13 }}>{issue.message}</div>
                      {issue.file && <div style={{ color: '#8b949e', fontSize: 11, marginTop: 2 }}>{issue.file}{issue.line ? `:${issue.line}` : ''}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.suggestions && report.suggestions.length > 0 && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 16 }}>
              <div style={{ color: '#c9d1d9', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Suggestions</div>
              <ul style={{ color: '#8b949e', fontSize: 13, paddingLeft: 20, lineHeight: 1.8 }}>
                {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QATester;
