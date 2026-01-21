import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    leagues: [],
    activeLeague: null,
    screen: "HOME"
};

const leagueSlice = createSlice({
    name: "league",
    initialState,
    reducers: {
        createLeague(state, action) {
            state.leagues.push(action.payload);
            state.activeLeague = action.payload;
            state.screen = "LEAGUE_CREATED";
        },
        joinLeague(state, action) {
            state.activeLeague = action.payload;
            state.screen = "CREATE_TEAM";
        },
        submitTeam(state, action) {
            const { leagueId, team } = action.payload;

            const league = state.leagues.find(
                (l) => l.id === leagueId
            );

            if (league) {
                league.teams.push(team);
            }

            state.activeLeague = null;
            state.screen = "HOME";
        },
        setScreen(state, action) {
            state.screen = action.payload;
        }
    }
});

export const {
    createLeague,
    joinLeague,
    submitTeam,
    setScreen
} = leagueSlice.actions;

export default leagueSlice.reducer;