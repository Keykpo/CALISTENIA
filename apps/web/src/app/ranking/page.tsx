'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Ranking from '@/components/Ranking'
import { Trophy, Users, Target } from 'lucide-react'

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Ranking de Atletas</h1>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre dónde te encuentras entre los mejores atletas de calistenia. 
            El ranking se basa en tus habilidades y progreso en diferentes categorías.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Trophy className="h-10 w-10" />
                <div>
                  <h3 className="text-2xl font-bold">Top 3</h3>
                  <p className="text-yellow-100">Atletas Elite</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10" />
                <div>
                  <h3 className="text-2xl font-bold">100+</h3>
                  <p className="text-blue-100">Atletas Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="h-10 w-10" />
                <div>
                  <h3 className="text-2xl font-bold">7</h3>
                  <p className="text-green-100">Categorías de Habilidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Component */}
        <Ranking currentUserId="current" />

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">¡Sigue Entrenando!</h2>
            <p className="text-lg mb-4">
              Cada entrenamiento te acerca más a la cima. Mejora tus habilidades y escala posiciones.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 rounded-lg p-4">
                <h3 className="font-semibold">Entrena Consistentemente</h3>
                <p className="text-sm text-purple-100">La constancia es clave para mejorar</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <h3 className="font-semibold">Desbloquea Habilidades</h3>
                <p className="text-sm text-purple-100">Cada nueva habilidad suma puntos</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <h3 className="font-semibold">Compite Sanamente</h3>
                <p className="text-sm text-purple-100">Inspírate en otros atletas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}