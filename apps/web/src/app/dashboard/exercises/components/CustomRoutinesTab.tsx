'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell } from 'lucide-react';

export default function CustomRoutinesTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Custom Routines</h2>
          <p className="text-muted-foreground">
            Create personalized workout routines by combining your favorite exercises
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Routine
        </Button>
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Custom Routines Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              Build your own workout routines by selecting exercises from the gallery,
              setting reps and rest times, and saving them for future sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
