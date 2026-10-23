import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { BigMamaNavbar } from "./components/BigMamaNavbar";
import { BigMamaHero } from "./components/BigMamaHero";
import { PlanApprovalModal } from "./components/PlanApprovalModal";
import { LiveConsoleTicker } from "./components/LiveConsoleTicker";
import { MissionReport } from "./components/MissionReport";
import { 
  planBrowserTask, 
  launchBrowserTask, 
  pollBrowserTaskStatus, 
  confirmBrowserTaskGate, 
  cancelBrowserTask, 
  BrowserTaskPlan, 
  BrowserTaskMission 
} from "./lib/browserTasksApi";

export default function App() {
  const [stage, setStage] = useState<"hero" | "running" | "report">("hero");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isConfirmingGate, setIsConfirmingGate] = useState(false);

  const [activePlan, setActivePlan] = useState<BrowserTaskPlan | null>(null);
  const [activePrompt, setActivePrompt] = useState("");
  const [activeTargetUrl, setActiveTargetUrl] = useState("");
  const [activeMission, setActiveMission] = useState<BrowserTaskMission | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Step 1: User submits prompt/URL -> generate Plan
  const handlePlanTask = async (prompt: string, targetUrl: string) => {
    setIsPlanning(true);
    setActivePrompt(prompt);
    setActiveTargetUrl(targetUrl);

    const res = await planBrowserTask(prompt, targetUrl);
    setIsPlanning(false);

    if (!res.ok || !res.plan) {
      toast.error(res.error || "Failed to generate execution plan.");
      return;
    }

    setActivePlan(res.plan);
  };

  // Step 2: Gate 1 Approved -> Launch Cloud Chromium
  const handleApprovePlan = async () => {
    if (!activePlan) return;
    setIsLaunching(true);

    const res = await launchBrowserTask(activePlan, activePrompt, activeTargetUrl);
    setIsLaunching(false);

    if (!res.ok || !res.missionId) {
      toast.error(res.error || "Failed to launch cloud browser session.");
      return;
    }

    // Set initial mission and enter running stage
    setActiveMission({
      id: res.missionId,
      type: "web_execution",
      status: "running",
      prompt: activePrompt,
      credit_cost: activePlan.creditCost,
      logs: [
        { step: "Session Request", message: "Plan approved. Requesting cloud Chromium session...", timestamp: new Date().toISOString() },
        { step: "Cloud Sandbox", message: "Spinning up isolated Chromium instance over CDP...", timestamp: new Date().toISOString() },
      ],
      result: {
        plan: activePlan,
        targetUrl: activePlan.targetUrl,
        vendorSessionId: res.vendorSessionId,
        liveDebuggerUrl: res.liveDebuggerUrl,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setStage("running");
    startPolling(res.missionId);
    toast.success("Cloud browser session active. Executing DOM actions over CDP.");
  };

  // Step 3: Polling status
  const startPolling = (missionId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = window.setInterval(async () => {
      const res = await pollBrowserTaskStatus(missionId);
      if (res.ok && res.mission) {
        setActiveMission(res.mission);

        if (res.mission.status === "completed") {
          clearInterval(pollIntervalRef.current!);
          setStage("report");
          toast.success("Mission complete! Findings and screenshots extracted.");
        } else if (res.mission.status === "failed") {
          clearInterval(pollIntervalRef.current!);
          toast.error("Mission failed. Check logs for details.");
        } else if (res.mission.status === "cancelled") {
          clearInterval(pollIntervalRef.current!);
          setStage("hero");
          toast.info("Mission was cancelled.");
        }
      }
    }, 2000);
  };

  // Gate 2: Mid-run confirmation
  const handleConfirmGate = async (confirmed: boolean) => {
    if (!activeMission) return;
    setIsConfirmingGate(true);
    const res = await confirmBrowserTaskGate(activeMission.id, confirmed);
    setIsConfirmingGate(false);

    if (!res.ok) {
      toast.error(res.error || "Failed to submit confirmation.");
      return;
    }

    if (confirmed) {
      toast.success("Gate 2 approved. Resuming browser execution.");
    } else {
      toast.info("Sensitive action denied. Cancelling task.");
      setStage("hero");
    }
  };

  // Stop/Cancel Task
  const handleCancelTask = async () => {
    if (!activeMission) {
      setActivePlan(null);
      return;
    }

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    await cancelBrowserTask(activeMission.id);
    setActiveMission(null);
    setActivePlan(null);
    setStage("hero");
    toast.info("Mission stopped.");
  };

  // Reset to Hero for a new mission
  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setActiveMission(null);
    setActivePlan(null);
    setStage("hero");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <Toaster position="top-right" theme="dark" richColors />
      <BigMamaNavbar />

      <main className="flex-1">
        {stage === "hero" && (
          <BigMamaHero onPlan={handlePlanTask} isPlanning={isPlanning} />
        )}

        {stage === "running" && activeMission && (
          <LiveConsoleTicker
            mission={activeMission}
            onConfirmGate={handleConfirmGate}
            onCancel={handleCancelTask}
            isConfirmingGate={isConfirmingGate}
          />
        )}

        {stage === "report" && activeMission && (
          <MissionReport mission={activeMission} onReset={handleReset} />
        )}
      </main>

      {/* Plan Approval Modal (Gate 1) */}
      {activePlan && stage === "hero" && (
        <PlanApprovalModal
          plan={activePlan}
          onApprove={handleApprovePlan}
          onCancel={() => setActivePlan(null)}
          isLaunching={isLaunching}
        />
      )}

      {/* Clean Footer */}
      <footer className="border-t border-neutral-800/80 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">BIG MAMA AI</span>
            <span>&bull;</span>
            <span>bigmamaai.com</span>
          </div>
          <p>&copy; 2026 Big Mama AI. Powered by autonomous cloud Chromium reached over CDP.</p>
        </div>
      </footer>
    </div>
  );
}
