import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DispatchBoard from './components/DispatchBoard';
import ShopFloor from './components/ShopFloor';
import Invoices from './components/Invoices';
import Inventory from './components/Inventory';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
    const { token } = useAuth();

    if (!token) {
        return <Login />; // Force Login if no token
    }

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<DispatchBoard />} />
                    <Route path="/shop-floor" element={<ShopFloor />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/financials" element={<Invoices />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
