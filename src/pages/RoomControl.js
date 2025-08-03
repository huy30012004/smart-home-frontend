// src/pages/RoomControl.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Paho from 'paho-mqtt';
import {
  Box, Container, Grid,
  Card, CardHeader, CardContent,
  Typography, Button
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon    from '@mui/icons-material/Opacity';
import LightbulbIcon  from '@mui/icons-material/Lightbulb';
import FanIcon        from '@mui/icons-material/Toys';

export default function RoomControl() {
  const { roomId } = useParams();

  // State cho live sensor và device
  const [live,   setLive]   = useState({ temperature: '--', humidity: '--' });
  const [states, setStates] = useState({ light: 'off', fan: 'off' });

  useEffect(() => {
    // 1. Khởi tạo MQTT client
    const MQTT_BROKER_WS = '4a97043579714e55aba4f9b977919abb.s1.eu.hivemq.cloud';
    const MQTT_PORT_WS   = 8884;            // WebSockets secure port
    const MQTT_PATH      = '/mqtt';         // theo docs HiveMQ Cloud
    const MQTT_USER      = 'admin-1';
    const MQTT_PASSWORD  = '1n1n1n1N!';
    const TOPIC          = 'sensor/esp32/data';

    const clientId = 'web_' + Math.random().toString(16).slice(2);
    const mqttClient = new Paho.Client(
      MQTT_BROKER_WS,
      MQTT_PORT_WS,
      MQTT_PATH,
      clientId
    );

    mqttClient.onConnectionLost = resp => {
      console.error('MQTT connection lost:', resp.errorMessage);
    };

    mqttClient.onMessageArrived = message => {
      try {
        const payload = JSON.parse(message.payloadString);
        if (payload.room === roomId) {
          // Cập nhật live sensor
          setLive({
            temperature: payload.temperature,
            humidity:    payload.humidity
          });
          // Cập nhật device states
          setStates({
            light: payload.light_status === 1 ? 'on' : 'off',
            fan:   payload.fan_status   === 1 ? 'on' : 'off'
          });
        }
      } catch (err) {
        console.error('Invalid MQTT payload', err);
      }
    };

    // Kết nối
    mqttClient.connect({
      useSSL:      true,
      userName:    MQTT_USER,
      password:    MQTT_PASSWORD,
      onSuccess:   () => {
        console.log('MQTT connected, subscribing to', TOPIC);
        mqttClient.subscribe(TOPIC);
      },
      onFailure:   err => console.error('MQTT connect failed', err),
      reconnect:   true
    });

    // Dọn dẹp khi unmount
    return () => {
      if (mqttClient.isConnected()) mqttClient.disconnect();
    };
  }, [roomId]);

  // Khi bấm toggle, gửi REST vẫn để lưu log và trigger backend
  const handleToggle = device => {
    fetch(`${process.env.REACT_APP_API_URL}/toggle/${roomId}/${device}`, {
      method: 'POST'
    })
      .then(r => r.json())
      .then(data => {
        setStates(s => ({ ...s, [device]: data.state }));
      })
      .catch(console.error);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header + Live summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Điều khiển {roomId.toUpperCase()}</Typography>
        <Box display="flex" gap={2}>
          <Card sx={{ display:'flex', alignItems:'center', p:1 }} elevation={2}>
            <ThermostatIcon color="error" /><Typography ml={1}>{live.temperature}°C</Typography>
          </Card>
          <Card sx={{ display:'flex', alignItems:'center', p:1 }} elevation={2}>
            <OpacityIcon color="primary" /><Typography ml={1}>{live.humidity}%</Typography>
          </Card>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Đèn */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardHeader
              avatar={<LightbulbIcon color={states.light==='on'?'warning':'disabled'} />}
              title="Đèn"
              subheader={`Trạng thái: ${states.light.toUpperCase()}`}
            />
            <CardContent>
              <Button
                variant="contained"
                color={states.light==='on'?'error':'success'}
                fullWidth
                onClick={() => handleToggle('light')}
              >
                {states.light==='on'?'Tắt':'Bật'} Đèn
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quạt */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardHeader
              avatar={<FanIcon color={states.fan==='on'?'info':'disabled'} />}
              title="Quạt"
              subheader={`Trạng thái: ${states.fan.toUpperCase()}`}
            />
            <CardContent>
              <Button
                variant="contained"
                color={states.fan==='on'?'error':'success'}
                fullWidth
                onClick={() => handleToggle('fan')}
              >
                {states.fan==='on'?'Tắt':'Bật'} Quạt
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* (Bạn có thể thêm biểu đồ/giá trị lịch sử tương tự) */}
      </Grid>
    </Container>
  );
}
