import React, { useState } from 'react'

const JoinLeague = ({ leagues, onBack }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const handleJoin = () => {
        const league = leagues.find((l) => l.code === code);

        if (!league) {
            setError("Invalid league code");
            return;
        }

        alert(`Joined league: ${league.name}`);
    }
    return (
        <div>
            <button onClick={onBack}>← Back</button>
            <h2>Join League</h2>
            <input
                type="text"
                placeholder='Enter League Code'
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
            />

            <button onClick={handleJoin}>Join Now!</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}

export default JoinLeague