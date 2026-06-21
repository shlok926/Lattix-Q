import { create } from "zustand";

export interface NotificationItem {
  id: number;
  type: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  route?: string; // Route to redirect when clicked
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'time' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: number) => void;
}

// Play warning/alert audio using standard Web Audio API oscillators
const playAlertSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch alarm note
    osc1.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15); // Ramp down frequency

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.35);
    osc2.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.error("Audio context play blocked or unsupported by browser:", e);
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    { id: 1, type: 'alert', title: 'Weak Key Found', desc: 'Server-4 uses legacy RSA-1024 parameters.', time: '10m ago', read: false, route: '/inventory' },
    { id: 2, type: 'info', title: 'FIPS 203 Standardized', desc: 'ML-KEM-768 is officially standard.', time: '2h ago', read: false, route: '/playbook' },
    { id: 3, type: 'success', title: 'Code Scan Complete', desc: 'Zero hardcoded keys in main-branch.', time: '1d ago', read: true, route: '/batch-scan' },
  ],
  unreadCount: 2,
  addNotification: (notif) => {
    const newItem: NotificationItem = {
      id: Date.now(),
      time: 'Just now',
      read: false,
      ...notif,
    };
    
    if (newItem.type === 'alert' || newItem.type === 'warning') {
      playAlertSound();
    }

    set((state) => {
      const updated = [newItem, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
}));
