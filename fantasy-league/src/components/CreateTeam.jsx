import React, { useState } from 'react'

function CreateTeam({ league, onSubmit }) {
    const [teamName, setTeamName] = useState("");
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const togglePlayer = (player) => {
        if (selectedPlayers.includes(player)) {
            setSelectedPlayers(
                selectedPlayers.filter((p) => p !== player)
            );
        } else {
            if (selectedPlayers.length >= league.teamSize) return;
            setSelectedPlayers([...selectedPlayers, player]);
        }
    };

    return (
        <div>
            <h2>Create Team for {league.name}</h2>

            <input
                placeholder="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
            />

            <h3>Select Players ({selectedPlayers.length}/{league.teamSize})</h3>

            <ul>
                {league.players.map((player) => (
                    <li key={player}>
                        <button onClick={() => togglePlayer(player)}>
                            {selectedPlayers.includes(player) ? "Remove" : "Add"}
                        </button>
                        {player}
                    </li>
                ))}
            </ul>

            <button
                disabled={
                    selectedPlayers.length !== league.teamSize || !teamName
                }
                onClick={() =>
                    onSubmit({
                        teamName,
                        selectedPlayers
                    })
                }
            >
                Submit Team
            </button>
        </div>
    );
}

export default CreateTeam
