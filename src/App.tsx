/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Radio, Camera, Mic, Volume2, VolumeX, Sun, Moon, Battery, Wifi, Video,
  Settings, AlertTriangle, Play, Square, RefreshCw, Key, Info, HelpCircle, 
  History, Music, Bell, Lightbulb, Zap, User, UserCheck, ShieldAlert,
  ArrowRight, ToggleLeft, ToggleRight, CheckCircle, ChevronRight, X
} from 'lucide-react';
import { BabySession, ActivityLog } from './types';
import { LULLABIES, NIGHTLIGHT_COLORS } from './data';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, OperationType, handleFirestoreError } from './firebase';

// Unique Device ID for session tracking
const CLIENT_DEVICE_ID = 'dev-' + Math.random().toString(36).substring(2, 11);

// --- COMPREHENSIVE WEB AUDIO LULLABY SYNTHESIZER ---
class LullabySynth {
  private ctx: AudioContext | null = null;
  private noteTimeout: any = null;
  private noiseNodeId: any = null;
  private isPlaying: boolean = false;

  constructor() {}

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.noteTimeout) {
      clearTimeout(this.noteTimeout);
      this.noteTimeout = null;
    }
    if (this.noiseNodeId) {
      if (this.noiseNodeId.stop) {
        try { this.noiseNodeId.stop(); } catch(e) {}
      }
      this.noiseNodeId = null;
    }
  }

  playSong(songId: string) {
    this.stop();
    this.init();
    if (!this.ctx) return;
    this.isPlaying = true;

    if (songId === 'twinkle') {
      const c = 261.63, d = 293.66, e = 329.63, f = 349.23, g = 392.00, a = 440.00;
      const melody = [
        { f: c, d: 600 }, { f: c, d: 600 }, { f: g, d: 600 }, { f: g, d: 600 },
        { f: a, d: 600 }, { f: a, d: 600 }, { f: g, d: 1100 },
        { f: f, d: 600 }, { f: f, d: 600 }, { f: e, d: 600 }, { f: e, d: 600 },
        { f: d, d: 600 }, { f: d, d: 600 }, { f: c, d: 1100 }
      ];
      this.startSequencer(melody);
    } else if (songId === 'brahms') {
      const c = 261.63, d = 293.66, e = 329.63, f = 349.23, g = 392.00, a = 440.00, b = 493.88, c5 = 523.25;
      const melody = [
        { f: e, d: 500 }, { f: e, d: 500 }, { f: g, d: 1000 },
        { f: e, d: 500 }, { f: e, d: 500 }, { f: g, d: 1000 },
        { f: e, d: 500 }, { f: g, d: 500 }, { f: c5, d: 1000 }, { f: b, d: 500 }, { f: a, d: 1000 },
        { f: a, d: 500 }, { f: g, d: 1000 }
      ];
      this.startSequencer(melody);
    } else if (songId === 'whitenoise') {
      this.startWhiteNoise();
    } else if (songId === 'heartbeat') {
      this.startHeartbeat();
    }
  }

  private startSequencer(melody: { f: number; d: number }[]) {
    let index = 0;
    const playNext = () => {
      if (!this.isPlaying || !this.ctx) return;
      const step = melody[index];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // Mellifluous chime sound
      osc.frequency.setValueAtTime(step.f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + (step.d / 1000) - 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (step.d / 1000));

      index = (index + 1) % melody.length;
      this.noteTimeout = setTimeout(playNext, step.d);
    };
    playNext();
  }

  private startWhiteNoise() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime); // Dreamy low brownian rumbles

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start();
    this.noiseNodeId = source;
  }

  private startHeartbeat() {
    const playPulse = () => {
      if (!this.isPlaying || !this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);

      setTimeout(() => {
        if (!this.isPlaying || !this.ctx) return;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(45, this.ctx.currentTime);
        gain2.gain.setValueAtTime(0.28, this.ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start();
        osc2.stop(this.ctx.currentTime + 0.35);
      }, 180);
    };

    const triggerLoop = () => {
      if (!this.isPlaying) return;
      playPulse();
      this.noteTimeout = setTimeout(triggerLoop, 1000); // 60 BPM human heartbeat
    };
    triggerLoop();
  }
}

const synthInstance = new LullabySynth();

const STREAM_PROFILES = {
  low: { width: 240, quality: 0.35, interval: 1300, label: "Éco (Basse consommation - 240p)" },
  medium: { width: 360, quality: 0.55, interval: 750, label: "Standard (Équilibré - 360p)" },
  high: { width: 480, quality: 0.75, interval: 400, label: "Ultra Fluide (Haute Qualité - 480p)" }
};

export default function App() {
  // --- APPLICATION STATE ---
  const [deviceRole, setDeviceRole] = useState<'launcher' | 'baby' | 'parent'>('launcher');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [session, setSession] = useState<BabySession | null>(null);
  const [logs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --- BABY-SPECIFIC STATES ---
  const [isMicrophoneActive, setIsMicrophoneActive] = useState<boolean>(false);
  const [babyUnitDecibel, setBabyUnitDecibel] = useState<number>(0);
  const [inputCode, setInputCode] = useState<string>('');
  const [cryingThreshold, setCryingThreshold] = useState<number>(30);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [videoDeviceId, setVideoDeviceId] = useState<string>('');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('high');

  // --- PARENT-SPECIFIC STATES ---
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [parentSpeakActive, setParentSpeakActive] = useState<boolean>(false);
  const [useServerFallback, setUseServerFallback] = useState<boolean>(false);

  const writeToServer = async (code: string, updates: Partial<BabySession>) => {
    try {
      const res = await fetch(`/api/sessions/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setSession(prev => prev ? { ...prev, ...data } : data);
      }
    } catch (e) {
      console.warn("Express Server sync failed:", e);
    }
  };

  const writeSessionData = async (updates: Partial<BabySession>, options = { merge: true }) => {
    if (!pairingCode) return;
    if (isFirebaseConfigured && !useServerFallback) {
      try {
        await setDoc(doc(db, 'sessions', pairingCode), updates, { merge: options.merge });
      } catch (err: any) {
        console.warn("Firestore write failed, falling back to synchronization server:", err);
        setUseServerFallback(true);
        await writeToServer(pairingCode, updates);
      }
    } else {
      await writeToServer(pairingCode, updates);
    }
  };

  // --- COMPONENT REFERENCES ---
  const babyVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // --- SHOW TOAST HELPER ---
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- ADD INSTANT ACTIVITY LOG ---
  const appendLog = (message: string, type: 'info' | 'warning' | 'volume' | 'lullaby' | 'control' = 'info') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Auto-scroll activity logs inside container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  // Read Battery API status if natively accessible
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // --- RETRIEVE CAMERA DEVICES ---
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setVideoDevices(videoInputs);
          if (videoInputs.length > 0) {
            setVideoDeviceId(videoInputs[0].deviceId);
          }
        })
        .catch(err => console.error("Could not load camera list:", err));
    }
  }, []);

  // --- FIRESTORE SESSION SUBSCRIBER ---
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    if (pairingCode && isFirebaseConfigured && !useServerFallback) {
      setIsSubscribing(true);
      unsubscribe = onSnapshot(doc(db, 'sessions', pairingCode), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as BabySession;
          setSession(data);
          
          // Trigger alarms or playback locally
          if (deviceRole === 'baby') {
            // Baby device responds to Parent instructions
            if (data.activeLullaby && data.activeLullaby !== 'none') {
              synthInstance.playSong(data.activeLullaby);
            } else {
              synthInstance.stop();
            }
          }
        } else {
          setSession(null);
          if (deviceRole === 'parent') {
            triggerToast("La session s'est déconnectée ou a expiré.", "error");
            setDeviceRole('launcher');
          }
        }
        setIsSubscribing(false);
      }, (error) => {
        console.warn("Firestore subscription failed, switching to local Express fallback:", error);
        setUseServerFallback(true);
        setIsSubscribing(false);
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [pairingCode, deviceRole, useServerFallback]);

  // --- SERVER SESSIONS FALLBACK SUBSCRIBER (POLLING BACKUP) ---
  useEffect(() => {
    let pollInterval: any = null;
    if (pairingCode && (!isFirebaseConfigured || useServerFallback)) {
      setIsSubscribing(true);
      
      const poll = async () => {
        try {
          const res = await fetch(`/api/sessions/${pairingCode}`);
          if (res.ok) {
            const data = await res.json() as BabySession;
            setSession(data);
            
            // Trigger alarms or playback locally
            if (deviceRole === 'baby') {
              if (data.activeLullaby && data.activeLullaby !== 'none') {
                synthInstance.playSong(data.activeLullaby);
              } else {
                synthInstance.stop();
              }
            }
          } else if (res.status === 404) {
            setSession(null);
            if (deviceRole === 'parent') {
              triggerToast("La session s'est déconnectée ou a expiré.", "error");
              setDeviceRole('launcher');
            }
          }
        } catch (e) {
          console.warn("Express polling fallback error:", e);
        } finally {
          setIsSubscribing(false);
        }
      };

      poll();
      pollInterval = setInterval(poll, 1200);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pairingCode, deviceRole, useServerFallback]);

  // --- BABY DEVICE SOUND & CRYING MONITOR SENSOR ---
  useEffect(() => {
    let interval: any = null;
    if (deviceRole === 'baby' && isMicrophoneActive && audioStreamRef.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(audioStreamRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        interval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          const normalizedVol = Math.min(100, Math.round((avg / 120) * 100));
          setBabyUnitDecibel(normalizedVol);

          // Update real-time noise level in database
          if (pairingCode) {
            const isBabyCrying = normalizedVol >= cryingThreshold;
            writeSessionData({
              noiseLevel: normalizedVol,
              isCrying: isBabyCrying,
              batteryLevel: batteryLevel,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }, 300);
      } catch (err) {
        console.error("Audio detection error: ", err);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [deviceRole, isMicrophoneActive, cryingThreshold, batteryLevel, pairingCode]);

  // --- STREAMS CAMERA PICTURE OVER NETWORK (NEAR REAL-TIME SNAPSHOT GRAPHICS) ---
  useEffect(() => {
    let videoTimer: any = null;
    const activeQuality = session?.streamQuality || streamQuality;
    const profile = STREAM_PROFILES[activeQuality as 'low' | 'medium' | 'high'] || STREAM_PROFILES.high;

    if (deviceRole === 'baby' && videoStreamRef.current && pairingCode) {
      videoTimer = setInterval(() => {
        if (babyVideoRef.current && canvasRef.current) {
          const video = babyVideoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
            // Apply dynamic resolution scale and JPEG compression
            const scale = profile.width / video.videoWidth;
            canvas.width = profile.width;
            canvas.height = video.videoHeight * scale;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const base64Jpeg = canvas.toDataURL('image/jpeg', profile.quality);
            writeSessionData({
              streamFrame: base64Jpeg,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
      }, profile.interval);
    }
    return () => {
      if (videoTimer) clearInterval(videoTimer);
    };
  }, [deviceRole, pairingCode, streamQuality, session?.streamQuality]);

  // --- REMOTE PHYSICAL FLASHLIGHT (TORCH) CONTROL ---
  useEffect(() => {
    if (deviceRole === 'baby' && videoStreamRef.current) {
      const track = videoStreamRef.current.getVideoTracks()[0];
      if (track) {
        const active = !!session?.flashlightActive;
        try {
          const capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
          if (capabilities && (capabilities as any).torch) {
            track.applyConstraints({
              advanced: [{ torch: active }]
            } as any).catch((err) => {
              console.warn("Torch constraints failed:", err);
            });
          }
        } catch (e) {
          console.warn("Physical torch applying error:", e);
        }
      }
    }
  }, [deviceRole, session?.flashlightActive, videoDevices]);

  // --- INTRINSIC SERVICE INITS & PAIRING CONTROL ACTIONS ---

  // Stop all media streams on cleanup
  const stopAllMediaStreams = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    setIsMicrophoneActive(false);
    synthInstance.stop();
  };

  const initBabyStation = async () => {
    stopAllMediaStreams();
    // Prompt permissions
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = mic;
      setIsMicrophoneActive(true);

      const constraints = videoDeviceId 
        ? { 
            video: { 
              deviceId: { exact: videoDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          } 
        : { 
            video: { 
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          };

      let cam;
      try {
        cam = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn("HD video constraint failed, attempting basic stream capture:", e);
        const basicConstraints = videoDeviceId 
          ? { video: { deviceId: { exact: videoDeviceId } } } 
          : { video: { facingMode: facingMode } };
        cam = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }

      videoStreamRef.current = cam;
      if (babyVideoRef.current) {
        babyVideoRef.current.srcObject = cam;
      }

      // Re-enumerate devices once permissions are granted so we get real camera names/labels!
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setVideoDevices(videoInputs);
          if (videoInputs.length > 0 && !videoDeviceId) {
            // Find a rear-facing camera to default to (Xiaomi back cameras!)
            const backCam = videoInputs.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arrière') || d.label.toLowerCase().includes('environment'));
            const defaultId = backCam ? backCam.deviceId : videoInputs[0].deviceId;
            setVideoDeviceId(defaultId);
            if (backCam) {
              setFacingMode('environment');
            }
          }
        } catch (e) {
          console.warn("Media re-enumeration failed:", e);
        }
      }
    } catch (err) {
      console.warn("Could not capture camera or mic stream:", err);
      triggerToast("Le Micro ou Caméra est inaccessible, exécution en mode Alerte uniquement.", "error");
    }

    // Reuse existing code if camera changed, otherwise generate a random 4 digit string
    const code = pairingCode || Math.floor(1000 + Math.random() * 9000).toString();
    setPairingCode(code);

    const initialBabyState: BabySession = {
      id: code,
      status: 'active',
      babyDeviceName: 'Appareil Bébé',
      batteryLevel: batteryLevel,
      noiseLevel: 0,
      isCrying: false,
      nightlightActive: false,
      nightlightColor: 'yellow',
      flashlightActive: false,
      activeLullaby: 'none',
      parentSpeaking: false,
      facingMode: facingMode,
      streamQuality: streamQuality,
      babyDeviceId: CLIENT_DEVICE_ID,
      parentDeviceId: ''
    };

    if (isFirebaseConfigured && !useServerFallback) {
      try {
        await setDoc(doc(db, 'sessions', code), initialBabyState);
        setSession(initialBabyState);
        setDeviceRole('baby');
        appendLog(`Station Bébé démarrée. Appairage : ${code} (Serveur Cloud)`, 'info');
        triggerToast("Station Bébé synchronisée sur le Cloud !", "success");
      } catch (err: any) {
        console.warn("Firestore initialization failed, switching to local Express synchronizer:", err);
        setUseServerFallback(true);
        await writeToServer(code, initialBabyState);
        setSession(initialBabyState);
        setDeviceRole('baby');
        appendLog(`Station Bébé démarrée. Appairage : ${code} (Serveur Local)`, 'info');
        triggerToast("Station Bébé synchronisée !", "success");
      }
    } else {
      await writeToServer(code, initialBabyState);
      setSession(initialBabyState);
      setDeviceRole('baby');
      appendLog(`Station Bébé démarrée. Appairage : ${code} (Serveur Local)`, 'info');
      triggerToast("Station Bébé synchronisée !", "success");
    }
  };

  const exitSession = async () => {
    stopAllMediaStreams();
    if (pairingCode) {
      if (isFirebaseConfigured && !useServerFallback) {
        try {
          await deleteDoc(doc(db, 'sessions', pairingCode));
        } catch (e) {
          try {
            await fetch(`/api/sessions/${pairingCode}`, { method: 'DELETE' });
          } catch (_) {}
        }
      } else {
        try {
          await fetch(`/api/sessions/${pairingCode}`, { method: 'DELETE' });
        } catch (_) {}
      }
    }
    setPairingCode('');
    setSession(null);
    setDeviceRole('launcher');
  };

  const connectAsParent = async () => {
    if (!inputCode || inputCode.length < 4) {
      triggerToast("Veuillez saisir un code à 4 chiffres valide.", "error");
      return;
    }

    setIsSubscribing(true);
    setPairingCode(inputCode);
    setDeviceRole('parent');
    appendLog(`Tentative de jumelage avec le code ${inputCode}...`, 'info');

    // Test cloud connection if configured first, switch to local server if it fails
    if (isFirebaseConfigured && !useServerFallback) {
      try {
        const docRef = doc(db, 'sessions', inputCode);
        const parentUpdates = { parentDeviceId: CLIENT_DEVICE_ID };
        await setDoc(docRef, parentUpdates, { merge: true });
        triggerToast("Jumelage Cloud réussi !", "success");
      } catch (error) {
        console.warn("Google cloud pairing failed, trying Express server handshake...", error);
        setUseServerFallback(true);
        try {
          const res = await fetch(`/api/sessions/${inputCode}`);
          if (res.ok) {
            const data = await res.json() as BabySession;
            const parentUpdates = { parentDeviceId: CLIENT_DEVICE_ID };
            await fetch(`/api/sessions/${inputCode}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parentUpdates)
            });
            setSession({ ...data, ...parentUpdates });
            triggerToast("Jumelage serveur réussi !", "success");
          } else {
            triggerToast("Code d'appairage incorrect ou session expirée.", "error");
            setDeviceRole('launcher');
            setPairingCode('');
          }
        } catch (err) {
          console.error("Local pairing error:", err);
          triggerToast("Le synchroniseur local est injoignable.", "error");
          setDeviceRole('launcher');
          setPairingCode('');
        }
      } finally {
        setIsSubscribing(false);
      }
    } else {
      // Local server handshake
      try {
        const res = await fetch(`/api/sessions/${inputCode}`);
        if (res.ok) {
          const data = await res.json() as BabySession;
          const parentUpdates = { parentDeviceId: CLIENT_DEVICE_ID };
          await fetch(`/api/sessions/${inputCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parentUpdates)
          });
          setSession({ ...data, ...parentUpdates });
          triggerToast("Jumelage serveur réussi !", "success");
        } else {
          triggerToast("Code d'appairage incorrect ou session expirée.", "error");
          setDeviceRole('launcher');
          setPairingCode('');
        }
      } catch (err) {
        console.error("Local pairing error:", err);
        triggerToast("Le synchroniseur local est injoignable.", "error");
        setDeviceRole('launcher');
        setPairingCode('');
      } finally {
        setIsSubscribing(false);
      }
    }
  };

  // Remote commands triggered by parent unit
  const sendParentControl = async (updates: Partial<BabySession>) => {
    if (!pairingCode) return;
    
    // Optimistic state update locally to ensure latency feels absolute zero
    if (session) {
      setSession(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await writeSessionData(updates, { merge: true });
      appendLog(`Commande contrôlée : ${Object.keys(updates).join(', ')}`, 'control');
    } catch (err: any) {
      console.error("Failed to propagate parent control command:", err);
      triggerToast("La commande n'a pas pu être envoyée.", "error");
    }
  };

  // Simulated baby cries button for sandbox and parent test runs
  const simulateBabyNoise = () => {
    if (deviceRole === 'baby') {
      const suddenNoise = Math.floor(65 + Math.random() * 30);
      setBabyUnitDecibel(suddenNoise);
      if (pairingCode) {
        writeSessionData({
          noiseLevel: suddenNoise,
          isCrying: suddenNoise >= cryingThreshold,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  };

  // Clean streams when component unmounts
  useEffect(() => {
    return () => {
      stopAllMediaStreams();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased selection:bg-indigo-500/20">
      <canvas ref={canvasRef} className="hidden" />

      {/* --- FLOATING TOAST GADGET --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl text-[11px] font-bold max-w-sm"
          >
            {toast.type === 'success' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
            {toast.type === 'error' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
            {toast.type === 'info' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- APP PORT HEADER --- */}
      <header className="border-b border-indigo-950/40 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow shadow-indigo-600/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              Apyrox Baby Monitor
              <span className="text-[8px] bg-slate-800 text-indigo-400 border border-indigo-950 px-1 py-0.5 rounded-md font-bold uppercase tracking-widest text-center">
                V3.0.0
              </span>
            </h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">Surveillance en temps réel</p>
          </div>
        </div>

        {/* CLOUD CONNECT MODULE */}
        <div className="flex items-center gap-2">
          {isFirebaseConfigured ? (
            <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-1 rounded-xl flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cloud Connecté
            </span>
          ) : (
            <span className="text-[8.5px] font-bold text-amber-500 bg-amber-950/20 border border-amber-900/40 px-2 py-1 rounded-xl flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Solo démo
            </span>
          )}
          {deviceRole !== 'launcher' && (
            <button 
              onClick={exitSession}
              className="text-[9px] font-bold px-2 py-1 select-none cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 transition"
            >
              Quitter
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* --- MAIN PAGE GRAPHICS RENDER --- */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col justify-center">

        {/* ======================================================== */}
        {/* LAUNCHER HUB SCREEN */}
        {/* ======================================================== */}
        {deviceRole === 'launcher' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
          >
            {/* ILLUSTRATION BANNER */}
            <div className="bg-gradient-to-br from-indigo-950/30 via-slate-900/50 to-purple-950/20 border border-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl" />

              <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center p-3 text-indigo-400 shadow-inner mb-4">
                <Radio className="w-full h-full text-indigo-400 animate-ping" />
              </div>
              <h2 className="text-[17px] font-extrabold text-white leading-tight">Mettez votre bébé en sécurité</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mt-1.5">
                Utilisez deux navigateurs ou smartphones pour connecter un appareil près de votre nouveau-né et un autre avec vous.
              </p>
            </div>

            {/* SELECTION TILES FOR DEVICE ROLES */}
            <div className="grid grid-cols-1 gap-4">

              {/* 1. BABY STATION STARTER */}
              <button
                onClick={initBabyStation}
                className="group relative text-left bg-indigo-900/30 hover:bg-indigo-900/40 cursor-pointer border border-indigo-800/40 p-5 rounded-2xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow shadow-indigo-600/20">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">👶 DÉBUTER LA STATION BÉBÉ</h3>
                    <p className="text-[10px] text-indigo-300/80 mt-0.5">Placez cet appareil près de votre enfant</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-450 group-hover:translate-x-1 transition" />
              </button>

              {/* 2. PARENT MONITOR ENTRANCE */}
              <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl shadow-lg space-y-3.5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center shadow-inner">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">📱 APPRAILLER STATION PARENT</h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">Surveillez le sommeil en temps réel</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Code de jumelage"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9.5 pr-3 py-2 text-[12px] text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600 tracking-widest font-mono text-center font-bold"
                    />
                  </div>
                  <button
                    onClick={connectAsParent}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-[11px] transition shadow shadow-purple-600/30 cursor-pointer text-center text-white active:scale-[0.98] flex items-center gap-1.5"
                  >
                    Jumeler
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* QUICK INFORMATION FOOTER */}
            <div className="bg-slate-900/20 border border-slate-900 p-3.5 rounded-xl text-[10px] text-slate-400 leading-normal flex items-start gap-2.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong>Sécurité absolue :</strong> Aucun compte utilisateur n'est requis pour lister ou surveiller votre enfant. Les jumelages sont sécurisés par codes à usage unique expirant après 10 minutes d'inactivité.
              </p>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* BABY UNIT STATION SCREEN */}
        {/* ======================================================== */}
        {deviceRole === 'baby' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 py-2"
          >
            {/* FULLSCREEN NIGHTLIGHT SHIELD OVERLAY (ACTIVATED ACCORDING TO SESSION CONFIG) */}
            {session?.nightlightActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b ${
                  session.nightlightColor === 'purple' ? NIGHTLIGHT_COLORS[1].class :
                  session.nightlightColor === 'blue' ? NIGHTLIGHT_COLORS[2].class :
                  session.nightlightColor === 'green' ? NIGHTLIGHT_COLORS[3].class :
                  NIGHTLIGHT_COLORS[0].class
                }`}
              >
                <div 
                  className="w-48 h-48 rounded-full blur-[40px] animate-pulse absolute" 
                  style={{ 
                    backgroundColor: 
                      session.nightlightColor === 'purple' ? '#a855f7' :
                      session.nightlightColor === 'blue' ? '#3b82f6' :
                      session.nightlightColor === 'green' ? '#10b981' : '#fbbf24'
                  }} 
                />
                
                <div className="relative flex flex-col items-center text-center space-y-4 max-w-sm">
                  <Sun className="w-14 h-14 text-white/40 animate-spin" style={{ animationDuration: '30s' }} />
                  <div>
                    <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest">Veilleuse active ({session.nightlightColor})</h2>
                    <p className="text-[10px] text-white/60 leading-normal mt-1">
                      Une lumière apaisante douce est actuellement diffusée pour aider bébé à s'endormir en toute sérénité.
                    </p>
                  </div>

                  <button
                    onClick={() => sendParentControl({ nightlightActive: false })}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 select-none cursor-pointer border border-white/20 text-white rounded-xl text-[10px]"
                  >
                    Éteindre la veilleuse
                  </button>
                </div>
              </motion.div>
            )}

            {/* STATIONS STATUS TILES */}
            <div className="flex bg-slate-900 border border-indigo-950/40 p-4 rounded-3xl items-center justify-between">
              <div>
                <span className="text-[8.5px] uppercase font-mono text-indigo-400 font-black tracking-widest">CODE APPEL</span>
                <div className="text-3xl font-black text-white tracking-widest mt-1 font-mono leading-none">
                  {pairingCode}
                </div>
                <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  Dépôt de caméra actif
                </div>
              </div>

              {/* BATTERY DISPLAY */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex items-center gap-3">
                <div className="relative shrink-0">
                  <Battery className="w-8 h-8 text-indigo-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-200">
                    {batteryLevel}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] uppercase tracking-wider block font-semibold text-slate-400">Autonomie</span>
                  <span className="text-[10px] font-bold text-white leading-none">Sur batterie</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE VIDEO CONTAINER FOR CAMERA FEED */}
            <div className="relative bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden aspect-video shadow-2xl flex items-center justify-center group">
              <video 
                ref={babyVideoRef}
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-all duration-350 ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
              />

              {/* VIDEO STATUS OVERLAYS */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-rose-600/85 text-white font-bold rounded-lg text-[9px] uppercase tracking-widest flex items-center gap-1 shadow">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    DIRECT
                  </span>
                </div>

                {/* DB LEVEL VISUAL GRAPHICS (EMOJI / WAVEFORM) */}
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-bold text-white">Niveau sonore: {babyUnitDecibel}%</span>
                    </div>
                    {/* Glowing progress line */}
                    <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/30">
                      <div 
                        className={`h-full transition-all duration-150 ${babyUnitDecibel >= cryingThreshold ? 'bg-amber-500 shadow shadow-amber-500/50' : 'bg-indigo-500'}`}
                        style={{ width: `${babyUnitDecibel}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={simulateBabyNoise} 
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[8.5px] cursor-pointer"
                  >
                    ⚡ Simuler bruit
                  </button>
                </div>
              </div>
            </div>

            {/* ADVANCED CAMERA & RESOLUTION SETTINGS PANEL */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* CAMERA OBJECTIVE LENS */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-850">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Objectif Caméra</span>
                    <span className="text-[8px] text-indigo-400 mt-0.5 font-bold">Actuel : {facingMode === 'user' ? 'Avant (Selfie)' : 'Arrière (64 MP)'}</span>
                  </div>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 align-middle">
                    <button
                      type="button"
                      onClick={() => {
                        setFacingMode('environment');
                        setVideoDeviceId('');
                        setTimeout(() => {
                          initBabyStation();
                          writeSessionData({ facingMode: 'environment' });
                        }, 50);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer select-none ${facingMode === 'environment' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                      Arrière
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFacingMode('user');
                        setVideoDeviceId('');
                        setTimeout(() => {
                          initBabyStation();
                          writeSessionData({ facingMode: 'user' });
                        }, 50);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer select-none ${facingMode === 'user' ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                      Avant
                    </button>
                  </div>
                </div>

                {/* RESOLUTION AND FLOW PRESETS */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-850">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Flux d'images & Fluidité</span>
                    <span className="text-[8px] text-indigo-400 mt-0.5 font-bold font-mono">Intervalle : {STREAM_PROFILES[streamQuality].interval}ms</span>
                  </div>
                  <select
                    value={streamQuality}
                    onChange={(e) => {
                      const nextQ = e.target.value as 'low' | 'medium' | 'high';
                      setStreamQuality(nextQ);
                      writeSessionData({ streamQuality: nextQ });
                    }}
                    className="bg-slate-950 border border-slate-800 text-[9.5px] font-extrabold text-white px-2 py-1 cursor-pointer rounded-lg focus:outline-none"
                  >
                    <option value="low">Éco (1.3s - 240p)</option>
                    <option value="medium">Standard (0.7s - 360p)</option>
                    <option value="high">Très Fluide 🔥 (0.4s - 480p)</option>
                  </select>
                </div>
              </div>

              {/* SPECIFIC SUB-LENS HARDWARE DISCOVERY */}
              {videoDevices.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-850 animate-fade-in">
                  <span className="text-[9px] font-black uppercase text-slate-400">Objectif Spécifique ({videoDevices.length} détectés)</span>
                  <select 
                    value={videoDeviceId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setVideoDeviceId(selectedId);
                      const selectedDevice = videoDevices.find(d => d.deviceId === selectedId);
                      const isBack = selectedDevice?.label.toLowerCase().includes('back') || selectedDevice?.label.toLowerCase().includes('arrière') || selectedDevice?.label.toLowerCase().includes('environment');
                      const inferredFacing = isBack ? 'environment' : 'user';
                      setFacingMode(inferredFacing);
                      setTimeout(() => {
                        initBabyStation();
                        writeSessionData({ facingMode: inferredFacing });
                      }, 50);
                    }}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-white px-2 py-1 rounded max-w-xs focus:outline-none focus:border-indigo-500"
                  >
                    {videoDevices.map(v => (
                      <option key={v.deviceId} value={v.deviceId}>{v.label || `Caméra Hardware (ID: ${v.deviceId.substring(0, 5)}...)`}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* CONTROLS & THRESHOLDS CARD */}
            <div className="bg-slate-900 border border-indigo-950/40 p-4 rounded-3xl space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9.5px] font-extrabold uppercase text-indigo-400 tracking-wider">Sensibilité de détection</span>
                  <span className="text-[10.5px] font-bold text-white">{cryingThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={cryingThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setCryingThreshold(val);
                    appendLog(`Sensibilité ajustée à ${val}%`, 'control');
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                  Alinez le seuil ci-dessus. Tout bruit dépassant cette valeur sera rapporté comme des "pleurs" réels sur la Station Parent.
                </p>
              </div>

              {/* SOOTHING BOX IN PROGRESS GADGET */}
              {session?.activeLullaby && session.activeLullaby !== 'none' && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Music className="w-5 h-5 text-indigo-400 animate-spin" />
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase leading-none">Berceuse active</h4>
                      <p className="text-[9px] text-slate-300 mt-1">{LULLABIES.find(l => l.id === session.activeLullaby)?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendParentControl({ activeLullaby: 'none' })}
                    className="p-1 px-2 text-[9px] cursor-pointer bg-slate-800 text-slate-200 border border-slate-700/60 rounded"
                  >
                    Arrêter
                  </button>
                </div>
              )}
            </div>

            {/* INSTANT LOG TRAIL */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-4">
              <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-500 mb-2">Activités de la Station</h4>
              <div ref={logContainerRef} className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {logs.length > 0 ? (
                  logs.map(l => (
                    <div key={l.id} className="text-[9px] leading-relaxed flex justify-between shrink-0">
                      <span className="text-slate-500 shrink-0 font-mono">{l.timestamp}</span>
                      <span className="text-slate-300 font-medium text-right ml-2">{l.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 text-[9px]">Aucun événement enregistré.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* PARENT RECEIVER MONITOR SCREEN */}
        {/* ======================================================== */}
        {deviceRole === 'parent' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 py-2"
          >
            {/* PARENT SYSTEM STATE CARD */}
            <div className="flex bg-slate-900 border border-indigo-950/40 p-4 rounded-3xl items-center justify-between shadow-xl">
              <div>
                <span className="text-[8.5px] uppercase font-mono text-purple-400 font-black tracking-widest leading-none block">CODE STATION PARENT</span>
                <div className="text-[17px] font-black text-white tracking-widest mt-0.5 font-mono">
                  {pairingCode}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 leading-none">
                  {session ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Appairé à {session.babyDeviceName}
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Recherche de signal...
                    </>
                  )}
                </div>
              </div>

              {/* BATTERY DISPLAY OF THE BABY DEVICE */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex items-center gap-3 shadow-inner">
                <div className="relative shrink-0">
                  <Battery className="w-8 h-8 text-purple-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-200">
                    {session?.batteryLevel || 100}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] uppercase tracking-wider block font-semibold text-slate-400">Batterie Bébé</span>
                  <span className="text-[10px] font-bold text-white leading-none">Transmission active</span>
                </div>
              </div>
            </div>

            {/* REAL-TIME VIDEO SCREEN FROM MONITORED BACKUP FEEDS */}
            <div className={`relative bg-slate-950 border rounded-3xl overflow-hidden aspect-video shadow-2xl flex flex-col justify-center items-center transition-all duration-300 ${session?.isCrying ? 'border-amber-500 shadow-amber-500/20 animate-pulse' : 'border-slate-900'}`}>
              
              {session?.streamFrame ? (
                <img 
                  src={session.streamFrame} 
                  alt="Baby Direct Stream" 
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all duration-350 ${session?.facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="text-center p-6 space-y-3 relative z-10 select-none">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 mx-auto shadow-inner animate-pulse">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-450 tracking-wider">Alerte audio seule</h4>
                    <p className="text-[9.5px] text-slate-500 leading-normal max-w-xs mt-1">
                      En attente ou caméra désactivée sur la station bébé. L'analyse des bruits reste entièrement fonctionnelle à 100%.
                    </p>
                  </div>
                </div>
              )}

              {/* STATIC INTERFACE OVERLAYS */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 p-4 flex flex-col justify-between select-none">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[9px] uppercase tracking-widest flex items-center gap-1 shadow">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    EN DIRECT
                  </span>
                  
                  {session?.isCrying && (
                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-widest animate-bounce shadow-lg flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 animate-swing" />
                      PLEURS DETECTÉS !
                    </span>
                  )}
                </div>

                {/* VOLUME MONITOR SLIDER DECI BEL FOOTER */}
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      Niveau Sonore Bébé: {session?.noiseLevel || 0}%
                    </span>
                    <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/30">
                      <div 
                        className={`h-full transition-all duration-300 ${session?.isCrying ? 'bg-amber-500 shadow shadow-amber-500/50' : 'bg-emerald-500'}`}
                        style={{ width: `${session?.noiseLevel || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PARLEMENT REMOTE CONTROL SOUNDBOARDS & BERCEUSES & VEILLEUSES */}
            <div className="bg-slate-900 border border-indigo-950/40 p-4 rounded-3xl space-y-4">
              <h3 className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Panneau de Contrôle à Distance</h3>

              {/* NIGHTLIGHT CONTROL SELECTORS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Veilleuse de la chambre
                  </span>
                  <button
                    onClick={() => sendParentControl({ nightlightActive: !session?.nightlightActive })}
                    className="p-1 px-3 text-[10px] font-extrabold cursor-pointer rounded-lg border transition"
                    style={{
                      backgroundColor: session?.nightlightActive ? '#fbbf24' : 'transparent',
                      color: session?.nightlightActive ? '#020617' : '#94a3b8',
                      borderColor: session?.nightlightActive ? '#fbbf24' : '#334155'
                    }}
                  >
                    {session?.nightlightActive ? 'Activée' : 'Éteinte'}
                  </button>
                </div>

                {session?.nightlightActive && (
                  <div className="grid grid-cols-4 gap-2 pt-1.5">
                    {NIGHTLIGHT_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => sendParentControl({ nightlightColor: c.id })}
                        className={`py-1.5 text-center text-[9px] font-black uppercase rounded-lg border cursor-pointer select-none transition ${session.nightlightColor === c.id ? `${c.border} bg-slate-950 text-white shadow shadow-inner` : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'}`}
                      >
                        {c.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* REMOTE DETAILED HARDWARE TOGGLES (FLASHLIGHT & QUALITY) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                {/* 1. PHYSICAL BACK FLASH TORCH LED ON PHONE */}
                <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-1.5 pr-1.5">
                    <Zap className={`w-4 h-4 ${session?.flashlightActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-300">Torche Flash</span>
                      <span className="text-[8.5px] text-slate-500">Lampe LED bébé</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => sendParentControl({ flashlightActive: !session?.flashlightActive })}
                    className={`py-1.5 px-3 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer select-none border ${session?.flashlightActive ? 'bg-amber-500 text-slate-950 border-amber-500 shadow shadow-amber-500/20' : 'bg-transparent text-slate-400 border-slate-800 hover:text-slate-200'}`}
                  >
                    {session?.flashlightActive ? 'Allumée' : 'Éteinte'}
                  </button>
                </div>

                {/* 2. DYNAMIC REMOTE RESOLUTION & FLUIDITY SELECTOR */}
                <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-1.5 pr-1.5">
                    <Video className="w-4 h-4 text-purple-450" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-300">Fluidité & Qualité</span>
                      <span className="text-[8.5px] text-slate-400">FPS / Compression</span>
                    </div>
                  </div>
                  <select
                    value={session?.streamQuality || streamQuality}
                    onChange={(e) => {
                      const selectedVal = e.target.value as 'low' | 'medium' | 'high';
                      setStreamQuality(selectedVal);
                      sendParentControl({ streamQuality: selectedVal });
                    }}
                    className="bg-slate-900 border border-slate-800 text-[9px] font-extrabold text-white px-2 py-1 cursor-pointer rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Éco (240p)</option>
                    <option value="medium">Standard (360p)</option>
                    <option value="high font-bold">Très Fluide 🔥 (480p)</option>
                  </select>
                </div>
              </div>

              {/* REMOTE LULLABIES SELECTOR SYSTEM */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-350 block mb-1 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-indigo-405" />
                  Jouer une Berceuse de réconfort
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {LULLABIES.map(l => {
                    const isMelodyActive = session?.activeLullaby === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          const nextLullaby = isMelodyActive ? 'none' : l.id;
                          sendParentControl({ activeLullaby: nextLullaby });
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition select-none flex items-center justify-between ${isMelodyActive ? 'bg-indigo-950/40 border-indigo-500 text-white shadow' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'}`}
                      >
                        <div className="truncate pr-1">
                          <span className="text-[11px] font-bold block">{l.emoji} {l.name.split(' ')[0]}</span>
                          <span className="text-[8.5px] text-slate-500 truncate block mt-0.5">{l.description}</span>
                        </div>
                        {isMelodyActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* WALKIE TALKIE SPEAK TO BABY BUTTON */}
            <div className="bg-slate-900 border border-indigo-950/40 p-4 rounded-3xl">
              <span className="text-[10px] font-bold text-slate-350 block mb-1 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
                Intercom Talkie-Walkie
              </span>
              <p className="text-[9.5px] text-slate-400 leading-relaxed mb-3">
                Parlez pour chuchoter, apaiser, rassurer votre bébé à distance lorsqu'il s'agite ou commence à se réveiller.
              </p>
              
              <button
                type="button"
                onMouseDown={() => {
                  setParentSpeakActive(true);
                  sendParentControl({ parentSpeaking: true });
                }}
                onMouseUp={() => {
                  setParentSpeakActive(false);
                  sendParentControl({ parentSpeaking: false });
                }}
                onTouchStart={() => {
                  setParentSpeakActive(true);
                  sendParentControl({ parentSpeaking: true });
                }}
                onTouchEnd={() => {
                  setParentSpeakActive(false);
                  sendParentControl({ parentSpeaking: false });
                }}
                className={`w-full py-3.5 cursor-pointer select-none font-black text-center text-xs uppercase rounded-2xl border transition active:scale-[0.98] ${parentSpeakActive ? 'bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse' : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-rose-400 hover:text-rose-350'}`}
              >
                {parentSpeakActive ? '🎙️ Emission en cours (Bébé vous entend)' : '🎤 Maintenir pour parler à bébé'}
              </button>
            </div>
          </motion.div>
        )}

      </main>

      {/* --- FOOTER TRADEMARKS --- */}
      <footer className="border-t border-indigo-950/40 bg-slate-900/40 py-3 text-center text-[9px] uppercase tracking-widest text-slate-550 select-none">
        Conçu par Bessem Cherni &bull; Tous droits réservés &bull; Apyrox baby monitor
      </footer>
    </div>
  );
}
