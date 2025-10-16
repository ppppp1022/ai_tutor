import { GoogleGenAI, Type, LiveConnectSession, LiveCallbacks } from '@google/genai';
import { Language, ConversationTurn } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const connectLive = (callbacks: LiveCallbacks, systemInstruction: string): Promise<LiveConnectSession> => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: systemInstruction,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  });
};

const getLanguagePrompts = (lang: Language) => {
  switch (lang) {
    case 'ja':
      return {
        prompt: `次の文は英語を学習している学生のものです。文法、表現、単語の選択についてフィードバックを提供してください。間違いがなければ、その旨を伝えてください。応答はJSONオブジェクト形式で作成してください。分析する文: "`,
        description: "修正点を説明したり、提案したりする簡潔な**日本語**のコメント配列です。間違いがない場合は、励ましのコメントを日本語で提供してください。"
      };
    case 'zh':
      return {
        prompt: `以下是英语学习者的句子。请就语法、表达和词汇选择提供反馈。如果没有错误，请说明。请以JSON对象格式编写您的回应。要分析的句子: "`,
        description: "一个用**中文**简洁解释更正或提供建议的评论数组。如果没有错误，请用中文提供鼓励的评论。"
      };
    case 'ko':
    default:
      return {
        prompt: `다음은 영어를 배우는 학생의 문장입니다. 문법, 표현, 단어 선택에 대한 피드백을 제공해주세요. 오류가 없다면 없다고 말해주세요. 응답은 JSON 객체 형식으로 작성해주세요. 분석할 문장: "`,
        description: "수정 사항을 설명하거나 제안하는 간결한 **한국어** 코멘트 배열입니다. 오류가 없다면 격려의 코멘트를 한국어로 제공해주세요."
      };
  }
};

export const getFeedbackForText = async (text: string, lang: Language) => {
  if (!text.trim()) {
    return null;
  }
  const { prompt, description } = getLanguagePrompts(lang);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${prompt}${text}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING, description: "The user's original English sentence." },
            correctedText: { type: Type.STRING, description: "The corrected English sentence. If no correction is needed, this should be the same as the original." },
            comments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: description,
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

export const getSummaryForConversation = async (conversation: ConversationTurn[]): Promise<string> => {
  if (conversation.length === 0) {
    return "A brief conversation took place.";
  }

  const transcript = conversation
    .map(turn => `${turn.speaker === 'user' ? 'Student' : 'Tutor'}: ${turn.text}`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The following is a transcript of an English practice conversation between a student and a tutor. Please provide a single, concise sentence that summarizes the main topic of the conversation.\n\nTranscript:\n${transcript}`,
    });
    return response.text.trim().replace(/"/g, ''); // Clean up quotes
  } catch (error) {
    console.error("Error getting summary from Gemini:", error);
    return "A conversation about various topics.";
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
