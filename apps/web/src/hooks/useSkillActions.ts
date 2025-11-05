'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface UseSkillActionsProps {
  onSkillUpdated?: () => void;
}

export function useSkillActions({ onSkillUpdated }: UseSkillActionsProps = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const unlockSkill = async (skillId: string, skillName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/skills/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId }),
      });

      if (response.ok) {
        toast.success(`🎉 ¡Skill Desbloqueada!`, {
          description: `${skillName} ahora está disponible para entrenar`,
        });
        onSkillUpdated?.();
        return true;
      } else {
        const data = await response.json();
        toast.error('Error al desbloquear', {
          description: data.error || 'No se pudo desbloquear la habilidad',
        });
        return false;
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSkill = async (
    skillId: string,
    skillName: string,
    rewards: { xp: number; coins: number; strength: number }
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          currentSets: 999,
          currentReps: 999,
          currentDuration: 999,
          daysCompleted: 999,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast.success(`🏆 ¡Skill Completada!`, {
          description: `${skillName} - Ganaste: ${rewards.xp} XP, ${rewards.coins} monedas, ${rewards.strength} fuerza`,
          duration: 5000,
        });

        if (data.leveledUp) {
          toast.success(`🎊 ¡Subiste de Nivel!`, {
            description: `Ahora eres nivel ${data.userInfo?.levelInfo?.currentLevel || data.userInfo?.currentLevel}`,
            duration: 6000,
          });
        }

        onSkillUpdated?.();
        return true;
      } else {
        const data = await response.json();
        toast.error('Error al completar', {
          description: data.error || 'No se pudo completar la habilidad',
        });
        return false;
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (
    skillId: string,
    progress: {
      currentSets?: number;
      currentReps?: number;
      currentDuration?: number;
      daysCompleted?: number;
    }
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          ...progress,
        }),
      });

      if (response.ok) {
        toast.success('Progreso actualizado', {
          description: 'Tu progreso ha sido guardado',
        });
        onSkillUpdated?.();
        return true;
      } else {
        const data = await response.json();
        toast.error('Error al actualizar', {
          description: data.error || 'No se pudo actualizar el progreso',
        });
        return false;
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    unlockSkill,
    completeSkill,
    updateProgress,
    isLoading,
  };
}
