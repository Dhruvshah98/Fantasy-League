import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinLeague, setScreen } from "../store/leagueSlice";

const JoinLeague = () => {
    const dispatch = useDispatch();
    const submitting = useSelector((state) => state.league.submitting);
    const [code, setCode] = useState("");

    const handleJoin = () => {
        const normalizedCode = code.trim().toUpperCase();

        if (!normalizedCode) {
            return;
        }

        dispatch(joinLeague(normalizedCode));
    };

    return (
        <section className="panel-stack">
            <div className="panel form-stack">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Join League</p>
                        <h2>Enter your invite code</h2>
                    </div>
                    <button className="ghost-button" onClick={() => dispatch(setScreen("HOME"))}>
                        Back
                    </button>
                </div>

                <input
                    placeholder="Enter league code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                />

                <button className="primary-button" onClick={handleJoin} disabled={submitting}>
                    {submitting ? "Checking..." : "Join League"}
                </button>
            </div>
        </section>
    );
};

export default JoinLeague;
