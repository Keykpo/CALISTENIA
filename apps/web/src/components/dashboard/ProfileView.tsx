'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import UnifiedSkillAssessment from '@/components/UnifiedSkillAssessment';
import { migrateToUnifiedHexagon, type OldHexagonProfile } from '@/lib/unified-hexagon-system';

interface ProfileViewProps {
  userId: string;
  userData: any;
  onUpdate: () => void;
}

export default function ProfileView({ userId, userData, onUpdate }: ProfileViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRecalculateWarning, setShowRecalculateWarning] = useState(false);
  const [localHexagon, setLocalHexagon] = useState<HexagonProfileWithXP | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    height: '',
    weight: '',
    gender: '',
  });

  // Fallback: If userData doesn't have hexagon, fetch it directly
  useEffect(() => {
    if (userData && !userData.hexagon) {
      console.log('⚠️ ProfileView: No hexagon in userData, fetching directly...');
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.hexagonProfile) {
            console.log('✅ ProfileView: Fetched hexagon directly:', data.hexagonProfile);
            setLocalHexagon(data.hexagonProfile);
          }
        })
        .catch(err => console.error('❌ ProfileView: Error fetching hexagon:', err));
    } else if (userData?.hexagon) {
      setLocalHexagon(userData.hexagon);
    }
  }, [userData]);

  const handleEdit = () => {
    // Initialize form with current data
    setFormData({
      firstName: userData?.user?.firstName || '',
      lastName: userData?.user?.lastName || '',
      height: userData?.user?.height || '',
      weight: userData?.user?.weight || '',
      gender: userData?.user?.gender || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const stats = userData?.stats || {};
  const user = userData?.user || {};
  // Use localHexagon which has fallback logic
  const hexProfile = localHexagon;

  console.log('👤 ProfileView - Hexagon data:', {
    hasHexProfile: !!hexProfile,
    source: userData?.hexagon ? 'from userData' : 'from direct fetch',
    calculatedFrom: hexProfile ? 'hexagon levels' : 'user.fitnessLevel',
  });

  // Calculate dynamic fitness level from hexagon
  const calculatedLevel = hexProfile ? calculateOverallLevel(hexProfile) : (user.fitnessLevel || 'BEGINNER');
  const levelBadgeColor = getLevelBadgeColor(calculatedLevel);

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Manage your profile and preferences
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isEditing ? (
              // View Mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">First Name</Label>
                    <p className="text-lg font-medium">
                      {user.firstName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Last Name</Label>
                    <p className="text-lg font-medium">
                      {user.lastName || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-600">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-lg font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Height</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Ruler className="w-4 h-4 text-slate-400" />
                      <p className="text-lg font-medium">
                        {user.height ? `${user.height} cm` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-600">Weight</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Weight className="w-4 h-4 text-slate-400" />
                      <p className="text-lg font-medium">
                        {user.weight ? `${user.weight} kg` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Gender</Label>
                    <p className="text-lg font-medium mt-1">
                      {user.gender || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Member Since</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-lg font-medium">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="70"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Unified Skill Assessment Card */}
      <UnifiedSkillAssessment
        userId={userId}
        hexagonProfile={migrateToUnifiedHexagon(hexProfile)}
        onUpdate={onUpdate}
      />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            Sign Out
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" disabled>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
