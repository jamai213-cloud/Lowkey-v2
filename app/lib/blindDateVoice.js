// Blind Lowkey Voice Call System
// WebRTC-based private voice connection for two matched users
// Falls back to text chat if voice connection fails

class BlindDateVoice {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.sessionId = null
    this.userId = null
    this.partnerId = null
    this.isMuted = false
    this.isConnected = false
    this.onConnectionChange = null
    this.onError = null
    this.onRemoteStream = null
    this.pollingInterval = null
    
    // WebRTC configuration with STUN servers
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    }
  }

  // Initialize the voice call
  async init(sessionId, userId, partnerId, callbacks = {}) {
    this.sessionId = sessionId
    this.userId = userId
    this.partnerId = partnerId
    this.onConnectionChange = callbacks.onConnectionChange || (() => {})
    this.onError = callbacks.onError || (() => {})
    this.onRemoteStream = callbacks.onRemoteStream || (() => {})

    try {
      // Request microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfig)

      // Add local audio track to connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })

      // Handle incoming remote tracks
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0]
        this.onRemoteStream(this.remoteStream)
      }

      // Handle ICE candidates
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await this.sendSignal('ice-candidate', event.candidate)
        }
      }

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState
        this.isConnected = state === 'connected'
        this.onConnectionChange(state)
        
        if (state === 'failed' || state === 'disconnected') {
          this.onError({ type: 'connection_failed', message: 'Voice connection lost' })
        }
      }

      // Start signaling
      await this.startSignaling()
      
      return { success: true }
    } catch (error) {
      console.error('Voice init error:', error)
      this.onError({ 
        type: error.name === 'NotAllowedError' ? 'permission_denied' : 'init_failed',
        message: error.message 
      })
      return { success: false, error: error.message }
    }
  }

  // Start the signaling process
  async startSignaling() {
    // Determine if this user should create the offer (lower userId goes first for consistency)
    const shouldCreateOffer = this.userId < this.partnerId

    if (shouldCreateOffer) {
      // Create and send offer
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      await this.sendSignal('offer', offer)
    }

    // Start polling for signals from partner
    this.startSignalPolling()
  }

  // Send signal to partner via API
  async sendSignal(type, data) {
    try {
      await fetch('/api/blinddate/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          fromUserId: this.userId,
          toUserId: this.partnerId,
          type,
          data
        })
      })
    } catch (error) {
      console.error('Signal send error:', error)
    }
  }

  // Poll for signals from partner
  startSignalPolling() {
    this.pollingInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/blinddate/signal?sessionId=${this.sessionId}&userId=${this.userId}`)
        if (res.ok) {
          const signals = await res.json()
          for (const signal of signals) {
            await this.handleSignal(signal)
          }
        }
      } catch (error) {
        console.error('Signal polling error:', error)
      }
    }, 1000)
  }

  // Handle incoming signal
  async handleSignal(signal) {
    if (!this.peerConnection) return

    try {
      switch (signal.type) {
        case 'offer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
          const answer = await this.peerConnection.createAnswer()
          await this.peerConnection.setLocalDescription(answer)
          await this.sendSignal('answer', answer)
          break

        case 'answer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
          break

        case 'ice-candidate':
          if (signal.data) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.data))
          }
          break
      }
    } catch (error) {
      console.error('Signal handling error:', error)
    }
  }

  // Toggle mute state
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.isMuted = !audioTrack.enabled
        return this.isMuted
      }
    }
    return this.isMuted
  }

  // Set mute state directly
  setMute(muted) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !muted
        this.isMuted = muted
      }
    }
  }

  // Get current mute state
  getMuteState() {
    return this.isMuted
  }

  // Check if connected
  getConnectionState() {
    return this.isConnected
  }

  // End the voice call and cleanup
  async end() {
    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.remoteStream = null
    this.isConnected = false

    // Notify server
    if (this.sessionId && this.userId) {
      try {
        await fetch('/api/blinddate/voice/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            userId: this.userId
          })
        })
      } catch (error) {
        console.error('Voice end notification error:', error)
      }
    }
  }

  // Static method to check if voice is supported
  static isSupported() {
    return !!(
      typeof window !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection
    )
  }

  // Static method to check microphone permission
  static async checkPermission() {
    if (!this.isSupported()) return 'unsupported'
    
    try {
      const result = await navigator.permissions.query({ name: 'microphone' })
      return result.state // 'granted', 'denied', or 'prompt'
    } catch {
      return 'unknown'
    }
  }
}

// Export singleton-style factory
let voiceInstance = null

export function getBlindDateVoice() {
  if (!voiceInstance) {
    voiceInstance = new BlindDateVoice()
  }
  return voiceInstance
}

export function createBlindDateVoice() {
  return new BlindDateVoice()
}

export default BlindDateVoice
