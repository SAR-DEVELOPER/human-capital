"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  Divider,
  Grid2,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  FlightTakeoff as TravelIcon,
  Work as ProjectIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { SuratTugasService } from "../../../../lib/api/services/suratTugas";
import { SuratTugasDetailResponse } from "../../../../lib/types/suratTugas";
import Link from "next/link";
import { motion } from "framer-motion";
import { baseColors } from "../../../../lib/theme";

export default function SuratTugasValidationPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suratTugas, setSuratTugas] = useState<SuratTugasDetailResponse | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSuratTugas();
    }
  }, [id]);

  const fetchSuratTugas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SuratTugasService.getSuratTugasById(id);
      setSuratTugas(data);
      // Document is valid if it exists and is active
      setIsValid(data.masterDocumentList.isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch document");
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: indonesianLocale });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      DRAFT: "warning",
      ACTIVE: "success",
      COMPLETED: "primary",
      CANCELLED: "error",
    };
    return statusMap[status] || "default";
  };

  const getTypeIcon = (type: string) => {
    return type === "perjalanan_dinas" ? <TravelIcon /> : <ProjectIcon />;
  };

  const getTypeLabel = (type: string) => {
    return type === "perjalanan_dinas" ? "Perjalanan Dinas" : "Proyek";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: baseColors.lightGray,
          p: 3,
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Memvalidasi dokumen...
        </Typography>
      </Box>
    );
  }

  if (error || !suratTugas) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: baseColors.lightGray,
          p: 3,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <ErrorIcon sx={{ fontSize: 120, color: baseColors.errorRed, mb: 3 }} />
        </motion.div>
        <Typography variant="h4" gutterBottom fontWeight={600} color="error">
          Dokumen Tidak Valid
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, textAlign: "center" }}>
          {error || "Dokumen tidak ditemukan atau telah dihapus dari sistem."}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/surat-tugas")}
          sx={{
            bgcolor: baseColors.deepBlue,
            "&:hover": { bgcolor: baseColors.royalBlue },
          }}
        >
          Kembali ke Daftar Surat Tugas
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: baseColors.lightGray,
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        {/* Validation Status Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              background: isValid
                ? `linear-gradient(135deg, ${baseColors.successGreen}15 0%, ${baseColors.successGreen}05 100%)`
                : `linear-gradient(135deg, ${baseColors.errorRed}15 0%, ${baseColors.errorRed}05 100%)`,
              border: `2px solid ${isValid ? baseColors.successGreen : baseColors.errorRed}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              {isValid ? (
                <VerifiedIcon sx={{ fontSize: 48, color: baseColors.successGreen }} />
              ) : (
                <WarningIcon sx={{ fontSize: 48, color: baseColors.errorRed }} />
              )}
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {isValid ? "Dokumen Valid" : "Dokumen Tidak Aktif"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isValid
                    ? "Dokumen ini terverifikasi dan terdaftar dalam sistem SAR Tax & Management Consultant"
                    : "Dokumen ini tidak aktif atau telah dibatalkan"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Document Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <AssignmentIcon sx={{ fontSize: 32, color: baseColors.deepBlue }} />
              <Typography variant="h5" fontWeight={600}>
                Informasi Dokumen
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Nomor Dokumen
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {suratTugas.masterDocumentList.documentNumber}
                </Typography>
              </Grid2>



              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Nama Dokumen
                </Typography>
                <Typography variant="body1">{suratTugas.masterDocumentList.documentName}</Typography>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Tanggal Legal Dokumen
                </Typography>
                <Typography variant="body1">
                  {formatDate(suratTugas.masterDocumentList.documentLegalDate)}
                </Typography>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Jenis Penugasan
                </Typography>
                <Chip
                  icon={getTypeIcon(suratTugas.type)}
                  label={getTypeLabel(suratTugas.type)}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Grid2>
            </Grid2>
          </Paper>
        </motion.div>

        {/* Assignment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <DescriptionIcon sx={{ fontSize: 32, color: baseColors.deepBlue }} />
              <Typography variant="h5" fontWeight={600}>
                Detail Penugasan
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Nama Pekerjaan
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {suratTugas.namaPekerjaan}
                </Typography>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Deskripsi Pekerjaan
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {suratTugas.deskripsiPekerjaan}
                </Typography>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CalendarIcon sx={{ fontSize: 20, color: baseColors.deepBlue }} />
                  <Typography variant="caption" color="text.secondary">
                    Periode Pelaksanaan
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(suratTugas.tanggalMulai)} - {formatDate(suratTugas.tanggalSelesai)}
                </Typography>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 20, color: baseColors.deepBlue }} />
                  <Typography variant="caption" color="text.secondary">
                    Lokasi
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {suratTugas.lokasi}
                </Typography>
              </Grid2>
            </Grid2>
          </Paper>
        </motion.div>

        {/* Client Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <BusinessIcon sx={{ fontSize: 32, color: baseColors.deepBlue }} />
              <Typography variant="h5" fontWeight={600}>
                Informasi Klien
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Nama Klien
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {suratTugas.client.name}
                </Typography>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Grup
                </Typography>
                <Typography variant="body1">{suratTugas.client.group}</Typography>
              </Grid2>
            </Grid2>
          </Paper>
        </motion.div>

        {/* Signer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <PersonIcon sx={{ fontSize: 32, color: baseColors.deepBlue }} />
              <Typography variant="h5" fontWeight={600}>
                Penandatangan
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: baseColors.deepBlue,
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {suratTugas.signer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {suratTugas.signer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {suratTugas.signer.jobTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {suratTugas.signer.email}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Team Members (if available) */}
        {suratTugas.timPenugasan && suratTugas.timPenugasan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <PersonIcon sx={{ fontSize: 32, color: baseColors.deepBlue }} />
                <Typography variant="h5" fontWeight={600}>
                  Tim Penugasan
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid2 container spacing={2}>
                {suratTugas.timPenugasan.map((assignment) => (
                  <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={assignment.id}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: baseColors.skyBlue,
                              color: baseColors.deepBlue,
                              fontWeight: 600,
                            }}
                          >
                            {assignment.personnel.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {assignment.personnel.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {assignment.personnel.jobTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {assignment.personnel.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                            Peran dalam Penugasan
                          </Typography>
                          <Chip
                            label={assignment.role}
                            size="small"
                            sx={{
                              bgcolor: `${baseColors.lightOrange}`,
                              color: baseColors.burntOrange,
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid2>
                ))}
              </Grid2>
            </Paper>
          </motion.div>
        )}

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Informasi Sistem
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              ID Dokumen: {suratTugas.id}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              Terakhir Diperbarui: {formatDate(suratTugas.updatedAt)}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              Status Aktif: {suratTugas.masterDocumentList.isActive ? "Ya" : "Tidak"}
            </Typography>
          </Alert>
        </motion.div>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/surat-tugas")}
          >
            Kembali
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
