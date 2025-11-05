// User types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  height?: number; // in cm
  weight?: number; // in kg
  fitnessLevel: FitnessLevel;
  goals: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  privacy: 'public' | 'friends' | 'private';
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  workoutReminders: boolean;
  goalDeadlines: boolean;
  socialUpdates: boolean;
}

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  difficulty: Difficulty;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
  variations?: ExerciseVariation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseVariation {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  instructions: string[];
}

export enum ExerciseCategory {
  PUSH = 'push',
  PULL = 'pull',
  LEGS = 'legs',
  CORE = 'core',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance'
}

export enum MuscleGroup {
  CHEST = 'chest',
  SHOULDERS = 'shoulders',
  TRICEPS = 'triceps',
  BACK = 'back',
  BICEPS = 'biceps',
  FOREARMS = 'forearms',
  CORE = 'core',
  GLUTES = 'glutes',
  QUADRICEPS = 'quadriceps',
  HAMSTRINGS = 'hamstrings',
  CALVES = 'calves'
}

export enum Equipment {
  NONE = 'none',
  PULL_UP_BAR = 'pull_up_bar',
  PARALLEL_BARS = 'parallel_bars',
  RINGS = 'rings',
  RESISTANCE_BANDS = 'resistance_bands',
  WALL = 'wall',
  BENCH = 'bench'
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Workout types
export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration?: number; // in minutes
  difficulty: Difficulty;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: ExerciseSet[];
  restTime?: number; // in seconds
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  reps?: number;
  duration?: number; // in seconds
  weight?: number; // in kg
  distance?: number; // in meters
  completed: boolean;
  notes?: string;
}

// Workout Session types
export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId?: string;
  workout?: Workout;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in minutes
  exercises: SessionExercise[];
  notes?: string;
  rating?: number; // 1-5
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: SessionSet[];
  restTime?: number;
  notes?: string;
}

export interface SessionSet {
  id: string;
  reps?: number;
  duration?: number;
  weight?: number;
  distance?: number;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

// Goal types
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  target: GoalTarget;
  current: GoalProgress;
  deadline?: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum GoalType {
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  WEIGHT = 'weight',
  SKILL = 'skill',
  HABIT = 'habit'
}

export interface GoalTarget {
  value: number;
  unit: string;
  exerciseId?: string;
}

export interface GoalProgress {
  value: number;
  lastUpdated: Date;
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

// Progress types
export interface ProgressEntry {
  id: string;
  userId: string;
  type: ProgressType;
  value: number;
  unit: string;
  date: Date;
  exerciseId?: string;
  notes?: string;
  createdAt: Date;
}

export enum ProgressType {
  WEIGHT = 'weight',
  BODY_FAT = 'body_fat',
  MUSCLE_MASS = 'muscle_mass',
  EXERCISE_PR = 'exercise_pr',
  MEASUREMENT = 'measurement'
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructor: User;
  difficulty: Difficulty;
  duration: number; // in weeks
  price: number;
  currency: string;
  thumbnail?: string;
  tags: string[];
  lessons: Lesson[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  content: LessonContent;
  duration?: number; // in minutes
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum LessonType {
  VIDEO = 'video',
  WORKOUT = 'workout',
  ARTICLE = 'article',
  QUIZ = 'quiz'
}

export interface LessonContent {
  videoUrl?: string;
  workoutId?: string;
  articleContent?: string;
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Community types
export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  workoutSessionId?: string;
  workoutSession?: WorkoutSession;
  likes: number;
  comments: Comment[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileForm {
  name: string;
  bio?: string;
  height?: number;
  weight?: number;
  fitnessLevel: FitnessLevel;
  goals: string[];
}

export interface WorkoutForm {
  name: string;
  description?: string;
  difficulty: Difficulty;
  tags: string[];
  isPublic: boolean;
  exercises: WorkoutExerciseForm[];
}

export interface WorkoutExerciseForm {
  exerciseId: string;
  sets: ExerciseSetForm[];
  restTime?: number;
  notes?: string;
}

export interface ExerciseSetForm {
  reps?: number;
  duration?: number;
  weight?: number;
  distance?: number;
}

export interface GoalForm {
  title: string;
  description?: string;
  type: GoalType;
  target: GoalTarget;
  deadline?: Date;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};