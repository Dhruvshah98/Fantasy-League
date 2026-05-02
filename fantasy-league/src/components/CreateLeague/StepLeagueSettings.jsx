function StepLeagueSettings({ leagueData, setLeagueData, onNext, onBack }) {
    const maxTeamSize = 50;

    return (
        <div className="form-stack">
            <h3>League Settings</h3>
            <p className="muted-copy">
                The admin decides how many players every fantasy team must contain.
            </p>
            <p className="muted-copy">
                Add at least this many players in the next step.
            </p>

            <div>
                <label>
                    Players Per Team:
                    <input
                        type="number"
                        min="1"
                        max={maxTeamSize}
                        value={leagueData.teamSize}
                        onChange={(event) =>
                            setLeagueData({
                                ...leagueData,
                                teamSize: Number(event.target.value)
                            })
                        }
                    />
                </label>
            </div>

            <div className="button-row">
                <button className="ghost-button" onClick={onBack}>Back</button>
                <button
                    className="primary-button"
                    onClick={onNext}
                    disabled={!leagueData.teamSize || leagueData.teamSize > maxTeamSize}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default StepLeagueSettings;
