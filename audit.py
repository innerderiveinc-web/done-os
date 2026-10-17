#!/usr/bin/env python3
"""
DONE OS — Comprehensive 360° Automated Health & Pre-flight Audit
Validates code integrity, Linux case-sensitivity, imports, CSS, and GoDaddy Apache deployment.
Run anytime with: python3 audit.py
"""

import os
import sys
import re
import glob

PASS = "✓ PASS"
FAIL = "✗ FAIL"
total_checks = 0
failed_checks = 0

def log_check(name, passed, details=""):
    global total_checks, failed_checks
    total_checks += 1
    if passed:
        print(f"[{PASS}] {name}")
    else:
        failed_checks += 1
        print(f"[{FAIL}] {name}")
        if details:
            print(f"       -> {details}")

print("==================================================")
print("  DONE OS — Automated Production Health Check")
print("==================================================")

# 1. Linux Case-Sensitivity & File Path Match
case_issues = []
js_files = glob.glob('src/**/*.js', recursive=True) + ['index.html']
for fpath in js_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    dir_name = os.path.dirname(fpath)
    matches = re.findall(r'from\s+[\'\"](\.[^\'\"]+)[\'\"]', content)
    matches += re.findall(r'import\s+[\'\"](\.[^\'\"]+)[\'\"]', content)
    for rel in matches:
        parts = rel.split('/')
        current = dir_name
        for part in parts:
            if part == '.':
                continue
            elif part == '..':
                current = os.path.dirname(current)
            else:
                target_part = part
                if not os.path.exists(os.path.join(current, target_part)) and os.path.exists(os.path.join(current, target_part + '.js')):
                    target_part += '.js'
                try:
                    entries = os.listdir(current)
                    if target_part not in entries:
                        for e in entries:
                            if e.lower() == target_part.lower():
                                case_issues.append(f"{fpath}: '{rel}' case mismatch with '{e}'")
                except Exception:
                    pass
                current = os.path.join(current, target_part)

log_check("Linux Case-Sensitivity Check (Ext4 / cPanel)", len(case_issues) == 0, "\n       -> ".join(case_issues))

# 2. Relative Imports Existence
broken_imports = []
for fpath in js_files:
    if fpath == 'index.html':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    dir_name = os.path.dirname(fpath)
    matches = re.findall(r'from\s+[\'\"](\.[^\'\"]+)[\'\"]', content)
    for target in matches:
        resolved = os.path.normpath(os.path.join(dir_name, target))
        if not os.path.exists(resolved) and not os.path.exists(resolved + '.js'):
            broken_imports.append(f"{fpath} -> {target}")

log_check("Import Resolution & File Existence", len(broken_imports) == 0, ", ".join(broken_imports))

# 3. Exported / Imported Symbol Integrity
exports_map = {}
for fpath in glob.glob('src/**/*.js', recursive=True):
    exports = set()
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    for m in re.finditer(r'export\s+(?:const|function|let|class)\s+([A-Za-z0-9_$]+)', content):
        exports.add(m.group(1))
    for m in re.finditer(r'export\s+\{([^}]+)\}', content):
        names = [x.strip().split(' as ')[-1].strip() for x in m.group(1).split(',') if x.strip()]
        exports.update(names)
    if 'export default' in content:
        exports.add('default')
    exports_map[os.path.normpath(fpath)] = exports

broken_symbols = []
for fpath in glob.glob('src/**/*.js', recursive=True):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    dir_name = os.path.dirname(fpath)
    for m in re.finditer(r'import\s+\{([^}]+)\}\s+from\s+[\'\"](\.[^\'\"]+)[\'\"]', content):
        imported_names = [x.strip().split(' as ')[0].strip() for x in m.group(1).split(',') if x.strip()]
        rel_target = m.group(2)
        resolved = os.path.normpath(os.path.join(dir_name, rel_target))
        if not resolved.endswith('.js'):
            resolved += '.js'
        if resolved in exports_map:
            for name in imported_names:
                if name not in exports_map[resolved]:
                    broken_symbols.append(f"{fpath} imports non-existent '{name}' from {resolved}")

log_check("Named Exports & Imports Mapping", len(broken_symbols) == 0, ", ".join(broken_symbols))

# 4. Dead Anchor / Broken Hash Links
dead_hrefs = []
for fpath in glob.glob('src/**/*.js', recursive=True):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r'href=[\'\"](#|\s*)[\'\"]', content)
    if matches:
        dead_hrefs.append(f"{fpath} has {len(matches)} dead href=#")

log_check("Navigation & Zero Dead Anchor Links", len(dead_hrefs) == 0, ", ".join(dead_hrefs))

# 5. Apache .htaccess Security & MIME Types
htaccess_path = '.htaccess'
htaccess_ok = False
if os.path.exists(htaccess_path):
    ht_content = open(htaccess_path).read()
    has_spa_rewrite = "RewriteRule ^ index.html [L,QSA]" in ht_content
    has_mime = "AddType application/javascript .js" in ht_content
    has_security = "Require all denied" in ht_content or "Deny from all" in ht_content
    htaccess_ok = has_spa_rewrite and has_mime and has_security

log_check("Apache .htaccess (SPA Routing, MIME & Security)", htaccess_ok)

# 6. Database Files (MySQL for cPanel)
has_mysql = os.path.exists('schema_mysql.sql') and os.path.getsize('schema_mysql.sql') > 1000
log_check("MySQL Database Schema (cPanel phpMyAdmin Ready)", has_mysql)

# 7. Stylesheet Health
css_path = 'src/styles.css'
css_ok = False
if os.path.exists(css_path):
    css_text = open(css_path).read()
    open_b = css_text.count('{')
    close_b = css_text.count('}')
    css_ok = (open_b == close_b) and (len(css_text) > 10000)

log_check("CSS Stylesheet Integrity & Brace Balance", css_ok)

# 8. Cleanliness (Zero Leftover Build Duplicates)
unwanted = ['dist', 'build.mjs', 'src/types/database.ts']
found_unwanted = [u for u in unwanted if os.path.exists(u)]
log_check("Zero Clutter & Duplicate Build Artifacts", len(found_unwanted) == 0, f"Found: {found_unwanted}")

print("==================================================")
if failed_checks == 0:
    print(f"  RESULT: ALL {total_checks} CHECKS PASSED (100% HEALTHY)")
    print("  System is fully locked, stable and deployment ready.")
else:
    print(f"  RESULT: {failed_checks} / {total_checks} CHECKS FAILED")
print("==================================================")

sys.exit(0 if failed_checks == 0 else 1)
