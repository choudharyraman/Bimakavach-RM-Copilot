import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import UnifiedInbox from './components/inbox/UnifiedInbox';
import DealPipeline from './components/crm/DealPipeline';
import ClientList from './components/clients/ClientList';
import ClientDetail from './components/clients/ClientDetail';
import NudgePanel from './components/nudges/NudgePanel';
import RenewalPipeline from './components/nudges/RenewalPipeline';
import ManagerDashboard from './pages/ManagerDashboard';
import CallSimulator from './components/common/CallSimulator';
import ToastContainer from './components/common/ToastContainer';
import './styles/design-system.css';
import './styles/components.css';

function AppContent() {
  const { state } = useApp();
  const { activeTab } = state;

  const renderContent = () => {
    switch (activeTab) {
      case 'inbox':
        return (
          <div className="app-content no-padding" style={{ display: 'flex', flexDirection: 'column' }}>
            <UnifiedInbox />
          </div>
        );
      case 'pipeline':
        return (
          <div className="app-content">
            <DealPipeline />
          </div>
        );
      case 'clients':
        return (
          <div className="app-content">
            <ClientList />
          </div>
        );
      case 'client_detail':
        return (
          <div className="app-content">
            <ClientDetail />
          </div>
        );
      case 'nudges':
        return (
          <div className="app-content">
            <NudgePanel />
          </div>
        );
      case 'renewals':
        return (
          <div className="app-content">
            <RenewalPipeline />
          </div>
        );
      case 'dashboard':
        return (
          <div className="app-content">
            <ManagerDashboard />
          </div>
        );
      default:
        return (
          <div className="app-content">
            <UnifiedInbox />
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Header />
        {renderContent()}
      </main>
      <CallSimulator />
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
