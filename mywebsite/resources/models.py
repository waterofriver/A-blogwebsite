from django.db import models
import os
from django.utils.text import slugify

class MaterialCategory(models.Model):
    name = models.CharField(max_length=100, default="未命名分类")
    slug = models.SlugField(unique=True, blank=True)  # 允许初始为空，save时会自动填充
    description = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        # 自动生成slug
        if not self.slug:
            self.slug = slugify(self.name)
            
            # 确保slug唯一
            original_slug = self.slug
            counter = 1
            while MaterialCategory.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
                
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "材料分类"
        verbose_name_plural = "材料分类"

class MaterialItem(models.Model):
    title = models.CharField(max_length=200, default="未命名项目")
    slug = models.SlugField(unique=True, blank=True)  # 允许初始为空，save时会自动填充
    category = models.ForeignKey(MaterialCategory, on_delete=models.CASCADE, related_name='items', null=True, blank=True)  # 允许为空
    description = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        # 自动生成slug
        if not self.slug:
            self.slug = slugify(self.title)
            
            # 确保slug唯一
            original_slug = self.slug
            counter = 1
            while MaterialItem.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
                
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "实验项目"
        verbose_name_plural = "实验项目"

class Attachment(models.Model):
    FILE_TYPES = (
        ('pdf', 'PDF文档'),
        ('ppt', 'PowerPoint'),
        ('doc', 'Word文档'),
        ('img', '图片'),
        ('vid', '视频'),
        ('code', '代码'),
        ('other', '其他'),
    )
    
    material = models.ForeignKey(MaterialItem, on_delete=models.CASCADE, related_name='attachments', null=True, blank=True)
    title = models.CharField(max_length=200, default="未命名附件")  # 添加默认值
    file = models.FileField(upload_to='materials/', null=True, blank=True)  # 允许为空
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, default='other')
    original_filename = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    preview_available = models.BooleanField(default=False)
    download_count = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # 设置原始文件名
        if not self.original_filename and self.file:
            self.original_filename = os.path.basename(self.file.name)
    
        # 如果没有标题，使用文件名作为标题
        if not self.title and self.file:
            filename = os.path.basename(self.file.name)
            name, _ = os.path.splitext(filename)
            self.title = name
    
        # 计算文件大小
        if self.file and hasattr(self.file, 'size'):
            self.file_size = self.file.size
    
        # 处理文件类型和预览设置
        if self.file and self.file.name:  # 确保文件存在
            extension = os.path.splitext(self.file.name)[1].lower()
        
            # 确定文件类型
            if not self.file_type or self.file_type == 'other':
                if extension == '.pdf':
                    self.file_type = 'pdf'
                elif extension in ['.ppt', '.pptx']:
                    self.file_type = 'ppt'
                elif extension in ['.doc', '.docx']:
                    self.file_type = 'doc'
                elif extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
                    self.file_type = 'img'
                elif extension in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv']:
                    self.file_type = 'vid'
                elif extension in ['.py', '.js', '.java', '.c', '.cpp', '.html', '.css']:
                    self.file_type = 'code'
                else:
                    self.file_type = 'other'
        
            # 设置预览可用性
            self.preview_available = extension in [
                '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',  # PDF和图片
                '.mp4', '.avi', '.mov', '.wmv',  # 视频
                '.doc', '.docx', '.ppt', '.pptx',  # Office文档
                '.txt'  # 文本
            ]
    
        super().save(*args, **kwargs)

    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "附件"
        verbose_name_plural = "附件"      