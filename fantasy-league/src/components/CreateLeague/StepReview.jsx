function StepReview({ leagueData, onBack }) {
    const handleCreate = () => {
        console.log("Final League Data:", leagueData);
    };

    return (
        <div>
            <h3>Review League</h3>

            <p><strong>Name:</strong> {leagueData.name}</p>
            <p><strong>Description:</strong> {leagueData.description}</p>
            <p><strong>Type:</strong> {leagueData.isPrivate ? "Private" : "Public"}</p>

            <button onClick={onBack}>Back</button>
            <button onClick={handleCreate}>Create League</button>
        </div>
    );
}

export default StepReview;
