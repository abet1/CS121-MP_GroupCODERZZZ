# Import necessary modules from Django and Django REST framework
from django.urls import path, include  # path for defining URL patterns, include for including other URL configurations
from rest_framework.routers import DefaultRouter  # DefaultRouter for automatic URL routing for ViewSets
from . import views  # Import views from the current directory

# Create a DefaultRouter instance
# DefaultRouter automatically creates URL patterns for ViewSets
# It provides a browsable API interface and handles URL routing
router = DefaultRouter()

# Register ViewSets with the router
# Each register call creates a set of URL patterns for the ViewSet
# basename is used to generate URL names for the ViewSet
router.register(r'users', views.UserViewSet, basename='user')  # Creates URLs for user management
router.register(r'products', views.ProductViewSet, basename='product')  # Creates URLs for product management
router.register(r'sold-products', views.SoldProductViewSet, basename='sold-product')  # Creates URLs for sold products

# Define the URL patterns for this app
# The router.urls contains all the URL patterns generated for the registered ViewSets
urlpatterns = [
    path('', include(router.urls)),  # Include all router-generated URLs at the root path
] 