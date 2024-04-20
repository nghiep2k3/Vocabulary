import React, { createContext, useContext, useState } from 'react';

const AudioContext = createContext();

export const useAudioContext = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(true);

    const togglePlay = () => {
        setIsPlaying((prevState) => !prevState);
    };

    return (
        <AudioContext.Provider value={{ isPlaying, togglePlay }}>
            {children}
        </AudioContext.Provider>
    );
};
