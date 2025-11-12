'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export function ErrorDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training/debug');
      const data = await response.json();
      setDiagnostics(data);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnostics({ error: 'Failed to run diagnostics' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="w-5 h-5" />
          Troubleshooting
        </CardTitle>
        <CardDescription>
          Run diagnostics to check your profile status and identify issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Run Diagnostics
            </>
          )}
        </Button>

        {diagnostics && (
          <div className="bg-white rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Diagnostic Results:</h4>
            <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-3 rounded">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>

            {diagnostics.debug && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  {diagnostics.debug.hasCompletedAssessment ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm">
                    Assessment: {diagnostics.debug.hasCompletedAssessment ? 'Completed' : 'Not completed'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {diagnostics.debug.hexagonProfile?.hasProfile ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm">
                    Hexagon Profile: {diagnostics.debug.hexagonProfile?.hasProfile ? 'Created' : 'Missing'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {diagnostics.debug.trainingGoals?.hasGoals ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm">
                    Training Goals: {diagnostics.debug.trainingGoals?.hasGoals ? 'Set' : 'Not set'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {diagnostics.debug.exercises?.total > 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    Exercises Database: {diagnostics.debug.exercises?.total || 0} exercises loaded
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
