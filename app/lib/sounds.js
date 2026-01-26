// Notification Sound System for LowKey
// Plays sounds for messages, alerts, friend requests, etc.
// Respects "Quiet Mode" setting

class LowkeySounds {
  constructor() {
    this.audioContext = null
    this.enabled = true
    this.volume = 0.5
    
    // Sound frequencies for different notification types
    this.sounds = {
      message: { frequency: 880, duration: 150, type: 'sine' },
      friendRequest: { frequency: 660, duration: 200, type: 'sine' },
      gameInvite: { frequency: 523, duration: 250, type: 'square' },
      notice: { frequency: 440, duration: 180, type: 'sine' },
      alert: { frequency: 1047, duration: 100, type: 'square' },
      notification: { frequency: 784, duration: 120, type: 'sine' },
      success: { frequency: 988, duration: 150, type: 'sine' },
      error: { frequency: 330, duration: 200, type: 'sawtooth' },
      messageRequest: { frequency: 587, duration: 180, type: 'sine' },
      comment: { frequency: 698, duration: 140, type: 'sine' },
    }
  }

  init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Load quiet mode preference
    this.loadSettings()
  }

  loadSettings() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('lowkey_user')
      if (user) {
        const userData = JSON.parse(user)
        this.enabled = !userData.quietMode
      }
    }
  }

  setQuietMode(quiet) {
    this.enabled = !quiet
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol))
  }

  async play(type) {
    if (!this.enabled) return
    if (!this.audioContext) this.init()
    if (!this.audioContext) return

    const sound = this.sounds[type] || this.sounds.notification
    
    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.value = sound.frequency
      oscillator.type = sound.type
      
      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration / 1000)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + sound.duration / 1000)
    } catch (e) {
      console.warn('Sound playback failed:', e)
    }
  }

  // Play double beep for important notifications
  async playDouble(type) {
    await this.play(type)
    setTimeout(() => this.play(type), 150)
  }

  // Convenience methods
  message() { this.play('message') }
  friendRequest() { this.playDouble('friendRequest') }
  gameInvite() { this.play('gameInvite') }
  notice() { this.play('notice') }
  alert() { this.playDouble('alert') }
  notification() { this.play('notification') }
  success() { this.play('success') }
  error() { this.play('error') }
  messageRequest() { this.playDouble('messageRequest') }
  comment() { this.play('comment') }
}

// Create singleton instance
const lowkeySounds = typeof window !== 'undefined' ? new LowkeySounds() : null

export default lowkeySounds
