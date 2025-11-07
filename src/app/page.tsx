"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  useTheme,
  Grid2,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as RecruitmentIcon,
  Assessment as PerformanceIcon,
  School as TrainingIcon,
  Payment as PayrollIcon,
  Event as AttendanceIcon,
  Assignment as TaskIcon,
  TrendingUp as AnalyticsIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  PersonSearch as EmployeeSearchIcon,
  Schedule as ScheduleIcon,
  WorkHistory as CareerIcon,
  LocalHospital as BenefitsIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Import ModuleCard component (using the one from your existing code)
interface ModuleItemProps {
  title: string;
  description: string;
  imagePath?: string;
  imageAlt?: string;
  urlTarget: string;
  icon: React.ReactNode;
  color: string;
  onClick: (urlTarget: string) => void;
  badge?: string;
  available?: boolean;
}

// Module Card Component
const ModuleCard: React.FC<ModuleItemProps> = ({
  title,
  description,
  imagePath,
  imageAlt,
  urlTarget,
  icon,
  color,
  onClick,
  badge = "Access",
  available = true,
}) => {
  const theme = useTheme();

  return (
    <motion.div whileHover={available ? { y: -5 } : {}} whileTap={available ? { scale: 0.98 } : {}}>
      <Paper
        onClick={() => available && onClick(urlTarget)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "visible",
          position: "relative",
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.08)",
          cursor: available ? "pointer" : "not-allowed",
          opacity: available ? 1 : 0.5,
          "&:hover": {
            boxShadow: available ? "0px 8px 25px rgba(0, 0, 0, 0.15)" : "0px 5px 15px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ pt: 5, px: 3, pb: 3, flexGrow: 1 }}>
          <Box sx={{ height: "70px" }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ mt: 1, fontWeight: "bold" }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: `${color}15`,
                color: color,
                fontWeight: "medium",
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
              }}
            >
              {badge}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Main Human Capital Hub Page
export default function HumanCapitalHub() {
  const theme = useTheme();
  const router = useRouter();

  // Handle module card clicks
  const handleModuleClick = (urlTarget: string) => {
    router.push(urlTarget);
  };

  // Human Capital module functionalities
  const hrModules = [
    {
      title: "Surat Tugas",
      description: "Manage surat tugas",
      urlTarget: "/surat-tugas",
      icon: <PeopleIcon />,
      color: "#1976d2",
      badge: "Core",
      available: true,
    },
    {
      title: "Employee Management",
      description: "Manage employee profiles, data, and records",
      urlTarget: "/division/human-capital/employees",
      icon: <PeopleIcon />,
      color: "#1976d2",
      badge: "Core",
      available: false,
    },
    {
      title: "Recruitment",
      description: "Manage job postings, candidates, and hiring process",
      urlTarget: "/division/human-capital/recruitment",
      icon: <RecruitmentIcon />,
      color: "#388e3c",
      badge: "Hiring",
      available: false,
    },
    {
      title: "Performance Management",
      description: "Track and evaluate employee performance",
      urlTarget: "/division/human-capital/performance",
      icon: <PerformanceIcon />,
      color: "#7b1fa2",
      badge: "Review",
      available: false,
    },
    {
      title: "Training & Development",
      description: "Manage training programs and employee development",
      urlTarget: "/division/human-capital/training",
      icon: <TrainingIcon />,
      color: "#f57c00",
      badge: "Learning",
      available: false,
    },
    {
      title: "Payroll Management",
      description: "Process payroll, benefits, and compensation",
      urlTarget: "/division/human-capital/payroll",
      icon: <PayrollIcon />,
      color: "#2e7d32",
      badge: "Finance",
      available: false,
    },
    {
      title: "Attendance & Leave",
      description: "Track attendance, leave requests, and schedules",
      urlTarget: "/division/human-capital/attendance",
      icon: <AttendanceIcon />,
      color: "#0288d1",
      badge: "Time",
      available: false,
    },
    {
      title: "Employee Self-Service",
      description: "Employee portal for personal information and requests",
      urlTarget: "/division/human-capital/self-service",
      icon: <BadgeIcon />,
      color: "#5c6bc0",
      badge: "Portal",
      available: false,
    },
    {
      title: "HR Analytics",
      description: "View HR metrics, reports, and insights",
      urlTarget: "/division/human-capital/analytics",
      icon: <AnalyticsIcon />,
      color: "#d32f2f",
      badge: "Insights",
      available: false,
    },
    {
      title: "Career Development",
      description: "Manage career paths and succession planning",
      urlTarget: "/division/human-capital/career",
      icon: <CareerIcon />,
      color: "#e64a19",
      badge: "Growth",
      available: false,
    },
    {
      title: "Benefits Administration",
      description: "Manage employee benefits and wellness programs",
      urlTarget: "/division/human-capital/benefits",
      icon: <BenefitsIcon />,
      color: "#00838f",
      badge: "Wellness",
      available: false,
    },
    {
      title: "Team Management",
      description: "Organize teams, departments, and reporting structures",
      urlTarget: "/division/human-capital/teams",
      icon: <TeamIcon />,
      color: "#3c5a96",
      badge: "Structure",
      available: false,
    },
    {
      title: "HR Settings",
      description: "Configure HR policies, workflows, and preferences",
      urlTarget: "/division/human-capital/settings",
      icon: <SettingsIcon />,
      color: "#607d8b",
      badge: "Config",
      available: false,
    },
  ];

  // HR Dashboard Stats Data
  const hrStats = [
    {
      title: "Total Employees",
      value: "247",
      color: theme.palette.primary.main,
    },
    {
      title: "New Hires (This Month)",
      value: "8",
      color: theme.palette.success.main,
    },
    {
      title: "Pending Leave Requests",
      value: "15",
      color: theme.palette.warning.main,
    },
    {
      title: "Performance Reviews Due",
      value: "12",
      color: theme.palette.error.main,
    },
  ];

  return (
    <Box sx={{ pb: 5 }}>
      {/* Main Content */}
      <Box sx={{ px: 3, py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "medium", mb: 1 }}>
            Human Capital Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your organization's most valuable asset - your people
          </Typography>
        </Box>

        {/* HR Quick Stats */}
        <Grid2 container spacing={3} sx={{ mb: 4 }}>
          {/* {hrStats.map((stat, index) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "40%",
                    height: "100%",
                    background: `linear-gradient(45deg, transparent 45%, ${stat.color}25 45%)`,
                    zIndex: 0,
                  }}
                />
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: stat.color, fontWeight: "bold" }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold" }}>
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      textTransform: "none",
                      color: stat.color,
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    View Details
                  </Typography>
                </Box>
              </Paper>
            </Grid2>
          ))} */}
        </Grid2>

        {/* HR Modules */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "medium" }}>
          Human Capital Functions
        </Typography>
        <Grid2 container spacing={3}>
          {hrModules.map((module, index) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <ModuleCard
                {...module}
                onClick={handleModuleClick}
                imagePath=""
                imageAlt=""
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </Box>
  );
}
