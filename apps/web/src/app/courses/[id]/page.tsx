'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  CheckCircle,
  Lock,
  ArrowLeft,
  Download,
  Share2,
  Trophy,
  Target,
  Calendar,
  User,
  PlayCircle,
  FileText,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'video' | 'exercise' | 'reading' | 'quiz';
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
  exerciseId?: string;
  content?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  price: number;
  thumbnail: string;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  category: string;
  isEnrolled: boolean;
  progress: number; // 0-100
  tags: string[];
  objectives: string[];
  requirements: string[];
  lessons: Lesson[];
  certificate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sample course data
const sampleCourse: Course = {
  id: '1',
  title: 'Calisthenics Fundamentals',
  description: 'Learn the basic movements and build a solid foundation for your calisthenics training. This course will take you from fundamental concepts to more complex exercises, developing strength, endurance, and technique.',
  level: 'beginner',
  duration: 8,
  lessonsCount: 24,
  studentsCount: 1250,
  rating: 4.8,
  price: 49.99,
  thumbnail: '/api/placeholder/400/250',
  instructor: 'Carlos Mendez',
  instructorBio: 'Certified coach with more than 10 years of experience in calisthenics and functional fitness.',
  instructorAvatar: '/api/placeholder/100/100',
  category: 'Basic',
  isEnrolled: true,
  progress: 65,
  tags: ['push-ups', 'pull-ups', 'squats', 'plank'],
  objectives: [
    'Master the basic calisthenics movements',
    'Develop functional strength and endurance',
    'Learn safe and effective progressions',
    'Create personalized training routines',
    'Understand the principles of biomechanics'
  ],
  requirements: [
    'No prior experience required',
    'Access to a pull-up bar (optional)',
    'Space to exercise at home',
    'Motivation to train consistently'
  ],
  certificate: true,
  createdAt: '2024-01-15',
  updatedAt: '2024-03-10',
  lessons: [
    {
      id: '1',
      title: 'Introduction to Calisthenics',
      description: 'Learn the fundamentals and benefits of calisthenics',
      duration: 15,
      type: 'video',
      isCompleted: true,
      isLocked: false,
      videoUrl: '/videos/intro.mp4'
    },
    {
      id: '2',
      title: 'Warm-up and Mobility',
      description: 'Complete warm-up routine to prevent injuries',
      duration: 20,
      type: 'video',
      isCompleted: true,
      isLocked: false,
      videoUrl: '/videos/warmup.mp4'
    },
    {
      id: '3',
      title: 'Basic Push-ups',
      description: 'Learn the correct push-up technique',
      duration: 25,
      type: 'exercise',
      isCompleted: true,
      isLocked: false,
      exerciseId: 'pushups-basic'
    },
    {
      id: '4',
      title: 'Push-up Progressions',
      description: 'Variations and progressions to improve your strength',
      duration: 30,
      type: 'video',
      isCompleted: false,
      isLocked: false,
      videoUrl: '/videos/pushup-progressions.mp4'
    },
    {
      id: '5',
      title: 'Squats and Variations',
      description: 'Strengthen your legs with different types of squats',
      duration: 35,
      type: 'exercise',
      isCompleted: false,
      isLocked: false,
      exerciseId: 'squats-variations'
    },
    {
      id: '6',
      title: 'Plank and Core',
      description: 'Develop a strong core with plank exercises',
      duration: 25,
      type: 'video',
      isCompleted: false,
      isLocked: false,
      videoUrl: '/videos/plank-core.mp4'
    },
    {
      id: '7',
      title: 'Introduction to Pull-ups',
      description: 'Preparation and progressions for your first pull-up',
      duration: 40,
      type: 'video',
      isCompleted: false,
      isLocked: true,
      videoUrl: '/videos/pullup-intro.mp4'
    },
    {
      id: '8',
      title: 'Week 1 Assessment',
      description: 'Test your knowledge from the first week',
      duration: 10,
      type: 'quiz',
      isCompleted: false,
      isLocked: true
    }
  ]
};

export default function CoursePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourse(sampleCourse);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Course not found</h3>
          <p className="text-muted-foreground mb-4">
            The course you are looking for does not exist or has been removed
          </p>
          <Link href="/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return level;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'exercise': return <Target className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'exercise': return 'Exercise';
      case 'reading': return 'Reading';
      case 'quiz': return 'Quiz';
      default: return type;
    }
  };

  const completedLessons = course.lessons.filter(lesson => lesson.isCompleted).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getLevelColor(course.level)}>
                {getLevelText(course.level)}
              </Badge>
              <Badge variant="outline">{course.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg mb-4">
              {course.description}
            </p>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground">Calificación</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{course.studentsCount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{course.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground">Weeks</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="font-semibold">{course.lessonsCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Lessons</p>
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {course.isEnrolled && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Your Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {completedLessons} of {course.lessonsCount} lessons completed
                  </span>
                </div>
                <Progress value={course.progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {course.progress}% completed
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-16 w-16 text-white opacity-50" />
              </div>

              {/* Price and Enrollment */}
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-primary mb-2">${course.price}</p>
                {course.isEnrolled ? (
                  <Button className="w-full" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Continue Course
                  </Button>
                ) : (
                  <Button className="w-full" size="lg">
                    Enroll Now
                  </Button>
                )}
              </div>

              {/* Course Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>Downloadable resources</span>
                </div>
                {course.certificate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Certificate of completion</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span>Mobile and desktop access</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Instructor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{course.instructor}</p>
                    <p className="text-sm text-muted-foreground">{course.instructorBio}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content Tabs */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.lessonsCount} lessons • {course.duration} weeks of content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      lesson.isLocked ? 'opacity-50' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {lesson.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : lesson.isLocked ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(lesson.type)}
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {getTypeText(lesson.type)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {lesson.duration}min
                      </div>
                      {!lesson.isLocked && (
                        <Button size="sm" variant="ghost">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructor" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{course.instructor}</h3>
                  <p className="text-muted-foreground mb-4">{course.instructorBio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">10+</p>
                  <p className="text-sm text-muted-foreground">Years of experience</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">5,000+</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-muted-foreground">Average rating</p>
                </div>
              </div>

              <Button variant="outline">
                View more courses from the instructor
              </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
              <CardDescription>
                Average rating: {course.rating}/5 ({course.studentsCount} reviews)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coming soon</h3>
                <p className="text-muted-foreground">
                  Reviews will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}