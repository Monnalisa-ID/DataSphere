import { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { SecurityView } from './components/SecurityView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';

type ViewType = 'dashboard' | 'analytics' | 'security' | 'audit-logs' | 'settings';

function MainAppContent() {
  const [currentView, setView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'security':
        return <SecurityView />;
      case 'audit-logs':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'System Dashboard Overview';
      case 'analytics':
        return 'Company Data Statistics';
      case 'security':
        return 'Interactive Security Playground';
      case 'audit-logs':
        return 'Secure Audit Logs Trail';
      case 'settings':
        return 'System Node Control Panel';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setView={setView} />

      {/* Main Panel Viewport */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950 overflow-y-auto">
        {/* Top Header bar with status and switch controllers */}
        <Header viewTitle={getViewTitle()} />

        {/* Dynamic page container */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <div className="animate-slideIn">
            {renderView()}
          </div>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <DatabaseProvider>
      <MainAppContent />
    </DatabaseProvider>
  );
}

export default App;
