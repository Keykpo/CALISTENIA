'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Target, TrendingUp, ListChecks } from 'lucide-react';
import ExerciseGalleryTab from './components/ExerciseGalleryTab';
import SkillPathsTab from './components/SkillPathsTab';
import ProgressionViewTab from './components/ProgressionViewTab';
import CustomRoutinesTab from './components/CustomRoutinesTab';
import { type MasteryGoal } from '@/lib/fig-level-progressions';

export default function ExercisesPage() {
  const { data: session } = useSession();
  const [userFitnessLevel, setUserFitnessLevel] = useState<string>('BEGINNER');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [userSkillProgress, setUserSkillProgress] = useState<Record<string, any>>({});
  const [selectedSkill, setSelectedSkill] = useState<MasteryGoal | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) return;

      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        if (data.user?.fitnessLevel) {
          setUserFitnessLevel(data.user.fitnessLevel);
        }

        // Fetch skill progress
        try {
          const progressRes = await fetch(`/api/skill-progress/${session.user.id}`);
          const progressData = await progressRes.json();

          if (progressData.success && progressData.progress) {
            const progressMap: Record<string, any> = {};
            progressData.progress.forEach((p: any) => {
              progressMap[p.skillBranch] = {
                currentLevel: p.currentLevel,
                sessionsCompleted: p.sessionsCompleted,
                assessmentScore: p.assessmentScore,
              };
            });
            setUserSkillProgress(progressMap);
          }
        } catch (error) {
          console.error('Error fetching skill progress:', error);
        }

        // Load favorites and completed from localStorage
        const storedFavorites = localStorage.getItem('exercise-favorites');
        const storedCompleted = localStorage.getItem('exercise-completed');

        if (storedFavorites) {
          setFavorites(new Set(JSON.parse(storedFavorites)));
        }
        if (storedCompleted) {
          setCompleted(new Set(JSON.parse(storedCompleted)));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [session]);

  const toggleFavorite = (exerciseId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(exerciseId)) {
      newFavorites.delete(exerciseId);
    } else {
      newFavorites.add(exerciseId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('exercise-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const toggleCompleted = (exerciseId: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompleted(newCompleted);
    localStorage.setItem('exercise-completed', JSON.stringify(Array.from(newCompleted)));
  };

  const handleSelectSkill = (skill: MasteryGoal) => {
    setSelectedSkill(skill);
    setActiveTab('progressions');
  };

  const handleBackToSkillPaths = () => {
    setSelectedSkill(null);
    setActiveTab('skill-paths');
  };

  const handleStartTraining = async (skillBranch: MasteryGoal, level: string) => {
    try {
      if (!session?.user?.id) {
        alert('Please sign in to start training');
        return;
      }

      // Create a training session for the selected skill and level
      const response = await fetch('/api/training-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          skillBranch,
          userLevel: level,
          duration: 60, // Default 60 minutes
        }),
      });

      const data = await response.json();

      if (data.success && data.session?.id) {
        // Redirect to training session
        window.location.href = `/dashboard/training/${data.session.id}`;
      } else {
        console.error('Failed to create training session:', data.error);
        alert(`Failed to create training session: ${data.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error starting training:', error);
      alert('Error starting training. Please try again.');
    }
  };

  const currentLevel = selectedSkill
    ? userSkillProgress[selectedSkill]?.currentLevel || 'BEGINNER'
    : 'BEGINNER';

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Exercises</h1>
        </div>
        <p className="text-muted-foreground">
          Master calisthenics skills, explore exercises, and build custom routines
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="skill-paths" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Skill Paths</span>
            <span className="sm:hidden">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="progressions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Progressions</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Exercise Gallery</span>
            <span className="sm:hidden">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="routines" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Routines</span>
            <span className="sm:hidden">Routines</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skill-paths" className="mt-0">
          <SkillPathsTab
            userSkillProgress={userSkillProgress}
            onSelectSkill={handleSelectSkill}
          />
        </TabsContent>

        <TabsContent value="progressions" className="mt-0">
          <ProgressionViewTab
            selectedSkill={selectedSkill}
            userCurrentLevel={currentLevel}
            onBack={handleBackToSkillPaths}
            onStartTraining={handleStartTraining}
          />
        </TabsContent>

        <TabsContent value="gallery" className="mt-0">
          <ExerciseGalleryTab
            userFitnessLevel={userFitnessLevel}
            favorites={favorites}
            completed={completed}
            onToggleFavorite={toggleFavorite}
            onToggleCompleted={toggleCompleted}
          />
        </TabsContent>

        <TabsContent value="routines" className="mt-0">
          <CustomRoutinesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
