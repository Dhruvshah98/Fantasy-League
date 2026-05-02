function StepReview({ leagueData, onBack, onConfirm, submitting }) {
    return (
        <div className="form-stack">
            <h3>Review League</h3>

            <p><strong>Name:</strong> {leagueData.name}</p>
            <p><strong>Admin:</strong> {leagueData.adminName}</p>
            <p><strong>Description:</strong> {leagueData.description || "No description"}</p>
            <p><strong>Players per Team:</strong> {leagueData.teamSize}</p>
            <p><strong>Player Pool:</strong> {leagueData.players.length}</p>
            <p><strong>Sheets Webhook:</strong> {leagueData.googleSheetsUrl || "Not configured"}</p>

            <div className="review-list">
                {leagueData.players.map((player) => (
                    <div className="review-item" key={player.id}>
                        <span>{player.name}</span>
                        <span>{player.position}</span>
                        <span>{player.points} pts</span>
                    </div>
                ))}
            </div>

            <div className="button-row">
                <button className="ghost-button" onClick={onBack}>Back</button>
                <button
                    className="primary-button"
                    onClick={onConfirm}
                    disabled={submitting}
                >
                    {submitting ? "Creating..." : "Create League"}
                </button>
            </div>
        </div>
    );
}

export default StepReview;
