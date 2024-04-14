import React, { useRef } from 'react';
import link from '../../assets/fakelove.mp3'

const App = () => {
  const audioRef = useRef(null);

  const playAudio = () => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.play(); // Phát âm thanh nếu audioElement tồn tại
    }
  };

  return (
    <div>
      <h1>Phát Nhạc Khi Ấn Nút</h1>
      <button onClick={playAudio}>Phát Nhạc</button>
      <audio ref={(element) => (audioRef.current = element)}>
        <source src={link} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default App;
