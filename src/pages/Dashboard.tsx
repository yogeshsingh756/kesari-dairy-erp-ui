import { useEffect, useState } from "react";
import { Typography, Box, Card, CardContent, Avatar } from "@mui/material";
import { People, Security, VpnKey, Business, Factory, Inventory } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getStats } from "../api/common.api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    activeUsers: 0,
    activeRoles: 0,
    activePermissions: 0,
    productTypes: 0,
    ingredientTypes: 0,
    productionBatches: 0
  });

  const stats = [
    {
      title: "Total Users",
      value: statsData.activeUsers.toString(),
      icon: <People />,
      color: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
      iconBg: "#FF9933",
      route: "/users"
    },
    {
      title: "Active Roles",
      value: statsData.activeRoles.toString(),
      icon: <Security />,
      color: "linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)",
      iconBg: "#FF8C00",
      route: "/roles"
    },
    {
      title: "Permissions",
      value: statsData.activePermissions.toString(),
      icon: <VpnKey />,
      color: "linear-gradient(135deg, #FFA500 0%, #CD853F 100%)",
      iconBg: "#FFA500",
      route: "/permissions"
    },
    {
      title: "Product Types",
      value: statsData.productTypes.toString(),
      icon: <Business />,
      color: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
      iconBg: "#DAA520",
      route: "/product-types"
    },
    {
      title: "Ingredient Types",
      value: statsData.ingredientTypes.toString(),
      icon: <Inventory />,
      color: "linear-gradient(135deg, #9ACD32 0%, #6B8E23 100%)",
      iconBg: "#9ACD32",
      route: "/ingredient-types"
    },
    {
      title: "Production Batches",
      value: statsData.productionBatches.toString(),
      icon: <Factory />,
      color: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
      iconBg: "#FF6347",
      route: "/production-batches"
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStatsData(res.data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Manage Users",
      icon: <People sx={{ fontSize: 40, color: "#FF9933", mb: 1 }} />,
      route: "/users",
      hoverColor: "#FFF8F0",
      borderColor: "#FF9933"
    },
    {
      title: "Manage Roles",
      icon: <Security sx={{ fontSize: 40, color: "#FF8C00", mb: 1 }} />,
      route: "/roles",
      hoverColor: "#FFF5E6",
      borderColor: "#FF8C00"
    },
    {
      title: "View Permissions",
      icon: <VpnKey sx={{ fontSize: 40, color: "#FFA500", mb: 1 }} />,
      route: "/permissions",
      hoverColor: "#FFF9E6",
      borderColor: "#FFA500"
    },
    {
      title: "Product Types",
      icon: <Business sx={{ fontSize: 40, color: "#DAA520", mb: 1 }} />,
      route: "/product-types",
      hoverColor: "#FFFDF0",
      borderColor: "#DAA520"
    },
    {
      title: "Ingredient Types",
      icon: <Inventory sx={{ fontSize: 40, color: "#9ACD32", mb: 1 }} />,
      route: "/ingredient-types",
      hoverColor: "#F0FFF0",
      borderColor: "#9ACD32"
    },
    {
      title: "Production Batches",
      icon: <Factory sx={{ fontSize: 40, color: "#FF6347", mb: 1 }} />,
      route: "/production-batches",
      hoverColor: "#FFF5F5",
      borderColor: "#FF6347"
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1
          }}
        >
          Welcome to Kesari Dairy ERP
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your dairy operations efficiently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 6 }}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            onClick={() => navigate(stat.route)}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" },
              background: stat.color,
              color: "white",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.2)"
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: stat.iconBg,
                    width: 56,
                    height: 56,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              onClick={() => navigate(action.route)}
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(25% - 12px)" },
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #e0e0e0",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: action.borderColor,
                  bgcolor: action.hoverColor
                }
              }}
            >
              {action.icon}
              <Typography variant="h6">{action.title}</Typography>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
