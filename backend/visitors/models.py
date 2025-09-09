from django.db import models


class Visitor(models.Model):
    DOC_TYPES = [
        ("CC", "Cédula de Ciudadanía"),
        ("TI", "Tarjeta de Identidad"),
        ("PASAPORTE", "Pasaporte"),
        ("PPT", "PPT"),
    ]

    VISITOR_TYPES = [
        ("PROVEEDOR", "Proveedor"),
        ("VISITANTE", "Visitante"),
    ]

    full_name = models.CharField(max_length=150)
    document_type = models.CharField(max_length=15, choices=DOC_TYPES)
    document_number = models.CharField(max_length=50)
    apartment = models.CharField(max_length=20)
    visitor_type = models.CharField(max_length=15, choices=VISITOR_TYPES)
    always_allowed = models.BooleanField(default=False)
    photo = models.ImageField(upload_to="visitors/photos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["document_type", "document_number"],
                name="unique_document",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} - {self.document_type} {self.document_number}"
