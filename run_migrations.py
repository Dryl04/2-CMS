#!/usr/bin/env python3
"""
Script pour afficher toutes les migrations à copier dans Supabase.
Usage: python3 run_migrations.py
"""

import os
import glob

migrations_dir = "supabase/migrations"
migrations = sorted(glob.glob(f"{migrations_dir}/*.sql"))

print("=" * 80)
print("SUPABASE MIGRATIONS - À EXÉCUTER DANS L'ORDRE")
print("=" * 80)
print()

for i, migration_file in enumerate(migrations, 1):
    print(f"\n{'=' * 80}")
    print(f"MIGRATION #{i}: {os.path.basename(migration_file)}")
    print(f"{'=' * 80}\n")
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        content = f.read()
        print(content)
    
    print(f"\n[ÉTAPE {i}]")
    print(f"1. Copie le contenu ci-dessus")
    print(f"2. Allez sur supabase.com > SQL Editor > New Query")
    print(f"3. Collez et cliquez 'Run'")
    print(f"\nAppuyez sur ENTRÉE pour continuer...\n")
    input()

print("\n✅ TOUTES LES MIGRATIONS SONT PRÊTES À ÊTRE EXÉCUTÉES!")
