# Import necessary Django modules
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

#/* User Model
# * Extends Django's AbstractUser to add custom fields
# * Represents both regular users and sellers in the system
# * Includes additional fields for contact and profile information
# */
class User(AbstractUser):
    is_seller = models.BooleanField(default=False)  # Flag to identify seller accounts
    phone_number = models.CharField(max_length=15, blank=True)  # Optional phone contact
    address = models.TextField(blank=True)  # Optional shipping/billing address
    created_at = models.DateTimeField(auto_now_add=True)  # Account creation timestamp
    updated_at = models.DateTimeField(auto_now=True)  # Last update timestamp

    def __str__(self):
        return self.username  # String representation for admin interface

#/* Product Model
# * Represents items available for sale in the store
# * Includes detailed product information and inventory tracking
# * Links products to their sellers
# */
class Product(models.Model):
    #/* Category Choices
    # * Predefined categories for product organization
    # * Used for filtering and categorization
    # */
    CATEGORY_CHOICES = [
        ('Plants', 'Plants'),
        ('Seeds', 'Seeds'),
        ('Gardening Tools', 'Gardening Tools'),
        ('Pots & Planters', 'Pots & Planters'),
    ]

    name = models.CharField(max_length=200)  # Product name/title
    description = models.TextField()  # Detailed product description
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Product price with 2 decimal places
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)  # Product category from predefined choices
    image = models.ImageField(upload_to='products/')  # Product image stored in products directory
    stock = models.PositiveIntegerField(default=0)  # Available quantity in inventory
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')  # Link to seller account
    created_at = models.DateTimeField(auto_now_add=True)  # Product creation timestamp
    updated_at = models.DateTimeField(auto_now=True)  # Last update timestamp

    def __str__(self):
        return self.name  # String representation for admin interface

    class Meta:
        ordering = ['-created_at']  # Default ordering by creation date (newest first)

#/* Sold Product Model
# * Tracks completed sales and purchase history
# * Links products to buyers and includes order status
# * Maintains shipping and payment information
# */
class SoldProduct(models.Model):
    #/* Status Choices
    # * Predefined order status options
    # * Used to track order progress
    # */
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales')  # Link to sold product
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')  # Link to buyer account
    quantity = models.PositiveIntegerField(default=1)  # Number of items purchased
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # Total cost of purchase
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')  # Current order status
    shipping_address = models.TextField()  # Delivery address for the order
    created_at = models.DateTimeField(auto_now_add=True)  # Order creation timestamp
    updated_at = models.DateTimeField(auto_now=True)  # Last update timestamp

    def __str__(self):
        return f"{self.product.name} - {self.buyer.username}"  # String representation for admin interface

    class Meta:
        ordering = ['-created_at']  # Default ordering by creation date (newest first) 