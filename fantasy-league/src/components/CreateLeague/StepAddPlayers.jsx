import React, { useState } from "react";

function StepAddPlayers({ leagueData, setLeagueData, onNext, onBack }) {
    const [playerName, setPlayerName] = useState("");
    const [position, setPosition] = useState("ST");
    const [points, setPoints] = useState(0);

    const addPlayer = () => {
        const trimmedName = playerName.trim();

        if (!trimmedName) {
            return;
        }

        const newPlayer = {
            id: Date.now(),
            name: trimmedName,
            position,
            points: Number(points)
        };

        setLeagueData({
            ...leagueData,
            players: [...leagueData.players, newPlayer]
        });

        setPlayerName("");
        setPosition("ST");
        setPoints(0);
    };

    const removePlayer = (playerId) => {
        setLeagueData({
            ...leagueData,
            players: leagueData.players.filter((player) => player.id !== playerId)
        });
    };

    return (
        <div className="form-stack">
            <h3>Add Players</h3>
            <p className="muted-copy">
                Add the player pool that all teams will choose from. You can update points later from the admin dashboard.
            </p>

            <input
                type="text"
                placeholder="Player name"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
            />

            <select
                value={position}
                onChange={(event) => setPosition(event.target.value)}
            >
                <option value="ST">Forward</option>
                <option value="CM">Midfielder</option>
                <option value="CB">Defender</option>
                <option value="GK">Goal Keeper</option>
            </select>

            <input
                type="number"
                placeholder="Starting points"
                value={points}
                onChange={(event) => setPoints(event.target.value)}
            />

            <button className="secondary-button" onClick={addPlayer}>
                Add Player
            </button>

            <ul className="inline-player-list">
                {leagueData.players.map((player) => (
                    <li className="editable-list-item" key={player.id}>
                        <span>{player.name} - {player.position} - {player.points} pts</span>
                        <button className="ghost-button compact-button" onClick={() => removePlayer(player.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <div className="button-row">
                <button className="ghost-button" onClick={onBack}>Back</button>
                <button
                    className="primary-button"
                    onClick={onNext}
                    disabled={leagueData.players.length < leagueData.teamSize}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default StepAddPlayers;
