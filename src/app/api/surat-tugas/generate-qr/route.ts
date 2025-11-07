import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
    try {
        const { url, documentId } = await request.json();

        if (!url || !documentId) {
            return NextResponse.json(
                { error: 'Missing url or documentId' },
                { status: 400 }
            );
        }

        console.log('Generating QR code for:', url, 'with ID:', documentId);

        // Use QuickChart.io API to generate QR code (75x75 as requested)
        const quickChartUrl = `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=250x250`;
        console.log('Fetching QR from QuickChart:', quickChartUrl);

        // Fetch QR code image from QuickChart
        const response = await fetch(quickChartUrl);
        if (!response.ok) {
            throw new Error(`QuickChart API failed: ${response.statusText}`);
        }

        // Get image as buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log('QR code fetched, size:', buffer.length, 'bytes');

        // Save to temporary directory (non-public)
        const tempDir = path.join(os.tmpdir(), 'qrst-temp');
        if (!existsSync(tempDir)) {
            await mkdir(tempDir, { recursive: true });
            console.log('Created temporary directory:', tempDir);
        }

        // Save file
        const filename = `${documentId}.png`;
        const filepath = path.join(tempDir, filename);
        await writeFile(filepath, buffer);
        console.log('QR code saved to temporary storage:', filepath);

        // Return API route path (non-public)
        const apiPath = `/api/surat-tugas/qr-image/${documentId}`;
        return NextResponse.json({
            success: true,
            path: apiPath,
            message: 'QR code generated and saved to temporary storage successfully'
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate QR code',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

