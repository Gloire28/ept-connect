// mobile/src/store/playerStore.js
import { create } from 'zustand';

const usePlayerStore = create((set) => ({
  currentTrack: null,     // { id, titre, urlMedia, typeMedia, ... }
  isPlaying: false,
  progress: 0,
  duration: 0,
  isMiniPlayerVisible: false,

  playTrack: (track) => {
    set({ currentTrack: track, isPlaying: true, isMiniPlayerVisible: true });
  },

  pauseTrack: () => set({ isPlaying: false }),
  stopTrack: () => set({ isPlaying: false, currentTrack: null, progress: 0 }),

  updateProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),

  hideMiniPlayer: () => set({ isMiniPlayerVisible: false }),
}));

export default usePlayerStore;