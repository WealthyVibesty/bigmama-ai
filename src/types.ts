export interface BrowserAgent {
  id: string;
  name: string;
  role: string;
  subtitle: string;
  iconType: "delegator" | "resend" | "brandapp" | "hyperframes" | "dealmaker" | "margins" | "notebook" | "life" | "security" | "designer";
  color: string;
  bgColor: string;
  badge?: string;
  unread?: boolean;
  systemPrompt: string;
  starterPrompt: string;
  defaultUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  agentId?: string;
  agentName?: string;
  interAgentInfo?: {
    type: "from" | "to";
    otherAgentName: string;
  };
  text: string;
  timestamp: string;
  statusBadge?: string;
  missionId?: string;
  planData?: any;
  reportData?: any;
}
