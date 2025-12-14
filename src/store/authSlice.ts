import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type User = { email?: string; username?: string } | null;

interface AuthState {
    isAuthenticated: boolean;
    user: User;
    selectedChatbotId: string | null;
    access_token?: string | null;
    token_type?: string | null;
}

const loadInitialState = (): AuthState => {
    const stored = localStorage.getItem("auth_state");
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return { isAuthenticated: false, user: null, selectedChatbotId: null };
        }
    }
    return { isAuthenticated: false, user: null, selectedChatbotId: null };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(
            state,
            action: PayloadAction<{ user?: User; access_token?: string; token_type?: string }>
        ) {
            state.isAuthenticated = true;
            if (action.payload.user !== undefined) state.user = action.payload.user;
            if (action.payload.access_token !== undefined) state.access_token = action.payload.access_token;
            if (action.payload.token_type !== undefined) state.token_type = action.payload.token_type;
            localStorage.setItem("auth_state", JSON.stringify(state));
        },
        selectChatbot(state, action: PayloadAction<string>) {
            state.selectedChatbotId = action.payload;
            localStorage.setItem("auth_state", JSON.stringify(state));
        },
        deselectChatbot(state) {
            state.selectedChatbotId = null;
            localStorage.setItem("auth_state", JSON.stringify(state));
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.selectedChatbotId = null;
            localStorage.removeItem("auth_state");
        },
    },
});

export const { loginSuccess, selectChatbot, deselectChatbot, logout } = authSlice.actions;
export default authSlice.reducer;
