export interface AssessmentQuestion {
  id: string
  category: 'empujes' | 'tracciones' | 'core' | 'tren_inferior' | 'equilibrio'
  question: string
  type: 'multiple_choice' | 'number_input' | 'yes_no'
  options?: AssessmentOption[]
  placeholder?: string
  description?: string
}

export interface AssessmentOption {
  value: string
  label: string
  points: number
}

export interface AssessmentResult {
  level: 'principiante' | 'intermedio' | 'avanzado'
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  categoryScores: {
    empujes: number
    tracciones: number
    core: number
    tren_inferior: number
    equilibrio: number
  }
  recommendedExercises: string[]
  totalScore: number
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // EMPUJES
  {
    id: 'push_ups_max',
    category: 'empujes',
    question: '¿Cuántas flexiones (push-ups) estándar puedes hacer seguidas?',
    type: 'multiple_choice',
    description: 'Flexiones completas con el pecho tocando el suelo',
    options: [
      { value: '0', label: 'No puedo hacer ninguna', points: 0 },
      { value: '1-5', label: '1 a 5 flexiones', points: 1 },
      { value: '6-15', label: '6 a 15 flexiones', points: 2 },
      { value: '16-25', label: '16 a 25 flexiones', points: 3 },
      { value: '26+', label: 'Más de 25 flexiones', points: 4 }
    ]
  },
  {
    id: 'wall_push_ups',
    category: 'empujes',
    question: '¿Puedes hacer flexiones de pared?',
    type: 'yes_no',
    description: 'Flexiones contra la pared con brazos extendidos',
    options: [
      { value: 'no', label: 'No', points: 0 },
      { value: 'yes', label: 'Sí, puedo hacer varias', points: 1 }
    ]
  },
  {
    id: 'dips_ability',
    category: 'empujes',
    question: '¿Puedes hacer fondos en paralelas o banco?',
    type: 'multiple_choice',
    description: 'Fondos bajando hasta que los codos formen 90°',
    options: [
      { value: 'none', label: 'No puedo hacer ninguno', points: 0 },
      { value: 'bench', label: 'Solo fondos en banco', points: 1 },
      { value: 'parallel_few', label: 'Fondos en paralelas (1-5)', points: 2 },
      { value: 'parallel_many', label: 'Fondos en paralelas (6+)', points: 3 }
    ]
  },

  // TRACCIONES
  {
    id: 'pull_ups_max',
    category: 'tracciones',
    question: '¿Cuántas dominadas (pull-ups) puedes hacer seguidas?',
    type: 'multiple_choice',
    description: 'Dominadas completas desde colgado hasta barbilla sobre la barra',
    options: [
      { value: '0', label: 'No puedo hacer ninguna', points: 0 },
      { value: '1-3', label: '1 a 3 dominadas', points: 2 },
      { value: '4-8', label: '4 a 8 dominadas', points: 3 },
      { value: '9+', label: 'Más de 8 dominadas', points: 4 }
    ]
  },
  {
    id: 'dead_hang',
    category: 'tracciones',
    question: '¿Cuánto tiempo puedes mantenerte colgado de una barra?',
    type: 'multiple_choice',
    description: 'Colgado pasivo con brazos extendidos',
    options: [
      { value: '0-10', label: 'Menos de 10 segundos', points: 0 },
      { value: '10-30', label: '10 a 30 segundos', points: 1 },
      { value: '30-60', label: '30 segundos a 1 minuto', points: 2 },
      { value: '60+', label: 'Más de 1 minuto', points: 3 }
    ]
  },

  // CORE
  {
    id: 'plank_time',
    category: 'core',
    question: '¿Cuánto tiempo puedes mantener una plancha (plank)?',
    type: 'multiple_choice',
    description: 'Plancha estándar con cuerpo recto',
    options: [
      { value: '0-30', label: 'Menos de 30 segundos', points: 0 },
      { value: '30-60', label: '30 segundos a 1 minuto', points: 1 },
      { value: '60-120', label: '1 a 2 minutos', points: 2 },
      { value: '120+', label: 'Más de 2 minutos', points: 3 }
    ]
  },
  {
    id: 'hollow_body',
    category: 'core',
    question: '¿Puedes mantener la posición de hollow body?',
    type: 'multiple_choice',
    description: 'Posición hueca con espalda baja pegada al suelo',
    options: [
      { value: 'no', label: 'No sé qué es o no puedo hacerla', points: 0 },
      { value: 'short', label: 'Sí, por menos de 30 segundos', points: 1 },
      { value: 'long', label: 'Sí, por más de 30 segundos', points: 2 }
    ]
  },

  // TREN INFERIOR
  {
    id: 'squats_max',
    category: 'tren_inferior',
    question: '¿Cuántas sentadillas puedes hacer seguidas?',
    type: 'multiple_choice',
    description: 'Sentadillas completas bajando hasta que los muslos estén paralelos al suelo',
    options: [
      { value: '0-10', label: 'Menos de 10', points: 0 },
      { value: '10-25', label: '10 a 25 sentadillas', points: 1 },
      { value: '25-50', label: '25 a 50 sentadillas', points: 2 },
      { value: '50+', label: 'Más de 50 sentadillas', points: 3 }
    ]
  },
  {
    id: 'single_leg_squat',
    category: 'tren_inferior',
    question: '¿Puedes hacer sentadillas a una pierna (pistol squat)?',
    type: 'multiple_choice',
    description: 'Sentadilla completa apoyando solo una pierna',
    options: [
      { value: 'no', label: 'No puedo hacer ninguna', points: 0 },
      { value: 'assisted', label: 'Solo con ayuda o apoyo', points: 1 },
      { value: 'partial', label: 'Parciales sin llegar abajo', points: 2 },
      { value: 'full', label: 'Completas sin ayuda', points: 4 }
    ]
  },

  // EQUILIBRIO
  {
    id: 'handstand_wall',
    category: 'equilibrio',
    question: '¿Puedes hacer pino (handstand) contra la pared?',
    type: 'multiple_choice',
    description: 'Posición invertida con manos en el suelo y pies contra la pared',
    options: [
      { value: 'no', label: 'No puedo subir a la posición', points: 0 },
      { value: 'short', label: 'Sí, por menos de 30 segundos', points: 1 },
      { value: 'long', label: 'Sí, por más de 30 segundos', points: 2 },
      { value: 'freestanding', label: 'Puedo hacer pino sin pared', points: 4 }
    ]
  },
  {
    id: 'crow_pose',
    category: 'equilibrio',
    question: '¿Puedes mantener la posición de crow pose (cuervo)?',
    type: 'multiple_choice',
    description: 'Equilibrio sobre las manos con rodillas apoyadas en los brazos',
    options: [
      { value: 'no', label: 'No puedo mantener la posición', points: 0 },
      { value: 'short', label: 'Sí, por menos de 10 segundos', points: 1 },
      { value: 'long', label: 'Sí, por más de 10 segundos', points: 2 }
    ]
  }
]

export function calculateAssessmentResult(answers: Record<string, string>): AssessmentResult {
  const categoryScores = {
    empujes: 0,
    tracciones: 0,
    core: 0,
    tren_inferior: 0,
    equilibrio: 0
  }

  let totalScore = 0
  const categoryQuestionCounts = {
    empujes: 0,
    tracciones: 0,
    core: 0,
    tren_inferior: 0,
    equilibrio: 0
  }

  // Calcular puntuaciones por categoría
  assessmentQuestions.forEach(question => {
    const answer = answers[question.id]
    if (answer && question.options) {
      const selectedOption = question.options.find(opt => opt.value === answer)
      if (selectedOption) {
        categoryScores[question.category] += selectedOption.points
        totalScore += selectedOption.points
        categoryQuestionCounts[question.category]++
      }
    }
  })

  // Normalizar puntuaciones por categoría (promedio y convertir a escala 0-10)
  Object.keys(categoryScores).forEach(category => {
    const cat = category as keyof typeof categoryScores
    if (categoryQuestionCounts[cat] > 0) {
      const averageScore = categoryScores[cat] / categoryQuestionCounts[cat]
      // Convertir de escala 0-4 a escala 0-10
      categoryScores[cat] = Math.round((averageScore / 4) * 10 * 10) / 10
    }
  })

  // Determinar nivel basado en puntuación total promedio (escala 0-10)
  const averageScore = totalScore / assessmentQuestions.length
  const normalizedScore = (averageScore / 4) * 10 // Convertir a escala 0-10
  
  let level: 'principiante' | 'intermedio' | 'avanzado'
  let fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

  if (normalizedScore < 2.5) {
    level = 'principiante'
    fitnessLevel = 'BEGINNER'
  } else if (normalizedScore < 6.25) {
    level = 'intermedio'
    fitnessLevel = 'INTERMEDIATE'
  } else {
    level = 'avanzado'
    fitnessLevel = 'ADVANCED'
  }

  // Recomendar ejercicios basados en el nivel y debilidades
  const recommendedExercises = getRecommendedExercises(level, categoryScores)

  return {
    level,
    fitnessLevel,
    categoryScores,
    recommendedExercises,
    totalScore: Math.round(normalizedScore * 10) / 10
  }
}

function getRecommendedExercises(
  level: 'principiante' | 'intermedio' | 'avanzado',
  categoryScores: Record<string, number>
): string[] {
  const recommendations: string[] = []

  // Ejercicios recomendados por nivel y categoría débil
  const exerciseRecommendations = {
    principiante: {
      empujes: ['wall-push-up', 'incline-push-up', 'knee-push-up'],
      tracciones: ['dead-hang', 'assisted-pull-up'],
      core: ['plank', 'hollow-body'],
      tren_inferior: ['bodyweight-squat', 'wall-sit'],
      equilibrio: ['crow-pose', 'handstand-wall']
    },
    intermedio: {
      empujes: ['standard-push-up', 'diamond-push-up', 'parallel-bar-dips'],
      tracciones: ['pull-up', 'chin-up'],
      core: ['hollow-body', 'l-sit-progression'],
      tren_inferior: ['single-leg-squat-assisted', 'jump-squat'],
      equilibrio: ['handstand-wall', 'tuck-planche']
    },
    avanzado: {
      empujes: ['archer-push-up', 'one-arm-push-up'],
      tracciones: ['weighted-pull-up', 'muscle-up-progression'],
      core: ['l-sit', 'human-flag-progression'],
      tren_inferior: ['pistol-squat', 'shrimp-squat'],
      equilibrio: ['handstand-freestanding', 'full-planche']
    }
  }

  // Identificar las 2 categorías más débiles
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 2)

  sortedCategories.forEach(([category]) => {
    const cat = category as keyof typeof exerciseRecommendations.principiante
    const exercises = exerciseRecommendations[level][cat]
    recommendations.push(...exercises.slice(0, 2)) // Tomar los 2 primeros ejercicios
  })

  return recommendations
}