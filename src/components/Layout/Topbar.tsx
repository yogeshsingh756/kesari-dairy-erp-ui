import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
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
      sx={{ zIndex: 1201, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Kesari Dairy ERP
        </Typography>

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
