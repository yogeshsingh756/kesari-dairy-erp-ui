import { Backdrop, CircularProgress } from "@mui/material";

export default function Loader({ open }: { open: boolean }) {
  return (
    <Backdrop sx={{ zIndex: 1300 }} open={open}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
