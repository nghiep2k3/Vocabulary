import React from 'react';

function ComponentB({ musicPlaying }) {
  return (
    <div>
      <p>Music is {musicPlaying ? 'playing' : 'paused'}</p>
    </div>
  );
}

export default ComponentB;
