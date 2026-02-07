from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	"""扩展自 Django 的 AbstractUser，以便保留原 Flask 模型中的自定义字段。
	请在 settings.py 中设置 `AUTH_USER_MODEL = 'core.User'`。
	"""
	security_question = models.CharField(max_length=200, blank=False)
	security_answer_hash = models.CharField(max_length=128, blank=False)
	nickname = models.CharField(max_length=50, null=True, blank=True)
	has_set_nickname = models.BooleanField(default=False)
	avatar_path = models.CharField(max_length=255, default='default-avatar.jpg')
	created_at = models.DateTimeField(auto_now_add=True)
	is_admin = models.BooleanField(default=False)
	is_root_admin = models.BooleanField(default=False)

	def __str__(self):
		return self.username


class Blog(models.Model):
	author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blogs')
	title = models.CharField(max_length=100)
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	is_public = models.BooleanField(default=True)
	likes_count = models.IntegerField(default=0)
	views_count = models.IntegerField(default=0)
	is_approved = models.BooleanField(default=True)
	is_pinned = models.BooleanField(default=False)
	is_featured = models.BooleanField(default=False)

	def __str__(self):
		return self.title


class Comment(models.Model):
	blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
	author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Comment {self.pk} on {self.blog_id}"


class Like(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
	blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='likes')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = (('user', 'blog'),)

	def __str__(self):
		return f"Like {self.pk}: user={self.user_id} blog={self.blog_id}"
