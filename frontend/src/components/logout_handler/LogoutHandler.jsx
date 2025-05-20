// src/components/logout_handler/LogoutHandler.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useAuth} from "../../contexts/AuthContext.jsx";

const LogoutHandler = () => {
    const { setAuthState } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        localStorage.removeItem("authToken");
        setAuthState({ token: null, user: null });

        toast({
            title: "Вихід виконано",
            description: "Ви успішно вийшли з системи",
            status: "info",
            duration: 3000,
            isClosable: true,
        });

        navigate("/", { replace: true });
    }, [setAuthState, navigate, toast]);

    return null;
};

export default LogoutHandler;