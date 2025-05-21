# Import necessary Django admin modules
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, SoldProduct

#/* Custom User Admin Configuration
# * Extends Django's default UserAdmin to customize user management interface
# * Adds seller-specific fields and customizes the display of user information
# */
class CustomUserAdmin(UserAdmin):
    # Fields to display in the user list view
    list_display = ('username', 'email', 'is_seller', 'is_staff', 'date_joined')
    
    # Filters available in the user list view
    list_filter = ('is_seller', 'is_staff', 'is_superuser', 'date_joined')
    
    # Fields to search in the user list view
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Default ordering of users in the list view
    ordering = ('-date_joined',)
    
    # Organization of fields in the user edit form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),  # Basic authentication fields
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'address')}),  # User details
        ('Permissions', {'fields': ('is_seller', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),  # Access control
        ('Important dates', {'fields': ('last_login', 'date_joined')}),  # Timestamps
    )
    
    # Organization of fields in the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),  # CSS class for form layout
            'fields': ('username', 'email', 'password1', 'password2', 'is_seller'),  # Required fields for new users
        }),
    )

#/* Product Admin Configuration
# * Customizes the admin interface for product management
# * Provides filtering, searching, and display options for products
# */
class ProductAdmin(admin.ModelAdmin):
    # Fields to display in the product list view
    list_display = ('name', 'category', 'price', 'stock', 'seller', 'created_at')
    
    # Filters available in the product list view
    list_filter = ('category', 'created_at', 'seller')
    
    # Fields to search in the product list view
    search_fields = ('name', 'description', 'seller__username')
    
    # Default ordering of products in the list view
    ordering = ('-created_at',)

#/*  Sold Product Admin Configuration
#   * Customizes the admin interface for sold product management
# * Provides filtering, searching, and display options for sales records
# */
class SoldProductAdmin(admin.ModelAdmin):
    # Fields to display in the sold product list view
    list_display = ('product', 'buyer', 'quantity', 'total_price', 'status', 'created_at')
    
    # Filters available in the sold product list view
    list_filter = ('status', 'created_at', 'buyer', 'product__seller')
    
    # Fields to search in the sold product list view
    search_fields = ('product__name', 'buyer__username', 'shipping_address')
    
    # Default ordering of sold products in the list view
    ordering = ('-created_at',)

# Register models with their custom admin configurations
admin.site.register(User, CustomUserAdmin)  # Register User model with custom admin
admin.site.register(Product, ProductAdmin)  # Register Product model with custom admin
admin.site.register(SoldProduct, SoldProductAdmin)  # Register SoldProduct model with custom admin 