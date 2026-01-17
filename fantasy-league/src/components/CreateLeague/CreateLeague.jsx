import { useState } from "react";
import StepLeagueInfo from "./StepLeagueInfo";
import StepLeagueSettings from "./StepLeagueSettings";
import StepAddPlayers from "./StepAddPlayers";
import StepReview from "./StepReview";

function CreateLeague({ onCreate, onBack }) {
    const [step, setStep] = useState(1);
    const [leagueData, setLeagueData] = useState({
        name: "",
        description: "",
        isPrivate: false,
        players: []
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <>
            <button onClick={onBack}>← Back</button>
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
                />
            )}
        </>
    )
}


export default CreateLeague;