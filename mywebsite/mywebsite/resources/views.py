from django.shortcuts import render, get_object_or_404
from django.http import FileResponse, Http404, HttpResponse
from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import MaterialCategory, MaterialItem, Attachment
from .serializers import (
    MaterialCategorySerializer, MaterialCategoryListSerializer,
    MaterialItemSerializer, MaterialItemListSerializer, 
    AttachmentSerializer
)
import os
import mimetypes

class MaterialCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaterialCategory.objects.all().prefetch_related(
        'items__attachments'  
    )
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MaterialCategoryListSerializer
        return MaterialCategorySerializer
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """获取课程概览统计信息"""
        categories = MaterialCategory.objects.all()
        total_items = MaterialItem.objects.count()
        total_attachments = Attachment.objects.count()
        
        return Response({
            'categories_count': categories.count(),
            'items_count': total_items,
            'attachments_count': total_attachments,
            'categories': MaterialCategoryListSerializer(
                categories, many=True, context={'request': request}
            ).data
        })

class MaterialItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaterialItem.objects.select_related('category').prefetch_related(
        'attachments'  
    )
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug']
    search_fields = ['title', 'description']
    ordering_fields = ['title']
    ordering = ['title']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MaterialItemListSerializer
        return MaterialItemSerializer
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, slug=None):
        """获取特定项目的所有附件"""
        item = self.get_object()
        attachments = item.attachments.all()  
        serializer = AttachmentSerializer(
            attachments, many=True, context={'request': request}
        )
        return Response(serializer.data)

class AttachmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Attachment.objects.select_related('material__category')
    serializer_class = AttachmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['file_type', 'material__category__slug']
    search_fields = ['title', 'original_filename', 'description']
    ordering_fields = ['title', 'uploaded_at', 'download_count']
    ordering = ['-uploaded_at']
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """下载文件"""
        attachment = self.get_object()
        
        # 更新下载计数和访问时间
        attachment.download_count += 1
        attachment.last_accessed = timezone.now()
        attachment.save(update_fields=['download_count', 'last_accessed'])
        
        # 检查文件是否存在
        if not attachment.file or not os.path.exists(attachment.file.path):
            return Response(
                {"error": "文件不存在"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            response = FileResponse(
                open(attachment.file.path, 'rb'),
                as_attachment=True,
                filename=attachment.original_filename
            )
            
            # 设置正确的Content-Type
            content_type, _ = mimetypes.guess_type(attachment.original_filename)
            if content_type:
                response['Content-Type'] = content_type
                
            return response
            
        except Exception as e:
            return Response(
                {"error": f"文件读取失败: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """预览文件"""
        attachment = self.get_object()
        
        if not attachment.preview_available:
            return Response(
                {"error": "此文件不支持预览"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 更新访问时间
        attachment.last_accessed = timezone.now()
        attachment.save(update_fields=['last_accessed'])
        
        # 检查文件是否存在
        if not attachment.file or not os.path.exists(attachment.file.path):
            return Response(
                {"error": "文件不存在"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # 设置正确的Content-Type用于预览
            content_type, _ = mimetypes.guess_type(attachment.original_filename)
            
            response = FileResponse(
                open(attachment.file.path, 'rb'),
                as_attachment=False  # 不作为附件，让浏览器尝试预览
            )
            
            if content_type:
                response['Content-Type'] = content_type
            
            # 对于PDF文件或其他文件类型，设置inline显示
            if content_type == 'application/pdf':
                response['Content-Disposition'] = f'inline; filename="{attachment.original_filename}"'
            
            return response
            
        except Exception as e:
            return Response(
                {"error": f"文件读取失败: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取文件统计信息"""
        attachments = self.get_queryset()
        
        # 按文件类型统计
        type_stats = {}
        for attachment in attachments:
            file_type = attachment.get_file_type_display()
            if file_type not in type_stats:
                type_stats[file_type] = {'count': 0, 'total_size': 0}
            type_stats[file_type]['count'] += 1
            type_stats[file_type]['total_size'] += attachment.file_size or 0
        
        return Response({
            'total_count': attachments.count(),
            'total_size': sum(a.file_size or 0 for a in attachments),
            'type_statistics': type_stats,
            'most_downloaded': AttachmentSerializer(
                attachments.order_by('-download_count')[:5],
                many=True,
                context={'request': request}
            ).data
        })
