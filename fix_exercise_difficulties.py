#!/usr/bin/env python3
"""
Script para corregir las dificultades de los ejercicios basándose en:
- DIFICULTAD COHERENTE/SISTEMA_D-S_COMPLETO.md
- DIFICULTAD COHERENTE/IMPLEMENTATION_COMPLETE.md
- OG2ChartsPrint.pdf progression charts
"""

import json
import sys

# Mapeo de correcciones basado en referencias oficiales
DIFFICULTY_CORRECTIONS = {
    # ==========================================
    # PLANCHE PROGRESSION (Basado en SISTEMA_D-S_COMPLETO.md)
    # ==========================================
    "lean-planche": {
        "old": "EXPERT",
        "new": "INTERMEDIATE",
        "reason": "IMPLEMENTATION_COMPLETE.md: Planche Lean S→C+"
    },
    "skill_planche_lean": {
        "old": "EXPERT",
        "new": "INTERMEDIATE",
        "reason": "IMPLEMENTATION_COMPLETE.md: Planche Lean S→C+"
    },
    "frog-planche": {
        "old": "EXPERT",
        "new": "INTERMEDIATE",
        "reason": "IMPLEMENTATION_COMPLETE.md: Frog Stand S→C"
    },
    "skill_frog_stand": {
        "old": "NOVICE",
        "new": "INTERMEDIATE",
        "reason": "IMPLEMENTATION_COMPLETE.md: Frog Stand S→C"
    },
    "skill_planche_tuck": {
        "old": "EXPERT",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: Tuck Planche = B+ (Intermediate)"
    },
    "skill_planche_adv_tuck": {
        "old": "EXPERT",
        "new": "ADVANCED",
        "reason": "SISTEMA_D-S: Adv Tuck Planche = A- (Advanced)"
    },
    "skill_planche_straddle": {
        "old": "EXPERT",
        "new": "ADVANCED",
        "reason": "SISTEMA_D-S: Straddle Planche = A (Advanced)"
    },
    # Full Planche stays EXPERT (S level) ✓

    # ==========================================
    # PLANCHE PUSH-UPS
    # ==========================================
    "push_pseudo_planche": {
        "old": "EXPERT",
        "new": "ADVANCED",
        "reason": "Pseudo planche push-ups are harder than regular but not S level"
    },

    # ==========================================
    # FRONT LEVER PROGRESSION (Basado en SISTEMA_D-S_COMPLETO.md)
    # ==========================================
    "skill_front_lever_adv_tuck": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: Adv Tuck FL = B+ (Intermediate)"
    },
    "skill_front_lever": {
        "old": "ADVANCED",
        "new": "EXPERT",
        "reason": "SISTEMA_D-S: Full FL = S (Expert/Elite)"
    },
    "front-lever": {
        "old": "ADVANCED",
        "new": "EXPERT",
        "reason": "SISTEMA_D-S: Full FL = S (Expert/Elite)"
    },
    # Front Lever (Una Pierna) stays ADVANCED (A level) ✓

    # ==========================================
    # BACK LEVER PROGRESSION (Same as Front Lever)
    # ==========================================
    "skill_back_lever_adv_tuck": {
        "old": "EXPERT",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: Adv Tuck BL = B+ (Intermediate)"
    },
    "skill_back_lever_one_leg": {
        "old": "EXPERT",
        "new": "ADVANCED",
        "reason": "SISTEMA_D-S: One-Leg BL = A (Advanced)"
    },
    "back-lever": {
        "old": "EXPERT",
        "new": "EXPERT",
        "reason": "Full Back Lever = S (Expert) - Already correct"
    },

    # ==========================================
    # PULL-UPS (Basado en OG2 Charts)
    # ==========================================
    "pull_one_arm": {
        "old": "NOVICE",
        "new": "EXPERT",
        "reason": "OG2 Chart: One-Arm Pull-up = Elite skill (S level)"
    },
    "pull_archer": {
        "old": "NOVICE",
        "new": "INTERMEDIATE",
        "reason": "OG2 Chart: Archer Pull-up = Intermediate (B+)"
    },
    "archer-pull-up": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "OG2 Chart: Archer Pull-up = Intermediate (B+)"
    },
    "pull_standard": {
        "old": "NOVICE",
        "new": "INTERMEDIATE",
        "reason": "OG2 Chart: Regular Pull-ups = Basic/Beginner (C/B-)"
    },

    # ==========================================
    # L-SIT PROGRESSION (Basado en SISTEMA_D-S_COMPLETO.md)
    # ==========================================
    "core_l_sit_tuck": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: Tuck L-Sit = C (Basic)"
    },
    "core_l_sit": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: L-Sit = B (Beginner/Intermediate)"
    },
    "l-sit-on-floor": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: L-Sit = B (Beginner/Intermediate)"
    },
    "l_sit_floor": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: L-Sit = B (Beginner/Intermediate)"
    },
    "l_sit_parallel_bars": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "SISTEMA_D-S: L-Sit = B (Beginner/Intermediate)"
    },
    "core_l_sit_one_leg": {
        "old": "ADVANCED",
        "new": "INTERMEDIATE",
        "reason": "One-leg L-Sit is easier than full, should be B+"
    },

    # ==========================================
    # MUSCLE-UP (Basado en OG2 Charts)
    # ==========================================
    "muscle-up-on-vertical-bar-": {
        "old": "NOVICE",
        "new": "EXPERT",
        "reason": "OG2 Chart: Muscle-up = Elite skill (S level)"
    },
}

def load_exercises(filepath):
    """Load exercises from JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_exercises(filepath, exercises):
    """Save exercises to JSON file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)

def apply_corrections(exercises):
    """Apply difficulty corrections to exercises"""
    corrections_applied = []
    not_found = []

    for exercise_id, correction in DIFFICULTY_CORRECTIONS.items():
        found = False
        for exercise in exercises:
            if exercise.get('id') == exercise_id:
                old_difficulty = exercise.get('difficulty')
                new_difficulty = correction['new']

                if old_difficulty != correction['old']:
                    print(f"⚠️  WARNING: {exercise_id} - Expected '{correction['old']}', found '{old_difficulty}'")

                exercise['difficulty'] = new_difficulty
                corrections_applied.append({
                    'id': exercise_id,
                    'name': exercise.get('name'),
                    'old': old_difficulty,
                    'new': new_difficulty,
                    'reason': correction['reason']
                })
                found = True
                break

        if not found:
            not_found.append(exercise_id)

    return corrections_applied, not_found

def print_summary(corrections_applied, not_found):
    """Print summary of changes"""
    print("\n" + "="*80)
    print("📊 RESUMEN DE CORRECCIONES APLICADAS")
    print("="*80 + "\n")

    if corrections_applied:
        print(f"✅ {len(corrections_applied)} ejercicios corregidos:\n")

        # Group by change type
        by_category = {}
        for corr in corrections_applied:
            change = f"{corr['old']} → {corr['new']}"
            if change not in by_category:
                by_category[change] = []
            by_category[change].append(corr)

        for change, items in sorted(by_category.items()):
            print(f"\n{change} ({len(items)} ejercicios):")
            print("-" * 60)
            for item in items:
                print(f"  • {item['name']} ({item['id']})")
                print(f"    Razón: {item['reason']}")

    if not_found:
        print(f"\n⚠️  {len(not_found)} ejercicios no encontrados en el archivo:")
        for ex_id in not_found:
            print(f"  • {ex_id}")

    print("\n" + "="*80 + "\n")

def main():
    filepath = './apps/web/src/data/exercises.json'

    print("🔧 Cargando ejercicios...")
    exercises = load_exercises(filepath)
    print(f"✅ {len(exercises)} ejercicios cargados\n")

    print("🔄 Aplicando correcciones...")
    corrections_applied, not_found = apply_corrections(exercises)

    print_summary(corrections_applied, not_found)

    # Save changes
    print("💾 Guardando cambios...")
    save_exercises(filepath, exercises)
    print(f"✅ Archivo actualizado: {filepath}\n")

    # Create changelog
    changelog_path = './EXERCISE_DIFFICULTY_CHANGELOG.md'
    with open(changelog_path, 'w', encoding='utf-8') as f:
        f.write("# Exercise Difficulty Corrections Log\n\n")
        f.write("## Summary\n\n")
        f.write(f"- **Total corrections:** {len(corrections_applied)}\n")
        f.write(f"- **Date:** {json.dumps(None)}\n")
        f.write(f"- **Based on:** DIFICULTAD COHERENTE references\n\n")

        f.write("## Changes Applied\n\n")
        for corr in corrections_applied:
            f.write(f"### {corr['name']} (`{corr['id']}`)\n")
            f.write(f"- **Old:** {corr['old']}\n")
            f.write(f"- **New:** {corr['new']}\n")
            f.write(f"- **Reason:** {corr['reason']}\n\n")

    print(f"📝 Changelog creado: {changelog_path}\n")
    print("🎉 ¡Correcciones completadas exitosamente!")

if __name__ == '__main__':
    main()
