// src/hooks/useMqtt.js
import { useEffect } from 'react';
import Paho from 'paho-mqtt';

export function useMqtt(onMessage, roomId) {
  useEffect(() => {
    const BROKER   = '4a97043579714e55aba4f9b977919abb.s1.eu.hivemq.cloud';
    const PORT     = 8884;    // WebSocket secure
    const PATH     = '/mqtt';
    const USER     = 'admin-1';
    const PASS     = '1n1n1n1N!';
    const TOPIC    = 'sensor/esp32/data';
    const clientId= 'web_' + Math.random().toString(16).slice(2);

    const client = new Paho.Client(BROKER, PORT, PATH, clientId);

    client.onConnectionLost = () => console.warn('MQTT lost');
    client.onMessageArrived = msg => {
      try {
        const p = JSON.parse(msg.payloadString);
        if (p.room === roomId) onMessage(p);
      } catch {}
    };

    client.connect({
      useSSL: true,
      userName: USER,
      password: PASS,
      onSuccess: () => client.subscribe(TOPIC),
      onFailure: err => console.error('MQTT fail', err),
      reconnect: true
    });

    return () => client.isConnected() && client.disconnect();
  }, [onMessage, roomId]);
}
