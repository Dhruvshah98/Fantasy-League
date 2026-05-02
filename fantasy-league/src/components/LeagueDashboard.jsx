import { useDispatch, useSelector } from "react-redux";
import { fetchLeagueById, fetchLeagues, setScreen } from "../store/leagueSlice";

function LeagueDashboard() {
    const dispatch = useDispatch();
    const { leagues, loading } = useSelector((state) => state.league);

    return (
        <section className="panel-stack">
            <div className="panel">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Dashboard</p>
                        <h2>Current Leagues</h2>
                    </div>
                    <button className="ghost-button" onClick={() => dispatch(fetchLeagues())}>
                        Refresh
                    </button>
                </div>

                {loading && <p className="muted-copy">Loading leagues...</p>}

                {!loading && leagues.length === 0 && (
                    <div className="empty-state">
                        <h3>No leagues created yet</h3>
                        <p>
                            Start by creating a private tournament and defining the
                            player pool that every manager will use.
                        </p>
                        <button
                            className="primary-button"
                            onClick={() => dispatch(setScreen("CREATE"))}
                        >
                            Create Your First League
                        </button>
                    </div>
                )}

                {leagues.length > 0 && (
                    <div className="league-grid">
                        {leagues.map((league) => (
                            <article className="league-card" key={league.id}>
                                <div className="league-card-top">
                                    <span className="league-code">{league.code}</span>
                                    <span className="pill">{league.teamSize} players/team</span>
                                </div>
                                <h3>{league.name}</h3>
                                <p className="muted-copy">{league.description || "No description added."}</p>
                                <div className="league-stats">
                                    <span>{league.players.length} players</span>
                                    <span>{league.teams.length} teams</span>
                                    <span>Admin: {league.adminName}</span>
                                </div>
                                <button
                                    className="secondary-button"
                                    onClick={() => dispatch(fetchLeagueById(league.id))}
                                >
                                    Open League
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default LeagueDashboard;
