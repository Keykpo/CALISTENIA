'use client';

import React, { useEffect, useRef } from 'react';

/**
 * API DOCUMENTATION PAGE
 *
 * Displays interactive Swagger UI for the Routines API
 * OpenAPI spec: /apps/web/src/lib/api-docs/routines-api.openapi.json
 */

export default function ApiDocsPage() {
  const swaggerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load Swagger UI CSS and JS
    const loadSwaggerUI = async () => {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
      script.async = true;

      script.onload = () => {
        // @ts-ignore - SwaggerUIBundle is loaded dynamically
        if (window.SwaggerUIBundle && swaggerContainerRef.current) {
          // @ts-ignore
          window.SwaggerUIBundle({
            url: '/api-docs/spec',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              // @ts-ignore
              window.SwaggerUIBundle.presets.apis,
              // @ts-ignore
              window.SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            plugins: [
              // @ts-ignore
              window.SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: 'StandaloneLayout',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 3,
            docExpansion: 'list',
            filter: true,
            showRequestHeaders: true,
            tryItOutEnabled: true,
          });
        }
      };

      document.body.appendChild(script);
    };

    loadSwaggerUI();

    // Cleanup
    return () => {
      // Remove scripts and styles on unmount if needed
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Calistenia API Documentation
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Interactive API documentation for the unified routines system
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Back to App
              </a>
              <a
                href="/api-docs/spec"
                download="routines-api.openapi.json"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Download OpenAPI Spec
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Info Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              📚 Current Version
            </h3>
            <p className="text-2xl font-bold text-blue-600">v2.0.0</p>
            <p className="text-xs text-gray-500 mt-1">Unified Routine System</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              🔗 Base URL
            </h3>
            <code className="text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
              /api
            </code>
            <p className="text-xs text-gray-500 mt-2">All endpoints are relative to this base</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              🔐 Authentication
            </h3>
            <p className="text-sm text-gray-600">NextAuth.js Session</p>
            <p className="text-xs text-gray-500 mt-1">Cookie-based authentication</p>
          </div>
        </div>

        {/* Migration Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Deprecation Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Legacy endpoints <code className="bg-yellow-100 px-1 rounded">/api/routines/generate-v3</code> and{' '}
                  <code className="bg-yellow-100 px-1 rounded">/api/training/generate-daily-routine</code>{' '}
                  are deprecated and will be removed on <strong>2025-03-01</strong>.
                </p>
                <p className="mt-1">
                  Please migrate to <code className="bg-yellow-100 px-1 rounded">/api/routines/generate</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Start
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Generate a Daily Routine:
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`POST /api/routines/generate
Content-Type: application/json

{
  "mode": "daily",
  "duration": 45,
  "focusAreas": ["PUSH", "CORE"],
  "targetSkill": "FRONT_LEVER"
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Generate a Weekly Routine:
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`POST /api/routines/generate
Content-Type: application/json

{
  "mode": "weekly",
  "duration": 60,
  "daysPerWeek": 4,
  "focusAreas": ["PUSH", "PULL", "LEGS"]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div id="swagger-ui" ref={swaggerContainerRef}></div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Calistenia App API v2.0.0 - Unified Routine System
            </p>
            <div className="flex gap-4">
              <a href="/CODE_REVIEW_RECOMMENDATIONS.md" className="text-sm text-blue-600 hover:text-blue-800">
                Code Review
              </a>
              <a href="/ROUTINE_SYSTEM_UNIFIED.md" className="text-sm text-blue-600 hover:text-blue-800">
                Migration Guide
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
