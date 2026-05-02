import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setScreen } from "../store/leagueSlice";

const LeagueCreated = () => {
    const dispatch = useDispatch();
    const { activeLeague, createdLeagueCode } = useSelector((state) => state.league);

    if (!activeLeague) {
        return null;
    }

    return (
        <section className="panel-stack">
            <div className="panel form-stack success-panel">
                <p className="section-kicker">League Created</p>
                <h2>{activeLeague.name}</h2>
                <p className="muted-copy">
                    Share this code with participants so they can join and create their teams.
                </p>

                <div className="code-spotlight">{createdLeagueCode || activeLeague.code}</div>

                <div className="button-row">
                    <button className="primary-button" onClick={() => dispatch(setScreen("LEAGUE_DETAILS"))}>
                        Open League Dashboard
                    </button>
                    <button className="secondary-button" onClick={() => dispatch(setScreen("HOME"))}>
                        Back Home
                    </button>
                </div>
            </div>
        </section>
    );
};

export default LeagueCreated;
