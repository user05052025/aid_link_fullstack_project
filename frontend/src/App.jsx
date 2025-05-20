// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NewRequestPage from "./pages/NewRequestPage.jsx";
import MyRequestsPage from "./pages/MyRequestsPage.jsx";
import RequestDetailsPage from "./pages/RequestDetailsPage.jsx";
import LogoutHandler from "./components/logout_handler/LogoutHandler.jsx";
import ScrollToTop from "./utils/scrollToTop.js";

function App() {
    return (
        <ChakraProvider>
            <AuthProvider>
                <Router>
                    <ScrollToTop />

                    <Routes>
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/new-request" element={<NewRequestPage />} />
                        <Route path="/my-requests" element={<MyRequestsPage />} />
                        <Route path="/requests/:requestId" element={<RequestDetailsPage />} />
                        <Route path="/logout" element={<LogoutHandler />} />
                        <Route path="/" element={<HomePage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ChakraProvider>
    );
}

export default App;