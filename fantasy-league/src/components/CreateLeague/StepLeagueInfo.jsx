function StepLeagueInfo({ leagueData, setLeagueData, onNext }) {
    const handleChange = (e) => {
        setLeagueData({
            ...leagueData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div>
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
                name="description"
                placeholder="Description"
                value={leagueData.description}
                onChange={handleChange}
            />

            <button onClick={onNext} disabled={!leagueData.name}>
                Next
            </button>
        </div>
    );
}

export default StepLeagueInfo;
