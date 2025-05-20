// src/components/comments/CommentSection.jsx

import React, { useState, useEffect } from "react";
import {
    Box,
    VStack,
    Heading,
    Text,
    Input,
    Button,
    Flex,
    Divider,
    Avatar,
    Spinner,
    Alert,
    AlertIcon,
    useToast,
    Badge,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const CommentSection = ({ requestId }) => {
    const { authState } = useAuth();
    const toast = useToast();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = async () => {
        if (!requestId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `http://localhost:8080/api/v1/requests/${requestId}/comments`
            );

            if (response.data && response.data.comments) {
                setComments(response.data.comments);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError("Не вдалося завантажити коментарі");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [requestId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast({
                title: "Помилка",
                description: "Коментар не може бути порожнім",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(
                `http://localhost:8080/api/v1/requests/${requestId}/comments`,
                { text: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );

            if (response.data && response.data.comments) {
                setComments(response.data.comments);
                setNewComment("");
                toast({
                    title: "Коментар додано",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            toast({
                title: "Помилка",
                description: err.response?.data?.message || "Не вдалося додати коментар",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('uk-UA', options);
    };

    return (
        <Box mt={8} bg="white" p={5} borderRadius="md" shadow="sm" borderWidth="1px">
            <Heading size="md" mb={4}>
                Коментарі
            </Heading>

            {loading ? (
                <Flex justify="center" py={6}>
                    <Spinner />
                </Flex>
            ) : error ? (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            ) : (
                <VStack spacing={4} align="stretch" mb={6} maxH="400px" overflowY="auto">
                    {comments.length === 0 ? (
                        <Text color="gray.500" textAlign="center" py={4}>
                            Коментарів ще немає. Будьте першим!
                        </Text>
                    ) : (
                        comments.map((comment) => (
                            <Box key={comment.id} p={3} bg="gray.50" borderRadius="md">
                                <Flex justify="space-between" align="flex-start" mb={2}>
                                    <Flex align="center">
                                        <Avatar size="sm" name={comment.user_name} bg={comment.user_role === "volunteer" ? "blue.500" : "teal.500"} mr={2} />
                                        <Box>
                                            <Text fontWeight="bold">
                                                {comment.user_name}
                                                <Badge
                                                    ml={2}
                                                    colorScheme={comment.user_role === "volunteer" ? "blue" : "teal"}
                                                    fontSize="xs"
                                                >
                                                    {comment.user_role === "volunteer" ? "Волонтер" : "Замовник"}
                                                </Badge>
                                            </Text>
                                        </Box>
                                    </Flex>
                                    <Text fontSize="sm" color="gray.500">
                                        {formatDate(comment.created_at)}
                                    </Text>
                                </Flex>
                                <Text mt={1}>{comment.text}</Text>
                            </Box>
                        ))
                    )}
                </VStack>
            )}

            {authState.token && (
                <>
                    <Divider mb={4} />
                    <Flex>
                        <Input
                            placeholder="Напишіть коментар..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            mr={3}
                        />
                        <Button
                            colorScheme="teal"
                            onClick={handleAddComment}
                            isLoading={submitting}
                            loadingText="Надсилання"
                        >
                            Додати
                        </Button>
                    </Flex>
                </>
            )}
        </Box>
    );
};

export default CommentSection;