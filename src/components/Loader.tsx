import { Backdrop, CircularProgress, Box, Typography, Paper, Avatar } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

interface LoaderProps {
  open: boolean;
  message?: string;
  size?: "small" | "medium" | "large";
  showLogo?: boolean;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledBackdrop = styled(Backdrop)(() => ({
  background: "rgba(255, 153, 51, 0.1)",
  backdropFilter: "blur(4px)",
  zIndex: 1400,
}));

const LoaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(255, 153, 51, 0.2)",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 153, 51, 0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  minWidth: 200,
}));

const AnimatedLogo = styled(Avatar)(() => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  boxShadow: "0 8px 24px rgba(255, 153, 51, 0.3)",
}));

export default function Loader({
  open,
  message = "Loading...",
  size = "medium",
  showLogo = true
}: LoaderProps) {
  const getSize = () => {
    switch (size) {
      case "small":
        return 40;
      case "large":
        return 80;
      default:
        return 60;
    }
  };

  if (!open) return null;

  return (
    <StyledBackdrop open={open}>
      <LoaderCard elevation={0}>
        {showLogo && (
          <AnimatedLogo
            src="/kesari-logo.jpeg"
            sx={{
              width: getSize(),
              height: getSize(),
            }}
          >
            K
          </AnimatedLogo>
        )}

        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            size={getSize() * 0.8}
            sx={{
              color: "#FF9933",
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: "#FF9933",
                fontWeight: 600,
                fontSize: size === "small" ? "0.7rem" : "0.875rem"
              }}
            >
              {Math.round(75)}%
            </Typography>
          </Box>
        </Box>

        <Typography
          variant={size === "small" ? "body2" : "body1"}
          sx={{
            color: "#E67E22",
            fontWeight: 500,
            textAlign: "center",
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#FF9933",
                animation: `${pulse} 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </LoaderCard>
    </StyledBackdrop>
  );
}
