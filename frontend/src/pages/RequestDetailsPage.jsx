// src/pages/RequestDetailsPage.jsx

import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    VStack,
    Badge,
    Spinner,
    Alert,
    AlertIcon,
    useToast,
    Divider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../components/common/header/Header";
import Footer from "../components/common/footer/Footer";
import CommentSection from "../components/comments/CommentSection";
import { useAuth } from "../contexts/AuthContext";

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

const RequestDetailsPage = () => {
    const { requestId } = useParams();
    const { authState } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [request, setRequest] = useState(null);
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accepting, setAccepting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const isLoggedIn = !!authState.token;
    const isVolunteer = authState.user?.role === "volunteer";
    const isRequester = authState.user?.role === "requester";
    const isMyRequest = isRequester && request?.requester_id === authState.user?.id;
    const isMyAssignment = isVolunteer && request?.volunteer_id === authState.user?.id;
    const canComment = (isMyRequest || isMyAssignment);

    useEffect(() => {
        const fetchRequestDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/requests/${requestId}`
                );

                if (response.data && response.data.request) {
                    setRequest(response.data.request);
                    setCategory(response.data.request.category_name);
                } else {
                    throw new Error("Не вдалося отримати деталі замовлення");
                }
            } catch (err) {
                console.error("Error fetching request details:", err);
                setError(err.response?.data?.message || "Не вдалося завантажити дані замовлення");
            } finally {
                setLoading(false);
            }
        };

        if (requestId) {
            fetchRequestDetails();
        }
    }, [requestId]);

    const handleAcceptRequest = async () => {
        if (!isLoggedIn || !isVolunteer) {
            toast({
                title: "Помилка",
                description: "Тільки волонтери можуть брати замовлення",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setAccepting(true);

        try {
            const response = await axios.put(
                `http://localhost:8080/api/v1/requests/${requestId}/assign`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                setRequest({
                    ...request,
                    status: "В роботі",
                    volunteer_id: authState.user.id,
                    volunteer_name: authState.user.name,
                });

                toast({
                    title: "Замовлення прийнято",
                    description: "Ви були призначені виконавцем цього замовлення",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("Error accepting request:", err);
            toast({
                title: "Помилка",
                description: err.response?.data?.message || "Не вдалося прийняти замовлення",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setAccepting(false);
            onClose();
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);

        try {
            const response = await axios.put(
                `http://localhost:8080/api/v1/requests/${requestId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                setRequest({
                    ...request,
                    status: newStatus,
                });

                toast({
                    title: "Статус оновлено",
                    description: `Замовлення успішно ${
                        newStatus === "Скасовано" ? "скасовано" : "позначено як виконане"
                    }`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast({
                title: "Помилка",
                description: err.response?.data?.message || "Не вдалося оновити статус замовлення",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

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
                                <Button as={Link} to="/login" colorScheme="teal" variant="solid">
                                    Увійти
                                </Button>
                            </>
                        ) : (
                            <>
                                <Text fontWeight="medium" color="gray.700" textAlign="center">
                                    {authState.user?.name || "Користувач"} (
                                    {isVolunteer ? "Волонтер" : "Отримувач"})
                                </Text>

                                <Button
                                    as={Link}
                                    to="/home"
                                    colorScheme="blue"
                                    variant="outline"
                                    mb={2}
                                >
                                    Всі замовлення
                                </Button>

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
                                    Мої замовлення
                                </Button>

                                <Button as={Link} to="/logout" colorScheme="red" variant="outline">
                                    Вийти
                                </Button>
                            </>
                        )}
                    </VStack>
                </Box>

                <Box flex="1" p={6}>
                    <Box mb={4}>
                        <Button
                            as={Link}
                            to="/home"
                            variant="outline"
                            size="sm"
                            leftIcon={<span>←</span>}
                            mb={4}
                        >
                            Назад до списку
                        </Button>
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
                    ) : request ? (
                        <Box>
                            <Box
                                p={6}
                                bg="white"
                                borderRadius="md"
                                shadow="md"
                                borderWidth="1px"
                                mb={6}
                            >
                                <Flex justify="space-between" align="start" wrap="wrap">
                                    <Box mb={4}>
                                        <Heading size="lg" color="teal.600">
                                            {request.title}
                                        </Heading>
                                        <Text mt={2} fontSize="lg">
                                            Категорія: {category}
                                        </Text>
                                    </Box>
                                    <Badge
                                        fontSize="md"
                                        colorScheme={getStatusColor(request.status)}
                                        p={2}
                                        borderRadius="md"
                                    >
                                        {request.status}
                                    </Badge>
                                </Flex>

                                <Divider my={4} />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Опис:
                                    </Text>
                                    <Text whiteSpace="pre-wrap">{request.description}</Text>
                                </Box>

                                <Box mt={4}>
                                    <Text fontWeight="bold">Деталі замовлення:</Text>
                                    <Flex mt={2} flexWrap="wrap">
                                        <Box minW="200px" mr={4} mb={2}>
                                            <Text fontWeight="medium">Пріоритет:</Text>
                                            <Text>{request.priority}</Text>
                                        </Box>
                                        {request.budget && (
                                            <Box minW="200px" mr={4} mb={2}>
                                                <Text fontWeight="medium">Бюджет:</Text>
                                                <Text>{request.budget} грн</Text>
                                            </Box>
                                        )}
                                        <Box minW="200px" mr={4} mb={2}>
                                            <Text fontWeight="medium">Місто:</Text>
                                            <Text>{request.city || "—"}</Text>
                                        </Box>
                                        <Box minW="200px" mb={2}>
                                            <Text fontWeight="medium">Область:</Text>
                                            <Text>{request.region || "—"}</Text>
                                        </Box>
                                    </Flex>
                                </Box>

                                <Divider my={4} />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Контакти:
                                    </Text>
                                    <Box mb={2}>
                                        <Text fontWeight="medium">Замовник:</Text>
                                        <Text>{request.requester_name}</Text>
                                    </Box>
                                    {request.volunteer_name && (
                                        <Box>
                                            <Text fontWeight="medium">Волонтер:</Text>
                                            <Text>{request.volunteer_name}</Text>
                                        </Box>
                                    )}
                                </Box>

                                {isLoggedIn && (
                                    <Box mt={6}>
                                        {isVolunteer && request.status === "Очікує на виконавця" && (
                                            <Button
                                                colorScheme="teal"
                                                onClick={onOpen}
                                                isLoading={accepting}
                                                mr={2}
                                            >
                                                Взяти замовлення
                                            </Button>
                                        )}

                                        {isMyRequest && request.status === "Очікує на виконавця" && (
                                            <Button
                                                colorScheme="red"
                                                onClick={() => handleStatusChange("Скасовано")}
                                                isLoading={updatingStatus}
                                            >
                                                Скасувати замовлення
                                            </Button>
                                        )}

                                        {(isMyRequest || isMyAssignment) && request.status === "В роботі" && (
                                            <Button
                                                colorScheme="green"
                                                onClick={() => handleStatusChange("Виконано")}
                                                isLoading={updatingStatus}
                                            >
                                                Позначити як виконане
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {canComment && <CommentSection requestId={requestId} />}
                        </Box>
                    ) : (
                        <Alert status="error">
                            <AlertIcon />
                            Замовлення не знайдено
                        </Alert>
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
                        {request && (
                            <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                                <Text fontWeight="bold">{request.title}</Text>
                                <Text mt={1}>{request.description}</Text>
                            </Box>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Скасувати
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleAcceptRequest}
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

export default RequestDetailsPage;