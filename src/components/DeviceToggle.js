// src/components/DeviceToggle.js
import React from 'react';

export default function DeviceToggle({ room, device, state, onToggle }) {
  return (
    <div style={{ margin: '8px 0' }}>
      <strong>{device}:</strong>{' '}
      <button onClick={() => onToggle(room, device)}>
        {state === 'on' ? '🔴 Tắt' : '🟢 Bật'}
      </button>
    </div>
  );
}
