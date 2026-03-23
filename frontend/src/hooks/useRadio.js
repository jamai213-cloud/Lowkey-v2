import { useState, useEffect, useRef, useCallback } from 'react';

// Lowkey Radio Stations - Real streaming URLs
const STATIONS = [
  {
    id: 'bbc-1xtra',
    name: 'BBC 1Xtra',
    genre: 'Hip-Hop / R&B',
    url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_1xtra',
    fallbackUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_1xtra',
    favicon: '',
    color: '#7C3AED',
  },
  {
    id: 'capital-xtra',
    name: 'Capital XTRA',
    genre: 'Urban / Dance',
    url: 'https://media-ice.musicradio.com/CapitalXTRALondonMP3',
    fallbackUrl: 'https://media-ice.musicradio.com/CapitalXTRAMP3',
    favicon: '',
    color: '#F59E0B',
  },
  {
    id: 'nts-1',
    name: 'NTS Radio 1',
    genre: 'Eclectic',
    url: 'https://stream-relay-geo.ntslive.net/stream',
    fallbackUrl: 'https://stream-relay-geo.ntslive.net/stream?client=NTSWebApp',
    favicon: '',
    color: '#A78BFA',
  },
  {
    id: 'nts-2',
    name: 'NTS Radio 2',
    genre: 'Eclectic',
    url: 'https://stream-relay-geo.ntslive.net/stream2',
    fallbackUrl: 'https://stream-relay-geo.ntslive.net/stream2?client=NTSWebApp',
    favicon: '',
    color: '#22C55E',
  },
  {
    id: 'bbc-radio1',
    name: 'BBC Radio 1',
    genre: 'Pop / Dance',
    url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    fallbackUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    favicon: '',
    color: '#EC4899',
  },
  {
    id: 'kisstory',
    name: 'KISSTORY',
    genre: 'Old School',
    url: 'https://stream-mz.planetradio.co.uk/kisstory.mp3',
    fallbackUrl: 'https://stream.planetradio.co.uk/kisstory.mp3',
    favicon: '',
    color: '#3B82F6',
  },
];

export const useRadio = () => {
  const [stations] = useState(STATIONS);
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const retryCountRef = useRef(0);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
      audioRef.current.volume = volume;
      audioRef.current.crossOrigin = 'anonymous';
      
      audioRef.current.addEventListener('loadstart', () => {
        setIsLoading(true);
        setError(null);
      });
      
      audioRef.current.addEventListener('canplay', () => {
        setIsLoading(false);
        retryCountRef.current = 0;
      });
      
      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
        setIsLoading(false);
      });
      
      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Radio stream error:', e);
        setIsLoading(false);
        
        // Try fallback URL if available
        if (retryCountRef.current === 0 && currentStation?.fallbackUrl) {
          retryCountRef.current = 1;
          audioRef.current.src = currentStation.fallbackUrl;
          audioRef.current.play().catch(() => {
            setError('Unable to connect');
            setIsPlaying(false);
          });
        } else {
          setError('Unable to connect');
          setIsPlaying(false);
        }
      });

      audioRef.current.addEventListener('waiting', () => {
        setIsLoading(true);
      });

      audioRef.current.addEventListener('playing', () => {
        setIsLoading(false);
        setError(null);
      });

      audioRef.current.addEventListener('stalled', () => {
        setIsLoading(true);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current && currentStation) {
      setError(null);
      retryCountRef.current = 0;
      
      // Set source if not already set
      if (!audioRef.current.src || audioRef.current.src !== currentStation.url) {
        audioRef.current.src = currentStation.url;
      }
      
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        // Try fallback
        if (currentStation.fallbackUrl) {
          audioRef.current.src = currentStation.fallbackUrl;
          audioRef.current.play().catch(() => {
            setError('Tap to retry');
          });
        } else {
          setError('Tap to retry');
        }
      });
    }
  }, [currentStation]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const selectStation = useCallback((station) => {
    const wasPlaying = isPlaying;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    setCurrentStation(station);
    setError(null);
    retryCountRef.current = 0;
    
    // Auto-play when switching stations if was playing
    if (wasPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current.src = station.url;
        audioRef.current.play().catch(err => {
          console.error('Station switch play error:', err);
          if (station.fallbackUrl) {
            audioRef.current.src = station.fallbackUrl;
            audioRef.current.play().catch(() => setError('Tap to retry'));
          }
        });
      }, 100);
    }
  }, [isPlaying]);

  const nextStation = useCallback(() => {
    const currentIndex = stations.findIndex(s => s.id === currentStation?.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    selectStation(stations[nextIndex]);
  }, [stations, currentStation, selectStation]);

  const previousStation = useCallback(() => {
    const currentIndex = stations.findIndex(s => s.id === currentStation?.id);
    const prevIndex = currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
    selectStation(stations[prevIndex]);
  }, [stations, currentStation, selectStation]);

  return {
    stations,
    currentStation,
    isPlaying,
    isLoading,
    volume,
    error,
    play,
    pause,
    togglePlay,
    nextStation,
    previousStation,
    selectStation,
    setVolume,
  };
};

export default useRadio;
