// Resources
import { create } from "zustand";

// Definitions
import { Definitions } from "..";
type StateUpdater<T> = T | ((prev: T) => T);
interface ChatStore {
  // States
  loading: boolean;
  sessionLoading: boolean;
  messages: Definitions.ChatMessage[];
  sending: boolean;
  sessionId: string | null;
  showPrompt: boolean;
  agent: string | null;
  emojisOpen: boolean;

  // Actions
  setLoading: (loading: boolean) => void;
  setSessionLoading: (sessionLoading: boolean) => void;
  setMessages: (messages: StateUpdater<Definitions.ChatMessage[]>) => void;
  setSending: (sending: boolean) => void;
  setSessionId: (sessionId: string | null) => void;
  setShowPrompt: (showPrompt: boolean) => void;
  setAgent: (agent: string | null) => void;
  setEmojisOpen: (emojisOpen: boolean) => void;
}

/**
 * Storage for all states that need to be synchronized between different components.
 */
export const useChatStore = create<ChatStore>((set) => ({
  // Initial
  loading: true,
  sessionLoading: true,
  messages: [],
  sending: false,
  sessionId: null,
  showPrompt: true,
  agent: null,
  emojisOpen: false,

  // Setters
  setLoading: (loading) => set({ loading }),
  setSessionLoading: (sessionLoading) => set({ sessionLoading }),
  setMessages: (updater) =>
    set((state) => ({
      messages:
        typeof updater === "function" ? updater(state.messages) : updater,
    })),
  setSending: (sending) => set({ sending }),
  setSessionId: (sessionId) => set({ sessionId }),
  setShowPrompt: (showPrompt) => set({ showPrompt }),
  setAgent: (agent) => set({ agent }),
  setEmojisOpen: (emojisOpen) => set({ emojisOpen }),
}));
