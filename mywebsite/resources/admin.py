from django.contrib import admin
from .models import MaterialCategory, MaterialItem, Attachment

class MaterialItemInline(admin.TabularInline):
    model = MaterialItem
    extra = 1

@admin.register(MaterialCategory)
class MaterialCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    ordering = ['name']  

class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1

@admin.register(MaterialItem)
class MaterialItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'description']
    list_filter = ['category']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [AttachmentInline]

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'material', 'file_type', 'file_size', 'preview_available', 'download_count']  
    list_filter = ['file_type', 'preview_available', 'material__category']  
    search_fields = ['title', 'description', 'original_filename']
    readonly_fields = ['file_size', 'preview_available', 'download_count', 'uploaded_at', 'last_accessed']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('material')
