from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test, name='test'),
    path('', views.home, name='home'),
    path('search/', views.search, name='search'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    path('forgot_password/', views.forgot_password, name='forgot_password'),
    path('set_nickname/', views.set_nickname, name='set_nickname'),
    path('blog/<int:blog_id>/', views.blog_detail, name='blog_detail'),
    path('create_blog/', views.create_blog, name='create_blog'),
    path('profile/', views.user_profile, name='user_profile'),
    path('clear_flash_messages/', views.clear_flash_messages, name='clear_flash_messages'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('avatars/<path:filename>/', views.get_avatar, name='get_avatar'),
    path('update_nickname/', views.update_nickname, name='update_nickname'),
    path('blog/<int:blog_id>/like/', views.like_blog, name='like_blog'),
    # API for front-end demo
    path('api/community/posts/', views.community_posts_api, name='api_community_posts'),
    path('api/users/', views.users_list_api, name='api_users_list'),
    path('api/users/me/', views.user_me_api, name='api_users_me'),
    path('api/users/<int:pk>/', views.user_detail_api, name='api_users_detail'),
    path('api/users/me/update/', views.user_update_api, name='api_users_update'),
    # auth API for front-end
    path('api/auth/login/', views.api_login, name='api_auth_login'),
    path('api/auth/logout/', views.api_logout, name='api_auth_logout'),
    path('api/auth/register/', views.api_register, name='api_auth_register'),

    # admin actions
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/blog/<int:blog_id>/<str:action>/', views.admin_blog_action, name='admin_blog_action'),
    path('admin/user/<int:user_id>/make_admin/', views.make_admin, name='make_admin'),
    path('admin/user/<int:user_id>/remove_admin/', views.remove_admin, name='remove_admin'),
    path('admin/transfer_root/<int:user_id>/', views.transfer_root, name='transfer_root'),
]
