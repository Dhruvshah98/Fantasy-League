function StepReview({ leagueData, onBack, onConfirm }) {
    // const onConfirm = () => {
    //     console.log("Final League Data:", leagueData);
    // };

    return (
        <div>
            <h3>Review League</h3>

            <p><strong>Name:</strong> {leagueData.name}</p>
            <p><strong>Description:</strong> {leagueData.description}</p>
            <p><strong>Players per Team:</strong> {leagueData.teamSize}</p>
            <p><strong>Players:</strong> {leagueData.players.length}</p>

            <button onClick={onBack}>Back</button>
            <button
                onClick={() => {
                    console.log("STEP REVIEW CLICKED");
                    onConfirm();
                }}
            >Create League</button>
        </div >
    );
}

export default StepReview;
