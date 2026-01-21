import { useState } from "react";
import StepLeagueInfo from "./StepLeagueInfo";
import StepLeagueSettings from "./StepLeagueSettings";
import StepAddPlayers from "./StepAddPlayers";
import StepReview from "./StepReview";

import { useDispatch } from "react-redux";
import { createLeague, setScreen } from "../../store/leagueSlice";

function CreateLeague() {

    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [leagueData, setLeagueData] = useState({
        name: "",
        description: "",
        players: []
    });

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleFinalCreate = () => {
        console.log("HANDLE FINAL CREATE CALLED");
        dispatch(
            createLeague({
                ...leagueData,
                id: Date.now(),
                code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                teams: []
            })
        );

        // dispatch(setScreen("HOME"));
    };

    return (
        <>
            <button onClick={() => dispatch(setScreen("HOME"))}>← Back</button>
            <h2>Create League</h2>
            {step === 1 && (
                <StepLeagueInfo
                    leagueData={leagueData}
                    setLeagueData={setLeagueData}
                    onNext={nextStep}
                />
            )}

            {step === 2 && (
                <StepLeagueSettings
                    leagueData={leagueData}
                    setLeagueData={setLeagueData}
                    onNext={nextStep}
                    onBack={prevStep}
                />
            )}

            {step === 3 && (
                <StepAddPlayers
                    leagueData={leagueData}
                    setLeagueData={setLeagueData}
                    onNext={nextStep}
                    onBack={prevStep}
                />
            )}


            {step === 4 && (
                <StepReview
                    leagueData={leagueData}
                    onBack={prevStep}
                    onConfirm={handleFinalCreate}
                />
            )}
        </>
    )
}


export default CreateLeague;