"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSuratTugasFromForm, saveQRCodeImage } from "../../../lib/utils/docxGenerator";
import type { TeamMember, SuratTugasFormData, SuratTugasProject, SuratTugasDBData } from "../../../lib/types/suratTugas";
import { SuratTugasService } from "../../../lib/api/services/suratTugas";
import UserInfoSidebar from "../../components/ui/UserInfoSidebar";
import {
    Box,
    Typography,
    Breadcrumbs,
    Link as MuiLink,
    Paper,
    Button,
    IconButton,
    useTheme,
    Grid2,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardActions,
    Fab,
    Badge,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete,
    Divider,
    Switch,
    Alert,
    Collapse,
    LinearProgress,
    AvatarGroup,
    ThemeProvider,
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    FlightTakeoff as TravelIcon,
    Work as ProjectIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    AttachMoney as MoneyIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckIcon,
    CheckCircleOutline as CheckCircleIcon,
    PendingActions as PendingIcon,
    Cancel as CancelIcon,
    Send as SendIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon,
    Business as CompanyIcon,
    LocalHotel as HotelIcon,
    Restaurant as MealIcon,
    LocalGasStation as TransportIcon,
    ExpandMore as ExpandMoreIcon,
    Refresh as RefreshIcon,
    GetApp as DownloadIcon,
    Print as PrintIcon,
    StarBorder as StarIcon,
    Schedule as ScheduleIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { createNewTheme, baseColors, customColors } from "../../../lib/theme";
import DocumentPersonnelModal from "../../modules/base/documents/components/DocumentPersonnelModal";
import { Identity, IdentityService } from "../../../lib/api/services/identity";
import { ClientBrowserModal } from "../../components/ui/ClientBrowser";
import { Client } from "../../../lib/api/types/client";

function SuratTugasPageContent() {
    const theme = useTheme();
    const router = useRouter();

    // Main view state
    const [currentView, setCurrentView] = useState<"management" | "create">("management");

    // Management view state
    const [suratTugasList, setSuratTugasList] = useState<SuratTugasProject[]>([]);
    const [suratTugasLoading, setSuratTugasLoading] = useState(false);
    const [suratTugasError, setSuratTugasError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [jenisFilter, setJenisFilter] = useState<string>("all");
    const [selectedSuratTugas, setSelectedSuratTugas] = useState<SuratTugasProject | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Create form state
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<SuratTugasFormData>({
        jenis: "",
        judul: "",
        deskripsi: "",
        petugas: [],
        penandatangan: null,
        tanggal_surat: new Date(), // Initialize with current date
        tanggal_mulai: null,
        tanggal_selesai: null,
        lokasi: "",
        klien: null,
        catatan: "",
        prioritas: "medium",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jenisError, setJenisError] = useState<string>("");

    // Client browser modal state
    const [clientBrowserModalOpen, setClientBrowserModalOpen] = useState(false);

    // Personnel modal state
    const [personnelModalOpen, setPersonnelModalOpen] = useState(false);
    const [availablePersonnel, setAvailablePersonnel] = useState<Identity[]>([]);
    const [personnelLoading, setPersonnelLoading] = useState(false);
    const [personnelError, setPersonnelError] = useState("");
    const [personnelSearchQuery, setPersonnelSearchQuery] = useState("");

    // Signing authority modal state
    const [signingAuthorityModalOpen, setSigningAuthorityModalOpen] = useState(false);

    // Current user state
    const [currentUserId, setCurrentUserId] = useState<string>("");

    // Load current user profile
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // Use Next.js API route to avoid CORS issues
                const res = await fetch('/api/auth/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    const identity = data.identity || {};
                    setCurrentUserId(identity.id || "");
                }
            } catch (error) {
                console.error('Failed to load current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // Load surat tugas data
    const loadSuratTugasData = async () => {
        setSuratTugasLoading(true);
        setSuratTugasError(null);
        try {
            const data = await SuratTugasService.getAllSuratTugas();
            setSuratTugasList(data);
        } catch (error) {
            setSuratTugasError(error instanceof Error ? error.message : 'Failed to load surat tugas');
            console.error('Error loading surat tugas:', error);
        } finally {
            setSuratTugasLoading(false);
        }
    };

    // Load surat tugas on mount
    useEffect(() => {
        loadSuratTugasData();
    }, []);

    // Load personnel data
    const loadPersonnel = async () => {
        setPersonnelLoading(true);
        setPersonnelError("");
        try {
            const personnel = await IdentityService.getPersonnel();
            setAvailablePersonnel(personnel);
        } catch (error) {
            setPersonnelError(error instanceof Error ? error.message : "Failed to load personnel");
        } finally {
            setPersonnelLoading(false);
        }
    };

    // Handle personnel search
    const handlePersonnelSearch = (query: string) => {
        setPersonnelSearchQuery(query);
        // Filter already loaded personnel
        // In a real implementation, you might want to make an API call with search query
    };

    // Handle personnel selection
    const handlePersonnelSelect = (person: Identity) => {
        // Convert Identity to TeamMember format
        const teamMember: TeamMember = {
            id: person.id,
            name: person.name,
            email: person.email,
            username: person.username,
            role: person.role,
            avatar: person.avatar,
            position: person.role, // Use role as position for now
            jobTitle: (person as any).jobTitle, // Get jobTitle from fetched data
        };

        // Check if already selected
        if (!formData.petugas.some(p => p.id === person.id)) {
            setFormData({
                ...formData,
                petugas: [...formData.petugas, teamMember]
            });
        }
        setPersonnelModalOpen(false);
    };

    // Remove personnel from selection
    const removePersonnel = (personId: string) => {
        setFormData({
            ...formData,
            petugas: formData.petugas.filter(p => p.id !== personId)
        });
    };

    // Update assignment role for specific personnel
    const updatePersonnelRole = (personId: string, assignmentRole: string) => {
        setFormData({
            ...formData,
            petugas: formData.petugas.map(p =>
                p.id === personId
                    ? { ...p, assignmentRole }
                    : p
            )
        });
    };

    // Handle signing authority selection
    const handleSigningAuthoritySelect = (person: Identity) => {
        // Convert Identity to TeamMember format
        const signingAuthority: TeamMember = {
            id: person.id,
            name: person.name,
            email: person.email,
            username: person.username,
            role: person.role,
            avatar: person.avatar,
            position: person.role,
            jobTitle: (person as any).jobTitle, // Get jobTitle from fetched data
        };

        setFormData({
            ...formData,
            penandatangan: signingAuthority
        });
        setSigningAuthorityModalOpen(false);
    };

    // Handle client selection
    const handleClientSelect = (client: Client) => {
        setFormData({
            ...formData,
            klien: client
        });
        setClientBrowserModalOpen(false);
    };

    // Filter personnel based on search query
    const filteredPersonnel = availablePersonnel.filter(person =>
        person.name.toLowerCase().includes(personnelSearchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(personnelSearchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(personnelSearchQuery.toLowerCase())
    );

    // Filter data
    const filteredSuratTugas = suratTugasList.filter((item) => {
        const matchesSearch = item.namaPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.masterDocumentList.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.client.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.masterDocumentList.documentStatus.toLowerCase() === statusFilter;
        const matchesJenis = jenisFilter === "all" || item.type === jenisFilter;

        return matchesSearch && matchesStatus && matchesJenis;
    });

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft": return theme.palette.grey[500];
            case "active": return theme.palette.primary.main;
            case "completed": return theme.palette.success.main;
            case "cancelled": return theme.palette.error.main;
            default: return theme.palette.grey[500];
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "low": return theme.palette.info.main;
            case "medium": return theme.palette.warning.main;
            case "high": return theme.palette.error.main;
            case "urgent": return "#d32f2f";
            default: return theme.palette.grey[500];
        }
    };

    // Form steps
    const formSteps = [
        {
            label: "Jenis & Informasi Dasar",
            content: "Pilih jenis surat tugas dan informasi dasar"
        },
        {
            label: "Detail Tugas",
            content: "Isi detail tugas dan jadwal"
        },
        {
            label: "Petugas & Tim",
            content: "Pilih petugas yang akan ditugaskan"
        },
        {
            label: "Penandatangan",
            content: "Pilih petugas yang bertanggung jawab menandatangani"
        },
        {
            label: "Review & Submit",
            content: "Review informasi dan kirim surat tugas"
        }
    ];

    // Generate HTML template with filled data
    const generateSuratTugasHTML = async (customFormData?: any) => {
        const dataToUse = customFormData || formData;

        // Get current date info
        const now = new Date();
        const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        const bulanRomawi = months[now.getMonth()];
        const tahun = now.getFullYear().toString();
        const tanggalSurat = now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Generate sequential number
        const nomorUrut = String(suratTugasList.length + 1).padStart(3, '0');

        // Format dates
        const formatTanggal = (date: Date | null) => {
            if (!date) return '';
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        };

        const tanggalMulaiFormatted = formatTanggal(dataToUse.tanggal_mulai);
        const tanggalSelesaiFormatted = formatTanggal(dataToUse.tanggal_selesai);
        const hariTanggal = dataToUse.tanggal_mulai && dataToUse.tanggal_selesai
            ? `${tanggalMulaiFormatted} s/d ${tanggalSelesaiFormatted}`
            : tanggalMulaiFormatted || tanggalSelesaiFormatted;

        // Prepare staff rows for table - let all rows render naturally
        const staffRows = dataToUse.petugas.map((petugas: TeamMember, index: number) =>
            `<tr>
                <td class="col-no">${index + 1}</td>
                <td>${petugas.name}</td>
                <td>${petugas.assignmentRole || petugas.position || petugas.role}</td>
            </tr>`
        ).join('');

        // Load the template file
        try {
            const response = await fetch('/templates/surat_tugas.html');
            let htmlTemplate = await response.text();

            // Replace placeholders with actual data
            htmlTemplate = htmlTemplate
                .replace(/{{NOMOR}}/g, nomorUrut)
                .replace(/{{BULAN_ROMAWI}}/g, bulanRomawi)
                .replace(/{{TAHUN}}/g, tahun)
                .replace(/{{TANGGAL_SURAT}}/g, tanggalSurat)
                .replace(/{{PERIHAL}}/g, dataToUse.jenis === "proyek" ? "Proyek" : "Perjalanan Dinas")
                .replace(/{{URAIAN_PEKERJAAN}}/g, dataToUse.deskripsi || '')
                .replace(/{{NAMA_KLIEN}}/g, dataToUse.klien?.name || dataToUse.klien || '')
                .replace(/{{TEMPAT}}/g, dataToUse.lokasi || 'Kantor SAR')
                .replace(/{{HARI_TANGGAL}}/g, hariTanggal);

            // Replace the staff table body with dynamic rows
            htmlTemplate = htmlTemplate.replace(
                /<tbody>[\s\S]*?<\/tbody>/,
                `<tbody>\n          ${staffRows}\n        </tbody>`
            );

            // Replace signature section with dynamic data (if provided)
            const signingAuthority = dataToUse.penandatangan || null;
            if (signingAuthority) {
                htmlTemplate = htmlTemplate.replace(
                    /<div class="sign-wrap keep-together">[\s\S]*?<\/div>\s*<\/div>/,
                    `<div class="sign-wrap keep-together">
        <div class="sign">
          <div class="org">SAR Tax &amp; Management Consultant</div>
          <div class="spacer"><!-- ruang tanda tangan --></div>
          <div class="name">${signingAuthority.name}</div>
          <div class="ids">
            ${(signingAuthority as any).jobTitle || signingAuthority.role || ''}<br/>
            ${signingAuthority.email || ''}
          </div>
        </div>
      </div>`
                );
            }

            // Add print controls to the template
            if (!htmlTemplate.includes('print-controls')) {
                const printControlsStyles = `
    /* Print button */
    .print-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
    }
    .print-btn {
      background: #2196F3;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .print-btn:hover {
      background: #1976D2;
    }
    .close-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .close-btn:hover {
      background: #d32f2f;
    }`;

                htmlTemplate = htmlTemplate.replace('</style>', printControlsStyles + '\n  </style>');

                const printControls = `
  <div class="print-controls no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Print</button>
    <button class="close-btn" onclick="window.close()">✕ Close</button>
  </div>
  `;

                htmlTemplate = htmlTemplate.replace('<body>', '<body>\n' + printControls);
            }

            return htmlTemplate;
        } catch (error) {
            console.error('Error loading template:', error);
            // Fallback to a basic template if loading fails
            return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Surat Tugas - Error</title>
</head>
<body>
  <p>Error loading template. Please try again.</p>
</body>
</html>`;
        }
    };

    // Open HTML template in new window
    const openPrintWindow = async () => {
        const htmlContent = await generateSuratTugasHTML();
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
        } else {
            alert('Popup blocked! Please allow popups for this site to print the document.');
        }
    };

    // Generate and download DOCX
    const generateAndDownloadDOCX = async (customFormData?: SuratTugasFormData) => {
        try {
            const dataToUse = customFormData || formData;

            // Validate required dates
            if (!dataToUse.tanggal_surat || !dataToUse.tanggal_mulai || !dataToUse.tanggal_selesai) {
                alert('Tanggal surat, tanggal mulai, dan tanggal selesai harus diisi');
                return;
            }

            // Generate Nomor based on tanggal_surat
            const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            const bulanRomawi = months[dataToUse.tanggal_surat.getMonth()];
            const tahun = dataToUse.tanggal_surat.getFullYear();

            // Get current number from API (month is 1-indexed in API, 0-indexed in JS Date)
            const bulanAngka = dataToUse.tanggal_surat.getMonth() + 1;
            const currentNumber = await SuratTugasService.getCurrentNumber(bulanAngka, tahun);
            const nomorUrut = String(currentNumber).padStart(3, '0');
            console.log('nomorUrut', nomorUrut);
            const generatedNomor = `${nomorUrut}/STg/HC-SAR/${bulanRomawi}/${tahun}`;
            console.log('generatedNomor', generatedNomor);

            // Validate required fields for backend
            if (!dataToUse.klien?.id) {
                alert('Klien harus dipilih');
                return;
            }
            if (!dataToUse.penandatangan?.id) {
                alert('Penandatangan harus dipilih');
                return;
            }

            // Prepare data for database submission (matches CreateSuratTugasDto)
            const DBData: SuratTugasDBData = {
                masterDocumentListId: generatedNomor, // Using generated nomor as document ID
                namaPekerjaan: dataToUse.judul,
                deskripsiPekerjaan: dataToUse.deskripsi,
                tanggalMulai: dataToUse.tanggal_mulai.toISOString().split('T')[0],
                tanggalSelesai: dataToUse.tanggal_selesai.toISOString().split('T')[0],
                lokasi: dataToUse.lokasi,
                clientId: String(dataToUse.klien.id),
                type: dataToUse.jenis,
                signerId: dataToUse.penandatangan.id,
                tanggalSuratTugas: dataToUse.tanggal_surat.toISOString().split('T')[0],
                createdBy: currentUserId,
                timPenugasan: dataToUse.petugas.map(p => ({
                    personnelId: p.id,
                    role: p.assignmentRole || p.jobTitle || p.position || p.role || ""
                }))
            }

            console.log('=== Surat Tugas Data ===');
            console.log('DBData (for API submission):', DBData);
            console.log('Document will render with:');
            console.log('  - Client Name:', dataToUse.klien?.name);
            console.log('  - Personnel:', dataToUse.petugas.map(p => p.name).join(', '));
            console.log('  - Signer:', dataToUse.penandatangan?.name);
            console.log('========================');

            // Submit to backend API - MUST succeed to get document ID for QR
            let url_verify = '';
            let qrCodePath = '';
            let documentId = '';

            try {
                console.log('Submitting surat tugas to backend...');
                const createResponse = await SuratTugasService.createSuratTugas(DBData);
                console.log('Backend submission successful:', createResponse);

                documentId = createResponse.id;

                // Build verification URL (frontend URL, not API URL)
                url_verify = `${window.location.origin}/surat-tugas/${documentId}`;
                console.log('Verification URL:', url_verify);

                // STEP 1: Generate and save QR code FIRST (before DOCX)
                try {
                    console.log('🔄 Step 1/2: Generating and saving QR code...');
                    qrCodePath = await saveQRCodeImage(url_verify, documentId);
                    console.log('✅ QR code saved successfully to:', qrCodePath);
                } catch (qrError) {
                    console.error('❌ Failed to save QR code:', qrError);
                    alert(`Warning: QR code generation failed: ${qrError instanceof Error ? qrError.message : 'Unknown error'}\n\nDocument will be created without QR code.`);
                    qrCodePath = ''; // Empty path = no QR in document
                }

                alert(`Surat Tugas berhasil dibuat! ID: ${documentId}\n\nURL Verifikasi:\n${url_verify}\n\nQR Code: ${qrCodePath || 'Not generated'}`);
            } catch (apiError) {
                console.error('Failed to submit to backend:', apiError);
                alert(`Gagal menyimpan ke database: ${apiError instanceof Error ? apiError.message : 'Unknown error'}\n\nTidak dapat melanjutkan ke DOCX generation.`);
                return; // STOP - can't generate DOCX without document ID
            }

            // STEP 2: Generate DOCX with embedded QR code
            console.log('🔄 Step 2/2: Generating DOCX with QR code...');
            console.log('QR code path to embed:', qrCodePath);

            await generateSuratTugasFromForm(
                dataToUse,
                dataToUse.tanggal_surat,
                {
                    documentNumber: nomorUrut,
                    autoDownload: true,
                    verificationUrl: qrCodePath // Pass QR code file path (e.g., "/images/qrst/abc-123.png")
                },
            );

            console.log('✅ DOCX generated successfully!');
            alert('Surat Tugas berhasil dibuat dan diunduh!');
            window.location.reload();

        } catch (error) {
            console.error('Error generating DOCX:', error);
            alert('Failed to generate DOCX file. Please try again.');
        }
    };

    // Render management view
    const renderManagementView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header with stats */}
            <Grid2 container spacing={3} sx={{ mb: 4 }}>
                {/* Hero Total Card */}
                <Grid2 size={{ xs: 12, md: 5 }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card elevation={0} sx={{
                            height: "100%",
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${baseColors.deepBlue} 0%, ${baseColors.royalBlue} 50%, ${baseColors.vibrantOrange} 100%)`,
                            border: `2px solid ${baseColors.royalBlue}`,
                            transition: "all 0.3s ease-in-out",
                            position: "relative",
                            overflow: "hidden",
                            "&:hover": {
                                boxShadow: `0 8px 32px ${baseColors.royalBlue}40`,
                                transform: "translateY(-4px)",
                            },
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                                backgroundSize: "200% 200%",
                                animation: "shimmer 3s infinite",
                            },
                            "@keyframes shimmer": {
                                "0%": { backgroundPosition: "0% 0%" },
                                "100%": { backgroundPosition: "200% 200%" },
                            }
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                                    <Box>
                                        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", mb: 1, fontWeight: "medium" }}>
                                            Total Surat Tugas
                                        </Typography>
                                        <Typography variant="h2" sx={{ fontWeight: "bold", color: "white", fontSize: "3.5rem", lineHeight: 1 }}>
                                            {suratTugasList.length}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
                                            Dokumen aktif dalam sistem
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        backdropFilter: "blur(10px)",
                                        border: "2px solid rgba(255,255,255,0.3)",
                                    }}>
                                        <AssignmentIcon sx={{ fontSize: 48, color: "white" }} />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid2>

                {/* Secondary Stats */}
                {[
                    {
                        label: "Perjalanan Dinas",
                        value: suratTugasList.filter(s => s.type === "perjalanan_dinas").length,
                        color: theme.palette.info.main,
                        icon: <TravelIcon />
                    },
                    {
                        label: "Proyek",
                        value: suratTugasList.filter(s => s.type === "proyek").length,
                        color: theme.palette.success.main,
                        icon: <ProjectIcon />
                    },
                ].map((stat, index) => (
                    <Grid2 size={{ xs: 12, sm: 6, md: 3.5 }} key={index}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card elevation={0} sx={{
                                height: "100%",
                                borderRadius: 3,
                                background: `linear-gradient(45deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
                                border: `1px solid ${stat.color}30`,
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    border: `1px solid ${stat.color}50`,
                                    boxShadow: `0 4px 20px ${stat.color}20`,
                                }
                            }}>
                                <CardContent sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <Box>
                                            <Typography variant="h3" sx={{ fontWeight: "bold", color: stat.color }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: "50%",
                                            backgroundColor: `${stat.color}15`,
                                            color: stat.color
                                        }}>
                                            {stat.icon}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid2>
                ))}
            </Grid2>

            {/* Filters and Search */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Cari surat tugas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="all">Semua Status</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="active">Aktif</MenuItem>
                                <MenuItem value="completed">Selesai</MenuItem>
                                <MenuItem value="cancelled">Dibatalkan</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Jenis</InputLabel>
                            <Select
                                value={jenisFilter}
                                label="Jenis"
                                onChange={(e) => setJenisFilter(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="all">Semua Jenis</MenuItem>
                                <MenuItem value="proyek">Proyek</MenuItem>
                                <MenuItem value="perjalanan_dinas">Perjalanan Dinas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Tooltip title="Refresh Data">
                                <IconButton
                                    onClick={loadSuratTugasData}
                                    disabled={suratTugasLoading}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.action.hover,
                                        "&:hover": { backgroundColor: theme.palette.action.selected }
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export Data">
                                <IconButton
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.action.hover,
                                        "&:hover": { backgroundColor: theme.palette.action.selected }
                                    }}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid2>
                </Grid2>
            </Paper>

            {/* Surat Tugas Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                {suratTugasLoading && (
                    <Box sx={{ p: 3 }}>
                        <LinearProgress />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                            Loading surat tugas...
                        </Typography>
                    </Box>
                )}
                {suratTugasError && (
                    <Alert severity="error" sx={{ m: 3 }}>
                        {suratTugasError}
                    </Alert>
                )}
                {!suratTugasLoading && !suratTugasError && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{
                                    background: `linear-gradient(90deg, ${baseColors.lightBlue} 0%, ${baseColors.paleOrange} 100%)`,
                                }}>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Nomor</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Judul</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Jenis</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Petugas</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Jadwal</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Lokasi</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", color: baseColors.deepBlue }}>Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSuratTugas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Tidak ada surat tugas
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSuratTugas.map((item) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ backgroundColor: baseColors.lightBlue }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                    {item.masterDocumentList.documentNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                        {item.namaPekerjaan}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.client.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={item.type === "proyek" ? <ProjectIcon /> : <TravelIcon />}
                                                    label={item.type === "proyek" ? "Proyek" : "Perjalanan Dinas"}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: item.type === "proyek" ? baseColors.lightBlue : baseColors.lightOrange,
                                                        color: item.type === "proyek" ? baseColors.deepBlue : baseColors.burntOrange,
                                                        fontWeight: "medium",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <AvatarGroup max={3} sx={{ justifyContent: "flex-start" }}>
                                                    {item.timPenugasan && item.timPenugasan.length > 0 ? (
                                                        item.timPenugasan.map((assignment) => (
                                                            <Tooltip
                                                                key={assignment.id}
                                                                title={`${assignment.personnel.name} - ${assignment.role}`}
                                                            >
                                                                <Avatar
                                                                    sx={{ width: 32, height: 32 }}
                                                                >
                                                                    {assignment.personnel.name.charAt(0)}
                                                                </Avatar>
                                                            </Tooltip>
                                                        ))
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">-</Typography>
                                                    )}
                                                </AvatarGroup>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">
                                                        {new Date(item.tanggalMulai).toLocaleDateString()} -
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {new Date(item.tanggalSelesai).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.masterDocumentList.documentStatus.charAt(0).toUpperCase() + item.masterDocumentList.documentStatus.slice(1).toLowerCase()}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(item.masterDocumentList.documentStatus.toLowerCase())}20`,
                                                        color: getStatusColor(item.masterDocumentList.documentStatus.toLowerCase()),
                                                        fontWeight: "medium"
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {item.lokasi || "-"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                                    <Tooltip title="View/Edit/Print features coming soon">
                                                        <IconButton size="small" disabled>
                                                            <ViewIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </motion.tr>
                                    )))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </motion.div>
    );

    // Render create form
    const renderCreateForm = () => (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
        >
            <Grid2 container spacing={3}>
                {/* Main Form */}
                <Grid2 size={{ xs: 12, lg: 9 }}>
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box sx={{
                            p: 3,
                            background: `linear-gradient(135deg, ${baseColors.deepBlue} 0%, ${baseColors.royalBlue} 100%)`,
                            color: "white",
                            borderRadius: "12px 12px 0 0"
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                                Buat Surat Tugas Baru
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Buat surat tugas untuk proyek atau perjalanan dinas
                            </Typography>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {formSteps.map((step, index) => (
                                    <Step key={index}>
                                        <StepLabel>
                                            <Typography variant="h6">{step.label}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {step.content}
                                            </Typography>
                                        </StepLabel>
                                        <StepContent>
                                            {/* Step Content */}
                                            {index === 0 && (
                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                    <Grid2 container spacing={3}>
                                                        <Grid2 size={{ xs: 12 }}>
                                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                                                                Pilih Jenis Surat Tugas
                                                            </Typography>
                                                            <RadioGroup
                                                                value={formData.jenis}
                                                                onChange={(e) => {
                                                                    setFormData({ ...formData, jenis: e.target.value as "proyek" | "perjalanan_dinas" });
                                                                    setJenisError(""); // Clear error when selection is made
                                                                }}
                                                            >
                                                                <FormControlLabel
                                                                    value="proyek"
                                                                    control={<Radio />}
                                                                    label={
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                            <ProjectIcon />
                                                                            <Box>
                                                                                <Typography variant="body1">Proyek</Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Surat tugas untuk pelaksanaan proyek tertentu
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    }
                                                                />
                                                                <FormControlLabel
                                                                    value="perjalanan_dinas"
                                                                    control={<Radio />}
                                                                    label={
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                            <TravelIcon />
                                                                            <Box>
                                                                                <Typography variant="body1">Perjalanan Dinas</Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Surat tugas untuk perjalanan dinas keluar kota/negeri
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    }
                                                                />
                                                            </RadioGroup>
                                                            {jenisError && (
                                                                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                                                                    {jenisError}
                                                                </Typography>
                                                            )}
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12 }}>
                                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                                <DatePicker
                                                                    label="Tanggal Surat"
                                                                    value={formData.tanggal_surat}
                                                                    onChange={(date) => setFormData({ ...formData, tanggal_surat: date })}
                                                                    sx={{ width: "100%" }}
                                                                    slotProps={{
                                                                        textField: {
                                                                            helperText: "Tanggal pembuatan surat tugas"
                                                                        }
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12 }}>
                                                            <TextField
                                                                fullWidth
                                                                label="perihal Surat Tugas"
                                                                value={formData.judul}
                                                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                                                placeholder="Masukkan perihal surat tugas"
                                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                            />
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12 }}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={4}
                                                                label="Deskripsi Singkat Pekerjaan"
                                                                value={formData.deskripsi}
                                                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                                                placeholder="Jelaskan secara singkat tugas yang akan dilaksanakan"
                                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                            />
                                                        </Grid2>
                                                    </Grid2>
                                                </Box>
                                            )}

                                            {index === 1 && (
                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                    <Grid2 container spacing={3}>
                                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                                <DatePicker
                                                                    label="Tanggal Mulai"
                                                                    value={formData.tanggal_mulai}
                                                                    onChange={(date) => setFormData({ ...formData, tanggal_mulai: date })}
                                                                    minDate={formData.tanggal_surat || undefined}
                                                                    sx={{ width: "100%" }}
                                                                    slotProps={{
                                                                        textField: {
                                                                            required: true,
                                                                            helperText: "Harus sama atau setelah tanggal surat"
                                                                        }
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                                <DatePicker
                                                                    label="Tanggal Selesai"
                                                                    value={formData.tanggal_selesai}
                                                                    onChange={(date) => setFormData({ ...formData, tanggal_selesai: date })}
                                                                    minDate={formData.tanggal_mulai || undefined}
                                                                    sx={{ width: "100%" }}
                                                                    slotProps={{
                                                                        textField: {
                                                                            required: true,
                                                                            helperText: "Harus sama atau setelah tanggal mulai"
                                                                        }
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                                            {formData.klien ? (
                                                                <Box>
                                                                    <Card
                                                                        elevation={0}
                                                                        sx={{
                                                                            border: `1px solid ${theme.palette.primary.main}30`,
                                                                            borderRadius: 2,
                                                                            p: 2,
                                                                            backgroundColor: `${theme.palette.primary.main}08`,
                                                                            minHeight: 56
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                                                                    {formData.klien.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {formData.klien.contact_name}
                                                                                </Typography>
                                                                            </Box>
                                                                            <IconButton
                                                                                onClick={() => setFormData({ ...formData, klien: null })}
                                                                                size="small"
                                                                            >
                                                                                <CloseIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    </Card>
                                                                </Box>
                                                            ) : (
                                                                <Box>
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<CompanyIcon />}
                                                                        onClick={() => setClientBrowserModalOpen(true)}
                                                                        fullWidth
                                                                        sx={{
                                                                            borderRadius: 2,
                                                                            borderStyle: "dashed",
                                                                            height: 56,
                                                                            justifyContent: "flex-start",
                                                                            px: 2,
                                                                            "&:hover": {
                                                                                borderStyle: "dashed",
                                                                            }
                                                                        }}
                                                                    >
                                                                        Pilih Klien
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                fullWidth
                                                                label="Lokasi Klien"
                                                                value={formData.lokasi}
                                                                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                                                placeholder="Masukkan lokasi klien"
                                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                            />
                                                        </Grid2>
                                                    </Grid2>
                                                </Box>
                                            )}

                                            {index === 2 && (
                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                                                        Pilih Petugas yang Ditugaskan <Typography component="span" color="error">*</Typography>
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, mt: -1 }}>
                                                        Minimal 1 petugas harus dipilih
                                                    </Typography>

                                                    {/* Selected Personnel Display */}
                                                    {formData.petugas.length > 0 && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                Petugas Terpilih dan Peran dalam Penugasan <Typography component="span" color="error">*</Typography>:
                                                            </Typography>
                                                            <Grid2 container spacing={2}>
                                                                {formData.petugas.map((person) => (
                                                                    <Grid2 size={{ xs: 12, md: 6 }} key={person.id}>
                                                                        <Card
                                                                            elevation={0}
                                                                            sx={{
                                                                                border: `1px solid ${theme.palette.divider}`,
                                                                                borderRadius: 2,
                                                                                p: 2
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                                                                <Avatar
                                                                                    src={person.avatar}
                                                                                    sx={{ width: 40, height: 40 }}
                                                                                >
                                                                                    {person.name.charAt(0)}
                                                                                </Avatar>
                                                                                <Box sx={{ flex: 1 }}>
                                                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                                                                        <Box>
                                                                                            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                                                                {person.name}
                                                                                            </Typography>
                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                {person.role}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            onClick={() => removePersonnel(person.id)}
                                                                                            sx={{ ml: 1 }}
                                                                                        >
                                                                                            <CloseIcon fontSize="small" />
                                                                                        </IconButton>
                                                                                    </Box>

                                                                                    <TextField
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        label="Peran dalam Penugasan"
                                                                                        value={person.assignmentRole || ""}
                                                                                        onChange={(e) => updatePersonnelRole(person.id, e.target.value)}
                                                                                        placeholder="e.g., Supervisor, Manajer Proyek, Koordinator"
                                                                                        required
                                                                                        error={!person.assignmentRole || person.assignmentRole.trim() === ""}
                                                                                        helperText={(!person.assignmentRole || person.assignmentRole.trim() === "") ? "Peran harus diisi" : ""}
                                                                                        sx={{
                                                                                            mt: 1,
                                                                                            "& .MuiOutlinedInput-root": { borderRadius: 1.5 }
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                            </Box>
                                                                        </Card>
                                                                    </Grid2>
                                                                ))}
                                                            </Grid2>
                                                        </Box>
                                                    )}

                                                    {/* Add Personnel Button */}
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => {
                                                            setPersonnelModalOpen(true);
                                                            if (availablePersonnel.length === 0) {
                                                                loadPersonnel();
                                                            }
                                                        }}
                                                        sx={{
                                                            borderRadius: 2,
                                                            borderStyle: "dashed",
                                                            py: 2,
                                                            px: 3,
                                                            width: "100%",
                                                            "&:hover": {
                                                                borderStyle: "dashed",
                                                            }
                                                        }}
                                                    >
                                                        Tambah Petugas
                                                    </Button>
                                                </Box>
                                            )}

                                            {index === 3 && (
                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                                                        Penandatangan Surat Tugas <Typography component="span" color="error">*</Typography>
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, mt: -1 }}>
                                                        Penandatangan harus dipilih
                                                    </Typography>

                                                    {/* Selected Signing Authority Display */}
                                                    {formData.penandatangan && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                Petugas yang Bertanggung Jawab:
                                                            </Typography>
                                                            <Card
                                                                elevation={0}
                                                                sx={{
                                                                    border: `1px solid ${theme.palette.primary.main}30`,
                                                                    borderRadius: 2,
                                                                    p: 2,
                                                                    backgroundColor: `${theme.palette.primary.main}08`
                                                                }}
                                                            >
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                                    <Avatar
                                                                        src={formData.penandatangan.avatar}
                                                                        sx={{ width: 48, height: 48 }}
                                                                    >
                                                                        {formData.penandatangan.name.charAt(0)}
                                                                    </Avatar>
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                                                            {formData.penandatangan.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {formData.penandatangan.role}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {formData.penandatangan.email}
                                                                        </Typography>
                                                                    </Box>
                                                                    <IconButton
                                                                        onClick={() => setFormData({ ...formData, penandatangan: null })}
                                                                        sx={{ ml: 1 }}
                                                                    >
                                                                        <CloseIcon />
                                                                    </IconButton>
                                                                </Box>
                                                            </Card>
                                                        </Box>
                                                    )}

                                                    {/* Select Signing Authority Button */}
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<PersonIcon />}
                                                        onClick={() => {
                                                            setSigningAuthorityModalOpen(true);
                                                            if (availablePersonnel.length === 0) {
                                                                loadPersonnel();
                                                            }
                                                        }}
                                                        sx={{
                                                            borderRadius: 2,
                                                            borderStyle: "dashed",
                                                            py: 2,
                                                            px: 3,
                                                            width: "100%",
                                                            "&:hover": {
                                                                borderStyle: "dashed",
                                                            }
                                                        }}
                                                    >
                                                        {formData.penandatangan ? "Ganti Penandatangan" : "Pilih Penandatangan"}
                                                    </Button>
                                                </Box>
                                            )}

                                            {index === 3 && (
                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                    <Grid2 container spacing={3}>
                                                        <Grid2 size={{ xs: 12 }}>
                                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                                                                Catatan Tambahan
                                                            </Typography>
                                                        </Grid2>
                                                        <Grid2 size={{ xs: 12 }}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                label="Catatan Tambahan"
                                                                value={formData.catatan}
                                                                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                                                placeholder="Catatan atau instruksi tambahan"
                                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                            />
                                                        </Grid2>
                                                    </Grid2>
                                                </Box>
                                            )}

                                            {index === 4 && (
                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                    <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: "medium" }}>
                                                        Review Informasi Surat Tugas
                                                    </Typography>
                                                    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                                        <CardContent>
                                                            <Grid2 container spacing={2}>
                                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                                    <Typography variant="body2" color="text.secondary">Jenis</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.jenis === "proyek" ? "Proyek" : "Perjalanan Dinas"}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                                    <Typography variant="body2" color="text.secondary">Tanggal Surat</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.tanggal_surat?.toLocaleDateString()}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                                    <Typography variant="body2" color="text.secondary">Lokasi Klien</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.lokasi}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12 }}>
                                                                    <Typography variant="body2" color="text.secondary">Klien</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.klien?.name || "-"}
                                                                    </Typography>
                                                                    {formData.klien && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {formData.klien.contact_name} - {formData.klien.contact_email}
                                                                        </Typography>
                                                                    )}
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12 }}>
                                                                    <Typography variant="body2" color="text.secondary">Judul</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.judul}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12 }}>
                                                                    <Typography variant="body2" color="text.secondary">Deskripsi</Typography>
                                                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                                                        {formData.deskripsi}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                                    <Typography variant="body2" color="text.secondary">Tanggal Mulai</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.tanggal_mulai?.toLocaleDateString()}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                                    <Typography variant="body2" color="text.secondary">Tanggal Selesai</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                                                                        {formData.tanggal_selesai?.toLocaleDateString()}
                                                                    </Typography>
                                                                </Grid2>
                                                                <Grid2 size={{ xs: 12 }}>
                                                                    <Typography variant="body2" color="text.secondary">Petugas dan Peran</Typography>
                                                                    <Grid2 container spacing={1} sx={{ mt: 1 }}>
                                                                        {formData.petugas.map((petugas) => (
                                                                            <Grid2 size={{ xs: 12, sm: 6 }} key={petugas.id}>
                                                                                <Card
                                                                                    elevation={0}
                                                                                    sx={{
                                                                                        border: `1px solid ${theme.palette.divider}`,
                                                                                        borderRadius: 1.5,
                                                                                        p: 1.5
                                                                                    }}
                                                                                >
                                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                                        <Avatar src={petugas.avatar} sx={{ width: 32, height: 32 }}>
                                                                                            {petugas.name.charAt(0)}
                                                                                        </Avatar>
                                                                                        <Box sx={{ flex: 1 }}>
                                                                                            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                                                                {petugas.name}
                                                                                            </Typography>
                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                {petugas.assignmentRole || "Peran belum ditentukan"}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                </Card>
                                                                            </Grid2>
                                                                        ))}
                                                                    </Grid2>
                                                                </Grid2>
                                                                {formData.penandatangan && (
                                                                    <Grid2 size={{ xs: 12 }}>
                                                                        <Typography variant="body2" color="text.secondary">Penandatangan</Typography>
                                                                        <Card
                                                                            elevation={0}
                                                                            sx={{
                                                                                border: `1px solid ${theme.palette.primary.main}30`,
                                                                                borderRadius: 1.5,
                                                                                p: 1.5,
                                                                                mt: 1,
                                                                                backgroundColor: `${theme.palette.primary.main}08`
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                                <Avatar src={formData.penandatangan.avatar} sx={{ width: 32, height: 32 }}>
                                                                                    {formData.penandatangan.name.charAt(0)}
                                                                                </Avatar>
                                                                                <Box sx={{ flex: 1 }}>
                                                                                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                                                        {formData.penandatangan.name}
                                                                                    </Typography>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {formData.penandatangan.role}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Card>
                                                                    </Grid2>
                                                                )}
                                                            </Grid2>
                                                        </CardContent>
                                                    </Card>
                                                </Box>
                                            )}

                                            {/* Navigation buttons */}
                                            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                <Button
                                                    disabled={activeStep === 0}
                                                    onClick={() => setActiveStep(activeStep - 1)}
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Kembali
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        if (activeStep === formSteps.length - 1) {
                                                            generateAndDownloadDOCX();
                                                        } else {
                                                            // Validation for step 0 (Jenis & Informasi Dasar - Jenis selection)
                                                            if (activeStep === 0) {
                                                                // Check if jenis is selected
                                                                if (!formData.jenis || formData.jenis.trim() === "") {
                                                                    setJenisError("Pilih jenis surat tugas (Proyek atau Perjalanan Dinas)");
                                                                    return;
                                                                }
                                                            }

                                                            // Validation for step 1 (Detail Tugas - Date validation)
                                                            if (activeStep === 1) {
                                                                // Check if tanggal_mulai is same or after tanggal_surat
                                                                if (formData.tanggal_mulai && formData.tanggal_surat) {
                                                                    const suratDate = new Date(formData.tanggal_surat);
                                                                    const mulaiDate = new Date(formData.tanggal_mulai);
                                                                    suratDate.setHours(0, 0, 0, 0);
                                                                    mulaiDate.setHours(0, 0, 0, 0);

                                                                    if (mulaiDate < suratDate) {
                                                                        alert('Tanggal mulai harus sama atau setelah tanggal surat');
                                                                        return;
                                                                    }
                                                                }

                                                                // Check if tanggal_selesai is same or after tanggal_mulai
                                                                if (formData.tanggal_selesai && formData.tanggal_mulai) {
                                                                    const mulaiDate = new Date(formData.tanggal_mulai);
                                                                    const selesaiDate = new Date(formData.tanggal_selesai);
                                                                    mulaiDate.setHours(0, 0, 0, 0);
                                                                    selesaiDate.setHours(0, 0, 0, 0);

                                                                    if (selesaiDate < mulaiDate) {
                                                                        alert('Tanggal selesai harus sama atau setelah tanggal mulai');
                                                                        return;
                                                                    }
                                                                }
                                                            }

                                                            // Validation for step 2 (Personnel Assignment)
                                                            if (activeStep === 2) {
                                                                // Check if at least 1 personnel is selected
                                                                if (formData.petugas.length === 0) {
                                                                    alert('Minimal 1 petugas harus dipilih');
                                                                    return;
                                                                }

                                                                // Check if all personnel have assignmentRole filled
                                                                const missingRoles = formData.petugas.filter(
                                                                    p => !p.assignmentRole || p.assignmentRole.trim() === ""
                                                                );
                                                                if (missingRoles.length > 0) {
                                                                    alert(`Mohon isi peran dalam penugasan untuk semua petugas (${missingRoles.length} petugas belum diisi)`);
                                                                    return;
                                                                }
                                                            }

                                                            // Validation for step 3 (Signing Authority)
                                                            if (activeStep === 3) {
                                                                // Check if penandatangan is selected
                                                                if (!formData.penandatangan) {
                                                                    alert('Penandatangan harus dipilih');
                                                                    return;
                                                                }
                                                            }
                                                            setActiveStep(activeStep + 1);
                                                        }
                                                    }}
                                                    disabled={isSubmitting}
                                                    startIcon={activeStep === formSteps.length - 1 ? <DownloadIcon /> : undefined}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {isSubmitting ? (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <LinearProgress sx={{ width: 16, height: 2 }} />
                                                            Generating...
                                                        </Box>
                                                    ) : activeStep === formSteps.length - 1 ? (
                                                        "Submit dan Download Surat Tugas"
                                                    ) : (
                                                        "Lanjutkan"
                                                    )}
                                                </Button>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    </Paper>
                </Grid2>

                {/* User Info Sidebar */}
                <Grid2 size={{ xs: 12, lg: 3 }}>
                    <UserInfoSidebar />
                </Grid2>
            </Grid2>
        </motion.div>
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ pb: 5 }}>
                {/* Breadcrumb Navigation */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        backgroundColor: "#fff",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link href="/" style={{ textDecoration: "none" }}>
                            <MuiLink
                                sx={{ display: "flex", alignItems: "center" }}
                                color="inherit"
                                underline="hover"
                                component="span"
                            >
                                <DashboardIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Dashboard
                            </MuiLink>
                        </Link>
                        <Link href="/division" style={{ textDecoration: "none" }}>
                            <MuiLink color="inherit" underline="hover" component="span">
                                Divisions
                            </MuiLink>
                        </Link>
                        <Link href="/division/human-capital" style={{ textDecoration: "none" }}>
                            <MuiLink color="inherit" underline="hover" component="span">
                                Human Capital
                            </MuiLink>
                        </Link>
                        <Typography
                            color="text.primary"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <AssignmentIcon sx={{ mr: 0.5 }} fontSize="small" />
                            Surat Tugas
                        </Typography>
                    </Breadcrumbs>
                </Box>

                {/* Main Content */}
                <Box sx={{ px: 3, py: 3 }}>
                    {/* Header with toggle */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: "medium", mb: 1 }}>
                                {currentView === "management" ? "Manajemen Surat Tugas" : "Buat Surat Tugas Baru"}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {currentView === "management"
                                    ? "Kelola surat tugas proyek dan perjalanan dinas"
                                    : "Buat surat tugas baru untuk tim Anda"
                                }
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            {currentView === "create" && (
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => setCurrentView("management")}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Kembali
                                </Button>
                            )}
                            {currentView === "management" && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={() => setCurrentView("create")}
                                        sx={{
                                            borderRadius: 3,
                                            px: 3,
                                            py: 1.5,
                                            background: `linear-gradient(45deg, ${baseColors.royalBlue} 30%, ${baseColors.vibrantOrange} 90%)`,
                                            boxShadow: `0 4px 20px ${baseColors.royalBlue}30`,
                                            "&:hover": {
                                                background: `linear-gradient(45deg, ${baseColors.deepBlue} 30%, ${baseColors.burntOrange} 90%)`,
                                                boxShadow: `0 6px 25px ${baseColors.royalBlue}40`,
                                                transform: "translateY(-2px)",
                                            },
                                            transition: "all 0.3s ease-in-out",
                                        }}
                                    >
                                        Buat Surat Tugas
                                    </Button>
                                </motion.div>
                            )}
                        </Box>
                    </Box>

                    {/* Main Content Area */}
                    <AnimatePresence mode="wait">
                        {currentView === "management" ? renderManagementView() : renderCreateForm()}
                    </AnimatePresence>
                </Box>

                {/* Detail Dialog - Temporarily disabled pending API integration */}
                {/* TODO: Update dialog to work with new SuratTugasProject structure from API */}
                <Dialog
                    open={false}
                    onClose={() => setDetailDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent>
                        <Typography>Detail view coming soon</Typography>
                    </DialogContent>
                </Dialog>

                {/* Personnel Selection Modal */}
                <DocumentPersonnelModal
                    open={personnelModalOpen}
                    onClose={() => setPersonnelModalOpen(false)}
                    personnel={filteredPersonnel}
                    onSelectPersonnel={handlePersonnelSelect}
                    loading={personnelLoading}
                    error={personnelError}
                    onSearch={handlePersonnelSearch}
                />

                {/* Signing Authority Selection Modal */}
                <DocumentPersonnelModal
                    open={signingAuthorityModalOpen}
                    onClose={() => setSigningAuthorityModalOpen(false)}
                    personnel={filteredPersonnel}
                    onSelectPersonnel={handleSigningAuthoritySelect}
                    loading={personnelLoading}
                    error={personnelError}
                    onSearch={handlePersonnelSearch}
                />

                {/* Client Browser Modal */}
                <ClientBrowserModal
                    open={clientBrowserModalOpen}
                    onClose={() => setClientBrowserModalOpen(false)}
                    selectedClient={formData.klien}
                    onSelectClient={handleClientSelect}
                    title="Pilih Klien"
                    subtitle="Pilih klien dari daftar atau cari klien"
                    mode="compact"
                    showCreateButton={true}
                />
            </Box>
        </LocalizationProvider>
    );
}

// Wrap with new vibrant theme
export default function SuratTugasPage() {
    return (
        <ThemeProvider theme={createNewTheme()}>
            <SuratTugasPageContent />
        </ThemeProvider>
    );
}
