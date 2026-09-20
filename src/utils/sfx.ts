// ============================================================
//  STAR WARS STYLE SYNTHETIC SFX GENERATOR (Web Audio API)
//  Zero external dependencies · Zero latency · Procedural audio
// ============================================================

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  return audioCtx
}

/**
 * Beep droid (stile astromech / R2-D2):
 * Sequenza di frequenze modulate veloci ad onda sinusoidale/triangolare (800Hz - 2400Hz)
 */
export function playDroidBeep(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const chirps = [
    { freqStart: 880,  freqEnd: 1760, duration: 0.05, type: 'sine' as OscillatorType },
    { freqStart: 1760, freqEnd: 1100, duration: 0.04, type: 'triangle' as OscillatorType },
    { freqStart: 1320, freqEnd: 2200, duration: 0.06, type: 'sine' as OscillatorType },
    { freqStart: 2200, freqEnd: 1540, duration: 0.05, type: 'triangle' as OscillatorType },
    { freqStart: 1650, freqEnd: 2400, duration: 0.07, type: 'sine' as OscillatorType },
  ]

  let offset = 0
  chirps.forEach((c) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = c.type
    osc.frequency.setValueAtTime(c.freqStart, now + offset)
    osc.frequency.exponentialRampToValueAtTime(Math.max(100, c.freqEnd), now + offset + c.duration)

    gain.gain.setValueAtTime(0.001, now + offset)
    gain.gain.linearRampToValueAtTime(0.14, now + offset + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + c.duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + offset)
    osc.stop(now + offset + c.duration + 0.01)

    offset += c.duration + 0.015
  })
}

/**
 * Comms Open:
 * Leggero burst di rumore bianco filtrato con risonanza radio per l'attivazione del microfono
 */
export function playCommsOpen(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const duration = 0.1
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  // Genera rumore bianco
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4
  }

  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = buffer

  // Filtro passa-banda risonante stile radio ricetrasmittente spaziale
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.setValueAtTime(1850, ctx.currentTime)
  bandpass.Q.setValueAtTime(4.5, ctx.currentTime)

  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.2, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  noiseSource.connect(bandpass)
  bandpass.connect(gain)
  gain.connect(ctx.destination)

  noiseSource.start(now)
  noiseSource.stop(now + duration)
}

/**
 * Success Chime:
 * Arpeggio pulito ascensionale a due toni per risposta corretta o livello completato
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [
    { freq: 659.25, time: 0.0,  dur: 0.16 }, // E5
    { freq: 987.77, time: 0.12, dur: 0.32 }, // B5
  ]

  notes.forEach((n) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(n.freq, now + n.time)

    gain.gain.setValueAtTime(0.001, now + n.time)
    gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + n.time)
    osc.stop(now + n.time + n.dur)
  })
}

/**
 * Error Hum:
 * Impulso a bassa frequenza attenuato (120Hz) per risposta errata
 */
export function playErrorHum(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(120, now)
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.28)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(320, now)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.32)
}

/**
 * Sequenza combinata per avvio registrazione (Comms Open + Droid Beep)
 */
export function playStartRecording(): void {
  playCommsOpen()
  setTimeout(() => {
    playDroidBeep()
  }, 60)
}

/**
 * Nav Click:
 * Tocco tattile sintetico futuristico per navigazione, pulsanti e selezioni (1200Hz -> 600Hz in 35ms)
 */
export function playNavClick(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(1200, now)
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.035)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.08, now + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.04)
}

/**
 * Nav Tab / Level Switch:
 * Sweep armonico morbido a due toni per cambio schermata o livello (740Hz -> 1100Hz)
 */
export function playNavTab(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(740, now)
  osc.frequency.exponentialRampToValueAtTime(1100, now + 0.06)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.09, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.075)
}

/**
 * Unit Select:
 * Chirp staccato a tre gradini ascendenti all'avvio o selezione di una missione (880 -> 1175 -> 1760 Hz)
 */
export function playUnitSelect(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const freqs = [880, 1175, 1760]
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    const t = now + i * 0.035
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, t)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.1, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + 0.035)
  })
}

/**
 * Modal Toggle:
 * Transizione sonora per apertura/chiusura popup o drawer di navigazione
 */
export function playModalToggle(open: boolean = true): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  if (open) {
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)
  } else {
    osc.frequency.setValueAtTime(780, now)
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.08)
  }

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.07, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.085)
}

