import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateLeague from "./components/CreateLeague/CreateLeague";
import JoinLeague from "./components/JoinLeague";
import LeagueCreated from "./components/LeagueCreated";
import CreateTeam from "./components/CreateTeam";
import LeagueDashboard from "./components/LeagueDashboard";
import LeagueDetails from "./components/LeagueDetails";
import {
  clearError,
  clearSuccessMessage,
  fetchLeagues,
  setScreen
} from "./store/leagueSlice";

function App() {
  const dispatch = useDispatch();
  const { screen, error, successMessage } = useSelector((state) => state.league);

  useEffect(() => {
    dispatch(fetchLeagues());
  }, [dispatch]);

  return (
    <div className="app-shell">
      <div className="page-frame">
        <header className="hero">
          <p className="eyebrow">Private Tournament Manager</p>
          <h1>Fantasy League Control Center</h1>
          <p className="hero-copy">
            Create custom fantasy leagues, build teams from your own player pool,
            track standings, and export the results for Excel or Google Sheets.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => dispatch(setScreen("CREATE"))}>
              Create League
            </button>
            <button className="secondary-button" onClick={() => dispatch(setScreen("JOIN"))}>
              Join With Code
            </button>
          </div>
        </header>

        {error && (
          <div className="alert-banner">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())}>Dismiss</button>
          </div>
        )}

        {successMessage && (
          <div className="alert-banner success-banner">
            <span>{successMessage}</span>
            <button onClick={() => dispatch(clearSuccessMessage())}>Dismiss</button>
          </div>
        )}

        {screen === "HOME" && <LeagueDashboard />}
        {screen === "CREATE" && <CreateLeague />}
        {screen === "JOIN" && <JoinLeague />}
        {screen === "CREATE_TEAM" && <CreateTeam />}
        {screen === "LEAGUE_CREATED" && <LeagueCreated />}
        {screen === "LEAGUE_DETAILS" && <LeagueDetails />}
      </div>
    </div>
  );
}

export default App;
