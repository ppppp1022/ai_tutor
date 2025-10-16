
import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveServerMessage, LiveConnectSession, Blob } from '@google/genai';
import { ConversationTurn, FeedbackItem } from '../types';
import { connectLive, getFeedbackForText, encode, decode, decodeAudioData } from '../services/geminiService';

export const useTutor = (addFeedback: (item: FeedbackItem) => void) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackItem | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveConnectSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  let nextStartTime = 0;

  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      currentOutputTranscriptionRef.current += text;
      setConversation(prev => {
          const lastTurn = prev[prev.length - 1];
          if (lastTurn?.speaker === 'tutor') {
              return [...prev.slice(0, -1), { ...lastTurn, text: currentOutputTranscriptionRef.current }];
          }
          return [...prev, { speaker: 'tutor', text: currentOutputTranscriptionRef.current, id: Date.now() }];
      });
    } else if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      currentInputTranscriptionRef.current += text;
       setConversation(prev => {
          const lastTurn = prev[prev.length - 1];
          if (lastTurn?.speaker === 'user') {
              return [...prev.slice(0, -1), { ...lastTurn, text: currentInputTranscriptionRef.current }];
          }
          return [...prev, { speaker: 'user', text: currentInputTranscriptionRef.current, id: Date.now() }];
      });
    }

    if (message.serverContent?.turnComplete) {
      const userText = currentInputTranscriptionRef.current;
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
      
      if(userText) {
          setIsProcessing(true);
          const feedback = await getFeedbackForText(userText);
          if (feedback) {
              const newFeedbackItem: FeedbackItem = {
                  ...feedback,
                  id: new Date().toISOString(),
                  timestamp: new Date().toLocaleString(),
              };
              setLatestFeedback(newFeedbackItem);
              addFeedback(newFeedbackItem);
          }
          setIsProcessing(false);
      }
    }

    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current) {
      nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
      const source = outputAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContextRef.current.destination);
      source.addEventListener('ended', () => { audioSourcesRef.current.delete(source); });
      source.start(nextStartTime);
      nextStartTime += audioBuffer.duration;
      audioSourcesRef.current.add(source);
    }

    if (message.serverContent?.interrupted) {
      for (const source of audioSourcesRef.current.values()) {
        source.stop();
      }
      audioSourcesRef.current.clear();
      nextStartTime = 0;
    }
  }, [addFeedback]);

  const startSession = useCallback(async () => {
    try {
      setConversation([]);
      setLatestFeedback(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = connectLive({
        onopen: () => {
          setIsSessionActive(true);
          const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
          mediaStreamSourceRef.current = source;
          const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
            
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: handleMessage,
        onerror: (e: ErrorEvent) => { console.error('Session error:', e); stopSession(); },
        onclose: (e: CloseEvent) => { stopSession(); },
      });
      await sessionPromiseRef.current;

    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Could not get microphone access. Please allow microphone permissions and try again.');
    }
  }, [handleMessage]);

  const stopSession = useCallback(() => {
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    
    inputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    outputAudioContextRef.current?.close();
    outputAudioContextRef.current = null;

    for (const source of audioSourcesRef.current.values()) {
        source.stop();
    }
    audioSourcesRef.current.clear();
    
    setIsSessionActive(false);
  }, []);
  
  useEffect(() => {
      return () => {
          if(isSessionActive) {
              stopSession();
          }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionActive]);


  return { isSessionActive, isProcessing, conversation, latestFeedback, startSession, stopSession };
};
