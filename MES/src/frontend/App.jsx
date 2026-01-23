import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import DigitalDrawingViewer from './components/DigitalDrawingViewer';
import DigitalTraveler from './components/DigitalTraveler';
import DispatchBoard from './components/DispatchBoard';
import GanttScheduler from './components/GanttScheduler';
import Inventory from './components/Inventory';
import Invoices from './components/Invoices';
import Layout from './components/Layout';
import Login from './components/Login';
import PartAnalysis from './components/PartAnalysis';
import PartCatalog from './components/PartCatalog';
import ShopFloor from './components/ShopFloor';
import StandaloneViewer from './components/StandaloneViewer';
import { AuthProvider, useAuth } from './context/AuthContext';

function SessionRestorer() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Save current path to storage on every change
        localStorage.setItem('englabs_last_path', location.pathname);
    }, [location]);

    useEffect(() => {
        // On mount, check if there is a saved path and we are currently at root (fresh load)
        const savedPath = localStorage.getItem('englabs_last_path');
        if (savedPath && savedPath !== '/' && location.pathname === '/') {
            navigate(savedPath);
        }
    }, []); // Run once on mount

    return null;
}

function AppRoutes() {
    const { token } = useAuth();

    if (!token) {
        return <Login />; // Force Login if no token
    }

    return (
        <Router>
            <SessionRestorer />
            <Routes>
                {/* Mobile App Route (Standalone) */}
                <Route path="/digital-traveler" element={<DigitalTraveler />} />
                <Route path="/viewer" element={<StandaloneViewer />} />
                <Route path="/drawing-viewer" element={<DigitalDrawingViewer />} />

                {/* Desktop App Routes (Wrapped in Layout) */}
                <Route path="/*" element={
                    <Layout>
                        <Routes>
                            <Route path="/" element={<DispatchBoard />} />
                            <Route path="/scheduler" element={<GanttScheduler />} />
                            <Route path="/catalog" element={<PartCatalog />} />
                            <Route path="/plm" element={<PartAnalysis />} />
                            <Route path="/shop-floor" element={<ShopFloor />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/financials" element={<Invoices />} />
                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
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
