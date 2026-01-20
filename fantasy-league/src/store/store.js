import { configureStore } from "@reduxjs/toolkit";
import leagueReducer from "./leagueSlice";

export const store = configureStore({
    reducer: {
        league: leagueReducer
    }
});