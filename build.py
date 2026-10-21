#!/usr/bin/env python3
"""
DONE OS — Deterministic Production Build Script
Packages all static assets, Apache configs, and schema files into dist/
"""
import shutil
import os
import sys

DIST_DIR = 'dist'
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def build():
    print("Starting DONE OS production build...")
    dist_path = os.path.join(ROOT_DIR, DIST_DIR)
    if os.path.exists(dist_path):
        shutil.rmtree(dist_path)
    os.makedirs(dist_path, exist_ok=True)

    # 1. Essential root files to copy
    root_files = [
        'index.html',
        'README.md',
        '.htaccess',
        'manifest.json',
        'sw.js',
        'schema_mysql.sql',
        'cron_reminders.php',
        'package.json'
    ]

    for fname in root_files:
        src = os.path.join(ROOT_DIR, fname)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(dist_path, fname))
            print(f"  ✓ Copied {fname}")
        else:
            print(f"  ⚠ Notice: Optional root file {fname} not found, skipping.")

    # 2. Ensure .env.example exists in dist
    env_example_src = os.path.join(ROOT_DIR, '.env.example')
    env_example_dst = os.path.join(dist_path, '.env.example')
    if os.path.exists(env_example_src):
        shutil.copy2(env_example_src, env_example_dst)
    else:
        with open(env_example_dst, 'w') as f:
            f.write("# DONE OS Environment Variables\nVITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\n")
    print("  ✓ Created .env.example template")

    # 3. Copy source and database directories
    shutil.copytree(os.path.join(ROOT_DIR, 'src'), os.path.join(dist_path, 'src'))
    print("  ✓ Copied src/ directory")

    supabase_src = os.path.join(ROOT_DIR, 'supabase')
    if os.path.exists(supabase_src):
        shutil.copytree(supabase_src, os.path.join(dist_path, 'supabase'))
        print("  ✓ Copied supabase/ directory")

    # 4. Create Cloudflare Pages / Netlify SPA redirect fallback
    with open(os.path.join(dist_path, '_redirects'), 'w') as f:
        f.write('/* /index.html 200\n')
    print("  ✓ Created Cloudflare/Netlify SPA _redirects")

    print("\n[SUCCESS] DONE OS static production build created successfully in dist/")

if __name__ == '__main__':
    try:
        build()
    except Exception as e:
        print(f"\n[BUILD ERROR]: {e}", file=sys.stderr)
        sys.exit(1)
