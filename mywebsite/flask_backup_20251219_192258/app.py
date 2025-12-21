import logging
import os
from flask_migrate import Migrate
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps
from flask_login import UserMixin

app = Flask(__name__)
app.config['LOGIN_MESSAGE'] = ''  # 禁用默认的登录消息
app.config['LOGIN_MESSAGE_CATEGORY'] = ''  # 禁用默认的登录消息类别
app.config['SECRET_KEY'] = os.environ.get('FORUM_SECRET_KEY', 'dev_key_change_in_production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/forum_db'
app.config['UPLOAD_FOLDER'] = 'uploads/avatars'  # 设置头像存储目录
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 限制上传文件大小为2MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # 允许的文件扩展名

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 初始化扩展
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
migrate = Migrate(app, db)  # 初始化迁移工具

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# 数据库模型
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    nickname = db.Column(db.String(50))
    avatar_path = db.Column(db.String(200), default='default-avatar.jpg')
    security_question = db.Column(db.String(200))
    security_answer_hash = db.Column(db.String(200))
    has_set_nickname = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)  # 普通管理员权限
    is_root_admin = db.Column(db.Boolean, default=False)  # 最高级管理员权限
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    blogs = db.relationship('Blog', backref='author', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='author', lazy=True, cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
        
    def set_security_answer(self, answer):
        self.security_answer_hash = bcrypt.generate_password_hash(answer).decode('utf-8')
        
    def check_security_answer(self, answer):
        return bcrypt.check_password_hash(self.security_answer_hash, answer)


class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_public = db.Column(db.Boolean, default=True)
    likes_count = db.Column(db.Integer, default=0)  # 点赞数
    views_count = db.Column(db.Integer, default=0)  # 浏览量
    is_approved = db.Column(db.Boolean, default=True)  # 是否审核通过
    is_pinned = db.Column(db.Boolean, default=False)  # 是否置顶
    is_featured = db.Column(db.Boolean, default=False)  # 是否加精
    
    # 关系
    comments = db.relationship('Comment', backref='blog', lazy=True, cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='blog', lazy=True, cascade="all, delete-orphan")


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 确保一个用户只能给一个帖子点赞一次
    __table_args__ = (db.UniqueConstraint('user_id', 'blog_id', name='unique_user_blog_like'),)


# 辅助函数：仅验证文件扩展名
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 登录管理器配置
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 自定义 unauthorized_handler
@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('login'))

# 管理员权限检查装饰器
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('您没有权限访问此页面', 'danger')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated_function

# 根管理员权限检查装饰器
def root_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_root_admin:
            flash('您没有权限执行此操作', 'danger')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated_function


# 路由
@app.route('/test')
def test():
    return "测试成功！", 200

@app.route('/')
@login_required
def home():
    show_only_mine = request.args.get('mine', 'false').lower() == 'true'
    query = Blog.query
    if not current_user.is_admin:
        query = query.filter_by(is_approved=True)
    
    if show_only_mine:
        blogs = query.filter_by(user_id=current_user.id).order_by(
            Blog.is_pinned.desc(),
            Blog.created_at.desc()
        ).all()
    else:
        blogs = query.filter_by(is_public=True).order_by(
            Blog.is_pinned.desc(),
            Blog.created_at.desc()
        ).all()
    
    return render_template('home.html', blogs=blogs, show_only_mine=show_only_mine)

@app.route('/search')
@login_required
def search():
    query = request.args.get('query', '')
    sort_by = request.args.get('sort', 'created')
    
    search_query = Blog.query
    if query:
        search_query = search_query.join(User).filter(
            db.or_(
                Blog.title.like(f'%{query}%'),
                User.username.like(f'%{query}%'),
                User.nickname.like(f'%{query}%')
            )
        )
    
    if not current_user.is_admin:
        search_query = search_query.filter_by(is_approved=True, is_public=True)
    
    if sort_by == 'likes':
        search_query = search_query.order_by(Blog.likes_count.desc())
    elif sort_by == 'views':
        search_query = search_query.order_by(Blog.views_count.desc())
    else:
        search_query = search_query.order_by(Blog.created_at.desc())
    
    blogs = search_query.all()
    return render_template('search.html', blogs=blogs, query=query, sort_by=sort_by)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            login_user(user)
            if not user.has_set_nickname:
                flash('请先设置昵称再继续。', 'info')
                return redirect(url_for('set_nickname'))
            flash('登录成功！', 'success')
            return redirect(url_for('home'))
        else:
            flash('登录失败。请检查用户名和密码是否正确。', 'danger')
            session['username'] = username
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        security_question = request.form['security_question']
        security_answer = request.form['security_answer']

        if password != confirm_password:
            flash('两次输入的密码不一致。请重新输入。', 'danger')
            return redirect(url_for('register'))
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('用户名已存在。请选择其他用户名。', 'danger')
            return redirect(url_for('register'))
        
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            flash('该邮箱已被注册。请使用其他邮箱地址。', 'danger')
            return redirect(url_for('register'))
        
        is_first_user = User.query.count() == 0
        user = User(
            username=username, 
            email=email, 
            security_question=security_question, 
            has_set_nickname=False,
            is_admin=is_first_user,
            is_root_admin=is_first_user
        )
        user.set_password(password)
        user.set_security_answer(security_answer)
        db.session.add(user)
        db.session.commit()
        
        flash('账户注册成功！您现在可以登录了。', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        security_answer = request.form['security_answer']
        new_password = request.form['new_password']
        username = session.get('username')
        
        if not username:
            flash('请尝试登录再尝试重置密码', 'danger')
            return redirect(url_for('login'))

        user = User.query.filter_by(username=username).first()
        if user and user.check_security_answer(security_answer):
            user.set_password(new_password)
            db.session.commit()
            flash('密码重置成功！', 'success')
            return redirect(url_for('login'))
        else:
            flash('输入的凭证无效。请检查您的输入。', 'danger')

    username = session.get('username')
    if not username:
        flash('请先尝试登录再尝试重置密码', 'danger')
        return redirect(url_for('login'))

    user = User.query.filter_by(username=username).first()
    security_question = user.security_question if user else None
    return render_template('forgot_password.html', security_question=security_question)


@app.route('/set_nickname', methods=['GET', 'POST'])
@login_required
def set_nickname():
    if request.method == 'POST':
        nickname = request.form['nickname']
        if not nickname:
            flash('昵称不能为空。', 'danger')
            return redirect(url_for('set_nickname'))     
        current_user.nickname = nickname
        current_user.has_set_nickname = True
        db.session.commit()
        flash('昵称设置成功！', 'success')
        return redirect(url_for('home'))
    return render_template('set_nickname.html')

@app.route('/blog/<int:blog_id>', methods=['GET', 'POST'])
@login_required
def blog_detail(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    is_author = current_user.id == blog.user_id
    
    if not (is_author or current_user.is_admin):
        blog.views_count += 1
        db.session.commit()

    if request.method == 'POST':
        comment_id = request.form.get('comment_id')
        if comment_id:
            comment = Comment.query.get_or_404(comment_id)
            if comment.user_id == current_user.id or current_user.is_admin:
                db.session.delete(comment)
                db.session.commit()
                flash('评论删除成功！', 'success')
            else:
                flash('您没有权限删除此评论', 'danger')
            return redirect(url_for('blog_detail', blog_id=blog_id))

        if 'edit_blog' in request.form and (is_author or current_user.is_admin):
            new_title = request.form['title']
            new_content = request.form['content']
            blog.title = new_title
            blog.content = new_content
            db.session.commit()
            flash('博客更新成功！', 'success')
            return redirect(url_for('blog_detail', blog_id=blog_id))

        if 'delete_blog' in request.form and (is_author or current_user.is_admin):
            db.session.delete(blog)
            db.session.commit()
            flash('博客删除成功！', 'success')
            return redirect(url_for('home'))

        if 'comment_content' in request.form:
            content = request.form['comment_content']
            comment = Comment(content=content, user_id=current_user.id, blog_id=blog_id)
            db.session.add(comment)
            db.session.commit()
            flash('评论添加成功！', 'success')
            return redirect(url_for('blog_detail', blog_id=blog_id))

    return render_template('blog_detail.html', blog=blog, is_author=is_author)

@app.route('/create_blog', methods=['GET', 'POST'])
@login_required
def create_blog():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        is_public = 'is_public' in request.form

        new_blog = Blog(
            title=title, 
            content=content, 
            user_id=current_user.id, 
            is_public=is_public,
            is_approved=current_user.is_admin
        )
        db.session.add(new_blog)
        db.session.commit()

        flash('博客创建成功！' + ('等待管理员审核。' if not current_user.is_admin else ''), 'success')
        return redirect(url_for('home'))

    return render_template('create_blog.html')

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def user_profile():
    if request.method == 'POST':
        if 'old_password' in request.form:
            old_password = request.form.get('old_password')
            new_password = request.form.get('new_password')
            confirm_password = request.form.get('confirm_password')

            if not current_user.check_password(old_password):
                flash('旧密码不正确。', 'danger')
                return redirect(url_for('user_profile'))

            if new_password != confirm_password:
                flash('新密码不一致。', 'danger')
                return redirect(url_for('user_profile'))

            current_user.set_password(new_password)
            db.session.commit()
            flash('密码更新成功！', 'success')
        
        if 'new_security_question' in request.form:
            password_for_security = request.form.get('password_for_security')
            new_security_question = request.form.get('new_security_question')
            new_security_answer = request.form.get('new_security_answer')

            if not current_user.check_password(password_for_security):
                flash('密码不正确。安全问题和答案未更新。', 'danger')
                return redirect(url_for('user_profile'))

            if new_security_question and new_security_answer:
                current_user.security_question = new_security_question
                current_user.set_security_answer(new_security_answer)
                db.session.commit()
                flash('安全问题和答案更新成功！', 'success')

        return redirect(url_for('user_profile'))

    blogs = Blog.query.filter_by(user_id=current_user.id).all()
    return render_template('user_profile.html', blogs=blogs)

@app.route('/clear_flash_messages', methods=['POST'])
@login_required
def clear_flash_messages():
    session.pop('_flashes', None)
    return '', 204

# 上传头像（仅验证扩展名）
@app.route('/upload-avatar', methods=['POST'])
@login_required
def upload_avatar():
    if 'avatar' not in request.files:
        flash('未上传文件', 'danger')
        return redirect(url_for('user_profile'))
    
    file = request.files['avatar']
    if file.filename == '':
        flash('未选择文件', 'danger')
        return redirect(url_for('user_profile'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{os.urandom(8).hex()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        current_user.avatar_path = unique_filename
        db.session.commit()
        flash('头像上传成功！', 'success')
        return redirect(url_for('user_profile'))
    else:
        flash('文件类型无效，请上传图片文件（png, jpg, jpeg, gif）', 'danger')
        return redirect(url_for('user_profile'))

@app.route('/avatars/<path:filename>')
def get_avatar(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/update_nickname', methods=['POST'])
@login_required
def update_nickname():
    new_nickname = request.json.get('nickname')

    if not new_nickname:
        return jsonify({'success': False, 'message': '昵称不能为空'})

    if len(new_nickname) < 1 or len(new_nickname) > 20:
        return jsonify({'success': False, 'message': '昵称长度必须在1到20个字符之间'})

    if not new_nickname.replace(' ', '').isalnum():
        return jsonify({'success': False, 'message': '昵称只能包含字母、数字和空格'})

    current_user.nickname = new_nickname
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': '昵称修改成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'昵称修改失败：{str(e)}'})

@app.route('/blog/<int:blog_id>/like', methods=['POST'])
@login_required
def like_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    existing_like = Like.query.filter_by(user_id=current_user.id, blog_id=blog_id).first()
    
    if existing_like:
        db.session.delete(existing_like)
        blog.likes_count -= 1
        db.session.commit()
        return jsonify({'success': True, 'liked': False, 'likes_count': blog.likes_count})
    else:
        new_like = Like(user_id=current_user.id, blog_id=blog_id)
        db.session.add(new_like)
        blog.likes_count += 1
        db.session.commit()
        return jsonify({'success': True, 'liked': True, 'likes_count': blog.likes_count})

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    pending_blogs = Blog.query.filter_by(is_approved=False).paginate(
        page=page, per_page=per_page, error_out=False
    )
    users = User.query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    all_blogs = Blog.query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('admin/dashboard.html', 
                          pending_blogs=pending_blogs,
                          users=users,
                          all_blogs=all_blogs)

@app.route('/admin/blog/<int:blog_id>/<action>', methods=['POST'])
@admin_required
def admin_blog_action(blog_id, action):
    blog = Blog.query.get_or_404(blog_id)
    
    if action == 'approve':
        blog.is_approved = True
        flash('帖子已通过审核', 'success')
    elif action == 'reject':
        blog.is_approved = False
        flash('帖子已拒绝', 'success')
    elif action == 'pin':
        blog.is_pinned = not blog.is_pinned
        flash(f'帖子已{"置顶" if blog.is_pinned else "取消置顶"}', 'success')
    elif action == 'feature':
        blog.is_featured = not blog.is_featured
        flash(f'帖子已{"加精" if blog.is_featured else "取消加精"}', 'success')
    elif action == 'delete':
        db.session.delete(blog)
        flash('帖子已删除', 'success')
    
    db.session.commit()
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/user/<int:user_id>/make_admin', methods=['POST'])
@root_admin_required
def make_admin(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        flash('不能修改自己的权限', 'danger')
        return redirect(url_for('admin_dashboard'))
        
    user.is_admin = True
    db.session.commit()
    flash(f'已将 {user.username} 设置为管理员', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/user/<int:user_id>/remove_admin', methods=['POST'])
@root_admin_required
def remove_admin(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        flash('不能修改自己的权限', 'danger')
        return redirect(url_for('admin_dashboard'))
        
    user.is_admin = False
    user.is_root_admin = False
    db.session.commit()
    flash(f'已将 {user.username} 移除管理员权限', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/transfer_root/<int:user_id>', methods=['POST'])
@root_admin_required
def transfer_root(user_id):
    new_root = User.query.get_or_404(user_id)
    if new_root.id == current_user.id:
        flash('不能将根权限移交给自己', 'danger')
        return redirect(url_for('admin_dashboard'))
    
    current_user.is_root_admin = False
    new_root.is_admin = True
    new_root.is_root_admin = True
    
    db.session.commit()
    flash(f'已将根管理员权限移交给 {new_root.username}', 'success')
    return redirect(url_for('admin_dashboard'))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', debug=True)
    