import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DemoPipelineModal } from './components/DemoPipelineModal';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Intelligence } from './pages/Intelligence';
import { Ingestion } from './pages/Ingestion';
import { IOCExplorer } from './pages/IOCExplorer';
import { AttackGraph } from './pages/AttackGraph';
import { AIThreatAnalysis } from './pages/AIThreatAnalysis';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { Alerts } from './pages/Alerts';
import { InvestigationView } from './pages/InvestigationView';
import { AnalystFeedback } from './pages/AnalystFeedback';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080F1F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#080F1F] flex flex-col">
      <Header onOpenDemo={() => setDemoOpen(true)} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      <DemoPipelineModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onComplete={() => {
          // Modal complete callback
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/intelligence" element={<Intelligence />} />
                  <Route path="/ingestion" element={<Ingestion />} />
                  <Route path="/ioc-explorer" element={<IOCExplorer />} />
                  <Route path="/attack-graph" element={<AttackGraph />} />
                  <Route path="/ai-analysis" element={<AIThreatAnalysis />} />
                  <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/investigation/:alertId" element={<InvestigationView />} />
                  <Route path="/feedback" element={<AnalystFeedback />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProtectedLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

