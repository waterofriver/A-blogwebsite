from __future__ import annotations

import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from resources.views import _scan_material_entries, _write_material_entries


class Command(BaseCommand):
    help = "Scan upload/materials and rebuild data/materials.json (use --dry-run to preview)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview the generated entries without writing materials.json",
        )

    def handle(self, *args, **options):
        try:
            entries = _scan_material_entries()
        except FileNotFoundError as exc:
            raise SystemExit(self.style.ERROR(str(exc)))

        if options.get("dry_run"):
            self.stdout.write(json.dumps(entries[:10], ensure_ascii=False, indent=2))
            self.stdout.write(self.style.WARNING(f"[dry-run] total entries: {len(entries)}"))
            return

        target = _write_material_entries(entries)
        self.stdout.write(self.style.SUCCESS(f"Wrote {len(entries)} entries to {target}"))

        media_root = Path(settings.MEDIA_ROOT)
        self.stdout.write(f"Scanned directory: {media_root / 'materials'}")
