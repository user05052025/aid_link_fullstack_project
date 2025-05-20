// src/pages/AuthPage.jsx

import React, { useState } from "react";
import {
    Box, Tabs, TabList, TabPanels, Tab, TabPanel,
    Heading, Input, FormControl, FormLabel, Button,
    Stack, Alert, AlertIcon, useToast
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const AuthPage = () => {
    const { setAuthState } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regRole, setRegRole] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regAddress, setRegAddress] = useState("");
    const [regCity, setRegCity] = useState("");
    const [regRegion, setRegRegion] = useState("");
    const [regError, setRegError] = useState("");
    const [regLoading, setRegLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");

        try {
            const response = await axios.post("http://localhost:8080/api/v1/auth/login", {
                email,
                password,
            });

            const { token, user } = response.data;
            localStorage.setItem("authToken", token);
            setAuthState({ token, user });
            navigate("/home");
        } catch (err) {
            setLoginError("Невірна електронна пошта або пароль");
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        setRegError("");

        if (!regName || !regEmail || !regPassword || !regRole) {
            setRegError("Ім’я, email, пароль та роль є обов’язковими полями");
            setRegLoading(false);
            return;
        }

        if (regRole !== "requester" && regRole !== "volunteer") {
            setRegError("Роль має бути 'requester' або 'volunteer'");
            setRegLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8080/api/v1/auth/register", {
                name: regName,
                email: regEmail,
                password: regPassword,
                role: regRole,
                phone: regPhone || null,
                address: regAddress || null,
                city: regCity || null,
                region: regRegion || null,
            });

            const { token, user } = response.data;
            localStorage.setItem("authToken", token);
            setAuthState({ token, user });

            toast({
                title: "Успішна реєстрація",
                description: "Ви були автоматично авторизовані",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            navigate("/home");
        } catch (err) {
            setRegError(err?.response?.data?.message || "Помилка реєстрації");
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <Box maxW="lg" mx="auto" mt={10} p={6} boxShadow="lg" borderRadius="xl" bg="white">
            <Tabs isFitted variant="enclosed-colored" colorScheme="teal">
                <TabList mb="1em">
                    <Tab>Вхід</Tab>
                    <Tab>Реєстрація</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Heading mb={6} fontSize="2xl" textAlign="center">
                            Вхід до системи
                        </Heading>
                        {loginError && (
                            <Alert status="error" mb={4}>
                                <AlertIcon />
                                {loginError}
                            </Alert>
                        )}
                        <form onSubmit={handleLogin}>
                            <Stack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Електронна пошта</FormLabel>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Пароль</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="********"
                                    />
                                </FormControl>

                                <Button type="submit" colorScheme="teal" isLoading={loginLoading} loadingText="Авторизація">
                                    Увійти
                                </Button>
                            </Stack>
                        </form>
                    </TabPanel>

                    <TabPanel>
                        <Heading mb={6} fontSize="2xl" textAlign="center">
                            Реєстрація
                        </Heading>
                        {regError && (
                            <Alert status="error" mb={4}>
                                <AlertIcon />
                                {regError}
                            </Alert>
                        )}
                        <form onSubmit={handleRegister}>
                            <Stack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Ім’я</FormLabel>
                                    <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Ваше ім’я" />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Електронна пошта</FormLabel>
                                    <Input value={regEmail} type="email" onChange={(e) => setRegEmail(e.target.value)} />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Пароль</FormLabel>
                                    <Input value={regPassword} type="password" onChange={(e) => setRegPassword(e.target.value)} />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Роль</FormLabel>
                                    <select
                                        value={regRole}
                                        onChange={(e) => setRegRole(e.target.value)}
                                        style={{
                                            padding: "0.5rem",
                                            borderRadius: "0.375rem",
                                            border: "1px solid #E2E8F0",
                                            fontSize: "1rem",
                                            color: "#2D3748",
                                        }}
                                    >
                                        <option value="">Оберіть роль</option>
                                        <option value="requester">Отримувач допомоги</option>
                                        <option value="volunteer">Волонтер</option>
                                    </select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Телефон</FormLabel>
                                    <Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Адреса</FormLabel>
                                    <Input value={regAddress} onChange={(e) => setRegAddress(e.target.value)} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Місто</FormLabel>
                                    <Input value={regCity} onChange={(e) => setRegCity(e.target.value)} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Регіон</FormLabel>
                                    <Input value={regRegion} onChange={(e) => setRegRegion(e.target.value)} />
                                </FormControl>

                                <Button type="submit" colorScheme="teal" isLoading={regLoading} loadingText="Реєстрація">
                                    Зареєструватися
                                </Button>
                            </Stack>
                        </form>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default AuthPage;