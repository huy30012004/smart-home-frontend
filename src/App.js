// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout      from './components/Layout';
import SelectRoom  from './pages/SelectRoom';
import RoomControl from './pages/RoomControl';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SelectRoom />} />
          <Route path="room/:roomId" element={<RoomControl />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
