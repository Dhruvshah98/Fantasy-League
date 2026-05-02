import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000/api";
const ADMIN_TOKENS_KEY = "fantasy-league-admin-tokens";

function loadAdminTokens() {
    if (typeof window === "undefined") {
        return {};
    }

    try {
        return JSON.parse(window.localStorage.getItem(ADMIN_TOKENS_KEY) || "{}");
    } catch (error) {
        return {};
    }
}

function saveAdminTokens(tokens) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(ADMIN_TOKENS_KEY, JSON.stringify(tokens));
}

const persistedAdminTokens = loadAdminTokens();

async function parseJsonResponse(response) {
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const looksLikeHtml = text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html");

    if (!contentType.includes("application/json") || looksLikeHtml) {
        throw new Error(
            "Fantasy League API is not responding with JSON. Make sure the backend server is running on http://localhost:4000."
        );
    }

    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.message || "Request failed");
    }

    return data;
}

async function apiRequest(pathname, options = {}) {
    const response = await fetch(`${API_BASE}${pathname}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    return parseJsonResponse(response);
}

function tokenHeader(getState, leagueId) {
    const token = getState().league.adminTokens[leagueId];
    return token ? { "x-admin-token": token } : {};
}

export const fetchLeagues = createAsyncThunk("league/fetchLeagues", async () => apiRequest("/leagues"));

export const fetchLeagueById = createAsyncThunk(
    "league/fetchLeagueById",
    async (leagueId) => apiRequest(`/leagues/${leagueId}`)
);

export const createLeague = createAsyncThunk(
    "league/createLeague",
    async (leagueData) =>
        apiRequest("/leagues", {
            method: "POST",
            body: JSON.stringify(leagueData)
        })
);

export const adminLogin = createAsyncThunk(
    "league/adminLogin",
    async ({ leagueId, password }) =>
        apiRequest(`/leagues/${leagueId}/admin-login`, {
            method: "POST",
            body: JSON.stringify({ password })
        })
);

export const joinLeague = createAsyncThunk(
    "league/joinLeague",
    async (code) => apiRequest(`/leagues/code/${encodeURIComponent(code)}`)
);

export const submitTeam = createAsyncThunk(
    "league/submitTeam",
    async ({ leagueId, team }) =>
        apiRequest(`/leagues/${leagueId}/teams`, {
            method: "POST",
            body: JSON.stringify(team)
        })
);

export const updatePlayer = createAsyncThunk(
    "league/updatePlayer",
    async ({ leagueId, playerId, player }, { getState }) =>
        apiRequest(`/leagues/${leagueId}/players/${playerId}`, {
            method: "PATCH",
            headers: tokenHeader(getState, leagueId),
            body: JSON.stringify(player)
        })
);

export const deletePlayer = createAsyncThunk(
    "league/deletePlayer",
    async ({ leagueId, playerId }, { getState }) =>
        apiRequest(`/leagues/${leagueId}/players/${playerId}`, {
            method: "DELETE",
            headers: tokenHeader(getState, leagueId)
        })
);

export const updateTeam = createAsyncThunk(
    "league/updateTeam",
    async ({ leagueId, teamId, team }, { getState }) =>
        apiRequest(`/leagues/${leagueId}/teams/${teamId}`, {
            method: "PATCH",
            headers: tokenHeader(getState, leagueId),
            body: JSON.stringify(team)
        })
);

export const deleteTeam = createAsyncThunk(
    "league/deleteTeam",
    async ({ leagueId, teamId }, { getState }) =>
        apiRequest(`/leagues/${leagueId}/teams/${teamId}`, {
            method: "DELETE",
            headers: tokenHeader(getState, leagueId)
        })
);

export const updateLeagueSettings = createAsyncThunk(
    "league/updateLeagueSettings",
    async ({ leagueId, googleSheetsUrl }, { getState }) =>
        apiRequest(`/leagues/${leagueId}/settings`, {
            method: "PATCH",
            headers: tokenHeader(getState, leagueId),
            body: JSON.stringify({ googleSheetsUrl })
        })
);

export const syncGoogleSheets = createAsyncThunk(
    "league/syncGoogleSheets",
    async (leagueId, { getState }) =>
        apiRequest(`/leagues/${leagueId}/sync-google-sheets`, {
            method: "POST",
            headers: tokenHeader(getState, leagueId)
        })
);

const initialState = {
    leagues: [],
    activeLeague: null,
    createdLeagueCode: "",
    screen: "HOME",
    loading: false,
    submitting: false,
    error: "",
    successMessage: "",
    adminTokens: persistedAdminTokens
};

function upsertLeague(state, league) {
    const existingIndex = state.leagues.findIndex((item) => item.id === league.id);

    if (existingIndex === -1) {
        state.leagues.unshift(league);
        return;
    }

    state.leagues[existingIndex] = league;
}

function setAdminSession(state, leagueId, token) {
    state.adminTokens[leagueId] = token;
    saveAdminTokens(state.adminTokens);
}

const leagueSlice = createSlice({
    name: "league",
    initialState,
    reducers: {
        setScreen(state, action) {
            state.screen = action.payload;
            state.error = "";
            state.successMessage = "";
        },
        clearError(state) {
            state.error = "";
        },
        clearSuccessMessage(state) {
            state.successMessage = "";
        },
        logoutAdmin(state, action) {
            delete state.adminTokens[action.payload];
            saveAdminTokens(state.adminTokens);
            state.successMessage = "Admin session cleared.";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeagues.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchLeagues.fulfilled, (state, action) => {
                state.loading = false;
                state.leagues = action.payload.leagues;
            })
            .addCase(fetchLeagues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Unable to load leagues.";
            })
            .addCase(fetchLeagueById.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchLeagueById.fulfilled, (state, action) => {
                state.loading = false;
                state.activeLeague = action.payload.league;
                upsertLeague(state, action.payload.league);
                state.screen = "LEAGUE_DETAILS";
            })
            .addCase(fetchLeagueById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Unable to load league.";
            })
            .addCase(createLeague.pending, (state) => {
                state.submitting = true;
                state.error = "";
                state.successMessage = "";
            })
            .addCase(createLeague.fulfilled, (state, action) => {
                state.submitting = false;
                state.activeLeague = action.payload.league;
                state.createdLeagueCode = action.payload.league.code;
                state.screen = "LEAGUE_CREATED";
                upsertLeague(state, action.payload.league);
                setAdminSession(state, action.payload.league.id, action.payload.adminToken);
                state.successMessage = "League created successfully.";
            })
            .addCase(createLeague.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.error.message || "Unable to create league.";
            })
            .addCase(adminLogin.pending, (state) => {
                state.submitting = true;
                state.error = "";
                state.successMessage = "";
            })
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.submitting = false;
                state.activeLeague = action.payload.league;
                upsertLeague(state, action.payload.league);
                setAdminSession(state, action.payload.league.id, action.payload.adminToken);
                state.successMessage = "Admin login successful.";
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.error.message || "Unable to log in as admin.";
            })
            .addCase(joinLeague.pending, (state) => {
                state.submitting = true;
                state.error = "";
            })
            .addCase(joinLeague.fulfilled, (state, action) => {
                state.submitting = false;
                state.activeLeague = action.payload.league;
                upsertLeague(state, action.payload.league);
                state.screen = "CREATE_TEAM";
            })
            .addCase(joinLeague.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.error.message || "Invalid league code.";
            })
            .addCase(submitTeam.pending, (state) => {
                state.submitting = true;
                state.error = "";
            })
            .addCase(submitTeam.fulfilled, (state, action) => {
                state.submitting = false;
                state.activeLeague = action.payload.league;
                upsertLeague(state, action.payload.league);
                state.screen = "LEAGUE_DETAILS";
                state.successMessage = "Team submitted successfully.";
            })
            .addCase(submitTeam.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.error.message || "Unable to save team.";
            });

        [updatePlayer, deletePlayer, updateTeam, deleteTeam, updateLeagueSettings, syncGoogleSheets].forEach(
            (thunk) => {
                builder
                    .addCase(thunk.pending, (state) => {
                        state.submitting = true;
                        state.error = "";
                        state.successMessage = "";
                    })
                    .addCase(thunk.fulfilled, (state, action) => {
                        state.submitting = false;
                        state.activeLeague = action.payload.league;
                        upsertLeague(state, action.payload.league);
                        state.successMessage = action.payload.message || "League updated successfully.";
                    })
                    .addCase(thunk.rejected, (state, action) => {
                        state.submitting = false;
                        state.error = action.error.message || "League update failed.";
                    });
            }
        );
    }
});

export const { setScreen, clearError, clearSuccessMessage, logoutAdmin } = leagueSlice.actions;

export default leagueSlice.reducer;
