import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Dumbbell, Clock, Target, TrendingUp } from 'lucide-react';

const workoutCategories = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Basic routines to start your calisthenics journey',
    icon: Target,
    workouts: 12,
    duration: '15-30 min',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'More challenging exercises to progress',
    icon: TrendingUp,
    workouts: 18,
    duration: '30-45 min',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Complex movements and intense routines',
    icon: Dumbbell,
    workouts: 15,
    duration: '45-60 min',
  },
];

const featuredWorkouts = [
  {
    id: 1,
    title: 'Push-up Progression',
    description: 'Master push-ups from zero to advanced variations',
    level: 'Beginner',
    duration: '20 min',
    exercises: 8,
  },
  {
    id: 2,
    title: 'Pull-up Mastery',
    description: 'Develop back and arm strength with pull-ups',
    level: 'Intermediate',
    duration: '35 min',
    exercises: 12,
  },
  {
    id: 3,
    title: 'Handstand Journey',
    description: 'Learn to handstand step by step',
    level: 'Advanced',
    duration: '45 min',
    exercises: 15,
  },
];

export default function WorkoutsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Calisthenics <span className="text-primary">Workouts</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Discover structured routines for all levels — from beginner to advanced athlete.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Training Categories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workoutCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{category.workouts} workouts</span>
                        <span>{category.duration}</span>
                      </div>
                      <Button className="w-full mt-4">
                        Explore Routines
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Workouts */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Workouts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {workout.level}
                      </span>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {workout.duration}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{workout.title}</CardTitle>
                    <CardDescription>{workout.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {workout.exercises} exercises
                      </span>
                      <Button size="sm">
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create your account and access all our personalized workouts.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}