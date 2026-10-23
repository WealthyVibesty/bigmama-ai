import { useState } from "react";
import { Toaster } from "sonner";
import { BROWSER_AGENTS } from "./data/browserAgents";
import { BrowserAgent, ChatMessage } from "./types";
import { AgentSidebar } from "./components/AgentSidebar";
import { AgentChatSurface } from "./components/AgentChatSurface";

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "delegator-3": [
    {
      id: "msg_1",
      sender: "agent",
      agentId: "brandapp-ide",
      interAgentInfo: {
        type: "from",
        otherAgentName: "BIG AI BRAND APP ANTIGRAVITY IDE",
      },
      text: "One heads-up on the UGC switch. When its test is done, the coding bot will ask you for a one-tap OK in its own chat before it merges, so keep an eye out for that.",
      timestamp: "Today 2:14 PM",
    },
    {
      id: "msg_2",
      sender: "agent",
      agentId: "brandapp-ide",
      interAgentInfo: {
        type: "to",
        otherAgentName: "BIG AI BRAND APP ANTIGRAVITY IDE",
      },
      text: "The ad card polish (#459) is clear to merge, and it's on both test copies now (the ad writer at v36 and the image function at v15). The crash is fixed, card prices only come from your saved offers, billing hasn't changed, and no other clients' details are left in the code.\n\nThe coding bot is running one last paid test now. Then it'll ask you to OK the merge, and I'll put both live.",
      timestamp: "Today 2:16 PM",
    },
    {
      id: "msg_3",
      sender: "user",
      text: "wake up pull in latest code we back to the bage",
      timestamp: "Today 2:19 PM",
    },
    {
      id: "msg_4",
      sender: "agent",
      agentId: "delegator-3",
      agentName: "Delegator 3",
      text: "I'm here. I'm pulling the latest from main and checking where live stands now.\n\nI'm checking what's changed since Oct 18: what's been merged, where the ad card polish (#459) and UGC switch (#460) stand, what's live, and whether the app needs a publish. I'll send you one summary shortly.",
      timestamp: "Today 2:19 PM",
      statusBadge: "Checking the recent commits",
    },
  ],
};

export default function App() {
  const [agents] = useState<BrowserAgent[]>(BROWSER_AGENTS);
  const [activeAgent, setActiveAgent] = useState<BrowserAgent>(BROWSER_AGENTS[0]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);

  const currentMessages = chatHistories[activeAgent.id] || [
    {
      id: `welcome_${activeAgent.id}`,
      sender: "agent",
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      text: `Hello! I am your ${activeAgent.name}. Send me any URL or web task to inspect over our cloud Chromium browser.`,
      timestamp: "Just now",
    },
  ];

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistories((prev) => ({
      ...prev,
      [activeAgent.id]: [...(prev[activeAgent.id] || []), newMsg],
    }));
  };

  const handleUpdateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChatHistories((prev) => {
      const currentList = prev[activeAgent.id] || [];
      const existingIdx = currentList.findIndex((m) => m.id === id);

      if (existingIdx >= 0) {
        const nextList = [...currentList];
        nextList[existingIdx] = { ...nextList[existingIdx], ...updates };
        return { ...prev, [activeAgent.id]: nextList };
      } else {
        return {
          ...prev,
          [activeAgent.id]: [...currentList, updates as ChatMessage],
        };
      }
    });
  };

  const handleNewChat = () => {
    const welcomeMsg: ChatMessage = {
      id: `new_${Date.now()}`,
      sender: "agent",
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      text: `New cloud browser session initialized for ${activeAgent.name}. Drop in a target URL or type your objective.`,
      timestamp: "Just now",
    };
    setChatHistories((prev) => ({
      ...prev,
      [activeAgent.id]: [welcomeMsg],
    }));
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-neutral-100 dark:bg-[#0c0c0c] font-sans antialiased">
      <Toaster position="top-right" richColors theme="system" />

      {/* Left Sidebar (Agents List matching screenshot) */}
      <AgentSidebar
        agents={agents}
        activeAgent={activeAgent}
        onSelectAgent={setActiveAgent}
        onNewChat={handleNewChat}
      />

      {/* Right Chat Area (Conversational browser workspace) */}
      <AgentChatSurface
        agent={activeAgent}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        onUpdateMessage={handleUpdateMessage}
      />
    </div>
  );
}
