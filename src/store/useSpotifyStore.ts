import { create } from 'zustand';
import { SpotifyAuthState, SpotifyEpisode, SpotifyPodcast } from '../types/spotify';
import { spotifyClient } from '../utils/spotify';

interface SpotifyStore extends SpotifyAuthState {
  podcast: SpotifyPodcast | null;
  episodes: SpotifyEpisode[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: () => void;
  handleCallback: (hash: string) => void;
  loadEpisodes: (page?: number) => Promise<void>;
  loadPodcastDetails: () => Promise<void>;
}

export const useSpotifyStore = create<SpotifyStore>((set, get) => ({
  accessToken: null,
  expiresAt: null,
  isAuthenticated: false,
  podcast: null,
  episodes: [],
  currentPage: 0,
  totalPages: 0,
  isLoading: false,
  error: null,

  initialize: async () => {
    const token = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_expires_at');

    if (token && expiresAt) {
      const now = Date.now();
      if (now < parseInt(expiresAt, 10)) {
        spotifyClient.setAccessToken(token);
        set({
          accessToken: token,
          expiresAt: parseInt(expiresAt, 10),
          isAuthenticated: true,
        });
        await get().loadPodcastDetails();
        await get().loadEpisodes(0);
      }
    }
  },

  login: () => {
    const authUrl = spotifyClient.getAuthUrl();
    window.location.href = authUrl;
  },

  handleCallback: (hash: string) => {
    const result = spotifyClient.handleCallback(hash);
    if (result) {
      const { accessToken, expiresIn } = result;
      const expiresAt = Date.now() + expiresIn * 1000;

      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_expires_at', expiresAt.toString());

      set({
        accessToken,
        expiresAt,
        isAuthenticated: true,
      });
    }
  },

  loadEpisodes: async (page = 0) => {
    try {
      set({ isLoading: true, error: null });
      const limit = 20;
      const offset = page * limit;
      
      const result = await spotifyClient.getPodcastEpisodes(offset, limit);
      
      set({
        episodes: result.episodes,
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load episodes',
        isLoading: false,
      });
    }
  },

  loadPodcastDetails: async () => {
    try {
      set({ isLoading: true, error: null });
      const podcast = await spotifyClient.getPodcastDetails();
      set({ podcast, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load podcast details',
        isLoading: false,
      });
    }
  },
}));