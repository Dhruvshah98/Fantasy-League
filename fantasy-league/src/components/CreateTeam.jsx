import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setScreen, submitTeam } from "../store/leagueSlice";

function CreateTeam() {
    const dispatch = useDispatch();
    const { activeLeague, submitting } = useSelector((state) => state.league);
    const [managerName, setManagerName] = useState("");
    const [teamName, setTeamName] = useState("");
    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);

    const selectedPlayers = (activeLeague?.players || []).filter((player) =>
        selectedPlayerIds.includes(player.id)
    );

    if (!activeLeague) {
        return (
            <section className="panel">
                <p>No active league selected.</p>
                <button className="primary-button" onClick={() => dispatch(setScreen("HOME"))}>
                    Go Home
                </button>
            </section>
        );
    }

    const togglePlayer = (playerId) => {
        if (selectedPlayerIds.includes(playerId)) {
            setSelectedPlayerIds((current) => current.filter((item) => item !== playerId));
            return;
        }

        if (selectedPlayerIds.length >= activeLeague.teamSize) {
            return;
        }

        setSelectedPlayerIds((current) => [...current, playerId]);
    };

    const handleSubmit = () => {
        dispatch(
            submitTeam({
                leagueId: activeLeague.id,
                team: {
                    managerName,
                    teamName,
                    selectedPlayerIds
                }
            })
        );
    };

    return (
        <section className="panel-stack">
            <div className="panel form-stack">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Build Team</p>
                        <h2>{activeLeague.name}</h2>
                    </div>
                    <button
                        className="ghost-button"
                        onClick={() => dispatch(setScreen("LEAGUE_DETAILS"))}
                    >
                        Back To League
                    </button>
                </div>

                <p className="muted-copy">
                    Select exactly {activeLeague.teamSize} players from the league pool.
                </p>

                <input
                    placeholder="Manager Name"
                    value={managerName}
                    onChange={(event) => setManagerName(event.target.value)}
                />

                <input
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                />

                <div className="selection-summary">
                    <span>{selectedPlayerIds.length} / {activeLeague.teamSize} selected</span>
                    <span>{selectedPlayers.reduce((sum, player) => sum + player.points, 0)} pts total</span>
                </div>

                <div className="player-pool-grid">
                    {activeLeague.players.map((player) => {
                        const isSelected = selectedPlayerIds.includes(player.id);

                        return (
                            <button
                                className={isSelected ? "player-chip selected" : "player-chip"}
                                key={player.id}
                                onClick={() => togglePlayer(player.id)}
                                type="button"
                            >
                                <strong>{player.name}</strong>
                                <span>{player.position}</span>
                                <span>{player.points} pts</span>
                            </button>
                        );
                    })}
                </div>

                <button
                    className="primary-button"
                    disabled={
                        submitting ||
                        !managerName.trim() ||
                        !teamName.trim() ||
                        selectedPlayerIds.length !== activeLeague.teamSize
                    }
                    onClick={handleSubmit}
                >
                    {submitting ? "Saving Team..." : "Submit Team"}
                </button>
            </div>
        </section>
    );
}

export default CreateTeam;
