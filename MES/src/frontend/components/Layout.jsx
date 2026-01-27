import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-200 group ${isActive
                ? 'glass-nav-active'
                : 'text-englabs-text-secondary hover:bg-white/50 hover:text-englabs-text-primary'
            }`
        }
        title={collapsed ? label : ""}
    >
        <span className="text-xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
        {!collapsed && <span className="font-medium text-sm transition-opacity duration-200">{label}</span>}
    </NavLink>
);

import HinataAssistant from './HinataAssistant';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-englabs-bg overflow-hidden font-sans text-englabs-text-primary selection:bg-englabs-primary selection:text-white">
            {/* Clean White Background with subtle gradient handled by body */}

            {/* Glass Sidebar */}
            <aside
                className={`${isCollapsed ? 'w-20' : 'w-64'} h-full flex flex-col z-10 glass-sidebar relative transition-all duration-300 ease-in-out`}
            >
                <div className={`p-8 ${isCollapsed ? 'px-4 items-center flex flex-col' : ''} relative`}>
                    {!isCollapsed ? (
                        <h1 className="text-2xl font-light tracking-tight text-englabs-text-primary whitespace-nowrap overflow-hidden">
                            Englabs<span className="font-bold text-englabs-primary">MES</span>
                        </h1>
                    ) : (
                        <h1 className="text-xl font-bold text-englabs-primary">E</h1>
                    )}

                    {!isCollapsed && (
                        <div className="mt-2 flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-englabs-success animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-englabs-text-secondary whitespace-nowrap">System Online</span>
                        </div>
                    )}

                    {/* Collapse Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-gray-500 hover:text-englabs-primary"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem to="/" icon="📋" label="Dispatch Command" collapsed={isCollapsed} />
                    <NavItem to="/catalog" icon="🧊" label="Part Catalog" collapsed={isCollapsed} />
                    <NavItem to="/scheduler" icon="📅" label="Agile Scheduler" collapsed={isCollapsed} />
                    <NavItem to="/plm" icon="🔬" label="Part Analysis (PLM)" collapsed={isCollapsed} />
                    <NavItem to="/shop-floor" icon="🏭" label="Shop Floor Live" collapsed={isCollapsed} />
                    <NavItem to="/inventory" icon="📦" label="Inventory" collapsed={isCollapsed} />
                    <NavItem to="/financials" icon="💰" label="Financial Ledger" collapsed={isCollapsed} />
                </nav>

                <div className="p-4 border-t border-white/20 bg-white/30 backdrop-blur-sm">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
                        <div className="w-9 h-9 rounded-lg bg-englabs-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-englabs-primary/20 shrink-0">
                            {user?.username?.substring(0, 2).toUpperCase() || 'OP'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-englabs-text-primary truncate">{user?.username || 'Operator'}</p>
                                <p className="text-xs text-englabs-text-secondary capitalize truncate">{user?.role || 'Access Level 1'}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={`w-full text-xs font-medium text-englabs-text-secondary hover:text-englabs-danger hover:bg-red-50/50 py-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100/50 ${isCollapsed ? 'text-center' : ''}`}
                        title={isCollapsed ? "Sign Out" : ""}
                    >
                        {isCollapsed ? "Exit" : "Sign Out"}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
                {/* Top Navigation Bar / Search */}
                <header className="bg-white border-b border-englabs-border sticky top-0 z-20 px-8 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center text-slate-400 text-sm">
                        <span className="mr-2">Pages</span> / <span className="ml-2 text-slate-800 font-medium capitalize">Dashboard</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Global Search */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-englabs-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders, machines..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 w-64 focus:w-80 transition-all focus:outline-none focus:ring-2 focus:ring-englabs-primary/20 focus:border-englabs-primary"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">/</span>
                            </div>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in flex-1">
                    {children}
                </div>
            </main>

            {/* AI Assistant (Fixed to Viewport) */}
            <HinataAssistant />
        </div>
    );
}
