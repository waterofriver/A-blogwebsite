from __future__ import annotations

import os
import time
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

# Keep in sync with resources.views PREVIEW_CACHE_SUBDIR
PREVIEW_CACHE_SUBDIR = "materials_previews"


class Command(BaseCommand):
    help = "Clean cached Office->PDF previews older than N days (default: 30)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Delete cached previews older than this many days (default: 30)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without removing files",
        )

    def handle(self, *args, **options):
        days = options["days"]
        dry_run = options["dry_run"]
        cutoff = timezone.now() - timedelta(days=days)

        cache_root = Path(settings.MEDIA_ROOT) / PREVIEW_CACHE_SUBDIR
        if not cache_root.exists():
            self.stdout.write(self.style.SUCCESS("Cache directory not found; nothing to do."))
            return

        removed = 0
        skipped = 0
        for file_path in cache_root.rglob("*.pdf"):
            try:
                mtime = file_path.stat().st_mtime
            except OSError:
                skipped += 1
                continue
            last_touched = timezone.datetime.fromtimestamp(mtime, tz=timezone.utc)
            if last_touched < cutoff:
                removed += 1
                if dry_run:
                    self.stdout.write(f"DRY-RUN delete: {file_path}")
                else:
                    try:
                        file_path.unlink()
                    except OSError:
                        skipped += 1
            else:
                skipped += 1

        msg = f"Removed {removed} cached pdf(s); inspected {removed + skipped} file(s)."
        if dry_run:
            msg = "[dry-run] " + msg
        self.stdout.write(self.style.SUCCESS(msg))
