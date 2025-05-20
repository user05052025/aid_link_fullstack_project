// src/pages/MyRequestsPage.jsx

import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Button,
    VStack,
    Text,
    Stack,
    Badge,
    Spinner,
    Alert,
    AlertIcon,
    useToast,
    Divider,
    ButtonGroup,
    Tooltip,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../components/common/header/Header.jsx";
import Footer from "../components/common/footer/Footer.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const getStatusColor = (status) => {
    switch (status) {
        case "Очікує на виконавця":
            return "orange";
        case "В роботі":
            return "blue";
        case "Виконано":
            return "green";
        case "Скасовано":
            return "red";
        default:
            return "gray";
    }
};

const MyRequestsPage = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [requests, setRequests] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authState.token) {
            toast({
                title: "Необхідно авторизуватись",
                description: "Будь ласка, увійдіть в систему для перегляду ваших замовлень.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            navigate("/login");
            return;
        }

        if (!authState.user) {
            const fetchUserProfile = async () => {
                try {
                    const response = await axios.get(
                        "http://localhost:8080/api/v1/auth/profile",
                        {
                            headers: {
                                Authorization: `Bearer ${authState.token}`
                            }
                        }
                    );

                    if (response.data && response.data.user) {
                        console.log("Профіль користувача отримано:", response.data.user);
                        window.location.reload();
                        return;
                    }
                } catch (err) {
                    console.error("Помилка при отриманні профілю:", err);
                    toast({
                        title: "Помилка автентифікації",
                        description: "Не вдалося отримати дані профілю. Будь ласка, увійдіть знову.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    navigate("/login");
                    return;
                }
            };

            fetchUserProfile();
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                let endpoint;

                if (!authState.user || !authState.user.role) {
                    throw new Error("Роль користувача не визначена");
                }

                console.log("User data:", authState.user);
                console.log("User role:", authState.user.role);

                const role = authState.user.role.toLowerCase();

                if (role === "requester") {
                    endpoint = "http://localhost:8080/api/v1/myrequests";
                } else if (role === "volunteer") {
                    endpoint = "http://localhost:8080/api/v1/assignedrequests";
                } else {
                    console.error("Невідома роль:", role);
                    endpoint = "http://localhost:8080/api/v1/myrequests";
                    toast({
                        title: "Увага",
                        description: "Використовуємо перегляд замовлень за замовчуванням",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                }

                const [requestsRes, categoriesRes] = await Promise.all([
                    axios.get(endpoint, {
                        headers: {
                            Authorization: `Bearer ${authState.token}`
                        }
                    }),
                    axios.get("http://localhost:8080/api/v1/categories")
                ]);

                const requestsData = requestsRes.data.requests || [];
                console.log("API response:", requestsRes.data);

                setRequests(requestsData);

                const map = {};
                (categoriesRes.data.categories || []).forEach((cat) => {
                    map[cat.id] = cat.name;
                });
                setCategoryMap(map);
            } catch (err) {
                console.error("Error fetching data:", err);
                const errorMessage = err.response ?
                    `Помилка: ${err.response.status} - ${err.response.data?.message || 'Невідома помилка'}` :
                    err.message || "Не вдалося отримати дані замовлень. Перевірте з'єднання з сервером.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authState, navigate, toast]);

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await axios.put(
                `http://localhost:8080/api/v1/requests/${requestId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`
                    }
                }
            );

            setRequests(requests.map(req => {
                if (req.id === requestId) {
                    return { ...req, status: newStatus };
                }
                return req;
            }));

            toast({
                title: "Статус оновлено",
                description: `Замовлення успішно ${newStatus === "Скасовано" ? "скасовано" : "позначено як виконане"}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            console.error("Error updating status:", err);
            toast({
                title: "Помилка",
                description: err?.response?.data?.message || "Не вдалося оновити статус замовлення",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleViewDetails = (requestId) => {
        navigate(`/requests/${requestId}`);
    };

    const userRole = authState.user?.role?.toLowerCase() === "volunteer" ? "volunteer" : "requester";
    const pageTitle = userRole === "volunteer" ? "Мої призначені замовлення" : "Мої замовлення";

    return (
        <Flex direction="column" minH="100vh" bg="gray.50">
            <Header />

            <Flex flex="1">
                <Box
                    w={{ base: "100%", md: "250px" }}
                    p={6}
                    bg="white"
                    borderRight="1px solid #e2e8f0"
                    minH="calc(100vh - 120px)"
                >
                    <VStack spacing={5} align="stretch">
                        <Heading size="md" color="teal.600" textAlign="center">
                            Меню
                        </Heading>
                        <Divider />
                        <Text fontWeight="medium" color="gray.700" textAlign="center">
                            {authState.user?.name || "Користувач"} ({userRole === "volunteer" ? "Волонтер" : "Отримувач"})
                        </Text>

                        {userRole === "requester" && (
                            <Button
                                as={Link}
                                to="/new-request"
                                colorScheme="teal"
                                leftIcon={<span>+</span>}
                                mb={2}
                            >
                                Нове замовлення
                            </Button>
                        )}

                        <Button
                            as={Link}
                            to="/home"
                            colorScheme="blue"
                            variant="outline"
                            mb={2}
                        >
                            Всі замовлення
                        </Button>

                        <Button
                            as={Link}
                            to="/logout"
                            colorScheme="red"
                            variant="outline"
                        >
                            Вийти
                        </Button>
                    </VStack>
                </Box>

                <Box flex="1" p={6}>
                    <Heading size="lg" mb={6}>
                        {pageTitle}
                    </Heading>

                    {loading ? (
                        <Flex justify="center" align="center" h="200px">
                            <Spinner size="xl" thickness="4px" color="teal.500" />
                        </Flex>
                    ) : error ? (
                        <Alert status="error">
                            <AlertIcon />
                            {error}
                        </Alert>
                    ) : requests.length === 0 ? (
                        <Alert status="info">
                            <AlertIcon />
                            <Text>
                                {userRole === "requester"
                                    ? "У вас немає активних замовлень. Створіть нове замовлення!"
                                    : "У вас немає призначених замовлень."}
                            </Text>
                        </Alert>
                    ) : (
                        <Stack spacing={5}>
                            {requests.map((request) => (
                                <Box
                                    key={request.id}
                                    p={5}
                                    bg="white"
                                    borderRadius="md"
                                    shadow="md"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ boxShadow: "lg" }}
                                    transition="all 0.2s"
                                >
                                    <Heading fontSize="xl" color="teal.600">
                                        {request.title}
                                    </Heading>

                                    <Text mt={2}>Категорія: {categoryMap[request.category_id] || request.category_name || "Невідома"}</Text>
                                    <Text>Місто: {request.city || "—"}, Область: {request.region || "—"}</Text>

                                    {request.volunteer_name && userRole === "requester" && (
                                        <Text fontWeight="medium" mt={2}>
                                            Волонтер: {request.volunteer_name}
                                        </Text>
                                    )}

                                    {request.requester_name && userRole === "volunteer" && (
                                        <Text fontWeight="medium" mt={2}>
                                            Замовник: {request.requester_name}
                                        </Text>
                                    )}

                                    <Badge mt={3} colorScheme={getStatusColor(request.status)}>
                                        {request.status}
                                    </Badge>

                                    <Flex mt={4} justify="space-between" align="center">

                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => handleViewDetails(request.id)}
                                        >
                                            Деталі
                                        </Button>

                                        {request.status === "Очікує на виконавця" && userRole === "requester" && (
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => handleStatusChange(request.id, "Скасовано")}
                                            >
                                                Скасувати замовлення
                                            </Button>
                                        )}

                                        {request.status === "В роботі" && (
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                onClick={() => handleStatusChange(request.id, "Виконано")}
                                            >
                                                Позначити як виконане
                                            </Button>
                                        )}
                                    </Flex>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Flex>

            <Footer />
        </Flex>
    );
};

export default MyRequestsPage;