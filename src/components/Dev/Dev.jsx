import React from 'react';

function ComponentA({ toggleMusic }) {
  return (
    <div>
      <button onClick={toggleMusic}>Toggle Music</button>
    </div>
  );
}

export default ComponentA;


// const playAudio = () => {
//   const audioElement = document.getElementById('audioElement');
//   if (audioElement) {
//       if (isPlaying) {
//           audioElement.play().catch(error => {
//               console.error('Error playing audio:', error);
//           });
//       } else {
//           audioElement.pause();
//       }
//   }
// };