import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Sparkles,
  Clock,
  Cpu,
  HeartPulse,
  PiggyBank,
  RefreshCw,
  AlertOctagon,
  Activity,
  Swords,
  Award,
  Bot,
  TrendingUp,
  ShieldCheck,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  badgeCount?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  unreadCount?: number;
  darkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, unreadCount = 0, darkMode = true }) => {
  const navGroups: NavGroup[] = [
    {
      group: "Core Management",
      items: [
        { name: "Overview Dashboard", path: "/overview", icon: LayoutDashboard },
        { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
        { name: "Budget Planner", path: "/budget", icon: PieChart },
        { name: "Savings Goals", path: "/savings", icon: PiggyBank },
        { name: "Subscriptions", path: "/subscriptions", icon: RefreshCw },
      ]
    },
    {
      group: "Intelligence & Simulation",
      items: [
        { name: "What-If Simulator", path: "/simulator", icon: Sparkles, badge: "Core" },
        { name: "Financial Time Machine", path: "/time-machine", icon: Clock },
        { name: "Financial Digital Twin", path: "/digital-twin", icon: Cpu },
        { name: "Money Survival Meter", path: "/survival-meter", icon: HeartPulse },
        { name: "Impulse Purchase Shield", path: "/impulse-shield", icon: ShieldAlert },
        { name: "Crisis Recovery", path: "/crisis-recovery", icon: AlertOctagon },
        { name: "Stress Test", path: "/stress-test", icon: Activity },
        { name: "Decision Battle", path: "/decision-battle", icon: Swords, badge: "Game" },
        { name: "Savings Challenges", path: "/challenges", icon: Award },
        { name: "AI Money Coach", path: "/coach", icon: Bot, badge: "AI" },
        { name: "Financial Forecast", path: "/forecast", icon: TrendingUp },
        { name: "Health Center", path: "/health-center", icon: ShieldCheck },
      ]
    },
    {
      group: "System & Account",
      items: [
        { name: "Sign In / Register", path: "/auth", icon: ShieldAlert, badge: "Auth" },
        { name: "Notifications", path: "/notifications", icon: Bell, badgeCount: unreadCount },
        { name: "Profile & Settings", path: "/settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      style={{
        width: collapsed ? '80px' : '280px',
        background: darkMode ? '#0d111a' : '#ffffff',
        borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease',
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div style={{ 
        padding: '20px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a3e635 0%, #4ade80 50%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(163, 230, 53, 0.4)',
            flexShrink: 0
          }}>
            <span style={{ color: '#090d16', fontSize: '22px', fontWeight: '800', fontFamily: 'system-ui' }}>₹</span>
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: darkMode ? '#ffffff' : '#0f172a' }}>
                Finora <span style={{ color: '#a3e635', fontSize: '12px', background: 'rgba(163, 230, 53, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>AI</span>
              </div>
              <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#64748b' }}>RupeeWise Gen Z</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
            border: 'none',
            color: darkMode ? '#94a3b8' : '#64748b',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {navGroups.map((grp, i) => (
          <div key={i}>
            {!collapsed && (
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: darkMode ? '#64748b' : '#94a3b8', fontWeight: 700, padding: '0 12px 8px' }}>
                {grp.group}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {grp.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '12px 0' : '10px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive 
                      ? (darkMode ? '#a3e635' : '#4d7c0f') 
                      : (darkMode ? '#cbd5e1' : '#475569'),
                    background: isActive 
                      ? (darkMode ? 'rgba(163, 230, 53, 0.12)' : 'rgba(101, 163, 13, 0.12)') 
                      : 'transparent',
                    border: isActive 
                      ? (darkMode ? '1px solid rgba(163, 230, 53, 0.25)' : '1px solid rgba(101, 163, 13, 0.3)') 
                      : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  })}
                  title={item.name}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
                  {!collapsed && item.badge && (
                    <span style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: '999px', fontWeight: 600 }}>
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span style={{ fontSize: '10px', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', padding: '2px 6px', borderRadius: '999px', fontWeight: 700 }}>
                      {item.badgeCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
