const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to the database
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create/open database
const db = new Database(dbPath);

console.log('🌱 Starting direct SQLite seeding...');
console.log(`📁 Database path: ${dbPath}`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const createTables = () => {
  console.log('📋 Creating tables...');

  // Skill table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Skill (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'STRENGTH',
      branch TEXT NOT NULL DEFAULT 'EMPUJE',
      difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
      "order" INTEGER DEFAULT 1,
      requiredStrength INTEGER DEFAULT 1,
      requiredEndurance INTEGER DEFAULT 1,
      requiredFlexibility INTEGER DEFAULT 1,
      requiredBalance INTEGER DEFAULT 1,
      strengthRequired INTEGER DEFAULT 0,
      strengthGained INTEGER DEFAULT 1,
      xpReward INTEGER DEFAULT 25,
      coinReward INTEGER DEFAULT 5,
      requiredReps INTEGER,
      requiredDuration INTEGER,
      requiredDays INTEGER DEFAULT 1,
      thumbnailUrl TEXT,
      videoUrl TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // SkillPrerequisite table
  db.exec(`
    CREATE TABLE IF NOT EXISTS SkillPrerequisite (
      id TEXT PRIMARY KEY,
      skillId TEXT NOT NULL,
      prerequisiteId TEXT NOT NULL,
      FOREIGN KEY (skillId) REFERENCES Skill(id) ON DELETE CASCADE,
      FOREIGN KEY (prerequisiteId) REFERENCES Skill(id) ON DELETE CASCADE,
      UNIQUE(skillId, prerequisiteId)
    )
  `);

  // Achievement table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Achievement (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'WORKOUT_COUNT',
      target INTEGER DEFAULT 1,
      level INTEGER DEFAULT 1,
      chainName TEXT,
      iconUrl TEXT,
      points INTEGER DEFAULT 100,
      rarity TEXT DEFAULT 'NOVICE',
      unlocksAchievementId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tables created');
};

// Generate CUID-like ID
const generateId = () => {
  return 'c' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Seed Skills
const seedSkills = () => {
  console.log('🎯 Seeding skills...');

  // Delete existing data
  db.exec('DELETE FROM SkillPrerequisite');
  db.exec('DELETE FROM Skill');

  const insertSkill = db.prepare(`
    INSERT INTO Skill (
      id, name, description, category, branch, difficulty, "order",
      requiredStrength, requiredEndurance, requiredFlexibility, requiredBalance,
      strengthRequired, strengthGained, xpReward, coinReward,
      requiredReps, requiredDuration, requiredDays
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  // Skills data
  const skillsData = [
    // CALENTAMIENTO
    { name: 'Círculos de Brazos', description: 'Movimiento circular de brazos para calentar hombros.', category: 'FLEXIBILITY', branch: 'CALENTAMIENTO', difficulty: 'BEGINNER', order: 1, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 1, requiredBalance: 1, strengthRequired: 0, strengthGained: 1, xpReward: 25, coinReward: 5, requiredReps: 15, requiredDays: 1 },
    { name: 'Rotaciones de Muñecas', description: 'Preparación de muñecas para ejercicios de apoyo.', category: 'FLEXIBILITY', branch: 'CALENTAMIENTO', difficulty: 'BEGINNER', order: 2, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 2, requiredBalance: 1, strengthRequired: 1, strengthGained: 1, xpReward: 25, coinReward: 5, requiredReps: 10, requiredDays: 1 },
    { name: 'Gato-Camello', description: 'Movilidad de columna vertebral.', category: 'FLEXIBILITY', branch: 'CALENTAMIENTO', difficulty: 'BEGINNER', order: 3, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 3, requiredBalance: 2, strengthRequired: 2, strengthGained: 2, xpReward: 30, coinReward: 6, requiredReps: 12, requiredDays: 1 },
    { name: 'Jumping Jacks', description: 'Ejercicio cardiovascular para activar todo el cuerpo.', category: 'DYNAMIC_MOVEMENTS', branch: 'CALENTAMIENTO', difficulty: 'BEGINNER', order: 4, requiredStrength: 1, requiredEndurance: 2, requiredFlexibility: 1, requiredBalance: 2, strengthRequired: 3, strengthGained: 3, xpReward: 40, coinReward: 8, requiredReps: 20, requiredDays: 1 },

    // EMPUJE
    { name: 'Flexiones contra Pared', description: 'Flexiones verticales contra la pared.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'BEGINNER', order: 1, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 1, requiredBalance: 1, strengthRequired: 5, strengthGained: 3, xpReward: 30, coinReward: 6, requiredReps: 10, requiredDays: 3 },
    { name: 'Flexiones Inclinadas', description: 'Flexiones con manos elevadas.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'BEGINNER', order: 2, requiredStrength: 2, requiredEndurance: 2, requiredFlexibility: 1, requiredBalance: 2, strengthRequired: 8, strengthGained: 4, xpReward: 50, coinReward: 10, requiredReps: 8, requiredDays: 4 },
    { name: 'Flexiones de Rodillas', description: 'Flexiones apoyando las rodillas.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'BEGINNER', order: 3, requiredStrength: 2, requiredEndurance: 2, requiredFlexibility: 2, requiredBalance: 2, strengthRequired: 12, strengthGained: 5, xpReward: 60, coinReward: 12, requiredReps: 8, requiredDays: 4 },
    { name: 'Flexiones Completas', description: 'Push-ups estándar.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'INTERMEDIATE', order: 4, requiredStrength: 3, requiredEndurance: 3, requiredFlexibility: 2, requiredBalance: 3, strengthRequired: 17, strengthGained: 6, xpReward: 80, coinReward: 16, requiredReps: 10, requiredDays: 5 },
    { name: 'Flexiones Anchas', description: 'Push-ups con manos separadas.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'INTERMEDIATE', order: 5, requiredStrength: 3, requiredEndurance: 3, requiredFlexibility: 2, requiredBalance: 3, strengthRequired: 23, strengthGained: 7, xpReward: 100, coinReward: 20, requiredReps: 8, requiredDays: 5 },
    { name: 'Flexiones Diamante', description: 'Push-ups con manos en forma de diamante.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'INTERMEDIATE', order: 6, requiredStrength: 4, requiredEndurance: 3, requiredFlexibility: 2, requiredBalance: 4, strengthRequired: 30, strengthGained: 8, xpReward: 120, coinReward: 24, requiredReps: 6, requiredDays: 6 },
    { name: 'Fondos en Banco', description: 'Dips en banco.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'INTERMEDIATE', order: 7, requiredStrength: 4, requiredEndurance: 3, requiredFlexibility: 3, requiredBalance: 3, strengthRequired: 38, strengthGained: 9, xpReward: 140, coinReward: 28, requiredReps: 8, requiredDays: 6 },
    { name: 'Flexiones Declinadas', description: 'Push-ups con pies elevados.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'INTERMEDIATE', order: 8, requiredStrength: 5, requiredEndurance: 4, requiredFlexibility: 3, requiredBalance: 4, strengthRequired: 47, strengthGained: 10, xpReward: 160, coinReward: 32, requiredReps: 6, requiredDays: 7 },
    { name: 'Flexiones Pliométricas', description: 'Push-ups explosivos con despegue.', category: 'DYNAMIC_MOVEMENTS', branch: 'EMPUJE', difficulty: 'ADVANCED', order: 9, requiredStrength: 5, requiredEndurance: 4, requiredFlexibility: 3, requiredBalance: 5, strengthRequired: 57, strengthGained: 12, xpReward: 200, coinReward: 40, requiredReps: 5, requiredDays: 8 },
    { name: 'Flexiones Archer', description: 'Push-ups unilaterales.', category: 'ADVANCED_SKILLS', branch: 'EMPUJE', difficulty: 'ADVANCED', order: 10, requiredStrength: 6, requiredEndurance: 4, requiredFlexibility: 4, requiredBalance: 6, strengthRequired: 69, strengthGained: 15, xpReward: 250, coinReward: 50, requiredReps: 4, requiredDays: 8 },
    { name: 'Fondos en Paralelas', description: 'Dips en paralelas.', category: 'PUSH_MOVEMENTS', branch: 'EMPUJE', difficulty: 'ADVANCED', order: 11, requiredStrength: 6, requiredEndurance: 5, requiredFlexibility: 4, requiredBalance: 5, strengthRequired: 84, strengthGained: 18, xpReward: 300, coinReward: 60, requiredReps: 6, requiredDays: 10 },
    { name: 'Flexiones a Una Mano', description: 'One-arm push-up.', category: 'ADVANCED_SKILLS', branch: 'EMPUJE', difficulty: 'ADVANCED', order: 12, requiredStrength: 8, requiredEndurance: 5, requiredFlexibility: 4, requiredBalance: 8, strengthRequired: 102, strengthGained: 25, xpReward: 500, coinReward: 100, requiredReps: 2, requiredDays: 12 },

    // TRACCION
    { name: 'Remo Invertido en Barra', description: 'Remo invertido con pies en el suelo.', category: 'PULL_MOVEMENTS', branch: 'TRACCION', difficulty: 'BEGINNER', order: 1, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 1, requiredBalance: 1, strengthRequired: 5, strengthGained: 3, xpReward: 30, coinReward: 6, requiredReps: 8, requiredDays: 3 },
    { name: 'Dominadas Asistidas con Banda', description: 'Dominadas con asistencia de banda elástica.', category: 'PULL_MOVEMENTS', branch: 'TRACCION', difficulty: 'BEGINNER', order: 2, requiredStrength: 2, requiredEndurance: 2, requiredFlexibility: 1, requiredBalance: 2, strengthRequired: 12, strengthGained: 5, xpReward: 50, coinReward: 10, requiredReps: 6, requiredDays: 4 },
    { name: 'Dominadas Excéntricas', description: 'Descenso controlado desde la posición alta.', category: 'PULL_MOVEMENTS', branch: 'TRACCION', difficulty: 'INTERMEDIATE', order: 3, requiredStrength: 3, requiredEndurance: 2, requiredFlexibility: 2, requiredBalance: 3, strengthRequired: 20, strengthGained: 6, xpReward: 70, coinReward: 14, requiredReps: 5, requiredDays: 5 },
    { name: 'Dominadas Completas', description: 'Pull-ups clásicos con agarre prono.', category: 'PULL_MOVEMENTS', branch: 'TRACCION', difficulty: 'INTERMEDIATE', order: 4, requiredStrength: 4, requiredEndurance: 3, requiredFlexibility: 2, requiredBalance: 3, strengthRequired: 28, strengthGained: 8, xpReward: 100, coinReward: 20, requiredReps: 5, requiredDays: 6 },
    { name: 'Dominadas a Larga Amplitud', description: 'Dominadas con agarre ancho.', category: 'PULL_MOVEMENTS', branch: 'TRACCION', difficulty: 'ADVANCED', order: 5, requiredStrength: 5, requiredEndurance: 3, requiredFlexibility: 3, requiredBalance: 4, strengthRequired: 40, strengthGained: 10, xpReward: 140, coinReward: 28, requiredReps: 4, requiredDays: 7 },
    { name: 'Muscle-up Asistido', description: 'Transición dominada-fondo con asistencia.', category: 'ADVANCED_SKILLS', branch: 'TRACCION', difficulty: 'ADVANCED', order: 6, requiredStrength: 6, requiredEndurance: 4, requiredFlexibility: 3, requiredBalance: 4, strengthRequired: 55, strengthGained: 15, xpReward: 220, coinReward: 44, requiredReps: 3, requiredDays: 8 },

    // CORE
    { name: 'Plancha (Plank)', description: 'Plancha estándar con apoyo de antebrazos.', category: 'CORE_STRENGTH', branch: 'CORE', difficulty: 'BEGINNER', order: 1, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 1, requiredBalance: 1, strengthRequired: 0, strengthGained: 2, xpReward: 25, coinReward: 5, requiredDuration: 30, requiredDays: 2 },
    { name: 'Plancha Lateral', description: 'Plancha lateral apoyado en un antebrazo.', category: 'CORE_STRENGTH', branch: 'CORE', difficulty: 'BEGINNER', order: 2, requiredStrength: 1, requiredEndurance: 2, requiredFlexibility: 1, requiredBalance: 2, strengthRequired: 2, strengthGained: 3, xpReward: 40, coinReward: 8, requiredDuration: 20, requiredDays: 3 },
    { name: 'Hollow Hold', description: 'Postura hueca con tensión corporal.', category: 'CORE_STRENGTH', branch: 'CORE', difficulty: 'INTERMEDIATE', order: 3, requiredStrength: 2, requiredEndurance: 2, requiredFlexibility: 2, requiredBalance: 3, strengthRequired: 8, strengthGained: 5, xpReward: 70, coinReward: 14, requiredDuration: 20, requiredDays: 4 },
    { name: 'L-Sit en Paralelas', description: 'Sujeción en L con soporte.', category: 'ADVANCED_SKILLS', branch: 'CORE', difficulty: 'ADVANCED', order: 4, requiredStrength: 4, requiredEndurance: 3, requiredFlexibility: 3, requiredBalance: 4, strengthRequired: 18, strengthGained: 8, xpReward: 140, coinReward: 28, requiredDuration: 15, requiredDays: 6 },

    // EQUILIBRIO
    { name: 'Cuadrupedia y Apoyo en Pared', description: 'Trabajo básico de equilibrio y apoyo.', category: 'BALANCE', branch: 'EQUILIBRIO', difficulty: 'BEGINNER', order: 1, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 1, requiredBalance: 2, strengthRequired: 0, strengthGained: 1, xpReward: 20, coinReward: 4, requiredDuration: 20, requiredDays: 2 },
    { name: 'Parada de Manos contra Pared', description: 'Handstand asistido en pared.', category: 'BALANCE', branch: 'EQUILIBRIO', difficulty: 'INTERMEDIATE', order: 2, requiredStrength: 2, requiredEndurance: 2, requiredFlexibility: 2, requiredBalance: 4, strengthRequired: 10, strengthGained: 4, xpReward: 80, coinReward: 16, requiredDuration: 20, requiredDays: 4 },
    { name: 'Handstand Libre (Corto)', description: 'Pino sin apoyo por segundos.', category: 'ADVANCED_SKILLS', branch: 'EQUILIBRIO', difficulty: 'ADVANCED', order: 3, requiredStrength: 3, requiredEndurance: 3, requiredFlexibility: 3, requiredBalance: 6, strengthRequired: 18, strengthGained: 6, xpReward: 150, coinReward: 30, requiredDuration: 5, requiredDays: 6 },

    // TREN INFERIOR
    { name: 'Sentadilla Aire', description: 'Bodyweight squat básica.', category: 'LEG_STRENGTH', branch: 'TREN_INFERIOR', difficulty: 'BEGINNER', order: 1, requiredStrength: 1, requiredEndurance: 1, requiredFlexibility: 1, requiredBalance: 1, strengthRequired: 0, strengthGained: 2, xpReward: 20, coinReward: 4, requiredReps: 10, requiredDays: 2 },
    { name: 'Zancadas Alternas', description: 'Lunges alternos controlados.', category: 'LEG_STRENGTH', branch: 'TREN_INFERIOR', difficulty: 'BEGINNER', order: 2, requiredStrength: 1, requiredEndurance: 2, requiredFlexibility: 2, requiredBalance: 2, strengthRequired: 2, strengthGained: 3, xpReward: 30, coinReward: 6, requiredReps: 10, requiredDays: 3 },
    { name: 'Sentadilla a una pierna asistida (Pistol)', description: 'Pistol squat con asistencia.', category: 'ADVANCED_SKILLS', branch: 'TREN_INFERIOR', difficulty: 'ADVANCED', order: 3, requiredStrength: 3, requiredEndurance: 2, requiredFlexibility: 3, requiredBalance: 4, strengthRequired: 12, strengthGained: 6, xpReward: 120, coinReward: 24, requiredReps: 5, requiredDays: 5 },

    // ESTATICOS
    { name: 'Tuck Front Lever', description: 'Posición de front lever en tuck.', category: 'STATIC_ELEMENTS', branch: 'ESTATICOS', difficulty: 'ADVANCED', order: 1, requiredStrength: 4, requiredEndurance: 3, requiredFlexibility: 2, requiredBalance: 3, strengthRequired: 20, strengthGained: 8, xpReward: 160, coinReward: 32, requiredDuration: 8, requiredDays: 6 },
    { name: 'Tuck Planche', description: 'Planche en tuck sobre paralelas.', category: 'STATIC_ELEMENTS', branch: 'ESTATICOS', difficulty: 'ADVANCED', order: 2, requiredStrength: 5, requiredEndurance: 3, requiredFlexibility: 3, requiredBalance: 4, strengthRequired: 26, strengthGained: 10, xpReward: 200, coinReward: 40, requiredDuration: 5, requiredDays: 8 },
  ];

  const createdSkills = [];

  const insertTransaction = db.transaction(() => {
    for (const skill of skillsData) {
      const id = generateId();
      insertSkill.run(
        id, skill.name, skill.description, skill.category, skill.branch, skill.difficulty, skill.order,
        skill.requiredStrength, skill.requiredEndurance, skill.requiredFlexibility, skill.requiredBalance,
        skill.strengthRequired, skill.strengthGained, skill.xpReward, skill.coinReward,
        skill.requiredReps || null, skill.requiredDuration || null, skill.requiredDays
      );
      createdSkills.push({ id, ...skill });
    }
  });

  insertTransaction();
  console.log(`✅ Created ${createdSkills.length} skills`);

  // Create prerequisites
  console.log('🔗 Creating skill prerequisites...');

  const insertPrereq = db.prepare(`
    INSERT INTO SkillPrerequisite (id, skillId, prerequisiteId)
    VALUES (?, ?, ?)
  `);

  const branches = ['CALENTAMIENTO', 'EMPUJE', 'TRACCION', 'CORE', 'EQUILIBRIO', 'TREN_INFERIOR', 'ESTATICOS'];

  const prereqTransaction = db.transaction(() => {
    for (const branch of branches) {
      const branchSkills = createdSkills
        .filter(s => s.branch === branch)
        .sort((a, b) => a.order - b.order);

      for (let i = 1; i < branchSkills.length; i++) {
        insertPrereq.run(generateId(), branchSkills[i].id, branchSkills[i - 1].id);
      }
    }
  });

  prereqTransaction();
  console.log('✅ Created skill prerequisites');

  return createdSkills.length;
};

// Seed Achievements
const seedAchievements = () => {
  console.log('🏆 Seeding achievements...');

  // Delete existing
  db.exec('DELETE FROM Achievement');

  const insertAchievement = db.prepare(`
    INSERT INTO Achievement (
      id, name, description, type, target, level, chainName, iconUrl, points, rarity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const achievements = [
    // Push-Up Chain
    { name: 'Push-Up Initiate', description: 'Complete 50 push-ups in total', type: 'EXERCISE_MASTERY', target: 50, level: 1, chainName: 'Push-Up Master', iconUrl: '💪', points: 300, rarity: 'NOVICE' },
    { name: 'Push-Up Enthusiast', description: 'Complete 200 push-ups in total', type: 'EXERCISE_MASTERY', target: 200, level: 2, chainName: 'Push-Up Master', iconUrl: '💪', points: 600, rarity: 'INTERMEDIATE' },
    { name: 'Push-Up Expert', description: 'Complete 500 push-ups in total', type: 'EXERCISE_MASTERY', target: 500, level: 3, chainName: 'Push-Up Master', iconUrl: '💪', points: 1000, rarity: 'ADVANCED' },
    { name: 'Push-Up Master', description: 'Complete 1000 push-ups in total', type: 'EXERCISE_MASTERY', target: 1000, level: 4, chainName: 'Push-Up Master', iconUrl: '💪', points: 2000, rarity: 'ELITE' },
    { name: 'Push-Up Legend', description: 'Complete 2500 push-ups in total', type: 'EXERCISE_MASTERY', target: 2500, level: 5, chainName: 'Push-Up Master', iconUrl: '💪', points: 5000, rarity: 'ELITE' },

    // Pull-Up Chain
    { name: 'Pull-Up Starter', description: 'Complete 25 pull-ups in total', type: 'EXERCISE_MASTERY', target: 25, level: 1, chainName: 'Pull-Up Warrior', iconUrl: '🏋️', points: 400, rarity: 'NOVICE' },
    { name: 'Pull-Up Practitioner', description: 'Complete 100 pull-ups in total', type: 'EXERCISE_MASTERY', target: 100, level: 2, chainName: 'Pull-Up Warrior', iconUrl: '🏋️', points: 800, rarity: 'INTERMEDIATE' },
    { name: 'Pull-Up Champion', description: 'Complete 300 pull-ups in total', type: 'EXERCISE_MASTERY', target: 300, level: 3, chainName: 'Pull-Up Warrior', iconUrl: '🏋️', points: 1500, rarity: 'ADVANCED' },
    { name: 'Pull-Up Warrior', description: 'Complete 750 pull-ups in total', type: 'EXERCISE_MASTERY', target: 750, level: 4, chainName: 'Pull-Up Warrior', iconUrl: '🏋️', points: 3000, rarity: 'ELITE' },

    // Core Chain
    { name: 'Core Awakening', description: 'Hold plank for 3 minutes total', type: 'EXERCISE_MASTERY', target: 180, level: 1, chainName: 'Core Champion', iconUrl: '🔥', points: 250, rarity: 'NOVICE' },
    { name: 'Core Builder', description: 'Hold plank for 10 minutes total', type: 'EXERCISE_MASTERY', target: 600, level: 2, chainName: 'Core Champion', iconUrl: '🔥', points: 500, rarity: 'INTERMEDIATE' },
    { name: 'Core Champion', description: 'Hold plank for 30 minutes total', type: 'EXERCISE_MASTERY', target: 1800, level: 3, chainName: 'Core Champion', iconUrl: '🔥', points: 1200, rarity: 'ADVANCED' },

    // Workout Chain
    { name: 'First Steps', description: 'Complete 5 workout sessions', type: 'WORKOUT_COUNT', target: 5, level: 1, chainName: 'Workout Consistency', iconUrl: '🎯', points: 300, rarity: 'NOVICE' },
    { name: 'Building Habits', description: 'Complete 25 workout sessions', type: 'WORKOUT_COUNT', target: 25, level: 2, chainName: 'Workout Consistency', iconUrl: '🎯', points: 700, rarity: 'INTERMEDIATE' },
    { name: 'Dedicated Athlete', description: 'Complete 50 workout sessions', type: 'WORKOUT_COUNT', target: 50, level: 3, chainName: 'Workout Consistency', iconUrl: '🎯', points: 1500, rarity: 'ADVANCED' },
    { name: 'Training Master', description: 'Complete 100 workout sessions', type: 'WORKOUT_COUNT', target: 100, level: 4, chainName: 'Workout Consistency', iconUrl: '🎯', points: 3000, rarity: 'ELITE' },
    { name: 'Lifetime Athlete', description: 'Complete 250 workout sessions', type: 'WORKOUT_COUNT', target: 250, level: 5, chainName: 'Workout Consistency', iconUrl: '🎯', points: 7500, rarity: 'ELITE' },

    // XP Chain
    { name: 'XP Collector', description: 'Earn 5,000 total XP', type: 'PROGRESS_MILESTONE', target: 5000, level: 1, chainName: 'XP Collector', iconUrl: '⭐', points: 500, rarity: 'NOVICE' },
    { name: 'XP Hunter', description: 'Earn 25,000 total XP', type: 'PROGRESS_MILESTONE', target: 25000, level: 2, chainName: 'XP Collector', iconUrl: '⭐', points: 1000, rarity: 'INTERMEDIATE' },
    { name: 'XP Master', description: 'Earn 100,000 total XP', type: 'PROGRESS_MILESTONE', target: 100000, level: 3, chainName: 'XP Collector', iconUrl: '⭐', points: 2500, rarity: 'ADVANCED' },
    { name: 'XP Champion', description: 'Earn 250,000 total XP', type: 'PROGRESS_MILESTONE', target: 250000, level: 4, chainName: 'XP Collector', iconUrl: '⭐', points: 5000, rarity: 'ELITE' },

    // Balance Chain
    { name: 'Finding Balance', description: 'Hold handstand for 1 minute total', type: 'EXERCISE_MASTERY', target: 60, level: 1, chainName: 'Balance Master', iconUrl: '🤸', points: 400, rarity: 'NOVICE' },
    { name: 'Balance Practitioner', description: 'Hold handstand for 5 minutes total', type: 'EXERCISE_MASTERY', target: 300, level: 2, chainName: 'Balance Master', iconUrl: '🤸', points: 900, rarity: 'INTERMEDIATE' },
    { name: 'Balance Master', description: 'Hold handstand for 15 minutes total', type: 'EXERCISE_MASTERY', target: 900, level: 3, chainName: 'Balance Master', iconUrl: '🤸', points: 2000, rarity: 'ADVANCED' },

    // Streak Chain
    { name: 'Week Warrior', description: 'Maintain a 7-day workout streak', type: 'STREAK', target: 7, level: 1, chainName: 'Streak Master', iconUrl: '🔥', points: 500, rarity: 'INTERMEDIATE' },
    { name: 'Month Master', description: 'Maintain a 30-day workout streak', type: 'STREAK', target: 30, level: 2, chainName: 'Streak Master', iconUrl: '🔥', points: 2000, rarity: 'ADVANCED' },
    { name: 'Streak Legend', description: 'Maintain a 100-day workout streak', type: 'STREAK', target: 100, level: 3, chainName: 'Streak Master', iconUrl: '🔥', points: 10000, rarity: 'ELITE' },
  ];

  const insertTransaction = db.transaction(() => {
    for (const achievement of achievements) {
      insertAchievement.run(
        generateId(),
        achievement.name,
        achievement.description,
        achievement.type,
        achievement.target,
        achievement.level,
        achievement.chainName,
        achievement.iconUrl,
        achievement.points,
        achievement.rarity
      );
    }
  });

  insertTransaction();
  console.log(`✅ Created ${achievements.length} achievements`);

  return achievements.length;
};

// Main execution
try {
  createTables();
  const skillCount = seedSkills();
  const achievementCount = seedAchievements();

  console.log('\n🎉 Seeding complete!');
  console.log(`📊 Summary:`);
  console.log(`   - ${skillCount} skills created`);
  console.log(`   - ${achievementCount} achievements created`);
  console.log(`\n💡 Database location: ${dbPath}`);

} catch (error) {
  console.error('❌ Error during seeding:', error);
  process.exit(1);
} finally {
  db.close();
}
