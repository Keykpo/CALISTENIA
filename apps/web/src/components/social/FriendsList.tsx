'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FriendsListProps {
  userId: string;
}

export default function FriendsList({ userId }: FriendsListProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'friends' | 'pending' | 'sent'>('friends');
  const [searchUsername, setSearchUsername] = useState('');

  useEffect(() => {
    fetchFriends();
  }, [tab]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/social/friends?status=${tab === 'friends' ? 'ACCEPTED' : tab === 'pending' ? 'PENDING_RECEIVED' : 'PENDING_SENT'}`);
      const data = await res.json();

      if (data.success) {
        if (tab === 'friends') {
          setFriends(data.friends);
        } else if (tab === 'pending') {
          setPendingRequests(data.friends);
        } else {
          setSentRequests(data.friends);
        }
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchUsername.trim()) return;

    try {
      const res = await fetch('/api/social/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUsername: searchUsername.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSearchUsername('');
        alert('Friend request sent!');
        if (tab === 'sent') fetchFriends();
      } else {
        alert(data.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('An error occurred');
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/social/friends/${friendshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (res.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/social/friends/${friendshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (res.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      const res = await fetch(`/api/social/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const renderFriendCard = (item: any, type: 'friend' | 'pending' | 'sent') => {
    const friend = item.requester || item.addressee;
    const displayName = friend.firstName && friend.lastName
      ? `${friend.firstName} ${friend.lastName}`
      : friend.username;

    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-blue-300 transition-all"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {friend.avatar ? (
              <img src={friend.avatar} alt={displayName} className="object-cover" />
            ) : (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-slate-500">@{friend.username}</p>
            {friend.currentLevel && (
              <Badge variant="outline" className="mt-1">
                Level {friend.currentLevel}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {type === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => acceptRequest(item.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectRequest(item.id)}
              >
                <UserX className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {type === 'sent' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeFriend(item.id)}
            >
              <UserX className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          {type === 'friend' && (
            <>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeFriend(item.id)}
              >
                <UserX className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Friends</CardTitle>
            <CardDescription>
              Connect with other athletes
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFriends}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Friend */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Add a Friend</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()}
            />
            <Button
              onClick={sendFriendRequest}
              disabled={!searchUsername.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="gap-1">
              <UserCheck className="h-4 w-4" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-1">
              <UserPlus className="h-4 w-4" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Friends List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {tab === 'friends' && friends.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <UserCheck className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No friends yet</p>
                  <p className="text-sm mt-1">Add friends to see them here</p>
                </div>
              )}
              {tab === 'pending' && pendingRequests.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No pending requests</p>
                </div>
              )}
              {tab === 'sent' && sentRequests.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <UserPlus className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No sent requests</p>
                </div>
              )}

              {tab === 'friends' && friends.map(f => renderFriendCard(f, 'friend'))}
              {tab === 'pending' && pendingRequests.map(f => renderFriendCard(f, 'pending'))}
              {tab === 'sent' && sentRequests.map(f => renderFriendCard(f, 'sent'))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
