// import { useState } from "react";
// import CreateLeague from "./components/CreateLeague/CreateLeague";
// import JoinLeague from "./components/JoinLeague";
// import CreateTeam from "./components/CreateTeam";

// function App() {
//   const [screen, setScreen] = useState("HOME");
//   const [leagues, setLeagues] = useState([]);
//   const [activeLeague, setActiveLeague] = useState(null);
//   const generateLeagueCode = () => {
//     return Math.random().toString(36).substring(2, 8).toUpperCase();
//   };
//   const handleCreateLeague = (leagueData) => {
//     const newLeague = {
//       ...leagueData,
//       id: Date.now(),
//       code: generateLeagueCode(),
//       teams: []
//     };

//     setLeagues((prev) => [...prev, newLeague]);
//     setScreen("HOME");

//     console.log("Leagues:", newLeague);
//   };
//   const handleJoinLeague = (league) => {
//     setActiveLeague(league);
//     setScreen("CREATE_TEAM");
//   };

//   const handleSubmitTeam = (team) => {
//     setLeagues((prev) =>
//       prev.map((league) =>
//         league.id === activeLeague.id
//           ? { ...league, teams: [...league.teams, team] }
//           : league
//       )
//     );

//     setActiveLeague(null);
//     setScreen("HOME");
//   };

//   return (
//     <div>
//       <h1>Fantasy League App</h1>
//       {screen === "HOME" && (
//         <div>
//           <button onClick={() => setScreen("CREATE")}>
//             Create League
//           </button>

//           <button onClick={() => setScreen("JOIN")}>
//             Join League
//           </button>
//         </div>
//       )}
//       {screen === "CREATE" &&
//         <CreateLeague
//           onBack={() => setScreen("HOME")}
//           onCreate={handleCreateLeague}
//         />
//       }
//       {screen === "JOIN" &&
//         <JoinLeague
//           leagues={leagues}
//           onBack={() => setScreen("HOME")}
//           onJoin={handleJoinLeague}
//         />
//       }
//       {screen === "CREATE_TEAM" && activeLeague && (
//         <CreateTeam
//           league={activeLeague}
//           onSubmit={handleSubmitTeam}
//         />
//       )}
//     </div>
//   )
// }


// export default App;import { useDispatch, useSelector } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import CreateLeague from "./components/CreateLeague/CreateLeague";
import JoinLeague from "./components/JoinLeague";
import CreateTeam from "./components/CreateTeam";
import { setScreen } from "./store/leagueSlice";

function App() {
  const dispatch = useDispatch();
  const screen = useSelector((state) => state.league.screen);

  return (
    <div>
      <h1>Fantasy League App</h1>

      {screen === "HOME" && (
        <div>
          <button onClick={() => dispatch(setScreen("CREATE"))}>
            Create League
          </button>
          <button onClick={() => dispatch(setScreen("JOIN"))}>
            Join League
          </button>
        </div>
      )}

      {screen === "CREATE" && <CreateLeague />}
      {screen === "JOIN" && <JoinLeague />}
      {screen === "CREATE_TEAM" && <CreateTeam />}
    </div>
  );
}

export default App;




