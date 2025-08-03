// src/pages/SelectRoom.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import BedroomParentIcon from '@mui/icons-material/BedroomParent';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const rooms = [
  { id: 'room1', label: 'Phòng ngủ', icon: <BedroomParentIcon sx={{ fontSize: 60 }} /> },
  { id: 'room2', label: 'Phòng khách', icon: <MeetingRoomIcon sx={{ fontSize: 60 }} /> },
];

export default function SelectRoom() {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Chọn phòng
      </Typography>
      <Grid container spacing={4} justifyContent="center" alignItems="center">
        {rooms.map(({ id, label, icon }) => (
          <Grid key={id} item xs={10} sm={6} md={4} lg={3}>
            <Card sx={{ minHeight: 220 }} elevation={4}>
              <CardActionArea
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                onClick={() => navigate(`/room/${id}`)}
              >
                <Box>{icon}</Box>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {label}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
