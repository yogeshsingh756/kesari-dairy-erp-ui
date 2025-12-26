import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Chip,
  Stack,
  Box,
  Avatar,
} from "@mui/material";
import {
  VpnKey,
  Shield,
} from "@mui/icons-material";
import { getPermissions } from "../../api/permissions.api";
import Loader from "../../components/Loader";

interface Permission {
  id: number;
  permissionKey: string;
  permissionName: string;
}

interface PermissionGroup {
  moduleName: string;
  permissions: Permission[];
}

const getChipColor = (key: string) => {
  if (key.includes("VIEW")) return "info";
  if (key.includes("CREATE")) return "success";
  if (key.includes("EDIT")) return "warning";
  if (key.includes("DELETE")) return "error";
  return "default";
};

export default function PermissionList() {
  const [data, setData] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPermissions()
      .then((res) => setData(res.data))
      .catch((error) => console.error('Failed to load permissions:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #FFA500 0%, #CD853F 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <VpnKey />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Permission Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                View all system permissions and access levels
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {data.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <VpnKey sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No permissions found</Typography>
              <Typography variant="body2">
                Permissions will be displayed here
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {data.map((group) => (
                <Box
                  key={group.moduleName}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "grey.50"
                  }}
                >
                  {/* Module Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Shield sx={{ color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {group.moduleName}
                    </Typography>
                  </Box>

                  {/* Permissions */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {group.permissions.map((p) => (
                      <Chip
                        key={p.id}
                        label={p.permissionName}
                        color={getChipColor(p.permissionKey) as any}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      {/* Loading */}
      <Loader open={loading} message="Loading permissions..." />
    </Box>
  );
}
