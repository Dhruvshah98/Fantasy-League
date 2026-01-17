function LeagueList({ leagues }) {
    return (
        <div>
            <h2>Leagues</h2>

            {leagues.length === 0 && <p>No leagues yet</p>}

            <ul>
                {leagues.map((league) => (
                    <li key={league.id}>{league.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default LeagueList;
