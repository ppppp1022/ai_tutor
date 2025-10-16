
import { GoogleGenAI, Type, LiveConnectSession, LiveCallbacks } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const connectLive = (callbacks: LiveCallbacks): Promise<LiveConnectSession> => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are a friendly and encouraging English tutor. Keep your responses concise and natural, as if in a real conversation. Your goal is to help the user practice speaking.',
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  });
};

export const getFeedbackForText = async (text: string) => {
  if (!text.trim()) {
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text from an English language learner. Provide feedback on grammar, expression, and word choice. If there are no errors, say so. Format the response as a JSON object. The text to analyze is: "${text}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            correctedText: { type: Type.STRING, description: "A corrected version of the text. If no correction is needed, this should be the same as the original text." },
            comments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of concise comments explaining the corrections or offering suggestions. If no errors, provide an encouraging comment."
            },
          },
          required: ['originalText', 'correctedText', 'comments'],
        },
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error getting feedback from Gemini:", error);
    return null;
  }
};

// Audio Encoding/Decoding utilities
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
