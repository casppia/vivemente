import SpotifyWebApi from 'spotify-web-api-js';
import { SpotifyEpisodeSchema, SpotifyPodcastSchema } from '../types/spotify';

const PODCAST_ID = '4rqeShQpXXxwBC3EfraUbK';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPES = ['streaming', 'user-read-email', 'user-read-private'];

class SpotifyClient {
  private api: SpotifyWebApi.SpotifyWebApiJs;
  private static instance: SpotifyClient;

  private constructor() {
    this.api = new SpotifyWebApi();
  }

  static getInstance(): SpotifyClient {
    if (!SpotifyClient.instance) {
      SpotifyClient.instance = new SpotifyClient();
    }
    return SpotifyClient.instance;
  }

  getAuthUrl(): string {
    if (!REDIRECT_URI) {
      throw new Error('Redirect URI is not configured');
    }

    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'token',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      state,
      show_dialog: 'true'
    });

    // Log the auth URL for debugging
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('Spotify Auth URL:', authUrl);
    return authUrl;
  }

  handleCallback(hash: string): { accessToken: string; expiresIn: number } | null {
    if (!hash) return null;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const state = params.get('state');
    const storedState = localStorage.getItem('spotify_auth_state');
    const expiresIn = parseInt(params.get('expires_in') || '0', 10);

    if (!accessToken || state !== storedState) {
      console.error('Auth error:', { accessToken: !!accessToken, stateMatch: state === storedState });
      return null;
    }

    localStorage.removeItem('spotify_auth_state');
    this.api.setAccessToken(accessToken);

    return { accessToken, expiresIn };
  }

  setAccessToken(token: string) {
    this.api.setAccessToken(token);
  }

  async getPodcastEpisodes(offset = 0, limit = 20) {
    try {
      const response = await this.api.getShowEpisodes(PODCAST_ID, {
        offset,
        limit,
        market: 'ES',
      });

      const episodes = response.items.map(episode => 
        SpotifyEpisodeSchema.parse(episode)
      );

      return {
        episodes,
        total: response.total,
        offset: response.offset,
        limit: response.limit,
      };
    } catch (error) {
      console.error('Error fetching podcast episodes:', error);
      throw new Error('Failed to fetch podcast episodes');
    }
  }

  async getPodcastDetails() {
    try {
      const response = await this.api.getShow(PODCAST_ID, { market: 'ES' });
      return SpotifyPodcastSchema.parse(response);
    } catch (error) {
      console.error('Error fetching podcast details:', error);
      throw new Error('Failed to fetch podcast details');
    }
  }

  async getEpisodeAudioFeatures(episodeId: string) {
    try {
      const response = await this.api.getEpisode(episodeId, { market: 'ES' });
      return SpotifyEpisodeSchema.parse(response);
    } catch (error) {
      console.error('Error fetching episode audio features:', error);
      throw new Error('Failed to fetch episode audio features');
    }
  }
}

export const spotifyClient = SpotifyClient.getInstance();