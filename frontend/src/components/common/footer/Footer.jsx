// src/components/common/footer/Footer.jsx

import React from "react";
import { Box, Text, Flex, Link } from "@chakra-ui/react";

const Footer = () => {
    return (
        <Box as="footer" bg="teal.500" py={4} color="white">
            <Flex direction="column" align="center" maxW="1200px" mx="auto">
                <Text fontSize="sm">
                    &copy; {new Date().getFullYear()} Волонтерська Платформа. Всі права захищені.
                </Text>
            </Flex>
        </Box>
    );
};

export default Footer;