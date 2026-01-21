import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import { setScreen } from "../store/leagueSlice";

const LeagueCreated = () => {
    const dispatch = useDispatch();

    const activeLeague = useSelector(
        (state) => state.league.activeLeague
    );
    if (!activeLeague) {
        dispatch(setScreen("HOME"));
        return null;
    }
    return (
        <div>
            <h2>League Created 🎉</h2>

            <p>
                <strong>League Name:</strong> {activeLeague.name}
            </p>

            <p>
                <strong>League Code:</strong>{" "}
                <span style={{ fontSize: "20px" }}>
                    {activeLeague.code}
                </span>
            </p>

            <p>Share this code with participants.</p>

            <button onClick={() => dispatch(setScreen("HOME"))}>
                Go Home
            </button>

        </div>
    )
}

export default LeagueCreated