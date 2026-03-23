import { useState, useEffect, useRef, useCallback } from 'react';

// Radio Browser API - free public radio stations
const RADIO_API_BASE = 'https://de1.api.radio-browser.info/json';

// Curated stations for the Lowkey nightlife vibe
const FALLBACK_STATIONS = [
  {
    id: 'lowkey-1',
    name: 'Late Night Vibes',
    genre: 'Chill',
    url: 'https://streams.ilovemusic.de/iloveradio-chillhop.mp3',
    favicon: '',
  },
  {
    id: 'lowkey-2', 
    name: 'Deep House Radio',
    genre: 'House',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    favicon: '',
  },
  {
    id: 'lowkey-3',
    name: 'Lounge FM',
    genre: 'Lounge',
    url: 'https://stream.laut.fm/lounge',
    favicon: '',
  },
  {
    id: 'lowkey-4',
    name: 'Night Owl Radio',
    genre: 'Electronic',
    url: 'https://streams.ilovemusic.de/iloveradio2.mp3',
    favicon: '',
  },
  {
    id: 'lowkey-5',
    name: 'Smooth Jazz',
    genre: 'Jazz',
    url: 'https://streaming.radio.co/s774887f7b/listen',
    favicon: '',
  },
];

export const useRadio = () => {
  const [stations, setStations] = useState(FALLBACK_STATIONS);
  const [currentStation, setCurrentStation] = useState(FALLBACK_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      audioRef.current.volume = volume;
      
      // Event listeners
      audioRef.current.addEventListener('loadstart', () => {
        setIsLoading(true);
        setError(null);
      });
      
      audioRef.current.addEventListener('canplay', () => {
        setIsLoading(false);
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
        setIsPlaying(false);
        setError('Unable to play this station');
      });

      audioRef.current.addEventListener('waiting', () => {
        setIsLoading(true);
      });

      audioRef.current.addEventListener('playing', () => {
        setIsLoading(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Fetch stations from Radio Browser API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        // Fetch chill/lounge stations suitable for nightlife app
        const response = await fetch(
          `${RADIO_API_BASE}/stations/search?tags=lounge,chill,house,electronic&limit=10&order=clickcount&reverse=true`,
          {
            headers: {
              'User-Agent': 'Lowkey/1.0',
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const mappedStations = data
              .filter(s => s.url_resolved && s.url_resolved.includes('http'))
              .map(s => ({
                id: s.stationuuid,
                name: s.name,
                genre: s.tags?.split(',')[0] || 'Radio',
                url: s.url_resolved,
                favicon: s.favicon || '',
              }));
            
            if (mappedStations.length > 0) {
              setStations([...FALLBACK_STATIONS, ...mappedStations]);
            }
          }
        }
      } catch (err) {
        console.log('Using fallback stations:', err);
        // Keep using fallback stations
      }
    };

    fetchStations();
  }, []);

  // Update audio source when station changes
  useEffect(() => {
    if (audioRef.current && currentStation?.url) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentStation.url;
      
      if (wasPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Autoplay error:', err);
          setError('Click play to start');
        });
      }
    }
  }, [currentStation]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current) {
      setError(null);
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setError('Unable to play');
      });
    }
  }, []);

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

  const nextStation = useCallback(() => {
    const currentIndex = stations.findIndex(s => s.id === currentStation?.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    setCurrentStation(stations[nextIndex]);
  }, [stations, currentStation]);

  const previousStation = useCallback(() => {
    const currentIndex = stations.findIndex(s => s.id === currentStation?.id);
    const prevIndex = currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
    setCurrentStation(stations[prevIndex]);
  }, [stations, currentStation]);

  const selectStation = useCallback((station) => {
    setCurrentStation(station);
  }, []);

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
