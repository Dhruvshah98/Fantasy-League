import { useState } from "react";
import CreateLeague from "./components/CreateLeague/CreateLeague";
import JoinLeague from "./components/JoinLeague";

function App() {
  const [screen, setScreen] = useState("HOME");
  const [leagues, setLeagues] = useState([]);
  const generateLeagueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };
  const handleCreateLeague = (leagueData) => {
    const newLeague = {
      ...leagueData,
      id: Date.now(),
      code: generateLeagueCode(),
      teams: []
    };

    setLeagues((prev) => [...prev, newLeague]);
    setScreen("HOME");

    console.log("Leagues:", newLeague);
  };

  return (
    <div>
      <h1>Fantasy League App</h1>
      {screen === "HOME" && (
        <div>
          <button onClick={() => setScreen("CREATE")}>
            Create League
          </button>

          <button onClick={() => setScreen("JOIN")}>
            Join League
          </button>
        </div>
      )}
      {screen === "CREATE" && <CreateLeague onBack={() => setScreen("HOME")} onCreate={handleCreateLeague} />}
      {screen === "JOIN" && <JoinLeague leagues={leagues} onBack={() => setScreen("HOME")} />}
    </div>
  )
}


export default App;