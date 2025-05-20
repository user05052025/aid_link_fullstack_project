// src/pages/NewRequestPage.jsx

import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Heading,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    VStack,
    Alert,
    AlertIcon,
    useToast,
    Divider
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../components/common/header/Header.jsx";
import Footer from "../components/common/footer/Footer.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const NewRequestPage = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [priority, setPriority] = useState("Середній");
    const [city, setCity] = useState("");
    const [region, setRegion] = useState("");

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authState.token) {
            toast({
                title: "Необхідно авторизуватись",
                description: "Будь ласка, увійдіть в систему для створення замовлень.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            navigate("/login");
            return;
        }

        if (authState.user && authState.user.role !== "requester") {
            toast({
                title: "Недостатньо прав",
                description: "Тільки отримувачі допомоги можуть створювати замовлення.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            navigate("/home");
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/categories");
                setCategories(response.data.categories || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Не вдалося завантажити категорії.");
            }
        };

        fetchCategories();
    }, [authState, navigate, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!title || !categoryId || !description || !region) {
            setError("Назва, категорія, опис та область є обов'язковими полями");
            setLoading(false);
            return;
        }

        try {
            const requestData = {
                title,
                category_id: categoryId,
                description,
                budget: budget || null,
                priority,
                city: city || null,
                region
            };

            const response = await axios.post(
                "http://localhost:8080/api/v1/requests",
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`
                    }
                }
            );

            toast({
                title: "Замовлення створено",
                description: "Ваше замовлення успішно додано до системи",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            navigate("/home");
        } catch (err) {
            console.error("Error creating request:", err);
            setError(err?.response?.data?.message || "Помилка при створенні замовлення");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex direction="column" minH="100vh" bg="gray.50">
            <Header />

            <Box flex="1" p={6} maxW="800px" mx="auto">
                <Heading mb={6} color="teal.600">Створення нового замовлення</Heading>

                {error && (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {error}
                    </Alert>
                )}

                <Box bg="white" p={6} borderRadius="md" boxShadow="md">
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Назва замовлення</FormLabel>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Введіть назву замовлення"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Категорія</FormLabel>
                                <Select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    placeholder="Оберіть категорію"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Опис</FormLabel>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Детально опишіть свої потреби"
                                    rows={5}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Бюджет (грн)</FormLabel>
                                <Input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="Введіть бюджет (необов'язково)"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Пріоритет</FormLabel>
                                <Select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="Низький">Низький</option>
                                    <option value="Середній">Середній</option>
                                    <option value="Високий">Високий</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Місто</FormLabel>
                                <Input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Введіть місто (необов'язково)"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Область</FormLabel>
                                <Input
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    placeholder="Введіть область"
                                />
                            </FormControl>

                            <Divider />

                            <Flex justify="space-between">
                                <Button
                                    onClick={() => navigate("/home")}
                                    variant="outline"
                                >
                                    Скасувати
                                </Button>
                                <Button
                                    type="submit"
                                    colorScheme="teal"
                                    isLoading={loading}
                                    loadingText="Створення"
                                >
                                    Створити замовлення
                                </Button>
                            </Flex>
                        </VStack>
                    </form>
                </Box>
            </Box>

            <Footer />
        </Flex>
    );
};

export default NewRequestPage;