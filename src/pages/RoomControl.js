// src/pages/RoomControl.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Grid,
  Card, CardHeader, CardContent,
  Typography, Button
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon    from '@mui/icons-material/Opacity';
import LightbulbIcon  from '@mui/icons-material/Lightbulb';
import FanIcon        from '@mui/icons-material/Toys';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

export default function RoomControl() {
  const { roomId } = useParams();

  // State cho live sensor và device
  const [live,   setLive]   = useState({ temperature: '--', humidity: '--' });
  const [states, setStates] = useState({ light: 'off', fan: 'off' });
  // State giữ lịch sử các điểm đo
  const [history, setHistory] = useState([]);

  // Hàm fetch dữ liệu từ Pi (Flask)
 const fetchRoomData = async () => {
   try {
     const res = await fetch(
       `${process.env.REACT_APP_API_URL}/room/${roomId}`
     );
     if (!res.ok) throw new Error('Fetch failed');
     const json = await res.json();
     // cập nhật live sensor
     setLive({
       temperature: json.live_temp ?? '--',
       humidity:    json.live_hum  ?? '--'
     });
     // cập nhật trạng thái device
     setStates(json.device_states || {});
     // thêm một entry vào history
     setHistory(h => [
       ...h,
       {
         time: Date.now(),
         temperature: +json.live_temp,
         humidity: +json.live_hum
       }
     ].slice(-50)); // chỉ giữ lại 50 điểm gần nhất
   } catch (err) {
     console.error('Fetch room data error:', err);
   }
 };

   useEffect(() => {
    // fetch lần đầu
    fetchRoomData();

    // sau đó polling mỗi 5s
    const intervalId = setInterval(fetchRoomData, 5000);

    // cleanup khi unmount
    return () => clearInterval(intervalId);
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
              {/* Biểu đồ lịch sử */}
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardHeader title="Biểu đồ nhiệt độ & độ ẩm (real-time)" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  domain={['auto','auto']}
                  name="Thời gian"
                  tickFormatter={ts => new Date(ts).toLocaleTimeString()}
                  type="number"
                />
                <YAxis yAxisId="left" domain={['auto','auto']} name="°C" />
                <YAxis yAxisId="right" orientation="right" domain={[0,100]} name="%" />
                <Tooltip labelFormatter={ts => new Date(ts).toLocaleTimeString()} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temperature" 
                  dot={false} 
                  stroke="#ff5722" 
                  name="Nhiệt độ (°C)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="humidity" 
                  dot={false} 
                  stroke="#2196f3" 
                  name="Độ ẩm (%)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      </Grid>
    </Container>
  );
}
