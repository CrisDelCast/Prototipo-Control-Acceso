from django.contrib import admin
from .models import Visitor


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "document_type",
        "document_number",
        "apartment",
        "visitor_type",
        "always_allowed",
        "created_at",
    )
    search_fields = (
        "full_name",
        "document_number",
        "apartment",
    )
    list_filter = ("document_type", "visitor_type", "always_allowed")
