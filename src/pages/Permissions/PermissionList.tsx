import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  Box,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { getPermissions } from "../../api/permissions.api";

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

  useEffect(() => {
    getPermissions().then((res) => setData(res.data));
  }, []);

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" mb={2}>
        Permissions
      </Typography>

      <Stack spacing={2}>
        {data.map((group) => (
          <Box key={group.moduleName}>
            {/* Module Header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              mb={1}
            >
              <ShieldIcon color="primary" fontSize="small" />
              <Typography fontWeight={600}>
                {group.moduleName}
              </Typography>
            </Stack>

            {/* Permissions */}
            <Grid container spacing={1}>
              {group.permissions.map((p) => (
                <Grid key={p.id}>
                  <Chip
                    label={p.permissionName}
                    color={getChipColor(p.permissionKey)}
                    size="small"
                    variant="filled"
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
