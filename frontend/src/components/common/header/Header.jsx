// src/components/common/header/Header.jsx

import React from "react";
import { Box, Flex, Heading, Image } from "@chakra-ui/react";

const Header = () => {
    return (
        <Box
            as="header"
            bg="teal.500"
            py={4}
            px={8}
            color="white"
            boxShadow="md"
        >
            <Flex
                align="center"
                justify="space-between"
                maxW="1200px"
                mx="auto"
            >
                <Heading size="lg" textAlign="center" flex="1">
                    AidLink
                </Heading>
            </Flex>
        </Box>
    );
};

export default Header;