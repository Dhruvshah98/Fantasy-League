function StepLeagueSettings({ leagueData, setLeagueData, onNext, onBack }) {
    return (
        <div>
            <h3>League Settings</h3>

            {/* <label>
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
            </label> */}

            <div>
                <label>
                    Players Per Team:
                    <input
                        type="number"
                        min="1"
                        max={leagueData.players.length || 11}
                        value={leagueData.teamSize}
                        onChange={(e) =>
                            setLeagueData({
                                ...leagueData,
                                teamSize: Number(e.target.value)
                            })
                        }
                    />
                </label>
            </div>

            <div>
                <button onClick={onBack}>Back</button>
                <button onClick={onNext}>Next</button>
            </div>
        </div>
    );
}

export default StepLeagueSettings;
