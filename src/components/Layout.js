// src/components/Layout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box, CssBaseline,
  AppBar, Toolbar, Typography,
  Drawer, List, ListItemButton, ListItemIcon
} from '@mui/material';
import HomeIcon     from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 72;

export default function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1, bgcolor: '#90A4AE' }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Smart Home
          </Typography>
          <Typography>Trần Huy</Typography>
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#ECEFF1'
          }
        }}
      >
        <Toolbar />
        <List>
          {[
            { icon: <HomeIcon />,     to: '/' },
            { icon: <GridViewIcon />, to: '/room/room1' },
            { icon: <BarChartIcon />, to: '/room/room2' },
            { icon: <SettingsIcon />, to: '/' }
          ].map((item, i) => (
            <ListItemButton
              key={i}
              component={Link}
              to={item.to}
              sx={{ justifyContent: 'center' }}
            >
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* This is where SelectRoom or RoomControl will render */}
        <Outlet />
      </Box>
    </Box>
  );
}
