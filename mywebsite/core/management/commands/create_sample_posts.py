from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import User, Blog

class Command(BaseCommand):
    help = 'Create sample users and blog posts for development'

    def handle(self, *args, **options):
        # create a sample user if none exists
        if not User.objects.filter(username='sampleuser').exists():
            u = User.objects.create_user(username='sampleuser', email='sample@example.com', password='password')
            u.nickname = '示例用户'
            u.has_set_nickname = True
            u.is_admin = True
            u.save()
            self.stdout.write(self.style.SUCCESS('Created sample user `sampleuser` (password: password)'))
        else:
            u = User.objects.filter(username='sampleuser').first()
            self.stdout.write('Sample user already exists')

        # create sample posts
        samples = [
            {'title': '极简风格 Logo 设计', 'content': '这是一个关于极简风格 Logo 的示例帖子内容。', 'is_public': True, 'is_approved': True},
            {'title': '3D 角色概念', 'content': '3D 角色开发与模型参考。', 'is_public': True, 'is_approved': True},
            {'title': 'UI 仪表盘重设计', 'content': '重新设计仪表盘交互和视觉层次。', 'is_public': True, 'is_approved': True},
        ]

        created = 0
        for s in samples:
            if not Blog.objects.filter(title=s['title']).exists():
                Blog.objects.create(
                    title=s['title'],
                    content=s['content'],
                    author=u,
                    is_public=s['is_public'],
                    is_approved=s['is_approved'],
                    created_at=timezone.now()
                )
                created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created {created} sample posts'))
        else:
            self.stdout.write('Sample posts already exist')
