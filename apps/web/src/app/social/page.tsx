'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle,
  Users,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import SocialFeed from '@/components/social/SocialFeed';
import FriendsList from '@/components/social/FriendsList';
import DirectMessages from '@/components/social/DirectMessages';

export default function SocialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading social...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-blue-600" />
                Social
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Connect with the fitness community
              </p>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  @{session.user.name || 'athlete'}
                </p>
                <p className="text-xs text-slate-600">
                  {session.user.email}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {(session.user.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white shadow-sm">
            <TabsTrigger value="feed" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-2">
              <Users className="w-4 h-4" />
              <span>Friends</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <SocialFeed userId={session.user.id as string} />
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <FriendsList userId={session.user.id as string} />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <DirectMessages userId={session.user.id as string} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
