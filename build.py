#!/usr/bin/env python3
"""
DONE — Build Script
Copies assets into dist/ for static hosting (Cloudflare Pages, Vercel, Netlify)
"""
import shutil
import os

DIST_DIR = 'dist'

def build():
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR, exist_ok=True)

    # Copy files
    shutil.copy2('index.html', os.path.join(DIST_DIR, 'index.html'))
    shutil.copy2('README.md', os.path.join(DIST_DIR, 'README.md'))
    shutil.copy2('.env.example', os.path.join(DIST_DIR, '.env.example'))
    if os.path.exists('manifest.json'):
        shutil.copy2('manifest.json', os.path.join(DIST_DIR, 'manifest.json'))
    if os.path.exists('sw.js'):
        shutil.copy2('sw.js', os.path.join(DIST_DIR, 'sw.js'))

    # Copy directories
    shutil.copytree('src', os.path.join(DIST_DIR, 'src'))
    shutil.copytree('supabase', os.path.join(DIST_DIR, 'supabase'))

    # Create Cloudflare Pages SPA redirect file (_routes.json / _redirects)
    with open(os.path.join(DIST_DIR, '_redirects'), 'w') as f:
        f.write('/* /index.html 200\n')

    print('DONE static production build created successfully in dist/')

if __name__ == '__main__':
    build()
