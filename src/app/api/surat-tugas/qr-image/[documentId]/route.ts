import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const { documentId } = await params;

        if (!documentId) {
            return NextResponse.json(
                { error: 'Missing documentId' },
                { status: 400 }
            );
        }

        // Get file from temporary directory
        const tempDir = path.join(os.tmpdir(), 'qrst-temp');
        const filename = `${documentId}.png`;
        const filepath = path.join(tempDir, filename);

        // Check if file exists
        if (!existsSync(filepath)) {
            console.error('QR code not found:', filepath);
            return NextResponse.json(
                { error: 'QR code image not found' },
                { status: 404 }
            );
        }

        // Read file
        const fileBuffer = await readFile(filepath);

        // Return image with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600',
                'Content-Length': fileBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('Error serving QR code:', error);
        return NextResponse.json(
            {
                error: 'Failed to serve QR code',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

