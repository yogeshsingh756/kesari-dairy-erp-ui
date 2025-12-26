import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";

interface Props {
  drawerWidth: number;
}

export default function Sidebar({ drawerWidth }: Props) {
  const navigate = useNavigate();
  const { state } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      <List>
        <ListItemButton onClick={() => navigate("/")}>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {hasPermission(state.permissions, "USER_VIEW") && (
          <ListItemButton onClick={() => navigate("/users")}>
            <ListItemText primary="Users" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "ROLE_VIEW") && (
          <ListItemButton onClick={() => navigate("/roles")}>
            <ListItemText primary="Roles" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "PERMISSION_VIEW") && (
          <ListItemButton onClick={() => navigate("/permissions")}>
            <ListItemText primary="Permissions" />
          </ListItemButton>
        )}
         {/* Product Types */}
        {hasPermission(state.permissions, "PRODUCT_TYPE_VIEW") && (
          <ListItemButton onClick={() => navigate("/product-types")}>
            <ListItemText primary="Product Types" />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );
}
