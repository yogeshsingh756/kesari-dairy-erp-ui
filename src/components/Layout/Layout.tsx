import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

const drawerWidth = 240;

export default function Layout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Topbar drawerWidth={drawerWidth} />
      <Sidebar drawerWidth={drawerWidth} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        {/* 🔴 THIS MUST EXIST */}
        <Outlet />
      </Box>
    </Box>
  );
}
