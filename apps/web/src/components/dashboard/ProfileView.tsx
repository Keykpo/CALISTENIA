'use client';

import { useState } from 'react';
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
  Target,
  Edit,
  Save,
  X,
  TrendingUp
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface ProfileViewProps {
  userId: string;
  userData: any;
  onUpdate: () => void;
}

export default function ProfileView({ userId, userData, onUpdate }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    height: '',
    weight: '',
    fitnessLevel: 'BEGINNER',
    gender: '',
  });

  const handleEdit = () => {
    // Initialize form with current data
    setFormData({
      firstName: userData?.user?.firstName || '',
      lastName: userData?.user?.lastName || '',
      height: userData?.user?.height || '',
      weight: userData?.user?.weight || '',
      fitnessLevel: userData?.user?.fitnessLevel || 'BEGINNER',
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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Gestiona tu perfil y preferencias
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar'}
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
                    <Label className="text-slate-600">Nombre</Label>
                    <p className="text-lg font-medium">
                      {user.firstName || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Apellido</Label>
                    <p className="text-lg font-medium">
                      {user.lastName || 'No especificado'}
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
                    <Label className="text-slate-600">Altura</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Ruler className="w-4 h-4 text-slate-400" />
                      <p className="text-lg font-medium">
                        {user.height ? `${user.height} cm` : 'No especificado'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-600">Peso</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Weight className="w-4 h-4 text-slate-400" />
                      <p className="text-lg font-medium">
                        {user.weight ? `${user.weight} kg` : 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Nivel de Fitness</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm">
                        {user.fitnessLevel || 'BEGINNER'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-600">Género</Label>
                    <p className="text-lg font-medium mt-1">
                      {user.gender || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-600">Miembro desde</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-lg font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Desconocido'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
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
                    <Label htmlFor="weight">Peso (kg)</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fitnessLevel">Nivel de Fitness</Label>
                    <Select
                      value={formData.fitnessLevel}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fitnessLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Principiante</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                        <SelectItem value="ADVANCED">Avanzado</SelectItem>
                        <SelectItem value="EXPERT">Experto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Masculino</SelectItem>
                        <SelectItem value="FEMALE">Femenino</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">
                          Prefiero no decirlo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estadísticas
            </CardTitle>
            <CardDescription>Tu progreso hasta ahora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Level</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.level || 1}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">XP Total</span>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.totalXP || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Monedas</span>
                <span className="text-2xl font-bold text-amber-600">
                  {stats.coins || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Racha</span>
                <span className="text-2xl font-bold text-orange-600">
                  {stats.dailyStreak || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Fuerza Total</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalStrength || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cuenta</CardTitle>
          <CardDescription>Gestiona tu cuenta y privacidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            Cerrar Sesión
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" disabled>
            Eliminar Cuenta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
