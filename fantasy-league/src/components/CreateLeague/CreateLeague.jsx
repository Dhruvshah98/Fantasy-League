import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StepLeagueInfo from "./StepLeagueInfo";
import StepLeagueSettings from "./StepLeagueSettings";
import StepAddPlayers from "./StepAddPlayers";
import StepReview from "./StepReview";
import { createLeague, setScreen } from "../../store/leagueSlice";

function CreateLeague() {
    const dispatch = useDispatch();
    const submitting = useSelector((state) => state.league.submitting);
    const [step, setStep] = useState(1);
    const [leagueData, setLeagueData] = useState({
        name: "",
        adminName: "",
        adminPassword: "",
        description: "",
        googleSheetsUrl: "",
        teamSize: 1,
        players: []
    });

    const nextStep = () => setStep((currentStep) => currentStep + 1);
    const prevStep = () => setStep((currentStep) => currentStep - 1);

    const handleFinalCreate = () => {
        dispatch(createLeague(leagueData));
    };

    return (
        <section className="panel-stack">
            <div className="panel">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Create League</p>
                        <h2>Set up a private tournament</h2>
                    </div>
                    <button className="ghost-button" onClick={() => dispatch(setScreen("HOME"))}>
                        Back
                    </button>
                </div>

                <div className="step-indicator">Step {step} of 4</div>

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
                        submitting={submitting}
                    />
                )}
            </div>
        </section>
    );
}

export default CreateLeague;
