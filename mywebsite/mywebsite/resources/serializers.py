from rest_framework import serializers
from .models import MaterialCategory, MaterialItem, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    file_size_human = serializers.SerializerMethodField()
    
    class Meta:
        model = Attachment
        fields = ['id', 'title', 'file', 'file_url', 'file_type', 'file_type_display', 
                  'original_filename', 'file_size', 'file_size_human', 'description', 
                  'preview_available', 'download_count', 'uploaded_at', 'preview_url']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(f'/api/materials/download/{obj.id}/')
        return None
        
    def get_preview_url(self, obj):
        request = self.context.get('request')
        if request and obj.preview_available:
            return request.build_absolute_uri(f'/api/materials/preview/{obj.id}/')
        return None
    
    def get_file_size_human(self, obj):
        """可读的文件大小"""
        if not obj.file_size:
            return "未知"
    
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024**2:
            return f"{size/1024:.1f} KB"
        elif size < 1024**3:
            return f"{size/(1024**2):.1f} MB"
        else:
            return f"{size/(1024**3):.1f} GB"


class MaterialItemSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    attachments_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MaterialItem
        fields = ['id', 'title', 'slug', 'description', 'category_name', 
                  'attachments', 'attachments_count']
    
    def get_attachments_count(self, obj):
        return obj.attachments.count()  # 使用 related_name='attachments'

class MaterialCategorySerializer(serializers.ModelSerializer):
    items = MaterialItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    total_attachments = serializers.SerializerMethodField()
    
    class Meta:
        model = MaterialCategory
        fields = ['id', 'name', 'slug', 'description', 'items', 
                  'items_count', 'total_attachments']
    
    def get_items_count(self, obj):
        return obj.items.count()  # 使用 related_name='items'
    
    def get_total_attachments(self, obj):
        return sum(item.attachments.count() for item in obj.items.all())  # 使用正确的关系名

# 简化版序列化器用于列表视图
class MaterialCategoryListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    total_attachments = serializers.SerializerMethodField()
    
    class Meta:
        model = MaterialCategory
        fields = ['id', 'name', 'slug', 'description', 'items_count', 
                  'total_attachments']
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_total_attachments(self, obj):
        return sum(item.attachments.count() for item in obj.items.all())

class MaterialItemListSerializer(serializers.ModelSerializer):
    attachments_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = MaterialItem
        fields = ['id', 'title', 'slug', 'description', 'category_name', 
                  'category_slug', 'attachments_count']
    
    def get_attachments_count(self, obj):
        return obj.attachments.count()  # 使用 related_name='attachments'
