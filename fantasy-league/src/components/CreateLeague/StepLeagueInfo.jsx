function StepLeagueInfo({ leagueData, setLeagueData, onNext }) {
    const handleChange = (event) => {
        setLeagueData({
            ...leagueData,
            [event.target.name]: event.target.value
        });
    };

    return (
        <div className="form-stack">
            <h3>League Info</h3>

            <input
                type="text"
                name="name"
                placeholder="League Name"
                value={leagueData.name}
                onChange={handleChange}
            />

            <input
                type="text"
                name="adminName"
                placeholder="Admin Name"
                value={leagueData.adminName}
                onChange={handleChange}
            />

            <input
                type="password"
                name="adminPassword"
                placeholder="Admin Password"
                value={leagueData.adminPassword}
                onChange={handleChange}
            />

            <input
                type="text"
                name="description"
                placeholder="Description (optional)"
                value={leagueData.description}
                onChange={handleChange}
            />

            <input
                type="url"
                name="googleSheetsUrl"
                placeholder="Google Apps Script Webhook URL (optional)"
                value={leagueData.googleSheetsUrl}
                onChange={handleChange}
            />

            <button
                className="primary-button"
                onClick={onNext}
                disabled={
                    !leagueData.name.trim() ||
                    !leagueData.adminName.trim() ||
                    !leagueData.adminPassword.trim()
                }
            >
                Next
            </button>
        </div>
    );
}

export default StepLeagueInfo;
