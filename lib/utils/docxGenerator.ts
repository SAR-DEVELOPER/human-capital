import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import ImageModule from 'docxtemplater-image-module-free';
import type {
    SuratTugasFormData,
    SuratTugasTemplateData,
    SuratTugasGenerationOptions,
    PetugasData,
    TeamMember,
} from '../types/suratTugas';

/**
 * Convert base64 data URL to Uint8Array (browser-compatible)
 * This replaces Buffer usage which is Node.js-only
 */
function base64ToUint8Array(dataUrl: string): Uint8Array {
    try {
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        
        // Decode base64 string to binary string
        const binaryString = atob(base64Data);
        
        // Convert binary string to Uint8Array
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        return bytes;
    } catch (error) {
        console.error('Error converting base64 to Uint8Array:', error);
        return new Uint8Array(0);
    }
}

/**
 * Low-level function: Generate Surat Tugas DOCX from template data
 * For most use cases, use `generateSuratTugasFromForm` instead
 *
 * @param data - Pre-formatted template data with UPPERCASE keys
 * @param options - Generation options (template path, filename, auto-download)
 */
export async function generateSuratTugasDOCX(
    data: SuratTugasTemplateData,
    options?: Pick<SuratTugasGenerationOptions, 'templatePath' | 'filename' | 'autoDownload'>
): Promise<Blob> {
    try {
        const templatePath = options?.templatePath || '/templates/template_surat_tugas.docx';

        console.log('Loading template from:', templatePath);

        // Load the template from the public directory
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Failed to load template from ${templatePath}: ${response.statusText}`);
        }

        const templateBuffer = await response.arrayBuffer();
        console.log('Template loaded, size:', templateBuffer.byteLength, 'bytes');

        // Load the template into pizzip
        const zip = new PizZip(templateBuffer);

        // PRE-LOAD QR image if path is provided (MUST happen before ImageModule init)
        let qrImageData: Uint8Array | null = null;
        if (data.qrCode && data.qrCode.startsWith('/api/surat-tugas/qr-image/')) {
            try {
                console.log('🔄 Pre-loading QR image from:', data.qrCode);
                const response = await fetch(data.qrCode, {
                    method: 'GET',
                    credentials: 'include', // Include cookies for authentication if needed
                    headers: {
                        'Accept': 'image/png',
                    },
                });
                if (!response.ok) {
                    const errorText = await response.text().catch(() => response.statusText);
                    throw new Error(`Failed to fetch QR: ${response.status} ${errorText}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                qrImageData = new Uint8Array(arrayBuffer);
                console.log('✅ QR image pre-loaded, size:', qrImageData.length, 'bytes');
            } catch (error) {
                console.error('❌ Failed to pre-load QR image:', error);
                console.error('QR code path was:', data.qrCode);
                qrImageData = null;
            }
        }

        // Configure image module for QR code insertion
        const imageOpts = {
            centered: false,
            getImage: (tagValue: string, tagName: string) => {
                console.log('ImageModule.getImage called:', {
                    tagName,
                    hasValue: !!tagValue,
                    valuePreview: tagValue ? tagValue.substring(0, 100) : 'empty'
                });

                // Check if this is qrCode tag and we have pre-loaded data
                if ((tagName === 'qrCode' || tagValue.includes('/images/qrst/')) && qrImageData) {
                    console.log('✅ Returning pre-loaded QR image, size:', qrImageData.length, 'bytes');
                    return qrImageData;
                }

                // Handle image data URLs (base64 fallback)
                if (tagValue && tagValue.startsWith('data:image')) {
                    const imageData = base64ToUint8Array(tagValue);
                    console.log('Converted base64 image, size:', imageData.length, 'bytes');
                    return imageData;
                }

                // Return empty buffer if no valid image data
                console.log('⚠️ No valid image data for tag:', tagName, 'tagValue:', tagValue);
                return new Uint8Array(0);
            },
            getSize: (img: Buffer | Uint8Array, tagValue: string, tagName: string): [number, number] => {
                console.log('ImageModule.getSize called:', {
                    tagName,
                    imageSize: img.length,
                    bytes: img.length > 0 ? 'has data' : 'empty'
                });

                // Set QR code size (width, height in pixels) - 75x75 as requested
                if (tagName === 'qrCode') {
                    return [75, 75];
                }

                // Default size for other images
                return [100, 100];
            }
        };

        console.log('Creating Docxtemplater instance with ImageModule...');

        // Create docxtemplater instance with ImageModule
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
                start: '{{',
                end: '}}'
            },
            modules: [new ImageModule(imageOpts)]
        });

        // Ensure all required fields have values (prevent undefined errors)
        // Keep original qrCode value - ImageModule will use it to identify which image to load
        const renderData: SuratTugasTemplateData = {
            ...data,
            qrCode: data.qrCode || '', // Keep the path value for ImageModule
        };

        console.log('Rendering document with data:', {
            NOMOR: renderData.NOMOR,
            PERIHAL: renderData.PERIHAL,
            petugasCount: renderData.petugas.length,
            hasQRCode: !!renderData.qrCode,
            qrCodeLength: renderData.qrCode ? renderData.qrCode.length : 0
        });

        // Render the document with data
        doc.render(renderData);

        console.log('Document rendered successfully');

        // Generate the document as a blob
        const blob = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE'
        }) as Blob;

        console.log('DOCX blob generated, size:', blob.size, 'bytes');

        // Generate filename
        const filename = options?.filename || `Surat_Tugas_${data.NOMOR.replace(/\//g, '_')}.docx`;

        // Download the file if autoDownload is true (default)
        const shouldDownload = options?.autoDownload !== false;
        if (shouldDownload) {
            console.log('Auto-downloading file:', filename);
            saveAs(blob, filename);
        }

        return blob;

    } catch (error) {
        console.error('Error generating DOCX:', error);
        
        // Enhanced error reporting
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to generate DOCX: ${error.message}`);
        }
        
        throw new Error('Failed to generate DOCX: Unknown error');
    }
}

/**
 * Format date to Indonesian locale
 */
export function formatDateIndonesian(date: Date): string {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format date with day name to Indonesian locale
 */
export function formatDateWithDayIndonesian(date: Date): string {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Get Roman numeral for month (1 = I, 2 = II, etc.)
 */
export function getRomanMonth(monthIndex: number): string {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    if (monthIndex < 0 || monthIndex > 11) {
        console.warn('Invalid month index:', monthIndex, 'defaulting to I');
        return 'I';
    }
    return romanNumerals[monthIndex];
}

/**
 * Save QR code as PNG file in temporary storage using API route
 * @param url - URL to encode in QR code
 * @param documentId - Document UUID for filename
 * @returns Promise<string> - API path to access the QR code image
 */
export async function saveQRCodeImage(url: string, documentId: string): Promise<string> {
    try {
        console.log('Requesting QR code generation for:', url, 'with ID:', documentId);

        // Call API route to generate and save QR code server-side
        const response = await fetch('/api/surat-tugas/generate-qr', {
            method: 'POST',
            credentials: 'include', // Include cookies for authentication if needed
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                url,
                documentId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { details: errorText || `API request failed: ${response.status}` };
            }
            throw new Error(errorData.details || errorData.error || 'API request failed');
        }

        const data = await response.json();
        console.log('✅ QR code generated successfully:', data.path);

        return data.path;

    } catch (error) {
        console.error('❌ Error saving QR code:', error);
        throw new Error(`Failed to save QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate QR code as base64 data URL
 * @param url - URL to encode in QR code
 * @returns Promise<string> - Base64 data URL of QR code image
 */
export async function generateQRCodeBase64(url: string): Promise<string> {
    try {
        console.log('Generating QR code for URL:', url);

        // Generate QR code as data URL (base64)
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'H', // High error correction
            margin: 1, // Quiet zone margin
            width: 200, // Image width
            color: {
                dark: '#000000',  // QR code color
                light: '#FFFFFF'  // Background color
            }
        });
        
        console.log('QR code generated successfully, data URL length:', qrCodeDataUrl.length);
        return qrCodeDataUrl;
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Default fallback data for penandatangan (signer)
 */
const DEFAULT_PENANDATANGAN = {
    name: 'Dr. H. Sony Devano, SE, Ak, SH, M.Ak, CA, BKP, CPA, CACP',
    role: 'Managing Partner',
    email: 'sony.devano@sar-consulting.co.id'
};

/**
 * Transform TeamMember array to PetugasData array for template
 */
function transformPetugasData(petugas: TeamMember[]): PetugasData[] {
    return petugas.map((person, index) => ({
        no: index + 1,
        nama: person.name,
        jabatan: person.assignmentRole || person.position || person.role
    }));
}

/**
 * Generate document number in format: XXX (padded to 3 digits)
 * If not provided in options, generates a timestamp-based number
 */
function generateDocumentNumber(options?: SuratTugasGenerationOptions): string {
    if (options?.documentNumber) {
        return options.documentNumber;
    }

    // Generate timestamp-based number as fallback
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Use last 3 digits of timestamp for sequential-looking number
    return `${year}${month}${day}${hours}${minutes}${seconds}`.slice(-3);
}

/**
 * High-level function: Generate Surat Tugas DOCX from form data
 * This function handles all data transformation and formatting automatically.
 *
 * @param formData - Raw form data from Surat Tugas form
 * @param tanggalSurat - Date of the surat tugas
 * @param options - Generation options (document number, template path, filename, auto-download, verification URL)
 * @returns Promise<Blob> - The generated DOCX file as a Blob
 *
 * @example
 * ```typescript
 * // Simple usage - auto-download with generated document number
 * await generateSuratTugasFromForm(formData, new Date());
 *
 * // With custom document number and verification URL
 * await generateSuratTugasFromForm(formData, new Date(), {
 *   documentNumber: '001',
 *   verificationUrl: 'https://example.com/verify/123'
 * });
 *
 * // Get blob without downloading
 * const blob = await generateSuratTugasFromForm(formData, new Date(), {
 *   autoDownload: false
 * });
 * ```
 */
export async function generateSuratTugasFromForm(
    formData: SuratTugasFormData,
    tanggalSurat: Date,
    options?: SuratTugasGenerationOptions,
): Promise<Blob> {
    try {
        console.log('=== Starting Surat Tugas generation ===');
        console.log('Form data:', {
            jenis: formData.jenis,
            judul: formData.judul,
            petugasCount: formData.petugas.length,
            hasPenandatangan: !!formData.penandatangan,
            hasKlien: !!formData.klien
        });
        console.log('Tanggal Surat:', tanggalSurat);
        console.log('Options:', options);

        // Get current date info for document metadata
        const bulanRomawi = getRomanMonth(tanggalSurat.getMonth());
        const tahun = tanggalSurat.getFullYear().toString();
        const tanggalSuratFormatted = formatDateIndonesian(tanggalSurat);

        console.log('Document metadata:', { bulanRomawi, tahun, tanggalSuratFormatted });

        // Generate or use provided document number
        const nomorUrut = generateDocumentNumber(options);
        console.log('Document number:', nomorUrut);

        // Format assignment date range
        const tanggalMulaiFormatted = formData.tanggal_mulai
            ? formatDateWithDayIndonesian(formData.tanggal_mulai)
            : '';
        const tanggalSelesaiFormatted = formData.tanggal_selesai
            ? formatDateWithDayIndonesian(formData.tanggal_selesai)
            : '';
        const hariTanggal = formData.tanggal_mulai && formData.tanggal_selesai
            ? `${tanggalMulaiFormatted} s/d ${tanggalSelesaiFormatted}`
            : tanggalMulaiFormatted || tanggalSelesaiFormatted;

        console.log('Assignment dates:', { tanggalMulaiFormatted, tanggalSelesaiFormatted, hariTanggal });

        // Transform personnel data for template
        const petugasData = transformPetugasData(formData.petugas);
        console.log('Personnel data prepared:', petugasData.length, 'personnel');

        // Prepare penandatangan data with fallback to default signer
        const penandatanganData = formData.penandatangan || DEFAULT_PENANDATANGAN;

        // Extract penandatangan values with proper fallbacks
        const penandatanganNama = penandatanganData?.name || DEFAULT_PENANDATANGAN.name;
        const penandatanganJabatan =
            (penandatanganData as TeamMember)?.jobTitle ||
            penandatanganData?.role ||
            DEFAULT_PENANDATANGAN.role;
        const penandatanganEmail = penandatanganData?.email || DEFAULT_PENANDATANGAN.email;

        console.log('Signer data:', {
            nama: penandatanganNama,
            jabatan: penandatanganJabatan,
            email: penandatanganEmail
        });

        // Handle QR code - either file path or generate from URL
        let qrCodeValue: string = '';
        if (options?.verificationUrl) {
            if (options.verificationUrl.startsWith('/images/qrst/') || options.verificationUrl.startsWith('/api/surat-tugas/qr-image/')) {
                // Already a QR image file path/route - use directly
                console.log('Using QR code image path:', options.verificationUrl);
                qrCodeValue = options.verificationUrl;
            } else {
                // It's a URL - generate QR code as base64 (fallback)
                console.log('Generating QR code for URL:', options.verificationUrl);
                try {
                    qrCodeValue = await generateQRCodeBase64(options.verificationUrl);
                    console.log('✅ QR Code generated successfully');
                } catch (qrError) {
                    console.error('❌ Failed to generate QR code:', qrError);
                    qrCodeValue = '';
                }
            }
        } else {
            console.log('No verification URL/path provided, skipping QR code');
        }

        // Prepare complete template data object (UPPERCASE keys to match template)
        const templateData: SuratTugasTemplateData = {
            NOMOR: nomorUrut,
            BULAN_ROMAWI: bulanRomawi,
            TAHUN: tahun,
            TANGGAL_SURAT: tanggalSuratFormatted,
            PERIHAL: formData.jenis === "proyek" ? "Proyek" : "Perjalanan Dinas",
            petugas: petugasData,
            URAIAN_PEKERJAAN: formData.deskripsi || '',
            NAMA_KLIEN: formData.klien?.name || '',
            TEMPAT: formData.lokasi || 'Kantor SAR',
            HARI_TANGGAL: hariTanggal,
            PENANDATANGAN_NAMA: penandatanganNama,
            PENANDATANGAN_JABATAN: penandatanganJabatan,
            PENANDATANGAN_EMAIL: penandatanganEmail,
            qrCode: qrCodeValue, // File path or base64 data URL
        };

        console.log('Template data prepared:', {
            ...templateData,
            qrCode: templateData.qrCode ? `Data URL (${templateData.qrCode.length} chars)` : 'Empty',
            petugas: `${templateData.petugas.length} personnel`
        });

        // Generate DOCX using low-level function
        console.log('Calling generateSuratTugasDOCX...');
        const blob = await generateSuratTugasDOCX(templateData, options);

        console.log('=== Surat Tugas generation completed successfully ===');
        console.log('Final blob size:', blob.size, 'bytes');

        return blob;

    } catch (error) {
        console.error('=== Error generating Surat Tugas from form ===');
        console.error('Error details:', error);
        
        if (error instanceof Error) {
            throw new Error(`Failed to generate Surat Tugas DOCX: ${error.message}`);
        }
        throw new Error('Failed to generate Surat Tugas DOCX: Unknown error');
    }
}

