const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

const SPANISH_VOICES = [
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Spanish)', category: 'premade' },
  { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Diego (Spanish)', category: 'premade' },
];

export async function getElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  if (!ELEVENLABS_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    return [];
  }
}

export async function generateSpeech(
  text: string,
  voiceId: string = SPANISH_VOICES[0].voice_id
): Promise<Blob | null> {
  if (!ELEVENLABS_API_KEY) {
    console.log('ElevenLabs API key not found');
    return null;
  }

  console.log('Generating ElevenLabs speech for:', text.substring(0, 50), 'with voice:', voiceId);

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('ElevenLabs audio generated successfully, size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    return null;
  }
}

export function isElevenLabsAvailable(): boolean {
  return !!ELEVENLABS_API_KEY;
}

export function getDefaultSpanishVoices(): ElevenLabsVoice[] {
  return SPANISH_VOICES;
}
