// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: localStorage.getItem("authToken") || null,
        user: null,
    });
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async (token) => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get("http://localhost:8080/api/v1/auth/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Profile API response:", response.data);

            if (response.data && response.data.user) {
                const userData = response.data.user;

                if (!userData.role || (userData.role.toLowerCase() !== "requester" && userData.role.toLowerCase() !== "volunteer")) {
                    console.warn("Роль користувача не визначена або не відповідає очікуваним значенням:", userData.role);
                    userData.role = "requester";
                }

                setAuthState(prevState => ({
                    ...prevState,
                    user: userData,
                }));
            } else {
                console.error("Сервер не повернув дані користувача");
                localStorage.removeItem("authToken");
                setAuthState({ token: null, user: null });
            }
        } catch (error) {
            console.error("Помилка при завантаженні профілю", error);
            localStorage.removeItem("authToken");
            setAuthState({ token: null, user: null });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        fetchUser(token);
    }, [fetchUser]);

    useEffect(() => {
        if (authState.token) {
            localStorage.setItem("authToken", authState.token);
        } else {
            localStorage.removeItem("authToken");
        }
    }, [authState.token]);

    const value = {
        authState,
        setAuthState,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};