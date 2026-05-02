import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    adminLogin,
    deletePlayer,
    deleteTeam,
    fetchLeagueById,
    logoutAdmin,
    setScreen,
    syncGoogleSheets,
    updateLeagueSettings,
    updatePlayer,
    updateTeam
} from "../store/leagueSlice";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000/api";

function LeagueDetails() {
    const dispatch = useDispatch();
    const { activeLeague, submitting, adminTokens } = useSelector((state) => state.league);
    const [adminPassword, setAdminPassword] = useState("");
    const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
    const [playerDrafts, setPlayerDrafts] = useState({});
    const [editingTeamId, setEditingTeamId] = useState("");
    const [teamDraft, setTeamDraft] = useState(null);

    const adminToken = activeLeague ? adminTokens[activeLeague.id] : "";
    const isAdmin = Boolean(adminToken);

    useEffect(() => {
        if (!activeLeague) {
            return;
        }

        setGoogleSheetsUrl(activeLeague.googleSheetsUrl || "");
        setPlayerDrafts(
            Object.fromEntries(
                activeLeague.players.map((player) => [
                    player.id,
                    {
                        name: player.name,
                        position: player.position,
                        points: player.points
                    }
                ])
            )
        );
    }, [activeLeague]);

    if (!activeLeague) {
        return (
            <section className="panel">
                <h2>No league selected</h2>
                <button className="primary-button" onClick={() => dispatch(setScreen("HOME"))}>
                    Go Back Home
                </button>
            </section>
        );
    }

    const exportUrl = (name) => `${API_BASE}/leagues/${activeLeague.id}/export/${name}.csv`;

    const handleAdminLogin = () => {
        dispatch(adminLogin({ leagueId: activeLeague.id, password: adminPassword }));
        setAdminPassword("");
    };

    const handlePlayerDraftChange = (playerId, field, value) => {
        setPlayerDrafts((current) => ({
            ...current,
            [playerId]: {
                ...current[playerId],
                [field]: field === "points" ? Number(value) : value
            }
        }));
    };

    const handleSavePlayer = (playerId) => {
        dispatch(
            updatePlayer({
                leagueId: activeLeague.id,
                playerId,
                player: playerDrafts[playerId]
            })
        );
    };

    const startTeamEdit = (team) => {
        setEditingTeamId(team.id);
        setTeamDraft({
            managerName: team.managerName,
            teamName: team.teamName,
            selectedPlayerIds: team.selectedPlayers.map((player) => player.id)
        });
    };

    const toggleTeamPlayer = (playerId) => {
        setTeamDraft((current) => {
            if (!current) {
                return current;
            }

            if (current.selectedPlayerIds.includes(playerId)) {
                return {
                    ...current,
                    selectedPlayerIds: current.selectedPlayerIds.filter((item) => item !== playerId)
                };
            }

            if (current.selectedPlayerIds.length >= activeLeague.teamSize) {
                return current;
            }

            return {
                ...current,
                selectedPlayerIds: [...current.selectedPlayerIds, playerId]
            };
        });
    };

    const handleSaveTeam = () => {
        if (!editingTeamId || !teamDraft) {
            return;
        }

        dispatch(
            updateTeam({
                leagueId: activeLeague.id,
                teamId: editingTeamId,
                team: teamDraft
            })
        );
        setEditingTeamId("");
        setTeamDraft(null);
    };

    const handleSyncSheets = () => {
        dispatch(syncGoogleSheets(activeLeague.id));
    };

    return (
        <section className="panel-stack">
            <div className="panel">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">League Overview</p>
                        <h2>{activeLeague.name}</h2>
                    </div>
                    <div className="button-row">
                        <button className="ghost-button" onClick={() => dispatch(setScreen("HOME"))}>
                            Back Home
                        </button>
                        <button
                            className="secondary-button"
                            onClick={() => dispatch(fetchLeagueById(activeLeague.id))}
                        >
                            Refresh League
                        </button>
                    </div>
                </div>

                <div className="details-grid">
                    <div className="detail-card">
                        <span className="detail-label">League Code</span>
                        <strong>{activeLeague.code}</strong>
                    </div>
                    <div className="detail-card">
                        <span className="detail-label">Admin</span>
                        <strong>{activeLeague.adminName}</strong>
                    </div>
                    <div className="detail-card">
                        <span className="detail-label">Players Per Team</span>
                        <strong>{activeLeague.teamSize}</strong>
                    </div>
                    <div className="detail-card">
                        <span className="detail-label">Teams Submitted</span>
                        <strong>{activeLeague.teams.length}</strong>
                    </div>
                </div>

                <p className="muted-copy">{activeLeague.description || "No description added."}</p>

                <div className="button-row">
                    <button className="primary-button" onClick={() => dispatch(setScreen("CREATE_TEAM"))}>
                        Build A Team
                    </button>
                    <a className="secondary-button inline-link-button" href={exportUrl("standings")}>
                        Export Standings CSV
                    </a>
                    <a className="secondary-button inline-link-button" href={exportUrl("teams")}>
                        Export Teams CSV
                    </a>
                    <a className="secondary-button inline-link-button" href={exportUrl("players")}>
                        Export Players CSV
                    </a>
                </div>
            </div>

            <div className="panel two-column-panel">
                <div>
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Standings</p>
                            <h3>Leaderboard</h3>
                        </div>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Team</th>
                                    <th>Manager</th>
                                    <th>Total Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeLeague.standings.length === 0 && (
                                    <tr>
                                        <td colSpan="4">No teams submitted yet.</td>
                                    </tr>
                                )}
                                {activeLeague.standings.map((standing) => (
                                    <tr key={standing.teamId}>
                                        <td>{standing.rank}</td>
                                        <td>{standing.teamName}</td>
                                        <td>{standing.managerName}</td>
                                        <td>{standing.totalPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="form-stack">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Admin Access</p>
                            <h3>{isAdmin ? "Admin unlocked" : "Admin login"}</h3>
                        </div>
                        {isAdmin && (
                            <button
                                className="ghost-button"
                                onClick={() => dispatch(logoutAdmin(activeLeague.id))}
                            >
                                Logout
                            </button>
                        )}
                    </div>

                    {!isAdmin && (
                        <>
                            <input
                                type="password"
                                placeholder="Enter admin password"
                                value={adminPassword}
                                onChange={(event) => setAdminPassword(event.target.value)}
                            />
                            <button
                                className="primary-button"
                                onClick={handleAdminLogin}
                                disabled={submitting || !adminPassword.trim()}
                            >
                                {submitting ? "Logging in..." : "Admin Login"}
                            </button>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <input
                                type="url"
                                placeholder="Google Apps Script webhook URL"
                                value={googleSheetsUrl}
                                onChange={(event) => setGoogleSheetsUrl(event.target.value)}
                            />
                            <div className="button-row">
                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        dispatch(
                                            updateLeagueSettings({
                                                leagueId: activeLeague.id,
                                                googleSheetsUrl
                                            })
                                        )
                                    }
                                    disabled={submitting}
                                >
                                    Save Sheets URL
                                </button>
                                <button
                                    className="primary-button"
                                    onClick={handleSyncSheets}
                                    disabled={submitting || !activeLeague.googleSheetsUrl}
                                >
                                    {submitting ? "Syncing..." : "Sync Google Sheets"}
                                </button>
                            </div>
                            <p className="muted-copy">
                                Use a Google Apps Script webhook URL to push standings, teams, and players directly into Google Sheets.
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="panel">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Player Pool</p>
                        <h3>Edit or remove players</h3>
                    </div>
                </div>
                <div className="player-list">
                    {activeLeague.players.map((player) => {
                        const draft = playerDrafts[player.id] || player;

                        return (
                            <div className="player-row admin-grid" key={player.id}>
                                <input
                                    value={draft.name}
                                    disabled={!isAdmin}
                                    onChange={(event) =>
                                        handlePlayerDraftChange(player.id, "name", event.target.value)
                                    }
                                />
                                <select
                                    value={draft.position}
                                    disabled={!isAdmin}
                                    onChange={(event) =>
                                        handlePlayerDraftChange(player.id, "position", event.target.value)
                                    }
                                >
                                    <option value="ST">Forward</option>
                                    <option value="CM">Midfielder</option>
                                    <option value="CB">Defender</option>
                                    <option value="GK">Goal Keeper</option>
                                </select>
                                <input
                                    type="number"
                                    value={draft.points}
                                    disabled={!isAdmin}
                                    onChange={(event) =>
                                        handlePlayerDraftChange(player.id, "points", event.target.value)
                                    }
                                />
                                {isAdmin && (
                                    <div className="button-row stretch-row">
                                        <button
                                            className="secondary-button"
                                            onClick={() => handleSavePlayer(player.id)}
                                            disabled={submitting}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="ghost-button"
                                            onClick={() =>
                                                dispatch(
                                                    deletePlayer({
                                                        leagueId: activeLeague.id,
                                                        playerId: player.id
                                                    })
                                                )
                                            }
                                            disabled={submitting}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="panel">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Submitted Teams</p>
                        <h3>Edit or remove teams</h3>
                    </div>
                </div>
                <div className="team-list">
                    {activeLeague.teams.length === 0 && (
                        <p className="muted-copy">No team has been created yet.</p>
                    )}

                    {activeLeague.teams.map((team) => {
                        const isEditing = editingTeamId === team.id;

                        return (
                            <article className="team-card" key={team.id}>
                                {!isEditing && (
                                    <>
                                        <div className="team-card-top">
                                            <div>
                                                <h4>{team.teamName}</h4>
                                                <p className="muted-copy">Manager: {team.managerName}</p>
                                            </div>
                                            <span className="pill">{team.totalPoints} pts</span>
                                        </div>
                                        <ul className="inline-player-list">
                                            {team.selectedPlayers.map((player) => (
                                                <li key={player.id}>
                                                    {player.name} ({player.position}) - {player.points}
                                                </li>
                                            ))}
                                        </ul>
                                        {isAdmin && (
                                            <div className="button-row">
                                                <button className="secondary-button" onClick={() => startTeamEdit(team)}>
                                                    Edit Team
                                                </button>
                                                <button
                                                    className="ghost-button"
                                                    onClick={() =>
                                                        dispatch(
                                                            deleteTeam({
                                                                leagueId: activeLeague.id,
                                                                teamId: team.id
                                                            })
                                                        )
                                                    }
                                                    disabled={submitting}
                                                >
                                                    Delete Team
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isEditing && teamDraft && (
                                    <div className="form-stack">
                                        <input
                                            value={teamDraft.teamName}
                                            onChange={(event) =>
                                                setTeamDraft((current) => ({
                                                    ...current,
                                                    teamName: event.target.value
                                                }))
                                            }
                                            placeholder="Team Name"
                                        />
                                        <input
                                            value={teamDraft.managerName}
                                            onChange={(event) =>
                                                setTeamDraft((current) => ({
                                                    ...current,
                                                    managerName: event.target.value
                                                }))
                                            }
                                            placeholder="Manager Name"
                                        />
                                        <div className="player-pool-grid compact-grid">
                                            {activeLeague.players.map((player) => {
                                                const selected = teamDraft.selectedPlayerIds.includes(player.id);

                                                return (
                                                    <button
                                                        type="button"
                                                        key={player.id}
                                                        className={selected ? "player-chip selected" : "player-chip"}
                                                        onClick={() => toggleTeamPlayer(player.id)}
                                                    >
                                                        <strong>{player.name}</strong>
                                                        <span>{player.position}</span>
                                                        <span>{player.points} pts</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="button-row">
                                            <button
                                                className="primary-button"
                                                onClick={handleSaveTeam}
                                                disabled={
                                                    submitting ||
                                                    !teamDraft.teamName.trim() ||
                                                    !teamDraft.managerName.trim() ||
                                                    teamDraft.selectedPlayerIds.length !== activeLeague.teamSize
                                                }
                                            >
                                                Save Team
                                            </button>
                                            <button
                                                className="ghost-button"
                                                onClick={() => {
                                                    setEditingTeamId("");
                                                    setTeamDraft(null);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default LeagueDetails;
