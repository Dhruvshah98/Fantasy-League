function StepReview({ leagueData, onBack, onCreate }) {
    const handleCreate = () => {
        console.log("Final League Data:", leagueData);
    };

    return (
        <div>
            <h3>Review League</h3>

            <p><strong>Name:</strong> {leagueData.name}</p>
            <p><strong>Description:</strong> {leagueData.description}</p>
            <p><strong>Players per Team:</strong> {leagueData.teamSize}</p>
            <p><strong>Players:</strong> {leagueData.players.length}</p>

            <button onClick={onBack}>Back</button>
            <button onClick={() => onCreate(leagueData)}>Create League</button>
        </div>
    );
}

export default StepReview;
