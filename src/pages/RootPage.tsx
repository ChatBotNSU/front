import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import {
    loginSuccess,
    logout,
    selectChatbot,
    deselectChatbot,
} from "../store/authSlice";
import Greetings from "./Greetings";
import UserStorage from "./UserStorage";
import Editor from "./Editor";
import AuthModal from "../modals/AuthModal";

const RootPage: React.FC = () => {
    const isAuthenticated = useSelector(
        (s: RootState) => s.auth.isAuthenticated
    );
    const selectedChatbotId = useSelector(
        (s: RootState) => s.auth.selectedChatbotId
    );
    const dispatch = useDispatch();
    const [showAuthModal, setShowAuthModal] = useState<
        "login" | "signup" | null
    >(null);

    const handleAuthSuccess = (payload?: {
        user?: any;
        access_token?: string;
        token_type?: string;
    }) => {
        if (payload) dispatch(loginSuccess(payload));
        setShowAuthModal(null);
    };

    if (!isAuthenticated) {
        return (
            <>
                <Greetings onOpenAuth={(mode) => setShowAuthModal(mode)} />
                {showAuthModal && (
                    <AuthModal
                        mode={showAuthModal}
                        onClose={() => setShowAuthModal(null)}
                        onSuccess={handleAuthSuccess}
                    />
                )}
            </>
        );
    }

    if (selectedChatbotId) {
        return (
            <Editor
                chatbotId={selectedChatbotId}
                onLogout={() => dispatch(logout())}
                onBack={() => dispatch(deselectChatbot())}
            />
        );
    }

    return (
        <UserStorage
            onSelectChatbot={(id) => dispatch(selectChatbot(id))}
            onLogout={() => dispatch(logout())}
        />
    );
};

export default RootPage;
