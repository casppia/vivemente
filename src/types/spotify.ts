import { z } from 'zod';

export const SpotifyEpisodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  duration_ms: z.number(),
  release_date: z.string(),
  audio_preview_url: z.string().nullable(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  images: z.array(
    z.object({
      url: z.string(),
      height: z.number(),
      width: z.number(),
    })
  ),
});

export type SpotifyEpisode = z.infer<typeof SpotifyEpisodeSchema>;

export const SpotifyPodcastSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  total_episodes: z.number(),
  episodes: z.array(SpotifyEpisodeSchema),
});

export type SpotifyPodcast = z.infer<typeof SpotifyPodcastSchema>;

export interface SpotifyAuthState {
  accessToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
}