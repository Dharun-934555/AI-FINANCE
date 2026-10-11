import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { FinancialTimeMachine } from './pages/FinancialTimeMachine';
import { MoneySurvivalMeter } from './pages/MoneySurvivalMeter';
import { FinancialDigitalTwin } from './pages/FinancialDigitalTwin';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPlanner } from './pages/BudgetPlanner';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { SubscriptionManager } from './pages/SubscriptionManager';
import { ImpulsePurchaseShield } from './pages/ImpulsePurchaseShield';
import { CrisisRecovery } from './pages/CrisisRecovery';
import { FinancialStressTest } from './pages/FinancialStressTest';
import { FinancialDecisionBattle } from './pages/FinancialDecisionBattle';
import { HealthCenter } from './pages/HealthCenter';
import { AiMoneyCoach } from './pages/AiMoneyCoach';
import { SavingsChallenges } from './pages/SavingsChallenges';
import { NotificationsPage } from './pages/NotificationsPage';
import { FinancialForecastPage } from './pages/FinancialForecastPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

export const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finora_theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(2);

  // Sync theme class to document body / html
  useEffect(() => {
    localStorage.setItem('finora_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await api.getMe();
        setCurrentUser(user);
      } catch {
        // If no user exists, auto seed or allow demo login
        api.demoLogin().then((res) => {
          setCurrentUser({ id: res.user_id, username: res.username });
        }).catch(console.error);
      }
    };

    initAuth();

    api.getNotifications().then((res) => {
      const unread = res.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    }).catch(console.error);
  }, []);

  const handleResetDemo = async () => {
    if (window.confirm("Reset simulation data to pristine Day 1 state with ₹10,000 starting budget?")) {
      await api.resetDemo();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    window.location.href = '/auth';
  };

  return (
    <Router>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        background: darkMode ? '#090d16' : '#f1f5f9', 
        color: darkMode ? '#f8fafc' : '#0f172a',
        transition: 'background 0.2s ease, color 0.2s ease'
      }}>
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          unreadCount={unreadCount} 
          darkMode={darkMode}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Navbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onResetDemo={handleResetDemo}
            unreadCount={unreadCount}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/auth" element={<AuthPage onLoginSuccess={(u) => setCurrentUser(u)} darkMode={darkMode} />} />
              <Route path="/overview" element={<OverviewDashboard />} />
              <Route path="/simulator" element={<WhatIfSimulator />} />
              <Route path="/time-machine" element={<FinancialTimeMachine />} />
              <Route path="/survival-meter" element={<MoneySurvivalMeter />} />
              <Route path="/digital-twin" element={<FinancialDigitalTwin />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budget" element={<BudgetPlanner />} />
              <Route path="/savings" element={<SavingsGoalsPage />} />
              <Route path="/subscriptions" element={<SubscriptionManager />} />
              <Route path="/impulse-shield" element={<ImpulsePurchaseShield />} />
              <Route path="/crisis-recovery" element={<CrisisRecovery />} />
              <Route path="/stress-test" element={<FinancialStressTest />} />
              <Route path="/decision-battle" element={<FinancialDecisionBattle />} />
              <Route path="/challenges" element={<SavingsChallenges />} />
              <Route path="/coach" element={<AiMoneyCoach />} />
              <Route path="/forecast" element={<FinancialForecastPage />} />
              <Route path="/health-center" element={<HealthCenter />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
