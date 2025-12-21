from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask_bcrypt import Bcrypt
from datetime import datetime


db = SQLAlchemy()
bcrypt = Bcrypt()  # 创建 Bcrypt 实例

class User(db.Model, UserMixin):
    __tablename__ = 'users'  # 表名为 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)  # 字段长度为 50
    password_hash = db.Column(db.String(64), nullable=False)  # 字段名为 password_hash
    email = db.Column(db.String(100), unique=True, nullable=True)  # 添加 email 字段
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 添加 created_at 字段
    security_question = db.Column(db.String(200), nullable=False)  # 密保问题
    security_answer_hash = db.Column(db.String(64), nullable=False)  # 密保答案的哈希值
    nickname = db.Column(db.String(50), nullable=True)  # 添加昵称字段
    has_set_nickname = db.Column(db.Boolean, default=False)  # 添加标志字段
    avatar_path = db.Column(db.String(255), nullable=False, default='default-avatar.jpg')  # 头像路径字段，默认值为默认头像
    is_admin = db.Column(db.Boolean, default=False)  # 普通管理员权限
    is_root_admin = db.Column(db.Boolean, default=False)  # 最高级管理员权限
    
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
    __tablename__ = 'blogs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 添加更新时间字段
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # 外键关联用户
    is_public = db.Column(db.Boolean, default=True)  # 添加是否公开的字段
    likes_count = db.Column(db.Integer, default=0)  # 点赞数
    views_count = db.Column(db.Integer, default=0)  # 浏览量
    is_approved = db.Column(db.Boolean, default=True)  # 是否审核通过
    is_pinned = db.Column(db.Boolean, default=False)  # 是否置顶
    is_featured = db.Column(db.Boolean, default=False)  # 是否加精
    
    # 关系
    comments = db.relationship('Comment', backref='blog', lazy=True, cascade="all, delete-orphan")
    likes = db.relationship('Like', backref='blog', lazy=True, cascade="all, delete-orphan")

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # 外键关联用户
    blog_id = db.Column(db.Integer, db.ForeignKey('blogs.id'), nullable=False)  # 外键关联博客

# 新增点赞模型
class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blogs.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 确保一个用户只能给一个帖子点赞一次
    __table_args__ = (db.UniqueConstraint('user_id', 'blog_id', name='unique_user_blog_like'),)