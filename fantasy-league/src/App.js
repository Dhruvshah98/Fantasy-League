import { useState } from "react";
import CreateLeague from "./components/CreateLeague/CreateLeague";
import JoinLeague from "./components/JoinLeague";
import LeagueList from "./components/LeagueList";

function App() {
  // const [leagues, setLeagues] = useState([]);
  // const handleCreateLeague = (name) => {
  //   setLeagues(prevLeagues => [
  //     ...prevLeagues,
  //     {
  //       id: Date.now(),
  //       name
  //     }
  //   ]);
  // };
  // return (
  //   <div>
  //     <h1>Fantasy League App</h1>
  //     <CreateLeague onCreate={handleCreateLeague} />
  //     <LeagueList leagues={leagues} />
  //   </div>
  // );
  const [screen, setScreen] = useState("HOME");
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
      {screen === "CREATE" && <CreateLeague onBack={() => setScreen("HOME")} />}
      {screen === "JOIN" && <JoinLeague onBack={() => setScreen("HOME")} />}
    </div>
  )
}


export default App;