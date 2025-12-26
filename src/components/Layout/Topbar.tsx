import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import { useAuth } from "../../auth/useAuth";

interface Props {
  drawerWidth: number;
}

export default function Topbar({ drawerWidth }: Props) {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201,
        ml: `${drawerWidth}px`,
        background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
        boxShadow: "0 4px 20px rgba(255, 153, 51, 0.3)"
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Box
            component="img"
            src="/kesari-logo.jpeg"
            alt="Kesari Dairy ERP Logo"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              mr: 2
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kesari Dairy ERP
          </Typography>
        </Box>

        <IconButton
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <AccountCircle />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              logout();
              setAnchorEl(null);
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
