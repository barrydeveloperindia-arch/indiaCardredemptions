import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('token');
        return isTokenExpired(storedToken) ? null : storedToken;
    });

    const [user, setUser] = useState(() => {
        const storedToken = localStorage.getItem('token');
        if (!isTokenExpired(storedToken)) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                return { username: payload.sub, role: payload.role };
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // When token updates (e.g. login), update user state if not already set (optional but good for consistency)
            // Actually login() sets user explicitely. This UseEffect is key for persistence.
        } else {
            localStorage.removeItem('token');
            setUser(null); // Ensure user is cleared if token is cleared
        }
    }, [token]);

    const login = async (username, password) => {
        const formBody = new URLSearchParams();
        formBody.append('username', username);
        formBody.append('password', password);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            setToken(data.access_token);
            setUser({ username: data.username, role: data.role });
            return true;
        } catch (error) {
            console.error("Auth Error:", error);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
