import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Stack,
} from "@mui/material";

import { getUsers, deleteUser } from "../../api/users.api";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";

import Loader from "../../components/Loader";
import AppSnackbar from "../../components/AppSnackbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import UserForm from "./UserForm"; // ✅ FIX 1

interface User {
  id: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
}

export default function UserList() {
  const { state } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err: unknown) {
      setSnackbar({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await deleteUser(deleteId);
      setSnackbar({
        type: "success",
        message: "User deleted successfully",
      });
      await loadUsers();
    } catch (err: unknown) {
      setSnackbar({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete user",
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h6">Users</Typography>

        {hasPermission(state.permissions, "USER_CREATE") && (
          <Button
            variant="contained"
            onClick={() => {
              setEditId(undefined);
              setOpenForm(true);
            }}
          >
            Add User
          </Button>
        )}
      </Stack>

      {/* Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell width={180}>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {hasPermission(state.permissions, "USER_EDIT") && (
                      <Button
                        size="small"
                        onClick={() => {
                          setEditId(u.id);
                          setOpenForm(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}

                    {hasPermission(state.permissions, "USER_DELETE") && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(u.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Dialogs & Feedback */}
      <UserForm
        open={openForm}
        userId={editId}
        onClose={() => setOpenForm(false)}
        onSuccess={loadUsers}
      />

      <Loader open={loading} />

      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Are you sure you want to delete this user?"
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </Paper>
  );
}
