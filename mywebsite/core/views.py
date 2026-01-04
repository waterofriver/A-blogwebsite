from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.contrib import messages
from django.db.models import Q
import os
import json

from .models import User, Blog, Comment, Like


def admin_required(view_func):
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated or not getattr(request.user, 'is_admin', False):
            messages.error(request, '您没有权限访问此页面')
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return _wrapped


def root_admin_required(view_func):
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated or not getattr(request.user, 'is_root_admin', False):
            messages.error(request, '您没有权限执行此操作')
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return _wrapped


def test(request):
    return HttpResponse('测试成功！')



@csrf_exempt
def api_login(request):
    """API login: accepts POST (form or JSON) with username & password. Sets session cookie on success."""
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)
    # support JSON or form
    username = request.POST.get('username')
    password = request.POST.get('password')
    if not username:
        try:
            data = json.loads(request.body.decode('utf-8') or '{}')
            username = data.get('username')
            password = data.get('password')
        except Exception:
            pass

    # allow login with email as well
    user = None
    if username and '@' in username:
        # treat as email
        try:
            u = User.objects.filter(email=username).first()
            if u:
                user = authenticate(request, username=u.username, password=password)
        except Exception:
            user = None
    if user is None:
        user = authenticate(request, username=username, password=password)
    if user:
        auth_login(request, user)
        return JsonResponse({'success': True, 'id': user.id, 'username': user.username})
    return JsonResponse({'success': False, 'detail': 'invalid credentials'}, status=400)


@csrf_exempt
def api_logout(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)
    auth_logout(request)
    return JsonResponse({'success': True})


@csrf_exempt
def api_register(request):
    """API register: accepts POST (form or JSON) with username,email,password,nickname(optional)."""
    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)
    username = request.POST.get('username')
    email = request.POST.get('email')
    password = request.POST.get('password')
    nickname = request.POST.get('nickname')
    if not username:
        try:
            data = json.loads(request.body.decode('utf-8') or '{}')
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            nickname = data.get('nickname')
        except Exception:
            pass

    if not username or not password:
        return JsonResponse({'success': False, 'detail': 'username and password required'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'success': False, 'detail': 'username exists'}, status=400)
    if email and User.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'detail': 'email exists'}, status=400)

    user = User(username=username, email=email or '')
    user.set_password(password)
    if nickname:
        user.nickname = nickname
        user.has_set_nickname = True
    user.save()
    # ensure profile exists
    try:
        if getattr(user, 'profile', None) is None:
            from .models import Profile
            Profile.objects.get_or_create(user=user, defaults={'nickname': nickname or ''})
    except Exception:
        pass

    # auto-login
    auth_login(request, user)
    return JsonResponse({'success': True, 'id': user.id, 'username': user.username, 'has_set_nickname': bool(getattr(user, 'has_set_nickname', False))})


@login_required
def home(request):
    show_only_mine = request.GET.get('mine', 'false').lower() == 'true'
    qs = Blog.objects
    if not getattr(request.user, 'is_admin', False):
        qs = qs.filter(is_approved=True)

    if show_only_mine:
        blogs = qs.filter(author=request.user).order_by('-is_pinned', '-created_at')
    else:
        blogs = qs.filter(is_public=True).order_by('-is_pinned', '-created_at')

    return render(request, 'home.html', {'blogs': blogs, 'show_only_mine': show_only_mine})


@login_required
def search(request):
    query = request.GET.get('query', '')
    sort_by = request.GET.get('sort', 'created')

    qs = Blog.objects.all()
    if query:
        qs = qs.filter(Q(title__icontains=query) | Q(author__username__icontains=query) | Q(author__nickname__icontains=query))

    if not getattr(request.user, 'is_admin', False):
        qs = qs.filter(is_approved=True, is_public=True)

    if sort_by == 'likes':
        qs = qs.order_by('-likes_count')
    elif sort_by == 'views':
        qs = qs.order_by('-views_count')
    else:
        qs = qs.order_by('-created_at')

    return render(request, 'search.html', {'blogs': qs, 'query': query, 'sort_by': sort_by})


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            auth_login(request, user)
            if not user.has_set_nickname:
                messages.info(request, '请先设置昵称再继续。')
                return redirect('set_nickname')
            messages.success(request, '登录成功！')
            return redirect('home')
        else:
            messages.error(request, '登录失败。请检查用户名和密码是否正确。')
            request.session['username'] = username
    return render(request, 'login.html')


@login_required
def logout_view(request):
    auth_logout(request)
    return redirect('login')


def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        security_question = request.POST.get('security_question')
        security_answer = request.POST.get('security_answer')

        if password != confirm_password:
            messages.error(request, '两次输入的密码不一致。请重新输入。')
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request, '用户名已存在。请选择其他用户名。')
            return redirect('register')

        if User.objects.filter(email=email).exists():
            messages.error(request, '该邮箱已被注册。请使用其他邮箱地址。')
            return redirect('register')

        is_first_user = User.objects.count() == 0
        user = User(username=username, email=email, security_question=security_question, has_set_nickname=False, is_admin=is_first_user, is_root_admin=is_first_user)
        user.set_password(password)
        # store security answer using Django's password hasher
        from django.contrib.auth.hashers import make_password
        user.security_answer_hash = make_password(security_answer)
        user.save()

        messages.success(request, '账户注册成功！您现在可以登录了。')
        return redirect('login')
    return render(request, 'register.html')


def forgot_password(request):
    if request.method == 'POST':
        security_answer = request.POST.get('security_answer')
        new_password = request.POST.get('new_password')
        username = request.session.get('username')

        if not username:
            messages.error(request, '请尝试登录再尝试重置密码')
            return redirect('login')

        user = User.objects.filter(username=username).first()
        from django.contrib.auth.hashers import check_password
        if user and check_password(security_answer, user.security_answer_hash):
            user.set_password(new_password)
            user.save()
            messages.success(request, '密码重置成功！')
            return redirect('login')
        else:
            messages.error(request, '输入的凭证无效。请检查您的输入。')

    username = request.session.get('username')
    if not username:
        messages.error(request, '请先尝试登录再尝试重置密码')
        return redirect('login')

    user = User.objects.filter(username=username).first()
    security_question = user.security_question if user else None
    return render(request, 'forgot_password.html', {'security_question': security_question})


@login_required
def set_nickname(request):
    if request.method == 'POST':
        nickname = request.POST.get('nickname')
        if not nickname:
            messages.error(request, '昵称不能为空。')
            return redirect('set_nickname')
        request.user.nickname = nickname
        request.user.has_set_nickname = True
        request.user.save()
        messages.success(request, '昵称设置成功！')
        return redirect('home')
    return render(request, 'set_nickname.html')


@login_required
def blog_detail(request, blog_id):
    blog = get_object_or_404(Blog, pk=blog_id)
    is_author = request.user.id == blog.author_id

    if not (is_author or getattr(request.user, 'is_admin', False)):
        blog.views_count += 1
        blog.save()

    if request.method == 'POST':
        if 'comment_id' in request.POST:
            comment = get_object_or_404(Comment, pk=request.POST.get('comment_id'))
            if comment.author_id == request.user.id or getattr(request.user, 'is_admin', False):
                comment.delete()
                messages.success(request, '评论删除成功！')
            else:
                messages.error(request, '您没有权限删除此评论')
            return redirect('blog_detail', blog_id=blog_id)

        if 'edit_blog' in request.POST and (is_author or getattr(request.user, 'is_admin', False)):
            blog.title = request.POST.get('title')
            blog.content = request.POST.get('content')
            blog.save()
            messages.success(request, '博客更新成功！')
            return redirect('blog_detail', blog_id=blog_id)

        if 'delete_blog' in request.POST and (is_author or getattr(request.user, 'is_admin', False)):
            blog.delete()
            messages.success(request, '博客删除成功！')
            return redirect('home')

        if 'comment_content' in request.POST:
            content = request.POST.get('comment_content')
            Comment.objects.create(content=content, author=request.user, blog=blog)
            messages.success(request, '评论添加成功！')
            return redirect('blog_detail', blog_id=blog_id)

    return render(request, 'blog_detail.html', {'blog': blog, 'is_author': is_author})


@login_required
def create_blog(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        is_public = 'is_public' in request.POST

        new_blog = Blog.objects.create(title=title, content=content, author=request.user, is_public=is_public, is_approved=getattr(request.user, 'is_admin', False))
        messages.success(request, '博客创建成功！' + ('等待管理员审核。' if not request.user.is_admin else ''))
        return redirect('home')

    return render(request, 'create_blog.html')


@login_required
def user_profile(request):
    if request.method == 'POST':
        if 'old_password' in request.POST:
            old_password = request.POST.get('old_password')
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')

            if not request.user.check_password(old_password):
                messages.error(request, '旧密码不正确。')
                return redirect('user_profile')

            if new_password != confirm_password:
                messages.error(request, '新密码不一致。')
                return redirect('user_profile')

            request.user.set_password(new_password)
            request.user.save()
            messages.success(request, '密码更新成功！')

        if 'new_security_question' in request.POST:
            password_for_security = request.POST.get('password_for_security')
            new_security_question = request.POST.get('new_security_question')
            new_security_answer = request.POST.get('new_security_answer')

            if not request.user.check_password(password_for_security):
                messages.error(request, '密码不正确。安全问题和答案未更新。')
                return redirect('user_profile')

            if new_security_question and new_security_answer:
                request.user.security_question = new_security_question
                from django.contrib.auth.hashers import make_password
                request.user.security_answer_hash = make_password(new_security_answer)
                request.user.save()
                messages.success(request, '安全问题和答案更新成功！')

        return redirect('user_profile')

    blogs = Blog.objects.filter(author=request.user)
    return render(request, 'user_profile.html', {'blogs': blogs})


@login_required
@require_POST
def clear_flash_messages(request):
    try:
        # 消息框架中缓存的消息通常在模板中消费，这里简单地清空 session 中的消息容器（实现依赖于后端）
        if '_messages' in request.session:
            del request.session['_messages']
    except Exception:
        pass
    return HttpResponse(status=204)


@login_required
@require_POST
def upload_avatar(request):
    if 'avatar' not in request.FILES:
        messages.error(request, '未上传文件')
        return redirect('user_profile')

    file = request.FILES['avatar']
    filename = file.name
    ext = filename.split('.')[-1].lower()
    if ext not in ('png', 'jpg', 'jpeg', 'gif'):
        messages.error(request, '文件类型无效，请上传图片文件（png, jpg, jpeg, gif）')
        return redirect('user_profile')

    fs = FileSystemStorage(location=str(settings.MEDIA_ROOT / 'avatars'))
    unique_name = f"{os.urandom(8).hex()}_{filename}"
    saved_name = fs.save(unique_name, file)
    request.user.avatar_path = f'avatars/{saved_name}'
    request.user.save()
    messages.success(request, '头像上传成功！')
    return redirect('user_profile')


def get_avatar(request, filename):
    # In DEBUG, Django can serve media files; prefer using MEDIA_URL in templates.
    from django.views.static import serve
    return serve(request, filename, document_root=str(settings.MEDIA_ROOT))


@require_GET
def community_posts_api(request):
    """Return a JSON list of recent community posts for the front-end demo."""
    posts = Blog.objects.select_related('author').order_by('-created_at')[:20]
    results = []
    for p in posts:
        author = getattr(p, 'author', None)
        author_name = None
        if author:
            author_name = author.nickname if getattr(author, 'nickname', None) else getattr(author, 'username', None)

        image_url = None
        # try to use blog image or author's avatar_path as fallback
        if hasattr(p, 'image') and getattr(p, 'image'):
            try:
                image_url = request.build_absolute_uri(p.image.url)
            except Exception:
                image_url = None
        elif author and getattr(author, 'avatar_path', None):
            image_url = request.build_absolute_uri(settings.MEDIA_URL + author.avatar_path)

        results.append({
            'id': p.pk,
            'title': p.title or '',
            'excerpt': (p.content[:200] + '...') if getattr(p, 'content', None) else '',
            'author': author_name,
            'created_at': p.created_at.isoformat() if getattr(p, 'created_at', None) else None,
            'image': image_url,
            'url': request.build_absolute_uri(f"/blog/{p.pk}/"),
        })

    return JsonResponse({'results': results})


@require_GET
def users_list_api(request):
    from django.contrib.auth import get_user_model
    UserModel = get_user_model()
    qs = UserModel.objects.all().select_related('profile')
    data = []
    for u in qs:
        avatar = None
        try:
            if getattr(u, 'profile', None) and u.profile.avatar:
                avatar = request.build_absolute_uri(u.profile.avatar.url)
        except Exception:
            avatar = None
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'nickname': getattr(u, 'nickname', None) or (getattr(u, 'profile', None) and getattr(u.profile, 'nickname', None)),
            'avatar': avatar,
        })
    return JsonResponse({'results': data})


@require_GET
def user_detail_api(request, pk: int):
    from django.contrib.auth import get_user_model
    UserModel = get_user_model()
    u = get_object_or_404(UserModel.objects.select_related('profile'), pk=pk)
    avatar = None
    try:
        if getattr(u, 'profile', None) and u.profile.avatar:
            avatar = request.build_absolute_uri(u.profile.avatar.url)
    except Exception:
        avatar = None
    return JsonResponse({
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'nickname': getattr(u, 'nickname', None) or (getattr(u, 'profile', None) and getattr(u.profile, 'nickname', None)),
        'bio': getattr(u, 'profile', None) and getattr(u.profile, 'bio', None),
        'avatar': avatar,
    })


@require_GET
def user_me_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'unauthenticated'}, status=401)
    u = request.user
    avatar = None
    try:
        if getattr(u, 'profile', None) and u.profile.avatar:
            avatar = request.build_absolute_uri(u.profile.avatar.url)
    except Exception:
        avatar = None
    return JsonResponse({
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'nickname': getattr(u, 'nickname', None) or (getattr(u, 'profile', None) and getattr(u.profile, 'nickname', None)),
        'bio': getattr(u, 'profile', None) and getattr(u.profile, 'bio', None),
        'avatar': avatar,
    })


@csrf_exempt
def user_update_api(request):
    """Update current user's profile. Accepts POST with fields: nickname, bio and optional file 'avatar'.

    NOTE: return JSON 401 when unauthenticated (avoid redirecting to HTML login page),
    so front-end can parse the response correctly.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'unauthenticated'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'detail': 'method not allowed'}, status=405)

    user = request.user
    nickname = request.POST.get('nickname')
    bio = request.POST.get('bio')

    if nickname is not None:
        user.nickname = nickname
        user.has_set_nickname = True

    # save avatar file if provided
    if 'avatar' in request.FILES:
        f = request.FILES['avatar']
        # reuse existing upload handling
        from django.core.files.storage import default_storage
        path = default_storage.save(f'avatars/{os.urandom(6).hex()}_{f.name}', f)
        # if using Profile model with ImageField
        try:
            profile = user.profile
        except Exception:
            profile = None
        if profile is not None:
            profile.avatar.name = path
            profile.save()
        else:
            # fallback: set avatar_path on user if field exists
            if hasattr(user, 'avatar_path'):
                user.avatar_path = path

    # update bio
    if bio is not None:
        try:
            profile = user.profile
        except Exception:
            profile = None
        if profile is not None:
            profile.bio = bio
            profile.save()

    user.save()

    # return updated representation
    avatar_url = None
    try:
        if getattr(user, 'profile', None) and user.profile.avatar:
            avatar_url = request.build_absolute_uri(user.profile.avatar.url)
    except Exception:
        avatar_url = None

    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'nickname': user.nickname,
        'bio': getattr(user.profile, 'bio', None) if getattr(user, 'profile', None) else None,
        'avatar': avatar_url,
    })


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_blogs(request):
    """List blogs or create new one. Uses session auth (withCredentials)."""
    if request.method == 'GET':
        qs = Blog.objects.select_related('author').filter(is_public=True, is_approved=True).order_by('-created_at')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        items = []
        for p in qs[start:end]:
            author = getattr(p, 'author', None)
            author_name = author.nickname if getattr(author, 'nickname', None) else getattr(author, 'username', None)
            items.append({
                'id': p.pk,
                'title': p.title,
                'content': p.content,
                'created_at': p.created_at.isoformat() if getattr(p, 'created_at', None) else None,
                'updated_at': p.updated_at.isoformat() if getattr(p, 'updated_at', None) else None,
                'author': author_name,
                'author_id': getattr(author, 'id', None),
                'likes_count': p.likes_count,
                'views_count': p.views_count,
                'is_pinned': p.is_pinned,
                'is_featured': p.is_featured,
            })
        return JsonResponse({
            'results': items,
            'page': page,
            'page_size': page_size,
            'total': qs.count(),
        })

    # POST create
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'unauthenticated'}, status=401)
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}
    title = payload.get('title') or request.POST.get('title')
    content = payload.get('content') or request.POST.get('content')
    if not title or not content:
        return JsonResponse({'detail': 'title and content required'}, status=400)
    blog = Blog.objects.create(author=request.user, title=title, content=content)
    return JsonResponse({
        'id': blog.id,
        'title': blog.title,
        'content': blog.content,
        'created_at': blog.created_at.isoformat() if getattr(blog, 'created_at', None) else None,
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_blog_detail(request, blog_id: int):
    blog = get_object_or_404(Blog.objects.select_related('author'), pk=blog_id)
    author = getattr(blog, 'author', None)
    author_name = author.nickname if getattr(author, 'nickname', None) else getattr(author, 'username', None)
    data = {
        'id': blog.pk,
        'title': blog.title,
        'content': blog.content,
        'created_at': blog.created_at.isoformat() if getattr(blog, 'created_at', None) else None,
        'updated_at': blog.updated_at.isoformat() if getattr(blog, 'updated_at', None) else None,
        'author': author_name,
        'author_id': getattr(author, 'id', None),
        'likes_count': blog.likes_count,
        'views_count': blog.views_count,
        'is_pinned': blog.is_pinned,
        'is_featured': blog.is_featured,
        'comments': [],
        'liked': False,
    }
    if request.user.is_authenticated:
        data['liked'] = Like.objects.filter(user=request.user, blog=blog).exists()
    for c in blog.comments.select_related('author').order_by('-created_at'):
        data['comments'].append({
            'id': c.id,
            'content': c.content,
            'created_at': c.created_at.isoformat() if getattr(c, 'created_at', None) else None,
            'author': c.author.nickname if getattr(c.author, 'nickname', None) else c.author.username,
            'author_id': c.author.id,
        })
    return JsonResponse(data)


@csrf_exempt
@require_POST
def api_blog_comments(request, blog_id: int):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'unauthenticated'}, status=401)
    blog = get_object_or_404(Blog, pk=blog_id)
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}
    content = payload.get('content') or request.POST.get('content')
    if not content:
        return JsonResponse({'detail': 'content required'}, status=400)
    c = Comment.objects.create(blog=blog, author=request.user, content=content)
    return JsonResponse({
        'id': c.id,
        'content': c.content,
        'created_at': c.created_at.isoformat() if getattr(c, 'created_at', None) else None,
        'author': c.author.nickname if getattr(c.author, 'nickname', None) else c.author.username,
        'author_id': c.author.id,
    })


@csrf_exempt
@require_POST
def api_blog_view(request, blog_id: int):
    blog = get_object_or_404(Blog, pk=blog_id)
    blog.views_count = (blog.views_count or 0) + 1
    blog.save(update_fields=['views_count'])
    return JsonResponse({'views_count': blog.views_count})


@csrf_exempt
@require_POST
def update_nickname(request):
    # Return JSON 401 if unauthenticated to avoid HTML redirects
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'unauthenticated'}, status=401)
    import json
    data = json.loads(request.body.decode('utf-8')) if request.body else {}
    new_nickname = data.get('nickname')

    if not new_nickname:
        return JsonResponse({'success': False, 'message': '昵称不能为空'})

    if len(new_nickname) < 1 or len(new_nickname) > 20:
        return JsonResponse({'success': False, 'message': '昵称长度必须在1到20个字符之间'})

    if not new_nickname.replace(' ', '').isalnum():
        return JsonResponse({'success': False, 'message': '昵称只能包含字母、数字和空格'})

    request.user.nickname = new_nickname
    request.user.has_set_nickname = True
    request.user.save()
    return JsonResponse({'success': True, 'message': '昵称修改成功'})


@csrf_exempt
@require_POST
def like_blog(request, blog_id):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'unauthenticated'}, status=401)
    blog = get_object_or_404(Blog, pk=blog_id)
    existing = Like.objects.filter(user=request.user, blog=blog).first()
    if existing:
        existing.delete()
        blog.likes_count = max(0, blog.likes_count - 1)
        blog.save()
        return JsonResponse({'success': True, 'liked': False, 'likes_count': blog.likes_count})
    else:
        Like.objects.create(user=request.user, blog=blog)
        blog.likes_count += 1
        blog.save()
        return JsonResponse({'success': True, 'liked': True, 'likes_count': blog.likes_count})


@admin_required
def admin_dashboard(request):
    page = int(request.GET.get('page', 1))
    per_page = 10

    pending_blogs = Blog.objects.filter(is_approved=False)
    users = User.objects.all()
    all_blogs = Blog.objects.all()

    # 简化分页：前端可接收 QuerySet
    return render(request, 'admin/dashboard.html', {'pending_blogs': pending_blogs, 'users': users, 'all_blogs': all_blogs})


@admin_required
@require_POST
def admin_blog_action(request, blog_id, action):
    blog = get_object_or_404(Blog, pk=blog_id)

    if action == 'approve':
        blog.is_approved = True
        messages.success(request, '帖子已通过审核')
    elif action == 'reject':
        blog.is_approved = False
        messages.success(request, '帖子已拒绝')
    elif action == 'pin':
        blog.is_pinned = not blog.is_pinned
        messages.success(request, f"帖子已{'置顶' if blog.is_pinned else '取消置顶'}")
    elif action == 'feature':
        blog.is_featured = not blog.is_featured
        messages.success(request, f"帖子已{'加精' if blog.is_featured else '取消加精'}")
    elif action == 'delete':
        blog.delete()
        messages.success(request, '帖子已删除')

    blog.save()
    return redirect('admin_dashboard')


@root_admin_required
@require_POST
def make_admin(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    if user.id == request.user.id:
        messages.error(request, '不能修改自己的权限')
        return redirect('admin_dashboard')
    user.is_admin = True
    user.save()
    messages.success(request, f'已将 {user.username} 设置为管理员')
    return redirect('admin_dashboard')


@root_admin_required
@require_POST
def remove_admin(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    if user.id == request.user.id:
        messages.error(request, '不能修改自己的权限')
        return redirect('admin_dashboard')
    user.is_admin = False
    user.is_root_admin = False
    user.save()
    messages.success(request, f'已将 {user.username} 移除管理员权限')
    return redirect('admin_dashboard')


@root_admin_required
@require_POST
def transfer_root(request, user_id):
    new_root = get_object_or_404(User, pk=user_id)
    if new_root.id == request.user.id:
        messages.error(request, '不能将根权限移交给自己')
        return redirect('admin_dashboard')

    request.user.is_root_admin = False
    request.user.save()
    new_root.is_admin = True
    new_root.is_root_admin = True
    new_root.save()
    messages.success(request, f'已将根管理员权限移交给 {new_root.username}')
    return redirect('admin_dashboard')
from django.shortcuts import render

# Create your views here.
