from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Blog, Comment, Like


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	pass


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
	list_display = ('id', 'title', 'author', 'created_at', 'is_public')
	search_fields = ('title', 'content')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
	list_display = ('id', 'blog', 'author', 'created_at')
	search_fields = ('content',)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'blog', 'created_at')
