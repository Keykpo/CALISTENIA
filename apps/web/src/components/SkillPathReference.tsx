'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Plus, Lock, Play } from 'lucide-react'

function MainCard({ title }: { title: string }) {
  return (
    <Card className="min-w-[220px] rounded-md bg-white border border-sky-200 shadow-sm">
      <CardContent className="p-4">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="mt-2">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-sky-300 text-sky-700">Rank F</Badge>
        </div>
        <div className="mt-3">
          <Button variant="link" className="px-0 text-sky-700">Ver guía detallada</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SecondaryCard({ title, icon }: { title: string; icon: 'check' | 'plus' | 'lock' }) {
  const Icon = icon === 'check' ? CheckCircle2 : icon === 'plus' ? Plus : Lock
  const color = icon === 'check' ? 'text-emerald-500' : icon === 'plus' ? 'text-amber-500' : 'text-gray-400'
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span>{title}</span>
    </div>
  )
}

function Lane({ title, items }: { title: string; items: Array<{ main: string; secondary?: { title: string; icon: 'check' | 'plus' | 'lock' }[] }> }) {
  return (
    <div className="space-y-2">
      <div className="text-[15px] font-semibold text-gray-800">{title}</div>
      <div className="flex items-center gap-6 overflow-x-auto pb-2">
        {items.map((it, idx) => (
          <React.Fragment key={`${title}-${idx}`}>
            <div>
              <MainCard title={it.main} />
              {it.secondary && (
                <div className="mt-2 space-y-1">
                  {it.secondary.map((s, i) => (
                    <SecondaryCard key={`${title}-${idx}-s-${i}`} title={s.title} icon={s.icon} />
                  ))}
                </div>
              )}
            </div>
            {idx < items.length - 1 && (
              <div className="flex items-center gap-2">
                <ArrowRight className="h-6 w-6 text-sky-500" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function SkillPathReference() {
  return (
    <div className="w-full mx-auto max-w-6xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-wide uppercase">Calisthenics Skill Path</h1>
        <div className="mt-1 text-sm text-muted-foreground">Level 1: Novice</div>
        <div className="text-xs text-muted-foreground">40 XP / 100 XP</div>
      </div>

      <div className="mt-8 space-y-10">
        <Lane
          title="Push & Handstand Skills"
          items={[
            { main: 'Push-ups', secondary: [{ title: 'Wall Handstand', icon: 'check' }] },
            { main: 'Pleuuo Planche Push-up', secondary: [{ title: 'Freestanding Handstand', icon: 'check' }] },
            { main: 'Planche Leans', secondary: [{ title: 'Full Planche', icon: 'lock' }] },
          ]}
        />

        <Lane
          title="Pull & Core Skills"
          items={[
            { main: 'Pull-ups', secondary: [{ title: 'Leg Raises', icon: 'check' }] },
            { main: 'Muscle-up', secondary: [{ title: 'L-Sit Hold', icon: 'check' }] },
            { main: 'Front Lever', secondary: [{ title: 'Planche Lean Abds', icon: 'lock' }] },
          ]}
        />

        <Lane
          title="Leg & Balance Skills"
          items={[
            { main: 'Squats', secondary: [{ title: 'Calf Raises', icon: 'plus' }] },
            { main: 'Bulgarian Split Squats', secondary: [{ title: 'V-Sit Hold', icon: 'check' }] },
            { main: 'Shrimp Squats', secondary: [{ title: 'Nordic Curls', icon: 'lock' }] },
          ]}
        />
      </div>

      <div className="mt-10 flex justify-center">
        <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
          <Play className="h-4 w-4 mr-2" />
          Begin Training Session
        </Button>
      </div>
    </div>
  )
}