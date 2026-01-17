function StepLeagueSettings({
    leagueData,
    setLeagueData,
    onNext,
    onBack
}) {
    return (
        <div>
            <h3>League Settings</h3>

            <label>
                <input
                    type="checkbox"
                    checked={leagueData.isPrivate}
                    onChange={(e) =>
                        setLeagueData({
                            ...leagueData,
                            isPrivate: e.target.checked
                        })
                    }
                />
                Private League
            </label>

            <div>
                <button onClick={onBack}>Back</button>
                <button onClick={onNext}>Next</button>
            </div>
        </div>
    );
}

export default StepLeagueSettings;
