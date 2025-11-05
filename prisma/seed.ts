import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding RPG Skill Tree database...')

  // Limpiar datos existentes
  await prisma.exerciseSkill.deleteMany()
  await prisma.skillPrerequisite.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.skill.deleteMany()

  // ================================
  // RAMA 0: CALENTAMIENTO Y MOVILIDAD
  // ================================
  const warmupSkills = [
    {
      name: 'Círculos de Brazos',
      description: 'Movimiento circular de brazos para calentar hombros.',
      category: 'FLEXIBILITY' as const,
      branch: 'CALENTAMIENTO' as const,
      difficulty: 'BEGINNER' as const,
      order: 1,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 1,
      requiredBalance: 1,
      strengthRequired: 0,
      strengthGained: 1,
      xpReward: 25,
      coinReward: 5,
      requiredReps: 15,
      requiredDays: 1,
    },
    {
      name: 'Rotaciones de Muñecas',
      description: 'Preparación de muñecas para ejercicios de apoyo.',
      category: 'FLEXIBILITY' as const,
      branch: 'CALENTAMIENTO' as const,
      difficulty: 'BEGINNER' as const,
      order: 2,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 2,
      requiredBalance: 1,
      strengthRequired: 1,
      strengthGained: 1,
      xpReward: 25,
      coinReward: 5,
      requiredReps: 10,
      requiredDays: 1,
    },
    {
      name: 'Gato-Camello',
      description: 'Movilidad de columna vertebral.',
      category: 'FLEXIBILITY' as const,
      branch: 'CALENTAMIENTO' as const,
      difficulty: 'BEGINNER' as const,
      order: 3,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 3,
      requiredBalance: 2,
      strengthRequired: 2,
      strengthGained: 2,
      xpReward: 30,
      coinReward: 6,
      requiredReps: 12,
      requiredDays: 1,
    },
    {
      name: 'Estiramiento de Hombros',
      description: 'Estiramiento dinámico para preparar hombros.',
      category: 'FLEXIBILITY' as const,
      branch: 'CALENTAMIENTO' as const,
      difficulty: 'BEGINNER' as const,
      order: 4,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 3,
      requiredBalance: 1,
      strengthRequired: 3,
      strengthGained: 2,
      xpReward: 30,
      coinReward: 6,
      requiredDuration: 30,
      requiredDays: 1,
    },
    {
      name: 'Jumping Jacks',
      description: 'Ejercicio cardiovascular para activar todo el cuerpo.',
      category: 'DYNAMIC_MOVEMENTS' as const,
      branch: 'CALENTAMIENTO' as const,
      difficulty: 'BEGINNER' as const,
      order: 5,
      requiredStrength: 1,
      requiredEndurance: 2,
      requiredFlexibility: 1,
      requiredBalance: 2,
      strengthRequired: 4,
      strengthGained: 3,
      xpReward: 40,
      coinReward: 8,
      requiredReps: 20,
      requiredDays: 1,
    },
  ]

  // ================================
  // RAMA 1: EMPUJE (PUSH)
  // ================================
  const pushSkills = [
    {
      name: 'Flexiones contra Pared',
      description: 'Flexiones verticales contra la pared.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'BEGINNER' as const,
      order: 1,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 1,
      requiredBalance: 1,
      strengthRequired: 5,
      strengthGained: 3,
      xpReward: 30,
      coinReward: 6,
      requiredReps: 10,
      requiredDays: 3,
    },
    {
      name: 'Flexiones Inclinadas',
      description: 'Flexiones con manos elevadas.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'BEGINNER' as const,
      order: 2,
      requiredStrength: 2,
      requiredEndurance: 2,
      requiredFlexibility: 1,
      requiredBalance: 2,
      strengthRequired: 8,
      strengthGained: 4,
      xpReward: 50,
      coinReward: 10,
      requiredReps: 8,
      requiredDays: 4,
    },
    {
      name: 'Flexiones de Rodillas',
      description: 'Flexiones apoyando las rodillas.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'BEGINNER' as const,
      order: 3,
      requiredStrength: 2,
      requiredEndurance: 2,
      requiredFlexibility: 2,
      requiredBalance: 2,
      strengthRequired: 12,
      strengthGained: 5,
      xpReward: 60,
      coinReward: 12,
      requiredReps: 8,
      requiredDays: 4,
    },
    {
      name: 'Flexiones Completas',
      description: 'Push-ups estándar.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 4,
      requiredStrength: 3,
      requiredEndurance: 3,
      requiredFlexibility: 2,
      requiredBalance: 3,
      strengthRequired: 17,
      strengthGained: 6,
      xpReward: 80,
      coinReward: 16,
      requiredReps: 10,
      requiredDays: 5,
    },
    {
      name: 'Flexiones Anchas',
      description: 'Push-ups con manos separadas.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 5,
      requiredStrength: 3,
      requiredEndurance: 3,
      requiredFlexibility: 2,
      requiredBalance: 3,
      strengthRequired: 23,
      strengthGained: 7,
      xpReward: 100,
      coinReward: 20,
      requiredReps: 8,
      requiredDays: 5,
    },
    {
      name: 'Flexiones Diamante',
      description: 'Push-ups con manos en forma de diamante.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 6,
      requiredStrength: 4,
      requiredEndurance: 3,
      requiredFlexibility: 2,
      requiredBalance: 4,
      strengthRequired: 30,
      strengthGained: 8,
      xpReward: 120,
      coinReward: 24,
      requiredReps: 6,
      requiredDays: 6,
    },
    {
      name: 'Fondos en Banco',
      description: 'Dips en banco.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 7,
      requiredStrength: 4,
      requiredEndurance: 3,
      requiredFlexibility: 3,
      requiredBalance: 3,
      strengthRequired: 38,
      strengthGained: 9,
      xpReward: 140,
      coinReward: 28,
      requiredReps: 8,
      requiredDays: 6,
    },
    {
      name: 'Flexiones Declinadas',
      description: 'Push-ups con pies elevados.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 8,
      requiredStrength: 5,
      requiredEndurance: 4,
      requiredFlexibility: 3,
      requiredBalance: 4,
      strengthRequired: 47,
      strengthGained: 10,
      xpReward: 160,
      coinReward: 32,
      requiredReps: 6,
      requiredDays: 7,
    },
    {
      name: 'Flexiones Pliométricas',
      description: 'Push-ups explosivos con despegue.',
      category: 'DYNAMIC_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'ADVANCED' as const,
      order: 9,
      requiredStrength: 5,
      requiredEndurance: 4,
      requiredFlexibility: 3,
      requiredBalance: 5,
      strengthRequired: 57,
      strengthGained: 12,
      xpReward: 200,
      coinReward: 40,
      requiredReps: 5,
      requiredDays: 8,
    },
    {
      name: 'Flexiones Archer',
      description: 'Push-ups unilaterales.',
      category: 'ADVANCED_SKILLS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'ADVANCED' as const,
      order: 10,
      requiredStrength: 6,
      requiredEndurance: 4,
      requiredFlexibility: 4,
      requiredBalance: 6,
      strengthRequired: 69,
      strengthGained: 15,
      xpReward: 250,
      coinReward: 50,
      requiredReps: 4,
      requiredDays: 8,
    },
    {
      name: 'Fondos en Paralelas',
      description: 'Dips en paralelas.',
      category: 'PUSH_MOVEMENTS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'ADVANCED' as const,
      order: 11,
      requiredStrength: 6,
      requiredEndurance: 5,
      requiredFlexibility: 4,
      requiredBalance: 5,
      strengthRequired: 84,
      strengthGained: 18,
      xpReward: 300,
      coinReward: 60,
      requiredReps: 6,
      requiredDays: 10,
    },
    {
      name: 'Flexiones a Una Mano',
      description: 'One-arm push-up.',
      category: 'ADVANCED_SKILLS' as const,
      branch: 'EMPUJE' as const,
      difficulty: 'ADVANCED' as const,
      order: 12,
      requiredStrength: 8,
      requiredEndurance: 5,
      requiredFlexibility: 4,
      requiredBalance: 8,
      strengthRequired: 102,
      strengthGained: 25,
      xpReward: 500,
      coinReward: 100,
      requiredReps: 2,
      requiredDays: 12,
    },
  ]

  // ================================
  // RAMA 2: TRACCIÓN (PULL)
  // ================================
  const pullSkills = [
    {
      name: 'Remo Invertido en Barra',
      description: 'Remo invertido con pies en el suelo.',
      category: 'PULL_MOVEMENTS' as const,
      branch: 'TRACCION' as const,
      difficulty: 'BEGINNER' as const,
      order: 1,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 1,
      requiredBalance: 1,
      strengthRequired: 5,
      strengthGained: 3,
      xpReward: 30,
      coinReward: 6,
      requiredReps: 8,
      requiredDays: 3,
    },
    {
      name: 'Dominadas Asistidas con Banda',
      description: 'Dominadas con asistencia de banda elástica.',
      category: 'PULL_MOVEMENTS' as const,
      branch: 'TRACCION' as const,
      difficulty: 'BEGINNER' as const,
      order: 2,
      requiredStrength: 2,
      requiredEndurance: 2,
      requiredFlexibility: 1,
      requiredBalance: 2,
      strengthRequired: 12,
      strengthGained: 5,
      xpReward: 50,
      coinReward: 10,
      requiredReps: 6,
      requiredDays: 4,
    },
    {
      name: 'Dominadas Excéntricas',
      description: 'Descenso controlado desde la posición alta.',
      category: 'PULL_MOVEMENTS' as const,
      branch: 'TRACCION' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 3,
      requiredStrength: 3,
      requiredEndurance: 2,
      requiredFlexibility: 2,
      requiredBalance: 3,
      strengthRequired: 20,
      strengthGained: 6,
      xpReward: 70,
      coinReward: 14,
      requiredReps: 5,
      requiredDays: 5,
    },
    {
      name: 'Dominadas Completas',
      description: 'Pull-ups clásicos con agarre prono.',
      category: 'PULL_MOVEMENTS' as const,
      branch: 'TRACCION' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 4,
      requiredStrength: 4,
      requiredEndurance: 3,
      requiredFlexibility: 2,
      requiredBalance: 3,
      strengthRequired: 28,
      strengthGained: 8,
      xpReward: 100,
      coinReward: 20,
      requiredReps: 5,
      requiredDays: 6,
    },
    {
      name: 'Dominadas a Larga Amplitud',
      description: 'Dominadas con agarre ancho.',
      category: 'PULL_MOVEMENTS' as const,
      branch: 'TRACCION' as const,
      difficulty: 'ADVANCED' as const,
      order: 5,
      requiredStrength: 5,
      requiredEndurance: 3,
      requiredFlexibility: 3,
      requiredBalance: 4,
      strengthRequired: 40,
      strengthGained: 10,
      xpReward: 140,
      coinReward: 28,
      requiredReps: 4,
      requiredDays: 7,
    },
    {
      name: 'Muscle-up Asistido',
      description: 'Transición dominada-fondo con asistencia.',
      category: 'ADVANCED_SKILLS' as const,
      branch: 'TRACCION' as const,
      difficulty: 'ADVANCED' as const,
      order: 6,
      requiredStrength: 6,
      requiredEndurance: 4,
      requiredFlexibility: 3,
      requiredBalance: 4,
      strengthRequired: 55,
      strengthGained: 15,
      xpReward: 220,
      coinReward: 44,
      requiredReps: 3,
      requiredDays: 8,
    },
  ]

  // ================================
  // RAMA 3: CORE
  // ================================
  const coreSkills = [
    {
      name: 'Plancha (Plank)',
      description: 'Plancha estándar con apoyo de antebrazos.',
      category: 'CORE_STRENGTH' as const,
      branch: 'CORE' as const,
      difficulty: 'BEGINNER' as const,
      order: 1,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 1,
      requiredBalance: 1,
      strengthRequired: 0,
      strengthGained: 2,
      xpReward: 25,
      coinReward: 5,
      requiredDuration: 30,
      requiredDays: 2,
    },
    {
      name: 'Plancha Lateral',
      description: 'Plancha lateral apoyado en un antebrazo.',
      category: 'CORE_STRENGTH' as const,
      branch: 'CORE' as const,
      difficulty: 'BEGINNER' as const,
      order: 2,
      requiredStrength: 1,
      requiredEndurance: 2,
      requiredFlexibility: 1,
      requiredBalance: 2,
      strengthRequired: 2,
      strengthGained: 3,
      xpReward: 40,
      coinReward: 8,
      requiredDuration: 20,
      requiredDays: 3,
    },
    {
      name: 'Hollow Hold',
      description: 'Postura hueca con tensión corporal.',
      category: 'CORE_STRENGTH' as const,
      branch: 'CORE' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 3,
      requiredStrength: 2,
      requiredEndurance: 2,
      requiredFlexibility: 2,
      requiredBalance: 3,
      strengthRequired: 8,
      strengthGained: 5,
      xpReward: 70,
      coinReward: 14,
      requiredDuration: 20,
      requiredDays: 4,
    },
    {
      name: 'L-Sit en Paralelas',
      description: 'Sujeción en L con soporte.',
      category: 'ADVANCED_SKILLS' as const,
      branch: 'CORE' as const,
      difficulty: 'ADVANCED' as const,
      order: 4,
      requiredStrength: 4,
      requiredEndurance: 3,
      requiredFlexibility: 3,
      requiredBalance: 4,
      strengthRequired: 18,
      strengthGained: 8,
      xpReward: 140,
      coinReward: 28,
      requiredDuration: 15,
      requiredDays: 6,
    },
  ]

  // ================================
  // RAMA 4: EQUILIBRIO (HANDSTAND)
  // ================================
  const balanceSkills = [
    {
      name: 'Cuadrupedia y Apoyo en Pared',
      description: 'Trabajo básico de equilibrio y apoyo.',
      category: 'BALANCE' as const,
      branch: 'EQUILIBRIO' as const,
      difficulty: 'BEGINNER' as const,
      order: 1,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 1,
      requiredBalance: 2,
      strengthRequired: 0,
      strengthGained: 1,
      xpReward: 20,
      coinReward: 4,
      requiredDuration: 20,
      requiredDays: 2,
    },
    {
      name: 'Parada de Manos contra Pared',
      description: 'Handstand asistido en pared.',
      category: 'BALANCE' as const,
      branch: 'EQUILIBRIO' as const,
      difficulty: 'INTERMEDIATE' as const,
      order: 2,
      requiredStrength: 2,
      requiredEndurance: 2,
      requiredFlexibility: 2,
      requiredBalance: 4,
      strengthRequired: 10,
      strengthGained: 4,
      xpReward: 80,
      coinReward: 16,
      requiredDuration: 20,
      requiredDays: 4,
    },
    {
      name: 'Handstand Libre (Corto)',
      description: 'Pino sin apoyo por segundos.',
      category: 'ADVANCED_SKILLS' as const,
      branch: 'EQUILIBRIO' as const,
      difficulty: 'ADVANCED' as const,
      order: 3,
      requiredStrength: 3,
      requiredEndurance: 3,
      requiredFlexibility: 3,
      requiredBalance: 6,
      strengthRequired: 18,
      strengthGained: 6,
      xpReward: 150,
      coinReward: 30,
      requiredDuration: 5,
      requiredDays: 6,
    },
  ]

  // ================================
  // RAMA 5: TREN INFERIOR
  // ================================
  const lowerBodySkills = [
    {
      name: 'Sentadilla Aire',
      description: 'Bodyweight squat básica.',
      category: 'LEG_STRENGTH' as const,
      branch: 'TREN_INFERIOR' as const,
      difficulty: 'BEGINNER' as const,
      order: 1,
      requiredStrength: 1,
      requiredEndurance: 1,
      requiredFlexibility: 1,
      requiredBalance: 1,
      strengthRequired: 0,
      strengthGained: 2,
      xpReward: 20,
      coinReward: 4,
      requiredReps: 10,
      requiredDays: 2,
    },
    {
      name: 'Zancadas Alternas',
      description: 'Lunges alternos controlados.',
      category: 'LEG_STRENGTH' as const,
      branch: 'TREN_INFERIOR' as const,
      difficulty: 'BEGINNER' as const,
      order: 2,
      requiredStrength: 1,
      requiredEndurance: 2,
      requiredFlexibility: 2,
      requiredBalance: 2,
      strengthRequired: 2,
      strengthGained: 3,
      xpReward: 30,
      coinReward: 6,
      requiredReps: 10,
      requiredDays: 3,
    },
    {
      name: 'Sentadilla a una pierna asistida (Pistol)',
      description: 'Pistol squat con asistencia.',
      category: 'ADVANCED_SKILLS' as const,
      branch: 'TREN_INFERIOR' as const,
      difficulty: 'ADVANCED' as const,
      order: 3,
      requiredStrength: 3,
      requiredEndurance: 2,
      requiredFlexibility: 3,
      requiredBalance: 4,
      strengthRequired: 12,
      strengthGained: 6,
      xpReward: 120,
      coinReward: 24,
      requiredReps: 5,
      requiredDays: 5,
    },
  ]

  // ================================
  // RAMA 6: ESTÁTICOS
  // ================================
  const staticSkills = [
    {
      name: 'Tuck Front Lever',
      description: 'Posición de front lever en tuck.',
      category: 'STATIC_ELEMENTS' as const,
      branch: 'ESTATICOS' as const,
      difficulty: 'ADVANCED' as const,
      order: 1,
      requiredStrength: 4,
      requiredEndurance: 3,
      requiredFlexibility: 2,
      requiredBalance: 3,
      strengthRequired: 20,
      strengthGained: 8,
      xpReward: 160,
      coinReward: 32,
      requiredDuration: 8,
      requiredDays: 6,
    },
    {
      name: 'Tuck Planche',
      description: 'Planche en tuck sobre paralelas.',
      category: 'STATIC_ELEMENTS' as const,
      branch: 'ESTATICOS' as const,
      difficulty: 'ADVANCED' as const,
      order: 2,
      requiredStrength: 5,
      requiredEndurance: 3,
      requiredFlexibility: 3,
      requiredBalance: 4,
      strengthRequired: 26,
      strengthGained: 10,
      xpReward: 200,
      coinReward: 40,
      requiredDuration: 5,
      requiredDays: 8,
    },
  ]

  // Crear todas las habilidades
  const allSkills = [
    ...warmupSkills,
    ...pushSkills,
    ...pullSkills,
    ...coreSkills,
    ...balanceSkills,
    ...lowerBodySkills,
    ...staticSkills,
  ]
  const createdSkills: any[] = []

  for (const skillData of allSkills) {
    const skill = await prisma.skill.create({
      data: skillData,
    })
    createdSkills.push(skill)
  }

  console.log(`✅ Created ${createdSkills.length} RPG skills en 7 ramas`)

  // ================================
  // CREAR PREREQUISITOS SECUENCIALES
  // ================================
  
  const createSequentialPrerequisites = async (skills: any[], branchName: string) => {
    for (let i = 1; i < skills.length; i++) {
      await prisma.skillPrerequisite.create({
        data: {
          skillId: skills[i].id,
          prerequisiteId: skills[i - 1].id,
        },
      })
    }
    console.log(`✅ Created sequential prerequisites for ${branchName} branch`)
  }

  const warmupCreatedSkills = createdSkills.filter(s => s.branch === 'CALENTAMIENTO')
  const pushCreatedSkills = createdSkills.filter(s => s.branch === 'EMPUJE')
  const pullCreatedSkills = createdSkills.filter(s => s.branch === 'TRACCION')
  const coreCreatedSkills = createdSkills.filter(s => s.branch === 'CORE')
  const balanceCreatedSkills = createdSkills.filter(s => s.branch === 'EQUILIBRIO')
  const lowerBodyCreatedSkills = createdSkills.filter(s => s.branch === 'TREN_INFERIOR')
  const staticCreatedSkills = createdSkills.filter(s => s.branch === 'ESTATICOS')

  await createSequentialPrerequisites(warmupCreatedSkills, 'CALENTAMIENTO')
  await createSequentialPrerequisites(pushCreatedSkills, 'EMPUJE')
  await createSequentialPrerequisites(pullCreatedSkills, 'TRACCION')
  await createSequentialPrerequisites(coreCreatedSkills, 'CORE')
  await createSequentialPrerequisites(balanceCreatedSkills, 'EQUILIBRIO')
  await createSequentialPrerequisites(lowerBodyCreatedSkills, 'TREN_INFERIOR')
  await createSequentialPrerequisites(staticCreatedSkills, 'ESTATICOS')

  // Cruces de ramas (dependencias avanzadas)
  if (pushCreatedSkills.length > 3 && coreCreatedSkills.length > 2) {
    await prisma.skillPrerequisite.create({
      data: {
        skillId: pushCreatedSkills[3].id, // Flexiones Completas
        prerequisiteId: warmupCreatedSkills[0]?.id ?? pushCreatedSkills[0].id,
      },
    })
  }

  if (balanceCreatedSkills.length > 1 && coreCreatedSkills.length > 2) {
    await prisma.skillPrerequisite.create({
      data: {
        skillId: balanceCreatedSkills[1].id, // Handstand pared
        prerequisiteId: coreCreatedSkills[2].id, // Hollow Hold
      },
    })
  }

  if (pullCreatedSkills.length > 3 && coreCreatedSkills.length > 2) {
    await prisma.skillPrerequisite.create({
      data: {
        skillId: pullCreatedSkills[3].id, // Dominadas completas
        prerequisiteId: coreCreatedSkills[2].id, // Hollow Hold
      },
    })
  }

  // ================================
  // EJERCICIOS BASE Y ENLACES CON HABILIDADES
  // ================================
  const exercises = [
    {
      name: 'Flexiones',
      description: 'Push-ups estándar con técnica correcta.',
      instructions: [
        'Coloca las manos a la anchura de hombros',
        'Mantén el cuerpo alineado',
        'Desciende controlado y empuja explosivo'
      ],
      category: 'STRENGTH' as const,
      difficulty: 'INTERMEDIATE' as const,
      muscleGroups: ['CHEST', 'SHOULDERS', 'ARMS', 'CORE'],
      equipment: ['NONE'],
      duration: null,
      calories: 50,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Flexiones Completas', 'Flexiones Anchas']
    },
    {
      name: 'Dominadas',
      description: 'Pull-ups clásicos en barra fija.',
      instructions: [
        'Agarre prono a la anchura de hombros',
        'Inicia con retracción escapular',
        'Eleva el mentón por encima de la barra'
      ],
      category: 'STRENGTH' as const,
      difficulty: 'INTERMEDIATE' as const,
      muscleGroups: ['BACK', 'ARMS', 'SHOULDERS', 'CORE'],
      equipment: ['PULL_UP_BAR'],
      duration: null,
      calories: 60,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Dominadas Completas', 'Dominadas Excéntricas']
    },
    {
      name: 'Plancha Isométrica',
      description: 'Mantén la tensión corporal en plank.',
      instructions: [
        'Antebrazos apoyados bajo los hombros',
        'Activa core y glúteos',
        'Respira de forma controlada'
      ],
      category: 'ENDURANCE' as const,
      difficulty: 'BEGINNER' as const,
      muscleGroups: ['CORE', 'SHOULDERS'],
      equipment: ['YOGA_MAT'],
      duration: 60,
      calories: 30,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Plancha (Plank)']
    },
    {
      name: 'Fondos en Paralelas',
      description: 'Dips en paralelas con técnica.',
      instructions: [
        'Mantén codos cerca del cuerpo',
        'Desciende controlado',
        'Empuja fuerte extendiendo completamente'
      ],
      category: 'STRENGTH' as const,
      difficulty: 'ADVANCED' as const,
      muscleGroups: ['CHEST', 'SHOULDERS', 'ARMS', 'CORE'],
      equipment: ['NONE'],
      duration: null,
      calories: 70,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Fondos en Paralelas']
    },
    {
      name: 'Handstand en Pared',
      description: 'Pino asistido en pared para ganar equilibrio.',
      instructions: [
        'Coloca manos firmes y separadas',
        'Activa hombros y core',
        'Mantén talones en la pared'
      ],
      category: 'BALANCE' as const,
      difficulty: 'INTERMEDIATE' as const,
      muscleGroups: ['SHOULDERS', 'ARMS', 'CORE'],
      equipment: ['NONE'],
      duration: 30,
      calories: 25,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Parada de Manos contra Pared']
    },
    {
      name: 'Sentadillas',
      description: 'Sentadillas de peso corporal controladas.',
      instructions: [
        'Pies a la anchura de hombros',
        'Rodillas alineadas con punteras',
        'Cadera atrás y pecho alto'
      ],
      category: 'STRENGTH' as const,
      difficulty: 'BEGINNER' as const,
      muscleGroups: ['LEGS', 'GLUTES', 'CORE'],
      equipment: ['NONE'],
      duration: null,
      calories: 40,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Sentadilla Aire']
    },
    {
      name: 'Remo Invertido',
      description: 'Remo invertido bajo la barra a altura media.',
      instructions: [
        'Cuerpo alineado en supino',
        'Retracción escapular previa',
        'Tira llevando el pecho a la barra'
      ],
      category: 'STRENGTH' as const,
      difficulty: 'BEGINNER' as const,
      muscleGroups: ['BACK', 'ARMS', 'SHOULDERS'],
      equipment: ['PULL_UP_BAR'],
      duration: null,
      calories: 45,
      videoUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      linkSkillNames: ['Remo Invertido en Barra']
    },
  ]

  const createdExercises: any[] = []
  for (const ex of exercises) {
    const exercise = await prisma.exercise.create({
      data: {
        name: ex.name,
        description: ex.description,
        instructions: JSON.stringify(ex.instructions),
        category: ex.category,
        difficulty: ex.difficulty,
        muscleGroups: JSON.stringify(ex.muscleGroups),
        equipment: JSON.stringify(ex.equipment),
        duration: ex.duration ?? undefined,
        calories: ex.calories ?? undefined,
        videoUrl: ex.videoUrl ?? undefined,
        imageUrl: ex.imageUrl ?? undefined,
        thumbnailUrl: ex.thumbnailUrl ?? undefined,
      },
    })
    createdExercises.push(exercise)

    // Enlazar con habilidades correspondientes por nombre
    const targetSkills = createdSkills.filter((s) => ex.linkSkillNames.includes(s.name))
    for (const ts of targetSkills) {
      await prisma.exerciseSkill.create({
        data: {
          exerciseId: exercise.id,
          skillId: ts.id,
          strengthContribution: 10,
          enduranceContribution: 8,
          flexibilityContribution: 4,
          balanceContribution: 4,
        },
      })
    }
  }

  console.log(`✅ Creado ${createdExercises.length} ejercicios y enlaces ExerciseSkill`)

  console.log('✅ RPG Skill Tree database seeded successfully!')
  console.log(`Created ${createdSkills.length} skills en 7 ramas`)
  console.log(`Created ${createdExercises.length} ejercicios enlazados a habilidades`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })