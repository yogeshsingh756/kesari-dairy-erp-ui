import { Button, Container, TextField, Typography, Box } from "@mui/material";
import { loginApi } from "../api/auth.api";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await loginApi(data);

      login({
        token: res.data.token,
        role: res.data.role,
        permissions: res.data.permissions,
      });

      navigate("/");
    } catch {
      alert("Invalid username or password");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={10}>
        <Typography variant="h5" align="center" mb={2}>
          Kesari Dairy ERP
        </Typography>

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={data.username}
          onChange={(e) =>
            setData({ ...data, username: e.target.value })
          }
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={submit}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
}
