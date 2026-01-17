import React, { useState } from 'react'

function StepAddPlayers({ leagueData, setLeagueData, onNext, onBack }) {
    const [playerName, setPlayerName] = useState("");
    const [position, setPosition] = useState("ST");

    const addPlayer = () => {
        if (!playerName) return;

        const newPlayer = {
            id: Date.now(),
            name: playerName,
            position
        };

        setLeagueData({
            ...leagueData,
            players: [...leagueData.players, newPlayer]
        });

        setPlayerName("");
        setPosition("ST");
    };

    return (
        <div>
            <h3>Add Players</h3>

            <input
                type="text"
                placeholder="Player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
            />

            <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
            >
                <option value="ST">Forward</option>
                <option value="CM">Midfielder</option>
                <option value="CB">Defender</option>
                <option value="GK">Goal Keeper</option>
            </select>

            <button onClick={addPlayer}>Add Player</button>

            <ul>
                {leagueData.players.map((player) => (
                    <li key={player.id}>
                        {player.name} — {player.position}
                    </li>
                ))}
            </ul>

            <div>
                <button onClick={onBack}>Back</button>
                <button
                    onClick={onNext}
                    disabled={leagueData.players.length < 2}
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default StepAddPlayers