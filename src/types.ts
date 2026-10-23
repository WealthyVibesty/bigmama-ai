export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp: string;
  statusBadge?: string;
  interAgentInfo?: {
    type: "from" | "to";
    otherAgentName: string;
  };
  screenshot?: string;
  data?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  computerId: string;
  lastMessage: string;
  iconColor: string;
  updatedAt: string;
  unread?: boolean;
  messages: ChatMessage[];
}
