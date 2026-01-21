import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { joinLeague, setScreen } from '../store/leagueSlice';

const JoinLeague = () => {
    const dispatch = useDispatch();
    const leagues = useSelector(
        (state) => state.league.leagues
    );
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const handleJoin = () => {
        const league = leagues.find((l) => l.code === code);
        if (!league) {
            setError("Invalid league code");
            return;
        }
        dispatch(joinLeague(league))
    }
    return (
        <>
            <button onClick={() => dispatch(setScreen("HOME"))}>
                ← Back
            </button>

            <h2>Join League</h2>

            <input
                placeholder="Enter league code"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                }}
            />

            <button onClick={handleJoin}>Join</button>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </>
    )
}

export default JoinLeague