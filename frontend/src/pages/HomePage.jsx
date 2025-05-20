// src/pages/HomePage.jsx

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
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Select,
    InputGroup,
    InputLeftElement,
    FormControl,
    FormLabel,
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

const HomePage = () => {
    const { authState, setAuthState } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accepting, setAccepting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const isLoggedIn = !!authState.token;
    const isVolunteer = authState.user?.role === "volunteer";
    const isRequester = authState.user?.role === "requester";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, categoriesRes] = await Promise.all([
                    axios.get("http://localhost:8080/api/v1/requests"),
                    axios.get("http://localhost:8080/api/v1/categories"),
                ]);

                setOrders(ordersRes.data.requests || []);
                setFilteredOrders(ordersRes.data.requests || []);

                const categoriesData = categoriesRes.data.categories || [];
                setCategories(categoriesData);

                const map = {};
                categoriesData.forEach((cat) => {
                    map[cat.id] = cat.name;
                });
                setCategoryMap(map);
            } catch (err) {
                setError("Не вдалося отримати дані.");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (orders.length === 0) return;

        let results = [...orders];

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            results = results.filter(
                order =>
                    order.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                    order.description.toLowerCase().includes(lowerCaseSearchTerm) ||
                    (order.city && order.city.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (order.region && order.region.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        if (selectedCategory) {
            results = results.filter(order => order.category_id === parseInt(selectedCategory));
        }

        setFilteredOrders(results);
    }, [searchTerm, selectedCategory, orders]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setAuthState({ token: null, user: null });
        toast({
            title: "Вихід виконано",
            status: "info",
            duration: 2000,
            isClosable: true,
        });
        navigate("/login");
    };

    const openAcceptModal = (order) => {
        setSelectedOrder(order);
        onOpen();
    };

    const handleAcceptOrder = async () => {
        if (!selectedOrder) return;

        setAccepting(true);

        try {
            await axios.put(
                `http://localhost:8080/api/v1/requests/${selectedOrder.id}/assign`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`
                    }
                }
            );

            const updatedOrders = orders.map(order => {
                if (order.id === selectedOrder.id) {
                    return { ...order, status: "В роботі", volunteer_id: authState.user.id };
                }
                return order;
            });

            setOrders(updatedOrders);
            setFilteredOrders(
                filteredOrders.map(order => {
                    if (order.id === selectedOrder.id) {
                        return { ...order, status: "В роботі", volunteer_id: authState.user.id };
                    }
                    return order;
                })
            );

            toast({
                title: "Замовлення прийнято",
                description: "Ви були призначені виконавцем цього замовлення",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
        } catch (err) {
            toast({
                title: "Помилка",
                description: err?.response?.data?.message || "Не вдалося прийняти замовлення",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setAccepting(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
    };

    const greeting = authState.user
        ? `Вітаємо, ${authState.user.name} (${authState.user.role === "volunteer" ? "Волонтер" : "Отримувач"})`
        : "";

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
                        {!isLoggedIn ? (
                            <>
                                <Button
                                    as={Link}
                                    to="/login"
                                    colorScheme="teal"
                                    variant="solid"
                                >
                                    Увійти
                                </Button>
                            </>
                        ) : (
                            <>
                                <Text fontWeight="medium" color="gray.700" textAlign="center">
                                    {greeting}
                                </Text>

                                {isRequester && (
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
                                    to="/my-requests"
                                    colorScheme="blue"
                                    variant="outline"
                                    mb={2}
                                >
                                    {isVolunteer ? "Мої замовлення" : "Мої замовлення"}
                                </Button>

                                <Button colorScheme="red" variant="outline" onClick={handleLogout}>
                                    Вийти
                                </Button>
                            </>
                        )}
                    </VStack>
                </Box>

                <Box flex="1" p={6}>
                    <Heading size="lg" mb={6}>
                        Доступні замовлення
                    </Heading>

                    <Box
                        mb={6}
                        p={4}
                        bg="white"
                        borderRadius="md"
                        shadow="sm"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <Flex
                            direction={{ base: "column", md: "row" }}
                            gap={4}
                            align={{ base: "stretch", md: "flex-end" }}
                        >
                            <FormControl>
                                <FormLabel>Пошук замовлень</FormLabel>
                                <InputGroup>
                                    <Input
                                        placeholder="Пошук за назвою, описом або місцем"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl maxW={{ base: "full", md: "200px" }}>
                                <FormLabel>Категорія</FormLabel>
                                <Select
                                    placeholder="Всі категорії"
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                colorScheme="gray"
                                onClick={clearFilters}
                                alignSelf={{ base: "flex-start", md: "flex-end" }}
                                mt={{ base: 0, md: "1px" }}
                            >
                                Скинути
                            </Button>
                        </Flex>

                        <Text mt={2} fontSize="sm" color="gray.600">
                            {filteredOrders.length === 1
                                ? "Знайдено 1 замовлення"
                                : `Знайдено ${filteredOrders.length} замовлень`}
                        </Text>
                    </Box>

                    {loading ? (
                        <Flex justify="center" align="center" h="200px">
                            <Spinner size="xl" thickness="4px" color="teal.500" />
                        </Flex>
                    ) : error ? (
                        <Alert status="error">
                            <AlertIcon />
                            {error}
                        </Alert>
                    ) : filteredOrders.length === 0 ? (
                        <Alert status="info">
                            <AlertIcon />
                            <Text>
                                {searchTerm || selectedCategory
                                    ? "За вашим запитом замовлень не знайдено. Спробуйте змінити параметри пошуку."
                                    : "Наразі немає замовлень."}
                            </Text>
                        </Alert>
                    ) : (
                        <Stack spacing={5}>
                            {filteredOrders.map((order) => (
                                <Box
                                    key={order.id}
                                    p={4}
                                    bg="white"
                                    borderRadius="md"
                                    shadow="sm"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ boxShadow: "md", borderColor: "teal.300" }}
                                    transition="all 0.2s"
                                >
                                    <Link to={`/requests/${order.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                        <Heading fontSize="xl" color="teal.600">
                                            {order.title}
                                        </Heading>
                                        <Text mt={2}>Категорія: {categoryMap[order.category_id] || "Невідома"}</Text>
                                        <Text>Місто: {order.city || "—"}, Область: {order.region || "—"}</Text>
                                        <Text mt={2} noOfLines={2}>{order.description}</Text>
                                    </Link>

                                    <Flex mt={3} justifyContent="space-between" alignItems="center" wrap="wrap">
                                        <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>

                                        <Flex gap={2} mt={{ base: 2, md: 0 }}>
                                            {isLoggedIn && isVolunteer && order.status === "Очікує на виконавця" && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="teal"
                                                    onClick={() => openAcceptModal(order)}
                                                >
                                                    Взяти замовлення
                                                </Button>
                                            )}
                                            <Button
                                                as={Link}
                                                to={`/requests/${order.id}`}
                                                size="sm"
                                                colorScheme="blue"
                                                variant="outline"
                                            >
                                                Деталі
                                            </Button>
                                        </Flex>
                                    </Flex>

                                    {!isLoggedIn && (
                                        <Text mt={2} fontSize="sm" color="gray.500">
                                            Щоб взяти замовлення, будь ласка, <Link to="/login" style={{color: "teal", textDecoration: "underline"}}>увійдіть в систему</Link>
                                        </Text>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Підтвердження</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>Ви дійсно бажаєте взяти це замовлення?</Text>
                        {selectedOrder && (
                            <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                                <Text fontWeight="bold">{selectedOrder.title}</Text>
                                <Text mt={1}>{selectedOrder.description}</Text>
                            </Box>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Скасувати
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleAcceptOrder}
                            isLoading={accepting}
                            loadingText="Обробка"
                        >
                            Підтвердити
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Footer />
        </Flex>
    );
};

export default HomePage;