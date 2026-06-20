import { create } from 'zustand';

export const useMusicStore = create((set, get) => ({
  tracks: [
    { id: 'default-1', name: 'Relaxing Zen Soundscape (Pre-Added)', url: 'https://youtu.be/D1f2dSi7kG4?si=k9cMfhtvzsqBME4o', videoId: 'D1f2dSi7kG4' }
  ],
  playingTrackId: null,
  playerState: -1, // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering
  player: null,
  userId: 'mock-user-123',

  initTracks: (userId) => {
    const saved = localStorage.getItem(`herverse-${userId}-custom-tracks`);
    const defaultTracks = [
      { id: 'default-1', name: 'Relaxing Zen Soundscape (Pre-Added)', url: 'https://youtu.be/D1f2dSi7kG4?si=k9cMfhtvzsqBME4o', videoId: 'D1f2dSi7kG4' },
      { id: 'default-2', name: 'Healing Flute (Meditation)', url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04', videoId: '2OEL4P1Rz04' },
      { id: 'default-3', name: 'Ambient Sleep Music (Deep Delta)', url: 'https://www.youtube.com/watch?v=13E67T8p8_8', videoId: '13E67T8p8_8' }
    ];
    const loaded = saved ? JSON.parse(saved) : defaultTracks;
    
    // Check if the default-1 has correct videoId
    const sanitized = loaded.map(t => {
      if (t.id === 'default-1' && !t.videoId) {
        return { ...t, videoId: 'D1f2dSi7kG4' };
      }
      return t;
    });

    set({ tracks: sanitized, userId });
  },

  setPlayer: (player) => set({ player }),
  
  setPlayerState: (playerState) => set({ playerState }),

  addTrack: (name, videoId, url) => {
    const { tracks, userId } = get();
    const newTrack = {
      id: Date.now().toString(),
      name,
      url,
      videoId
    };
    const updated = [...tracks, newTrack];
    localStorage.setItem(`herverse-${userId}-custom-tracks`, JSON.stringify(updated));
    set({ tracks: updated });
  },

  deleteTrack: (trackId) => {
    const { tracks, userId, playingTrackId, player } = get();
    const updated = tracks.filter(t => t.id !== trackId);
    localStorage.setItem(`herverse-${userId}-custom-tracks`, JSON.stringify(updated));
    set({ tracks: updated });

    if (playingTrackId === trackId) {
      if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
      }
      set({ playingTrackId: null, playerState: -1 });
    }
  },

  renameTrack: (trackId, newName) => {
    const { tracks, userId } = get();
    const updated = tracks.map(t => t.id === trackId ? { ...t, name: newName } : t);
    localStorage.setItem(`herverse-${userId}-custom-tracks`, JSON.stringify(updated));
    set({ tracks: updated });
  },

  playTrack: (trackId) => {
    const { player, tracks } = get();
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    set({ playingTrackId: trackId, playerState: 3 }); // buffering
    
    if (player && typeof player.loadVideoById === 'function') {
      player.loadVideoById(track.videoId);
      player.playVideo();
    }
  },

  togglePlayPause: () => {
    const { player, playingTrackId, tracks, playerState } = get();
    if (!playingTrackId && tracks.length > 0) {
      // If no track is playing, play the first track in list
      get().playTrack(tracks[0].id);
      return;
    }

    if (player && typeof player.getPlayerState === 'function') {
      const state = player.getPlayerState();
      if (state === 1) { // playing
        player.pauseVideo();
        set({ playerState: 2 });
      } else {
        player.playVideo();
        set({ playerState: 1 });
      }
    }
  }
}));
