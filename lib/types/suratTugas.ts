// lib/types/suratTugas.ts
// Shared types for Surat Tugas (Assignment Letter) feature

import { Client } from "../api/types/client";

/**
 * Team member representation
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  position?: string;
  assignmentRole?: string; // Role specific to this assignment
  jobTitle?: string; // Job title from the database
}

/**
 * Form data structure for creating Surat Tugas
 */
export interface SuratTugasFormData {
  jenis: "proyek" | "perjalanan_dinas" | "";
  judul: string;
  deskripsi: string;
  petugas: TeamMember[];
  penandatangan: TeamMember | null; // Personnel responsible for signing
  tanggal_surat: Date | null; // Date of document issuance
  tanggal_mulai: Date | null;
  tanggal_selesai: Date | null;
  lokasi: string;
  klien: Client | null; // Client object from ClientBrowser
  catatan: string;
  prioritas: "low" | "medium" | "high" | "urgent";
}

/**
 * Persisted Surat Tugas project structure (from backend)
 */
export interface SuratTugasProject {
  id: string;
  namaPekerjaan: string;
  deskripsiPekerjaan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
  type: "proyek" | "perjalanan_dinas";
  tanggalSuratTugas: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  masterDocumentList: {
    id: string;
    documentNumber: string;
    documentExternalNumber: string;
    documentName: string;
    documentLegalDate: string;
    indexNumber: number;
    documentStatus: string;
    mongoDocumentId: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
  client: {
    id: string;
    name: string;
    group: string;
    contact_name: string;
    contact_position: string;
    contact_email: string;
    contact_phone: string;
    referral_from: string;
    date_of_first_project: string;
    status: string;
    priority_number: number;
    created_at: string;
    updated_at: string;
    isWapu: boolean;
  };
  signer: {
    id: string;
    externalId: string;
    keycloakId: string | null;
    email: string;
    name: string;
    department: string | null;
    jobTitle: string;
    preferredUsername: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    status: string;
    role: string;
  };
  timPenugasan?: Array<{
    id: string;
    role: string;
    createdAt: string;
    personnel: {
      id: string;
      externalId: string;
      keycloakId: string | null;
      email: string;
      name: string;
      department: string | null;
      jobTitle: string;
      preferredUsername: string;
      createdAt: string;
      updatedAt: string;
      isActive: boolean;
      status: string;
      role: string;
    };
  }>;
}

/**
 * Personnel data structure for template
 */
export interface PetugasData {
  no: number;
  nama: string;
  jabatan: string;
}

/**
 * Complete data structure for DOCX template rendering
 */
export interface SuratTugasTemplateData {
  NOMOR: string;
  BULAN_ROMAWI: string;
  TAHUN: string;
  TANGGAL_SURAT: string;
  PERIHAL: string;
  petugas: PetugasData[];
  URAIAN_PEKERJAAN: string;
  NAMA_KLIEN: string;
  TEMPAT: string;
  HARI_TANGGAL: string;
  PENANDATANGAN_NAMA: string;
  PENANDATANGAN_JABATAN: string;
  PENANDATANGAN_EMAIL: string;
  qrCode?: string; // Base64 data URL for QR code image
}

/**
 * Options for document generation
 */
export interface SuratTugasGenerationOptions {
  /**
   * Override document number (if not provided, will auto-generate)
   */
  documentNumber?: string;

  /**
   * Custom template path (defaults to /templates/template_surat_tugas.docx)
   */
  templatePath?: string;

  /**
   * Custom filename (defaults to Surat_Tugas_{NOMOR}.docx)
   */
  filename?: string;

  /**
   * Whether to download file immediately (defaults to true)
   */
  autoDownload?: boolean;

  /**
   * Verification URL or QR code image path
   * - If starts with "http": Will generate QR code
   * - If starts with "/images/qrst/": Will use as image file path
   */
  verificationUrl?: string;
}

/**
 * Database submission data structure for Surat Tugas
 * Matches CreateSuratTugasDto from backend
 */
export interface SuratTugasDBData {
  masterDocumentListId: string; // UUID
  namaPekerjaan: string;
  deskripsiPekerjaan: string;
  tanggalMulai: string; // ISO date string
  tanggalSelesai: string; // ISO date string
  lokasi: string;
  clientId: string; // UUID (changed from klienId)
  type: string;
  signerId: string; // UUID (required)
  tanggalSuratTugas: string; // ISO date string (changed from tanggalSurat)
  createdBy: string; // UUID
  timPenugasan: Array<{ personnelId: string; role: string }>; // Array of personnel with roles
}

/**
 * Detailed Surat Tugas response from get-by-id endpoint
 * Used for validation and display purposes
 */
export interface SuratTugasDetailResponse {
  id: string;
  namaPekerjaan: string;
  deskripsiPekerjaan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
  type: "proyek" | "perjalanan_dinas";
  tanggalSuratTugas: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  masterDocumentList: {
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    id: string;
    documentNumber: string;
    documentExternalNumber: string;
    documentName: string;
    documentLegalDate: string;
    indexNumber: number;
    documentStatus: string;
    mongoDocumentId: string | null;
  };
  client: {
    id: string;
    name: string;
    group: string;
    contact_name: string;
    contact_position: string;
    contact_email: string;
    contact_phone: string;
    referral_from: string;
    date_of_first_project: string;
    status: string;
    priority_number: number;
    created_at: string;
    updated_at: string;
    isWapu: boolean;
  };
  signer: {
    id: string;
    externalId: string;
    keycloakId: string | null;
    email: string;
    name: string;
    department: string | null;
    jobTitle: string;
    preferredUsername: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    status: string;
    role: string;
  };
  timPenugasan?: Array<{
    id: string;
    role: string;
    createdAt: string;
    personnel: {
      id: string;
      externalId: string;
      keycloakId: string | null;
      email: string;
      name: string;
      department: string | null;
      jobTitle: string;
      preferredUsername: string;
      createdAt: string;
      updatedAt: string;
      isActive: boolean;
      status: string;
      role: string;
    };
  }>;
}

