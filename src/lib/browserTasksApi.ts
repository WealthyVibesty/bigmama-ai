const EDGE_FUNCTION_URL = "https://zvltrbklmbggrsgxaeae.supabase.co/functions/v1/browser-task-runner";

export interface BrowserTaskPlan {
  title: string;
  targetUrl: string;
  isReadOnly: boolean;
  requiresMidRunApproval: boolean;
  sensitiveActionType?: "payment" | "post" | "send";
  steps: string[];
  expectedOutputs: string[];
  creditCost: number;
}

export interface BrowserTaskMission {
  id: string;
  type: string;
  status: "pending" | "running" | "paused_for_approval" | "completed" | "failed" | "cancelled";
  prompt: string;
  credit_cost: number;
  logs: Array<{
    step: string;
    message: string;
    timestamp: string;
  }>;
  result?: {
    plan?: BrowserTaskPlan;
    targetUrl?: string;
    statusMessage?: string;
    liveDebuggerUrl?: string | null;
    vendorSessionId?: string;
    summary?: string;
    findings?: Record<string, any>;
    screenshots?: Array<{ title: string; url: string }>;
  };
  created_at: string;
  updated_at: string;
}

export async function planBrowserTask(
  prompt: string,
  targetUrl?: string
): Promise<{ ok: boolean; plan?: BrowserTaskPlan; error?: string }> {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "plan",
        prompt,
        targetUrl: targetUrl || undefined,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || "Network error while planning browser task" };
  }
}

export async function launchBrowserTask(
  plan: BrowserTaskPlan,
  prompt: string,
  targetUrl?: string
): Promise<{ ok: boolean; missionId?: string; vendorSessionId?: string; liveDebuggerUrl?: string | null; error?: string }> {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "launch",
        approved: true,
        plan,
        prompt,
        targetUrl: targetUrl || plan.targetUrl,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to launch browser task" };
  }
}

export async function pollBrowserTaskStatus(
  missionId: string
): Promise<{ ok: boolean; mission?: BrowserTaskMission; error?: string }> {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        missionId,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to fetch task status" };
  }
}

export async function confirmBrowserTaskGate(
  missionId: string,
  confirmed: boolean
): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "confirm_gate",
        missionId,
        confirmed,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to submit gate confirmation" };
  }
}

export async function cancelBrowserTask(
  missionId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cancel",
        missionId,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to cancel task" };
  }
}
