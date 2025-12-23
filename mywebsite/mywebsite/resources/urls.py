from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MaterialCategoryViewSet,
    MaterialItemViewSet,
    AttachmentViewSet,
    MaterialCatalogView,
    MaterialFilePreviewView,
    MaterialFileDownloadView,
    MaterialFileHtmlPreviewView,
)
from . import views

# 创建路由器并注册ViewSets
router = DefaultRouter()
router.register(r'categories', MaterialCategoryViewSet)
router.register(r'items', MaterialItemViewSet)
router.register(r'attachments', AttachmentViewSet)

urlpatterns = [
    # API根路径
    path('', include(router.urls)),

    # 数据聚合与静态资源代理
    path('catalog/', MaterialCatalogView.as_view(), name='material-catalog'),
    path('assets/preview/', MaterialFilePreviewView.as_view(), name='material-file-preview'),
    path('assets/preview/html/', MaterialFileHtmlPreviewView.as_view(), name='material-file-html-preview'),
    path('assets/download/', MaterialFileDownloadView.as_view(), name='material-file-download'),
    
    # 直接的下载和预览URL (更简洁的路径)
    path('download/<int:pk>/', AttachmentViewSet.as_view({'get': 'download'}), name='attachment-download'),
    path('preview/<int:pk>/', AttachmentViewSet.as_view({'get': 'preview'}), name='attachment-preview'),
    
    # 添加额外的概览统计接口
    path('overview/', MaterialCategoryViewSet.as_view({'get': 'overview'}), name='course-overview'),
    path('file-stats/', AttachmentViewSet.as_view({'get': 'statistics'}), name='file-statistics'),
]
