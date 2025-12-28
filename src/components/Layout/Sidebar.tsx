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
          background: "linear-gradient(180deg, #FFF8F0 0%, #FFE5CC 100%)",
          borderRight: "1px solid #FFE5CC"
        },
      }}
    >
      <Toolbar />

      <List sx={{ p: 2 }}>
        {hasPermission(state.permissions, "DASHBOARD_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "USER_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/users")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Users" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "ROLE_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/roles")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Roles" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "PERMISSION_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/permissions")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #FFA500 0%, #CD853F 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Permissions" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "PRODUCT_TYPE_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/product-types")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Product Types" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "INGREDIENT_TYPE_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/ingredient-types")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Ingredient Types" />
          </ListItemButton>
        )}

        {hasPermission(state.permissions, "PRODUCTION_BATCH_VIEW") && (
          <ListItemButton
            onClick={() => navigate("/production-batches")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                background: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
                color: "white"
              }
            }}
          >
            <ListItemText primary="Production Batches" />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );
}
