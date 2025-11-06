"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HexagonRadar from '@/components/HexagonRadar';
import { useRouter } from 'next/navigation';

type Values = {
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;
};

export default function AssessmentPage() {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    relativeStrength: 3,
    muscularEndurance: 3,
    balanceControl: 3,
    jointMobility: 3,
    bodyTension: 3,
    skillTechnique: 3,
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ fitnessLevel: string } | null>(null);

  const update = (key: keyof Values, v: number) => setValues((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/assessment/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save assessment');
      setResult({ fitnessLevel: data.fitnessLevel });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    router.push('/dashboard?tab=dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Initial Assessment</CardTitle>
            <CardDescription>
              Rate yourself in the six calisthenics axes (0-10). Be honest—this helps personalize your plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  ['relativeStrength', 'Relative Strength'],
                  ['muscularEndurance', 'Muscular Endurance'],
                  ['balanceControl', 'Balance & Control'],
                  ['jointMobility', 'Joint Mobility'],
                  ['bodyTension', 'Body Tension'],
                  ['skillTechnique', 'Skill Technique'],
                ] as Array<[keyof Values, string]>
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-gray-500">{values[key]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={values[key]}
                    onChange={(e) => update(key, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <HexagonRadar values={values} size={360} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} disabled={saving} variant="black">
                {saving ? 'Saving...' : 'Save Assessment'}
              </Button>
              {result && (
                <Button onClick={handleContinue} variant="outline">
                  Continue to Dashboard (Level: {result.fitnessLevel})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}