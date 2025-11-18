import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api-docs/spec
 *
 * Serves the OpenAPI specification JSON file
 */
export async function GET() {
  try {
    const specPath = path.join(
      process.cwd(),
      'apps/web/src/lib/api-docs/routines-api.openapi.json'
    );

    // Check if file exists
    if (!fs.existsSync(specPath)) {
      return NextResponse.json(
        { error: 'OpenAPI spec not found' },
        { status: 404 }
      );
    }

    // Read the spec file
    const specContent = fs.readFileSync(specPath, 'utf8');
    const spec = JSON.parse(specContent);

    // Return with appropriate headers
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('[API_DOCS] Error serving OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    );
  }
}
