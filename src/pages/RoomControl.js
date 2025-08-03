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
    fetch(`${process.env.REACT_APP_API_URL}/room/${roomId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Room "${roomId}" not found`);
        return res.json();
      })
      .then(json => {
        setLive({
          temperature: json.live_temp,
          humidity:    json.live_hum
        });
        setStates(json.device_states);
      })
      .catch(err => console.error('Fetch room data error:', err));
  }, [roomId, process.env.REACT_APP_API_URL]);

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
