import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getRoles, deleteRole } from "../../api/roles.api";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";
import RoleForm from "./RoleForm";

interface Role {
  id: string;
  roleName: string;
  description: string;
}

export default function RoleList() {
  const { state } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const loadRoles = async () => {
    const res = await getRoles();
    setRoles(res.data);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const onEdit = (id: string) => {
    setEditId(id);
    setOpenForm(true);
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    await deleteRole(id);
    loadRoles();
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Roles</Typography>

        {hasPermission(state.permissions, "ROLE_CREATE") && (
          <Button
            variant="contained"
            onClick={() => {
              setEditId(undefined);
              setOpenForm(true);
            }}
          >
            Add Role
          </Button>
        )}
      </Stack>

      {/* Roles Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Role Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell width={120}>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No roles found
              </TableCell>
            </TableRow>
          ) : (
            roles.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.roleName}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>
                  {hasPermission(state.permissions, "ROLE_EDIT") && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(r.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}

                  {hasPermission(state.permissions, "ROLE_DELETE") && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(r.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Role Form */}
      <RoleForm
        open={openForm}
        roleId={editId}
        onClose={() => setOpenForm(false)}
        onSuccess={loadRoles}
      />
    </Paper>
  );
}
