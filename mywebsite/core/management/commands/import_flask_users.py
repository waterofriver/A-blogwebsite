from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import sqlite3
import glob
import os

User = get_user_model()

class Command(BaseCommand):
    help = "Import users from a Flask sqlite database backup (best-effort)."

    def handle(self, *args, **options):
        candidates = glob.glob(os.path.join('..', 'flask_backup_20251219_192258', 'instance', '*')) + glob.glob(os.path.join('..', 'flask_backup_20251219_192258', '*'))
        candidates = [c for c in candidates if c.endswith('.db') or c.endswith('.sqlite') or c.endswith('.sqlite3')]
        if not candidates:
            self.stdout.write(self.style.ERROR('No candidate sqlite files found under flask_backup_20251219_192258/'))
            return
        dbpath = candidates[0]
        self.stdout.write(f'Using {dbpath}')
        conn = sqlite3.connect(dbpath)
        cur = conn.cursor()
        possible_tables = ['users', 'user', 'account', 'auth_user']
        table = None
        for t in possible_tables:
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,))
            if cur.fetchone():
                table = t
                break
        if not table:
            self.stdout.write(self.style.ERROR('No user table found; inspect sqlite manually'))
            return
        cur.execute(f'PRAGMA table_info({table})')
        cols = [r[1] for r in cur.fetchall()]
        self.stdout.write(f'Found columns: {cols}')
        cur.execute(f'SELECT * FROM {table} LIMIT 10000')
        rows = cur.fetchall()
        created = 0
        with transaction.atomic():
            for r in rows:
                row = dict(zip(cols, r))
                email = row.get('email') or row.get('user_email') or row.get('username')
                username = row.get('username') or (email.split('@')[0] if email else f'user{created}')
                raw_password = row.get('password') or row.get('passwd') or None
                if not email and User.objects.filter(username=username).exists():
                    continue
                if User.objects.filter(email=email).exists():
                    continue
                u = User(username=username, email=email)
                if raw_password:
                    try:
                        u.set_password(raw_password)
                    except Exception:
                        u.set_unusable_password()
                else:
                    u.set_unusable_password()
                u.save()
                created += 1
                # set profile fields if available
                try:
                    profile = u.profile
                except Exception:
                    from core.models import Profile
                    Profile.objects.create(user=u, nickname=row.get('nickname') or row.get('name'))
        self.stdout.write(self.style.SUCCESS(f'Imported {created} users'))
