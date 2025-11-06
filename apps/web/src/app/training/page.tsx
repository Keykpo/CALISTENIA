'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { 
  Target, 
  Trophy, 
  Clock, 
  Zap, 
  CheckCircle, 
  Star,
  Coins,
  TrendingUp,
  Flame,
  Dumbbell,
  Heart,
  StretchHorizontal
} from 'lucide-react';

// Goal types
type GoalKey = 
  | 'fuerza_general' 
  | 'dominadas' 
  | 'flexibilidad' 
  | 'handstand' 
  | 'muscle_up' 
  | 'planche' 
  | 'front_lever'
  | 'back_lever'
  | 'human_flag'
  | 'dragon_flag'
  | 'one_arm_pullup'
  | 'pistol_squat'
  | 'bridge'
  | 'front_split'
  | 'side_split'
  | 'press_to_handstand'
  | 'weight_loss'
  | 'muscle_gain'
  | 'endurance';

type FitnessLevel = 'principiante' | 'intermedio' | 'avanzado';

// Rank system for exercises
type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  description: string;
  rank?: Rank;
}

interface Goal {
  key: GoalKey;
  name: string;
  description: string;
  icon: any;
  category: 'strength' | 'flexibility' | 'conditioning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Goals array with all objectives
const GOALS: Goal[] = [
  // Basic strength goals
  { key: 'fuerza_general', name: 'General Strength', description: 'Build full-body basic strength', icon: Dumbbell, category: 'strength', difficulty: 'beginner' },
  { key: 'dominadas', name: 'Pull-ups', description: 'Master perfect pull-ups', icon: TrendingUp, category: 'strength', difficulty: 'beginner' },
  
  // Advanced calisthenics goals
  { key: 'handstand', name: 'Handstand', description: 'Perfect balance in handstand', icon: Target, category: 'strength', difficulty: 'intermediate' },
  { key: 'muscle_up', name: 'Muscle Up', description: 'Explosive transition from pull-up to dip', icon: Zap, category: 'strength', difficulty: 'advanced' },
  { key: 'planche', name: 'Planche', description: 'Advanced horizontal balance', icon: Star, category: 'strength', difficulty: 'advanced' },
  { key: 'front_lever', name: 'Front Lever', description: 'Perfect front lever', icon: Trophy, category: 'strength', difficulty: 'advanced' },
  { key: 'back_lever', name: 'Back Lever', description: 'Full control back lever', icon: Trophy, category: 'strength', difficulty: 'advanced' },
  { key: 'human_flag', name: 'Human Flag', description: 'Side human flag', icon: Trophy, category: 'strength', difficulty: 'advanced' },
  { key: 'dragon_flag', name: 'Dragon Flag', description: 'Dragon flag for extreme core strength', icon: Flame, category: 'strength', difficulty: 'advanced' },
  { key: 'one_arm_pullup', name: 'One-arm Pull-up', description: 'Maximum unilateral strength', icon: Trophy, category: 'strength', difficulty: 'advanced' },
  { key: 'pistol_squat', name: 'Pistol Squat', description: 'Perfect single-leg squat', icon: Target, category: 'strength', difficulty: 'intermediate' },
  
  // Flexibility goals
  { key: 'flexibilidad', name: 'General Flexibility', description: 'Improve your range of motion', icon: StretchHorizontal, category: 'flexibility', difficulty: 'beginner' },
  { key: 'bridge', name: 'Bridge', description: 'Full bridge for back flexibility', icon: StretchHorizontal, category: 'flexibility', difficulty: 'intermediate' },
  { key: 'front_split', name: 'Front Split', description: 'Complete front split', icon: StretchHorizontal, category: 'flexibility', difficulty: 'intermediate' },
  { key: 'side_split', name: 'Side Split', description: 'Perfect side split', icon: StretchHorizontal, category: 'flexibility', difficulty: 'intermediate' },
  { key: 'press_to_handstand', name: 'Press to Handstand', description: 'Smooth transition to handstand', icon: Star, category: 'flexibility', difficulty: 'advanced' },
  
  // Conditioning goals
  { key: 'weight_loss', name: 'Weight Loss', description: 'Burn fat and improve body composition', icon: Flame, category: 'conditioning', difficulty: 'beginner' },
  { key: 'muscle_gain', name: 'Muscle Gain', description: 'Hypertrophy with calisthenics', icon: Dumbbell, category: 'conditioning', difficulty: 'intermediate' },
  { key: 'endurance', name: 'Endurance', description: 'Improve your cardiovascular capacity', icon: Heart, category: 'conditioning', difficulty: 'beginner' },
];

// Reward system based on fitness level and goal type
const getRewardByLevel = (level: FitnessLevel, goalDifficulty: string, goalType?: GoalKey) => {
  const baseRewards = {
    principiante: { exp: 10, coins: 5 },
    intermedio: { exp: 15, coins: 8 },
    avanzado: { exp: 20, coins: 12 }
  };
  
  const difficultyMultiplier = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2
  };

  // Goal-specific multipliers for enhanced rewards
  const goalMultipliers: Partial<Record<GoalKey, number>> = {
    // Basic goals
    fuerza_general: 1.0,
    dominadas: 1.2,
    flexibilidad: 1.0,
    
    // Advanced calisthenics goals (higher rewards for difficulty)
    handstand: 1.5,
    muscle_up: 1.8,
    planche: 2.0,
    front_lever: 1.8,
    back_lever: 1.9,
    human_flag: 2.2,
    dragon_flag: 1.7,
    one_arm_pullup: 2.5,
    pistol_squat: 1.4,
    
    // Flexibility goals (moderate rewards)
    bridge: 1.3,
    front_split: 1.2,
    side_split: 1.2,
    press_to_handstand: 2.1,
    
    // Conditioning goals (consistent rewards)
    weight_loss: 0.8,
    muscle_gain: 1.1,
    endurance: 0.9,
  };
  
  const base = baseRewards[level];
  const difficultyMult = difficultyMultiplier[goalDifficulty as keyof typeof difficultyMultiplier];
  const goalMult = goalType ? (goalMultipliers[goalType] || 1.0) : 1.0;
  
  return {
    exp: Math.round(base.exp * difficultyMult * goalMult),
    coins: Math.round(base.coins * difficultyMult * goalMult)
  };
};

// Compute rank for each exercise based on the user's fitness level
const getRankForExercise = (exercise: Exercise, level: FitnessLevel, index: number): Rank => {
  if (exercise.rank) return exercise.rank;
  // For each level, we progressively increase difficulty across the 4 exercises
  const rankByLevel: Record<FitnessLevel, Rank[]> = {
    principiante: ['F', 'E', 'D', 'C'],
    intermedio: ['D', 'C', 'B', 'A'],
    avanzado: ['C', 'B', 'A', 'S'],
  };
  const ranks = rankByLevel[level];
  return ranks[index] ?? ranks[ranks.length - 1];
};

// Ensure exercises have explicit rank; if missing, assign based on level and position
const withRanks = (level: FitnessLevel, exercises: Exercise[]): Exercise[] => {
  return exercises.map((ex, idx) => ({
    ...ex,
    rank: ex.rank ?? getRankForExercise(ex, level, idx),
  }));
};

// Map rank to a human-readable difficulty in English
const getDifficultyLabelByRank = (rank: Rank): string => {
  const map: Record<Rank, string> = {
    F: 'Very easy',
    E: 'Easy',
    D: 'Moderate',
    C: 'Challenging',
    B: 'Hard',
    A: 'Very hard',
    S: 'Elite',
  };
  return map[rank];
};

export default function TrainingPage() {
  const [selectedGoal, setSelectedGoal] = useState<GoalKey>('fuerza_general');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('principiante');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [totalExp, setTotalExp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [sessionExp, setSessionExp] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);

  // Load saved data on component mount
  useEffect(() => {
    const savedExp = localStorage.getItem('totalExp');
    const savedCoins = localStorage.getItem('coins');
    const savedLevel = localStorage.getItem('fitnessLevel');
    
    if (savedExp) setTotalExp(parseInt(savedExp));
    if (savedCoins) setCoins(parseInt(savedCoins));
    if (savedLevel) setFitnessLevel(savedLevel as FitnessLevel);
  }, []);

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('totalExp', totalExp.toString());
    localStorage.setItem('coins', coins.toString());
    localStorage.setItem('fitnessLevel', fitnessLevel);
  }, [totalExp, coins, fitnessLevel]);

  const selectedGoalData = GOALS.find(g => g.key === selectedGoal);
  const baseExercises = getExercisesFor(selectedGoal, fitnessLevel);
  const exercises = withRanks(fitnessLevel, baseExercises);

  const completeExercise = (exerciseName: string) => {
    if (completedExercises.has(exerciseName)) return;
    
    const reward = getRewardByLevel(fitnessLevel, selectedGoalData?.difficulty || 'beginner', selectedGoal);
    
    setCompletedExercises(prev => new Set([...prev, exerciseName]));
    setTotalExp(prev => prev + reward.exp);
    setCoins(prev => prev + reward.coins);
    setSessionExp(prev => prev + reward.exp);
    setSessionCoins(prev => prev + reward.coins);
  };

  const resetSession = () => {
    setCompletedExercises(new Set());
    setSessionExp(0);
    setSessionCoins(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
  <h1 className="text-4xl font-bold text-gray-900 mb-4">Personalized Training</h1>
  <p className="text-lg text-gray-600">Select your goal and level to get a personalized routine</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Total EXP</p>
                  <p className="text-2xl font-bold">{totalExp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Coins</p>
                  <p className="text-2xl font-bold">{coins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Session EXP</p>
                  <p className="text-2xl font-bold text-blue-600">{sessionExp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Session Coins</p>
                  <p className="text-2xl font-bold text-green-600">{sessionCoins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goal Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Select Your Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium">Fitness Level</label>
                  <select 
                    value={fitnessLevel} 
                    onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="principiante">Beginner</option>
                    <option value="intermedio">Intermediate</option>
                    <option value="avanzado">Advanced</option>
                  </select>
                </div>

                {/* Goal Categories */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">STRENGTH</h3>
                    <div className="space-y-1">
                      {GOALS.filter(g => g.category === 'strength').map((goal) => (
                        <button
                          key={goal.key}
                          onClick={() => setSelectedGoal(goal.key)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedGoal === goal.key 
                              ? 'bg-blue-100 border-2 border-blue-500' 
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <goal.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{goal.name}</span>
                            <Badge variant={goal.difficulty === 'advanced' ? 'destructive' : goal.difficulty === 'intermediate' ? 'default' : 'secondary'} className="ml-auto text-xs">
                              {goal.difficulty === 'beginner' ? 'Beginner' : goal.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">FLEXIBILITY</h3>
                    <div className="space-y-1">
                      {GOALS.filter(g => g.category === 'flexibility').map((goal) => (
                        <button
                          key={goal.key}
                          onClick={() => setSelectedGoal(goal.key)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedGoal === goal.key 
                              ? 'bg-blue-100 border-2 border-blue-500' 
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <goal.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{goal.name}</span>
                            <Badge variant={goal.difficulty === 'advanced' ? 'destructive' : goal.difficulty === 'intermediate' ? 'default' : 'secondary'} className="ml-auto text-xs">
                              {goal.difficulty === 'beginner' ? 'Beginner' : goal.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">CONDITIONING</h3>
                    <div className="space-y-1">
                      {GOALS.filter(g => g.category === 'conditioning').map((goal) => (
                        <button
                          key={goal.key}
                          onClick={() => setSelectedGoal(goal.key)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedGoal === goal.key 
                              ? 'bg-blue-100 border-2 border-blue-500' 
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <goal.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{goal.name}</span>
                            <Badge variant={goal.difficulty === 'advanced' ? 'destructive' : goal.difficulty === 'intermediate' ? 'default' : 'secondary'} className="ml-auto text-xs">
                              {goal.difficulty === 'beginner' ? 'Beginner' : goal.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercise List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {selectedGoalData?.icon && <selectedGoalData.icon className="h-5 w-5" />}
                  <span>{selectedGoalData?.name}</span>
                </CardTitle>
                <CardDescription>{selectedGoalData?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.map((exercise, index) => {
                    const isCompleted = completedExercises.has(exercise.name);
                    const reward = getRewardByLevel(fitnessLevel, selectedGoalData?.difficulty || 'beginner', selectedGoal);
                    const rank = exercise.rank as Rank;
                    const difficultyText = getDifficultyLabelByRank(rank);
                    
                    return (
                      <div key={index} className={`p-4 border rounded-lg ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 flex items-center">
                              <span>{exercise.name}</span>
                              <Badge variant="outline" className="ml-2">Rank {rank}</Badge>
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center space-x-1">
                                <Target className="h-4 w-4" />
                                <span>{exercise.sets} sets</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Zap className="h-4 w-4" />
                                <span>{exercise.reps} reps</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{exercise.rest} rest</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-indigo-500" />
                                <span>Difficulty: {difficultyText}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="flex items-center space-x-1 text-blue-600">
                                <Trophy className="h-4 w-4" />
                                <span>+{reward.exp} EXP</span>
                              </span>
                              <span className="flex items-center space-x-1 text-yellow-600">
                                <Coins className="h-4 w-4" />
                                <span>+{reward.coins} coins</span>
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => completeExercise(exercise.name)}
                            disabled={isCompleted}
                            variant={isCompleted ? "outline" : "default"}
                            size="sm"
                            className="ml-4"
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </>
                            ) : (
                              'Complete'
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Session Summary */}
                {completedExercises.size > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Session Summary</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm">
                        <span>Exercises completed: {completedExercises.size}</span>
                        <span className="text-blue-600">+{sessionExp} EXP</span>
                        <span className="text-yellow-600">+{sessionCoins} coins</span>
                      </div>
                      <Button onClick={resetSession} variant="outline" size="sm">
                        New Session
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Exercise generation function
function getExercisesFor(goal: GoalKey, level: FitnessLevel): Exercise[] {
  const exercises: { [key in GoalKey]: { [key in FitnessLevel]: Exercise[] } } = {
    fuerza_general: {
      principiante: [
        { name: 'Flexiones de rodillas', sets: 3, reps: '8-12', rest: '60s', description: 'Flexiones modificadas para desarrollar fuerza básica del pecho y brazos' },
        { name: 'Dominadas asistidas', sets: 3, reps: '5-8', rest: '90s', description: 'Dominadas con banda elástica o apoyo para fortalecer la espalda' },
        { name: 'Sentadillas libres', sets: 3, reps: '12-15', rest: '60s', description: 'Sentadillas básicas para fortalecer piernas y glúteos' },
        { name: 'Plancha', sets: 3, reps: '20-30s', rest: '60s', description: 'Mantén posición de plancha para fortalecer el core' },
      ],
      intermedio: [
        { name: 'Flexiones estándar', sets: 4, reps: '10-15', rest: '60s', description: 'Flexiones completas con buena técnica' },
        { name: 'Dominadas', sets: 4, reps: '6-10', rest: '90s', description: 'Dominadas completas sin asistencia' },
        { name: 'Fondos en paralelas', sets: 3, reps: '8-12', rest: '75s', description: 'Fondos para desarrollar tríceps y pecho' },
        { name: 'Sentadillas pistol asistidas', sets: 3, reps: '5-8 cada pierna', rest: '90s', description: 'Sentadillas a una pierna con apoyo' },
      ],
      avanzado: [
        { name: 'Flexiones con palmada', sets: 4, reps: '8-12', rest: '90s', description: 'Flexiones explosivas con palmada en el aire' },
        { name: 'Dominadas lastradas', sets: 4, reps: '6-8', rest: '2min', description: 'Dominadas con peso adicional' },
        { name: 'Fondos lastrados', sets: 4, reps: '8-10', rest: '2min', description: 'Fondos en paralelas con peso adicional' },
        { name: 'Muscle-up negativas', sets: 3, reps: '3-5', rest: '2min', description: 'Fase negativa del muscle-up para desarrollar fuerza' },
      ],
    },
    dominadas: {
      principiante: [
        { name: 'Dominadas asistidas con banda', sets: 3, reps: '5-8', rest: '90s', description: 'Usa banda elástica para reducir el peso corporal' },
        { name: 'Dominadas negativas', sets: 3, reps: '3-5', rest: '90s', description: 'Salta arriba y baja lentamente en 3-5 segundos' },
        { name: 'Colgarse en barra', sets: 3, reps: '20-30s', rest: '60s', description: 'Desarrolla fuerza de agarre colgándote de la barra' },
        { name: 'Remo invertido', sets: 3, reps: '8-12', rest: '60s', description: 'Remo horizontal para fortalecer músculos de tracción' },
      ],
      intermedio: [
        { name: 'Dominadas estrictas', sets: 4, reps: '6-10', rest: '90s', description: 'Dominadas completas sin impulso' },
        { name: 'Dominadas con agarre amplio', sets: 3, reps: '5-8', rest: '90s', description: 'Enfoque en dorsales con agarre más amplio' },
        { name: 'Dominadas supinas', sets: 3, reps: '6-10', rest: '90s', description: 'Agarre supino para trabajar bíceps' },
        { name: 'Dominadas L-sit', sets: 3, reps: '3-6', rest: '2min', description: 'Dominadas manteniendo piernas horizontales' },
      ],
      avanzado: [
        { name: 'Dominadas lastradas', sets: 4, reps: '5-8', rest: '2min', description: 'Dominadas con chaleco de peso o cinturón' },
        { name: 'Dominadas arqueras', sets: 3, reps: '3-6 cada lado', rest: '2min', description: 'Dominadas asimétricas preparando una mano' },
        { name: 'Dominadas comando', sets: 3, reps: '6-10', rest: '90s', description: 'Alternando lados de la barra en cada repetición' },
        { name: 'Dominadas a una mano asistidas', sets: 3, reps: '1-3 cada lado', rest: '3min', description: 'Progresión hacia la dominada a una mano' },
      ],
    },
    handstand: {
      principiante: [
        { name: 'Parada de manos contra pared', sets: 3, reps: '20-30s', rest: '60s', description: 'Practica el equilibrio con apoyo de la pared' },
        { name: 'Pike push-ups', sets: 3, reps: '8-12', rest: '60s', description: 'Fortalece hombros en posición invertida' },
        { name: 'Hollow body hold', sets: 3, reps: '20-30s', rest: '60s', description: 'Desarrolla fuerza del core necesaria para handstand' },
        { name: 'Caminata en pared', sets: 3, reps: '5-8 pasos', rest: '90s', description: 'Camina con las manos acercándote a la pared' },
      ],
      intermedio: [
        { name: 'Handstand pared 60s', sets: 3, reps: '45-60s', rest: '90s', description: 'Mantén handstand contra pared por tiempo prolongado' },
        { name: 'Handstand chest-to-wall', sets: 3, reps: '30-45s', rest: '90s', description: 'Handstand mirando hacia la pared para mejor alineación' },
        { name: 'Pike push-ups elevados', sets: 3, reps: '8-12', rest: '75s', description: 'Pike push-ups con pies elevados' },
        { name: 'Handstand kick-ups', sets: 5, reps: '5-10 intentos', rest: '60s', description: 'Practica subir a handstand sin pared' },
      ],
      avanzado: [
        { name: 'Handstand libre', sets: 5, reps: '30-60s', rest: '2min', description: 'Handstand sin apoyo con control total' },
        { name: 'Handstand push-ups', sets: 3, reps: '5-10', rest: '2min', description: 'Flexiones en posición de handstand' },
        { name: 'Handstand caminata', sets: 3, reps: '10-20 pasos', rest: '2min', description: 'Camina en handstand manteniendo el equilibrio' },
        { name: 'One arm handstand progresión', sets: 3, reps: '10-20s', rest: '3min', description: 'Progresión hacia handstand a una mano' },
      ],
    },
    muscle_up: {
      principiante: [
        { name: 'Dominadas explosivas', sets: 3, reps: '5-8', rest: '90s', description: 'Dominadas rápidas llevando pecho a la barra' },
        { name: 'Fondos en paralelas', sets: 3, reps: '8-12', rest: '75s', description: 'Fortalece la fase de empuje del muscle-up' },
        { name: 'Muscle-up negativo', sets: 3, reps: '3-5', rest: '2min', description: 'Baja lentamente desde arriba de la barra' },
        { name: 'Transición asistida', sets: 3, reps: '3-5', rest: '90s', description: 'Practica la transición con banda elástica' },
      ],
      intermedio: [
        { name: 'Dominadas al pecho', sets: 4, reps: '6-8', rest: '90s', description: 'Dominadas llevando pecho por encima de la barra' },
        { name: 'Muscle-up con kip', sets: 3, reps: '3-6', rest: '2min', description: 'Muscle-up usando impulso controlado' },
        { name: 'Fondos profundos', sets: 3, reps: '8-10', rest: '90s', description: 'Fondos con rango completo de movimiento' },
        { name: 'False grip holds', sets: 3, reps: '20-30s', rest: '60s', description: 'Mantén agarre falso para muscle-up en anillas' },
      ],
      avanzado: [
        { name: 'Muscle-up estricto', sets: 4, reps: '3-6', rest: '2min', description: 'Muscle-up sin impulso, solo fuerza' },
        { name: 'Muscle-up lastrado', sets: 3, reps: '2-4', rest: '3min', description: 'Muscle-up con peso adicional' },
        { name: 'Muscle-up en anillas', sets: 3, reps: '3-5', rest: '2min', description: 'Muscle-up en anillas para mayor dificultad' },
        { name: 'Muscle-up a una mano asistido', sets: 2, reps: '1-2 cada lado', rest: '3min', description: 'Progresión hacia muscle-up unilateral' },
      ],
    },
    planche: {
      principiante: [
        { name: 'Planche lean', sets: 3, reps: '15-30s', rest: '60s', description: 'Inclínate hacia adelante en posición de flexión' },
        { name: 'Frog stand', sets: 3, reps: '10-20s', rest: '60s', description: 'Equilibrio en cuclillas con manos en el suelo' },
        { name: 'Flexiones pseudo planche', sets: 3, reps: '5-10', rest: '75s', description: 'Flexiones con manos hacia atrás' },
        { name: 'Tuck planche', sets: 3, reps: '5-15s', rest: '90s', description: 'Planche con rodillas al pecho' },
      ],
      intermedio: [
        { name: 'Advanced tuck planche', sets: 3, reps: '10-20s', rest: '90s', description: 'Tuck planche con rodillas más extendidas' },
        { name: 'Tuck planche push-ups', sets: 3, reps: '3-8', rest: '2min', description: 'Flexiones en posición tuck planche' },
        { name: 'One leg planche', sets: 3, reps: '5-15s cada pierna', rest: '90s', description: 'Planche extendiendo una pierna' },
        { name: 'Straddle planche lean', sets: 3, reps: '15-25s', rest: '90s', description: 'Lean con piernas abiertas' },
      ],
      avanzado: [
        { name: 'Straddle planche', sets: 3, reps: '10-20s', rest: '2min', description: 'Planche con piernas abiertas' },
        { name: 'Full planche', sets: 3, reps: '5-15s', rest: '3min', description: 'Planche completo con piernas juntas' },
        { name: 'Planche push-ups', sets: 3, reps: '3-6', rest: '3min', description: 'Flexiones en posición planche completo' },
        { name: 'Maltese progresión', sets: 2, reps: '3-8s', rest: '3min', description: 'Progresión hacia el maltese' },
      ],
    },
    front_lever: {
      principiante: [
        { name: 'Tuck front lever', sets: 3, reps: '10-20s', rest: '90s', description: 'Front lever con rodillas al pecho' },
        { name: 'Front lever negativas', sets: 3, reps: '3-5', rest: '90s', description: 'Baja lentamente desde posición invertida' },
        { name: 'Dominadas front lever', sets: 3, reps: '5-8', rest: '90s', description: 'Dominadas llevando piernas hacia adelante' },
        { name: 'Ice cream makers', sets: 3, reps: '3-6', rest: '2min', description: 'Desde front lever a dominada invertida' },
      ],
      intermedio: [
        { name: 'Advanced tuck front lever', sets: 3, reps: '15-25s', rest: '90s', description: 'Tuck con rodillas más extendidas' },
        { name: 'One leg front lever', sets: 3, reps: '8-15s cada pierna', rest: '90s', description: 'Front lever extendiendo una pierna' },
        { name: 'Straddle front lever', sets: 3, reps: '5-12s', rest: '2min', description: 'Front lever con piernas abiertas' },
        { name: 'Front lever raises', sets: 3, reps: '5-8', rest: '2min', description: 'Subir y bajar en front lever controlado' },
      ],
      avanzado: [
        { name: 'Full front lever', sets: 3, reps: '10-20s', rest: '2min', description: 'Front lever completo con piernas juntas' },
        { name: 'Front lever pull-ups', sets: 3, reps: '3-6', rest: '3min', description: 'Dominadas manteniendo front lever' },
        { name: 'Front lever touch', sets: 3, reps: '3-5', rest: '3min', description: 'Tocar pies manteniendo front lever' },
        { name: 'Victorian progresión', sets: 2, reps: '3-8s', rest: '3min', description: 'Progresión hacia el victorian' },
      ],
    },
    back_lever: {
      principiante: [
        { name: 'Tuck back lever', sets: 3, reps: '10-20s', rest: '90s', description: 'Back lever con rodillas al pecho' },
        { name: 'Back lever negativas', sets: 3, reps: '3-5', rest: '90s', description: 'Baja lentamente a posición back lever' },
        { name: 'Skin the cat', sets: 3, reps: '3-6', rest: '90s', description: 'Rotación completa colgando de la barra' },
        { name: 'German hang', sets: 3, reps: '15-30s', rest: '60s', description: 'Colgarse con brazos extendidos hacia atrás' },
      ],
      intermedio: [
        { name: 'Straddle back lever', sets: 3, reps: '8-15s', rest: '90s', description: 'Back lever con piernas abiertas' },
        { name: 'Half lay back lever', sets: 3, reps: '5-12s', rest: '2min', description: 'Back lever con una pierna extendida' },
        { name: 'Back lever raises', sets: 3, reps: '5-8', rest: '2min', description: 'Subir y bajar controladamente' },
        { name: 'Back lever to inverted hang', sets: 3, reps: '3-5', rest: '2min', description: 'Transición desde back lever' },
      ],
      avanzado: [
        { name: 'Full back lever', sets: 3, reps: '10-20s', rest: '2min', description: 'Back lever completo con piernas juntas' },
        { name: 'Back lever pull-ups', sets: 3, reps: '2-5', rest: '3min', description: 'Dominadas desde posición back lever' },
        { name: 'Back lever press', sets: 3, reps: '2-4', rest: '3min', description: 'Presionar desde back lever a handstand' },
        { name: 'Elbow lever to back lever', sets: 2, reps: '2-3', rest: '3min', description: 'Transición entre posiciones' },
      ],
    },
    human_flag: {
      principiante: [
        { name: 'Tuck human flag', sets: 3, reps: '5-15s', rest: '90s', description: 'Human flag con rodillas al pecho' },
        { name: 'Flag negativas', sets: 3, reps: '3-5', rest: '90s', description: 'Baja lentamente desde posición vertical' },
        { name: 'Side plank', sets: 3, reps: '30-45s cada lado', rest: '60s', description: 'Plancha lateral para fortalecer core' },
        { name: 'Flag holds verticales', sets: 3, reps: '10-20s', rest: '60s', description: 'Mantén posición vertical en poste' },
      ],
      intermedio: [
        { name: 'Straddle human flag', sets: 3, reps: '8-15s', rest: '90s', description: 'Human flag con piernas abiertas' },
        { name: 'Flag raises', sets: 3, reps: '5-8', rest: '2min', description: 'Subir y bajar en human flag' },
        { name: 'One leg flag', sets: 3, reps: '5-10s cada pierna', rest: '90s', description: 'Flag extendiendo una pierna' },
        { name: 'Flag push-ups', sets: 3, reps: '3-6', rest: '2min', description: 'Flexiones en posición flag' },
      ],
      avanzado: [
        { name: 'Full human flag', sets: 3, reps: '10-20s', rest: '2min', description: 'Human flag completo horizontal' },
        { name: 'Flag pull-ups', sets: 3, reps: '3-5', rest: '3min', description: 'Dominadas en posición flag' },
        { name: 'Flag press', sets: 3, reps: '2-4', rest: '3min', description: 'Presionar desde flag a vertical' },
        { name: 'Dragon flag to human flag', sets: 2, reps: '2-3', rest: '3min', description: 'Transición entre movimientos' },
      ],
    },
    dragon_flag: {
      principiante: [
        { name: 'Tuck dragon flag', sets: 3, reps: '5-15s', rest: '90s', description: 'Dragon flag con rodillas al pecho' },
        { name: 'Dragon flag negativas', sets: 3, reps: '3-5', rest: '90s', description: 'Baja lentamente manteniendo rigidez' },
        { name: 'Hollow body rocks', sets: 3, reps: '10-15', rest: '60s', description: 'Balanceo en posición hollow body' },
        { name: 'V-ups', sets: 3, reps: '8-12', rest: '60s', description: 'Abdominales en V para fortalecer core' },
      ],
      intermedio: [
        { name: 'Bent knee dragon flag', sets: 3, reps: '8-15s', rest: '90s', description: 'Dragon flag con rodillas ligeramente dobladas' },
        { name: 'Dragon flag raises', sets: 3, reps: '5-8', rest: '2min', description: 'Subir y bajar controladamente' },
        { name: 'One leg dragon flag', sets: 3, reps: '5-10s cada pierna', rest: '90s', description: 'Dragon flag con una pierna extendida' },
        { name: 'Dragon flag pulses', sets: 3, reps: '8-12', rest: '90s', description: 'Pequeños pulsos en posición dragon flag' },
      ],
      avanzado: [
        { name: 'Full dragon flag', sets: 3, reps: '10-20s', rest: '2min', description: 'Dragon flag completo con piernas rectas' },
        { name: 'Dragon flag reps', sets: 3, reps: '5-10', rest: '2min', description: 'Repeticiones completas de dragon flag' },
        { name: 'Weighted dragon flag', sets: 3, reps: '5-8s', rest: '3min', description: 'Dragon flag con peso adicional' },
        { name: 'Dragon flag to V-sit', sets: 3, reps: '3-5', rest: '3min', description: 'Transición a V-sit desde dragon flag' },
      ],
    },
    one_arm_pullup: {
      principiante: [
        { name: 'Dominadas asimétricas', sets: 3, reps: '5-8 cada lado', rest: '90s', description: 'Una mano más alta que la otra' },
        { name: 'Dominadas con toalla', sets: 3, reps: '5-8 cada lado', rest: '90s', description: 'Una mano en barra, otra en toalla' },
        { name: 'Negativas a una mano', sets: 3, reps: '2-4 cada lado', rest: '2min', description: 'Baja lentamente con una mano' },
        { name: 'Dominadas lastradas', sets: 3, reps: '6-8', rest: '90s', description: 'Dominadas con peso adicional' },
      ],
      intermedio: [
        { name: 'Dominadas arqueras', sets: 3, reps: '4-8 cada lado', rest: '2min', description: 'Dominadas laterales alternando brazos' },
        { name: 'One arm hang', sets: 3, reps: '15-30s cada brazo', rest: '90s', description: 'Colgarse con un solo brazo' },
        { name: 'Dominadas con banda', sets: 3, reps: '3-6 cada lado', rest: '2min', description: 'Asistencia mínima con banda elástica' },
        { name: 'Typewriter pull-ups', sets: 3, reps: '6-10', rest: '2min', description: 'Dominadas deslizándose lateralmente' },
      ],
      avanzado: [
        { name: 'One arm pull-up', sets: 3, reps: '1-3 cada brazo', rest: '3min', description: 'Dominada completa a una mano' },
        { name: 'One arm chin-up', sets: 3, reps: '1-3 cada brazo', rest: '3min', description: 'Dominada supina a una mano' },
        { name: 'Weighted one arm negatives', sets: 3, reps: '2-3 cada lado', rest: '3min', description: 'Negativas a una mano con peso' },
        { name: 'One arm muscle-up progresión', sets: 2, reps: '1-2 cada lado', rest: '4min', description: 'Progresión hacia muscle-up unilateral' },
      ],
    },
    pistol_squat: {
      principiante: [
        { name: 'Sentadillas asistidas', sets: 3, reps: '5-10 cada pierna', rest: '60s', description: 'Pistol squat con apoyo de manos' },
        { name: 'Box pistol squats', sets: 3, reps: '6-12 cada pierna', rest: '60s', description: 'Pistol squat sentándose en caja' },
        { name: 'Sentadillas búlgaras', sets: 3, reps: '8-12 cada pierna', rest: '60s', description: 'Sentadillas con pie trasero elevado' },
        { name: 'Pistol squat negativas', sets: 3, reps: '3-6 cada pierna', rest: '90s', description: 'Baja lentamente en pistol squat' },
      ],
      intermedio: [
        { name: 'Pistol squat con banda', sets: 3, reps: '5-10 cada pierna', rest: '90s', description: 'Asistencia ligera con banda elástica' },
        { name: 'Elevated pistol squats', sets: 3, reps: '6-10 cada pierna', rest: '90s', description: 'Pistol squat desde superficie elevada' },
        { name: 'Shrimp squats progresión', sets: 3, reps: '3-6 cada pierna', rest: '2min', description: 'Progresión hacia shrimp squat' },
        { name: 'Cossack squats', sets: 3, reps: '8-12 cada lado', rest: '75s', description: 'Sentadillas laterales para movilidad' },
      ],
      avanzado: [
        { name: 'Pistol squat completo', sets: 3, reps: '8-12 cada pierna', rest: '90s', description: 'Pistol squat sin asistencia' },
        { name: 'Weighted pistol squats', sets: 3, reps: '5-8 cada pierna', rest: '2min', description: 'Pistol squat con peso adicional' },
        { name: 'Shrimp squats', sets: 3, reps: '3-6 cada pierna', rest: '2min', description: 'Sentadilla con pierna atrás' },
        { name: 'Dragon squats', sets: 2, reps: '2-5 cada pierna', rest: '3min', description: 'Variación extrema de pistol squat' },
      ],
    },
    flexibilidad: {
      principiante: [
        { name: 'Estiramiento de isquiotibiales', sets: 3, reps: '30-45s cada pierna', rest: '30s', description: 'Estira la parte posterior de las piernas' },
        { name: 'Estiramiento de cuádriceps', sets: 3, reps: '30-45s cada pierna', rest: '30s', description: 'Estira la parte frontal del muslo' },
        { name: 'Estiramiento de hombros', sets: 3, reps: '30-45s cada brazo', rest: '30s', description: 'Mejora la movilidad de hombros' },
        { name: 'Gato-camello', sets: 3, reps: '10-15', rest: '30s', description: 'Movilidad de columna vertebral' },
      ],
      intermedio: [
        { name: 'Pike stretch', sets: 3, reps: '45-60s', rest: '45s', description: 'Estiramiento profundo de isquiotibiales' },
        { name: 'Pancake stretch', sets: 3, reps: '45-60s', rest: '45s', description: 'Estiramiento sentado con piernas abiertas' },
        { name: 'Shoulder dislocates', sets: 3, reps: '10-15', rest: '30s', description: 'Movilidad de hombros con banda' },
        { name: 'Hip flexor stretch', sets: 3, reps: '45-60s cada lado', rest: '45s', description: 'Estira flexores de cadera' },
      ],
      avanzado: [
        { name: 'Oversplits', sets: 3, reps: '60-90s cada pierna', rest: '60s', description: 'Splits más allá de 180 grados' },
        { name: 'Backbend progression', sets: 3, reps: '30-60s', rest: '90s', description: 'Progresión hacia puente completo' },
        { name: 'Scorpion stretch', sets: 3, reps: '30-45s cada lado', rest: '60s', description: 'Estiramiento avanzado de espalda' },
        { name: 'King pigeon pose', sets: 3, reps: '45-60s cada lado', rest: '60s', description: 'Postura avanzada de yoga' },
      ],
    },
    bridge: {
      principiante: [
        { name: 'Puente básico', sets: 3, reps: '15-30s', rest: '60s', description: 'Puente desde el suelo activando glúteos' },
        { name: 'Puente de hombros', sets: 3, reps: '20-30s', rest: '60s', description: 'Puente apoyando hombros en el suelo' },
        { name: 'Estiramiento de pecho', sets: 3, reps: '30-45s', rest: '30s', description: 'Abre el pecho para preparar el puente' },
        { name: 'Extensiones de espalda', sets: 3, reps: '10-15', rest: '45s', description: 'Fortalece músculos extensores' },
      ],
      intermedio: [
        { name: 'Puente desde pared', sets: 3, reps: '20-40s', rest: '90s', description: 'Camina hacia abajo por la pared' },
        { name: 'Puente asistido', sets: 3, reps: '15-30s', rest: '90s', description: 'Puente con ayuda de otra persona' },
        { name: 'Wheel pose holds', sets: 3, reps: '10-20s', rest: '90s', description: 'Mantén posición de rueda' },
        { name: 'Camel pose', sets: 3, reps: '30-45s', rest: '60s', description: 'Postura de camello para flexibilidad' },
      ],
      avanzado: [
        { name: 'Puente completo', sets: 3, reps: '30-60s', rest: '2min', description: 'Puente completo sin asistencia' },
        { name: 'Bridge walk-ups', sets: 3, reps: '5-10', rest: '2min', description: 'Subir y bajar del puente' },
        { name: 'One arm bridge', sets: 3, reps: '10-20s cada brazo', rest: '2min', description: 'Puente levantando un brazo' },
        { name: 'Bridge to stand', sets: 3, reps: '3-6', rest: '3min', description: 'Levantarse desde posición de puente' },
      ],
    },
    front_split: {
      principiante: [
        { name: 'Estocadas profundas', sets: 3, reps: '30-45s cada pierna', rest: '45s', description: 'Estocadas manteniendo posición' },
        { name: 'Estiramiento de psoas', sets: 3, reps: '30-45s cada lado', rest: '45s', description: 'Estira flexores de cadera' },
        { name: 'Estiramiento de isquiotibiales', sets: 3, reps: '30-45s cada pierna', rest: '45s', description: 'Estira parte posterior del muslo' },
        { name: 'Splits asistidos', sets: 3, reps: '30-60s cada pierna', rest: '60s', description: 'Splits con apoyo de bloques' },
      ],
      intermedio: [
        { name: 'Splits con soporte', sets: 3, reps: '45-90s cada pierna', rest: '60s', description: 'Splits bajando gradualmente el soporte' },
        { name: 'Estiramiento dinámico', sets: 3, reps: '10-15 cada pierna', rest: '45s', description: 'Movimientos dinámicos hacia split' },
        { name: 'PNF stretching', sets: 3, reps: '3-5 ciclos cada pierna', rest: '60s', description: 'Estiramiento con contracción-relajación' },
        { name: 'Splits en pared', sets: 3, reps: '60-90s cada pierna', rest: '60s', description: 'Splits con pierna trasera en pared' },
      ],
      avanzado: [
        { name: 'Front split completo', sets: 3, reps: '60-120s cada pierna', rest: '90s', description: 'Split frontal completo al suelo' },
        { name: 'Oversplits frontales', sets: 3, reps: '30-60s cada pierna', rest: '90s', description: 'Splits más allá de 180 grados' },
        { name: 'Splits con flexión', sets: 3, reps: '30-45s cada pierna', rest: '90s', description: 'Split inclinándose hacia adelante' },
        { name: 'Needle scale', sets: 3, reps: '15-30s cada pierna', rest: '2min', description: 'Split vertical de pie' },
      ],
    },
    side_split: {
      principiante: [
        { name: 'Sentadillas sumo', sets: 3, reps: '30-45s', rest: '45s', description: 'Sentadilla profunda con piernas abiertas' },
        { name: 'Estiramiento de aductores', sets: 3, reps: '30-45s cada lado', rest: '45s', description: 'Estira músculos internos del muslo' },
        { name: 'Mariposa', sets: 3, reps: '45-60s', rest: '45s', description: 'Sentado con plantas de pies juntas' },
        { name: 'Splits laterales asistidos', sets: 3, reps: '30-60s', rest: '60s', description: 'Side splits con apoyo de bloques' },
      ],
      intermedio: [
        { name: 'Pancake stretch', sets: 3, reps: '60-90s', rest: '60s', description: 'Inclinarse hacia adelante con piernas abiertas' },
        { name: 'Side splits progresivos', sets: 3, reps: '60-90s', rest: '60s', description: 'Bajar gradualmente en side split' },
        { name: 'Cossack squats', sets: 3, reps: '8-12 cada lado', rest: '45s', description: 'Sentadillas laterales dinámicas' },
        { name: 'Straddle stretch', sets: 3, reps: '60-90s', rest: '60s', description: 'Estiramiento sentado con piernas abiertas' },
      ],
      avanzado: [
        { name: 'Side split completo', sets: 3, reps: '90-180s', rest: '90s', description: 'Split lateral completo al suelo' },
        { name: 'Oversplits laterales', sets: 3, reps: '30-60s', rest: '90s', description: 'Side splits elevados más de 180°' },
        { name: 'Middle split press', sets: 3, reps: '5-10', rest: '2min', description: 'Presionar hacia arriba desde side split' },
        { name: 'Flying splits', sets: 3, reps: '3-6 cada lado', rest: '2min', description: 'Saltos en split lateral' },
      ],
    },
    press_to_handstand: {
      principiante: [
        { name: 'Pike compressions', sets: 3, reps: '10-15', rest: '60s', description: 'Comprimir piernas hacia pecho en pike' },
        { name: 'L-sit progresión', sets: 3, reps: '10-20s', rest: '60s', description: 'Mantener piernas elevadas sentado' },
        { name: 'Straddle ups', sets: 3, reps: '8-12', rest: '60s', description: 'Levantar caderas con piernas abiertas' },
        { name: 'Pike push-ups', sets: 3, reps: '8-12', rest: '60s', description: 'Flexiones en posición pike' },
      ],
      intermedio: [
        { name: 'Straddle press negativas', sets: 3, reps: '3-6', rest: '90s', description: 'Bajar lentamente desde handstand' },
        { name: 'Press to headstand', sets: 3, reps: '5-8', rest: '90s', description: 'Presionar a parada de cabeza' },
        { name: 'Bent arm press', sets: 3, reps: '3-6', rest: '2min', description: 'Press con brazos doblados' },
        { name: 'Crow to chaturanga', sets: 3, reps: '5-8', rest: '90s', description: 'Transición desde crow pose' },
      ],
      avanzado: [
        { name: 'Straddle press to handstand', sets: 3, reps: '3-6', rest: '2min', description: 'Press completo con piernas abiertas' },
        { name: 'Pike press to handstand', sets: 3, reps: '2-5', rest: '3min', description: 'Press con piernas juntas' },
        { name: 'One arm press progresión', sets: 2, reps: '1-3 cada brazo', rest: '3min', description: 'Progresión hacia press unilateral' },
        { name: 'Press to handstand variations', sets: 3, reps: '2-4', rest: '3min', description: 'Variaciones avanzadas de press' },
      ],
    },
    weight_loss: {
      principiante: [
        { name: 'Circuito básico', sets: 3, reps: '30s trabajo/30s descanso', rest: '2min', description: 'Burpees, sentadillas, flexiones, plancha' },
        { name: 'Jumping jacks', sets: 3, reps: '30-45s', rest: '60s', description: 'Saltos abriendo y cerrando piernas' },
        { name: 'Mountain climbers', sets: 3, reps: '20-30s', rest: '60s', description: 'Escaladores para cardio y core' },
        { name: 'Marcha en el lugar', sets: 3, reps: '60s', rest: '45s', description: 'Activación cardiovascular básica' },
      ],
      intermedio: [
        { name: 'HIIT circuito', sets: 4, reps: '40s trabajo/20s descanso', rest: '2min', description: 'Circuito de alta intensidad' },
        { name: 'Burpees', sets: 4, reps: '30-45s', rest: '75s', description: 'Ejercicio completo de cuerpo' },
        { name: 'Squat jumps', sets: 4, reps: '30-40s', rest: '60s', description: 'Saltos de sentadilla explosivos' },
        { name: 'Tabata protocol', sets: 8, reps: '20s trabajo/10s descanso', rest: '3min', description: 'Protocolo Tabata intenso' },
      ],
      avanzado: [
        { name: 'Metcon workout', sets: 5, reps: '45s trabajo/15s descanso', rest: '3min', description: 'Entrenamiento metabólico avanzado' },
        { name: 'Burpee variations', sets: 4, reps: '45-60s', rest: '90s', description: 'Variaciones avanzadas de burpees' },
        { name: 'Plyometric circuit', sets: 4, reps: '40s trabajo/20s descanso', rest: '2min', description: 'Circuito pliométrico intenso' },
        { name: 'EMOM cardio', sets: 10, reps: 'Cada minuto', rest: '0s', description: 'Every Minute On the Minute cardio' },
      ],
    },
    muscle_gain: {
      principiante: [
        { name: 'Flexiones progresivas', sets: 4, reps: '8-12', rest: '90s', description: 'Flexiones adaptadas a tu nivel' },
        { name: 'Dominadas asistidas', sets: 4, reps: '6-10', rest: '2min', description: 'Dominadas con banda o apoyo' },
        { name: 'Sentadillas', sets: 4, reps: '12-15', rest: '90s', description: 'Sentadillas para piernas y glúteos' },
        { name: 'Plancha', sets: 3, reps: '30-60s', rest: '90s', description: 'Isométrico para core y estabilidad' },
      ],
      intermedio: [
        { name: 'Flexiones lastradas', sets: 4, reps: '8-12', rest: '2min', description: 'Flexiones con peso adicional' },
        { name: 'Dominadas', sets: 4, reps: '6-10', rest: '2min', description: 'Dominadas completas sin asistencia' },
        { name: 'Fondos en paralelas', sets: 4, reps: '8-12', rest: '2min', description: 'Fondos para tríceps y pecho' },
        { name: 'Pistol squats asistidas', sets: 3, reps: '6-10 cada pierna', rest: '2min', description: 'Sentadillas unilaterales' },
      ],
      avanzado: [
        { name: 'Ejercicios lastrados', sets: 5, reps: '6-8', rest: '3min', description: 'Movimientos básicos con peso extra' },
        { name: 'Movimientos avanzados', sets: 4, reps: '3-6', rest: '3min', description: 'Muscle-ups, one-arm push-ups, etc.' },
        { name: 'Superseries', sets: 4, reps: '8-12 + 6-10', rest: '2min', description: 'Ejercicios combinados sin descanso' },
        { name: 'Tempo training', sets: 4, reps: '6-8', rest: '3min', description: 'Ejercicios con tempo controlado' },
      ],
    },
    endurance: {
      principiante: [
        { name: 'Caminata activa', sets: 1, reps: '15-20 min', rest: '0s', description: 'Caminata a ritmo moderado constante' },
        { name: 'Circuito ligero', sets: 3, reps: '45s trabajo/60s descanso', rest: '3min', description: 'Ejercicios básicos a ritmo sostenido' },
        { name: 'Escalones', sets: 3, reps: '2-3 min', rest: '2min', description: 'Subir y bajar escalones continuamente' },
        { name: 'Respiración rítmica', sets: 3, reps: '5 min', rest: '2min', description: 'Ejercicios de respiración controlada' },
      ],
      intermedio: [
        { name: 'Cardio intervals', sets: 6, reps: '2min trabajo/1min descanso', rest: '0s', description: 'Intervalos de intensidad moderada' },
        { name: 'Circuito resistencia', sets: 4, reps: '60s trabajo/30s descanso', rest: '3min', description: 'Circuito enfocado en resistencia' },
        { name: 'Fartlek training', sets: 1, reps: '20-25 min', rest: '0s', description: 'Entrenamiento con cambios de ritmo' },
        { name: 'Tempo runs', sets: 3, reps: '5-8 min', rest: '3min', description: 'Carrera a ritmo constante moderado' },
      ],
      avanzado: [
        { name: 'Long intervals', sets: 5, reps: '4min trabajo/2min descanso', rest: '0s', description: 'Intervalos largos de alta intensidad' },
        { name: 'Threshold training', sets: 3, reps: '8-12 min', rest: '4min', description: 'Entrenamiento en umbral anaeróbico' },
        { name: 'Pyramid intervals', sets: 1, reps: '30-40 min', rest: '0s', description: 'Intervalos piramidales progresivos' },
        { name: 'VO2 max intervals', sets: 6, reps: '3min trabajo/3min descanso', rest: '0s', description: 'Intervalos para mejorar VO2 máximo' },
      ],
    },
  };

  return exercises[goal]?.[level] || [];
}