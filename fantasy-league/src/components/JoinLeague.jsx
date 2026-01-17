import React, { useState } from 'react'

const JoinLeague = ({ onBack }) => {
    const [leagueCode, setLeagueCode] = useState('')
    const handleJoin = () => {
        console.log('====================================');
        console.log("Joining League:", leagueCode);
        console.log('====================================');
    }
    return (
        <div>
            <button onClick={onBack}>← Back</button>
            <h2>Join League</h2>
            <input
                type="text"
                placeholder='Enter League Code'
                value={leagueCode}
                onChange={(e) => setLeagueCode(e.target.value)}
            />

            <button onClick={handleJoin}>Join Now!</button>
        </div>
    )
}

export default JoinLeague