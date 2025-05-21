# Import necessary Django and DRF modules
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Product, SoldProduct, User
from .serializers import UserSerializer, UserCreateSerializer, ProductSerializer, SoldProductSerializer
from rest_framework import serializers

#/* Custom Permission Class
# * Checks if the requesting user has seller privileges
# * Used to restrict certain actions to seller accounts only
# */
class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_seller

#/* User ViewSet
# * Handles all user-related operations including:
# * - User registration
# * - User login/logout
# * - Current user information
# * - User profile management
# */
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    #/* Get Queryset Method
    # * Restricts users to only access their own data
    # * Returns a queryset containing only the current user
    # */
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    #/* Current User Action
    # * Custom endpoint to get current user's information
    # * @returns {Response} Serialized user data
    # */
    @action(detail=False, methods=['get'])
    def current_user(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    #/* Register Action
    # * Custom endpoint for user registration
    # * - Validates user data
    # * - Creates new user account
    # * - Automatically logs in the new user
    # * - Returns user data with 201 status on success
    # * 
    # * @param {Request} request - Contains user registration data
    # * @returns {Response} New user data or validation errors
    # */
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    @method_decorator(ensure_csrf_cookie)
    def register(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #/* Login Action
    # * Custom endpoint for user authentication
    # * - Validates credentials
    # * - Checks user status
    # * - Creates session
    # * 
    # * @param {Request} request - Contains username and password
    # * @returns {Response} User data or error message
    # */
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    @method_decorator(ensure_csrf_cookie)
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                serializer = self.get_serializer(user)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'User account is disabled'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    #/* Logout Action
    # * Custom endpoint to end user session
    # * @returns {Response} Empty response with 204 status
    # */
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

#/* Product ViewSet
# * Handles all product-related operations including:
# * - Product listing and retrieval
# * - Product creation and updates
# * - Product deletion
# * - Category filtering
# */
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    #/* Get Permissions Method
    # * Sets different permission classes based on action:
    # * - AllowAny for list and retrieve
    # * - IsAuthenticated and IsSeller for other actions
    # */
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated, IsSeller]
        return [permission() for permission in permission_classes]

    #/* Perform Create Method
    # * Handles product creation
    # * Associates product with seller
    # * Handles validation errors
    # */
    def perform_create(self, serializer):
        try:
            serializer.save(seller=self.request.user)
        except Exception as e:
            raise serializers.ValidationError(str(e))

    #/* Get Queryset Method
    # * Returns filtered product list
    # * Supports category filtering via query parameters
    # */
    def get_queryset(self):
        # For sellers, show all products (including zero stock)
        if self.request.user.is_authenticated and self.request.user.is_seller:
            queryset = Product.objects.all()
        else:
            # For regular users, only show products with stock > 0
            queryset = Product.objects.filter(stock__gt=0)
            
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    #/* Create Method
    # * Overrides default create to handle exceptions
    # * Returns appropriate error responses
    # */
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

#/* SoldProduct ViewSet
# * Handles all sold product operations including:
# * - Purchase history
# * - Order management
# * - Stock updates
# */
class SoldProductViewSet(viewsets.ModelViewSet):
    serializer_class = SoldProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow public access for listing sold products
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            # For public access, return all sold products
            return SoldProduct.objects.all().order_by('-created_at')
        elif self.request.user.is_authenticated:
            if self.request.user.is_seller:
                # Get all products sold by this seller
                return SoldProduct.objects.filter(product__seller=self.request.user).order_by('-created_at')
            # For regular users, show only their purchases
            return SoldProduct.objects.filter(buyer=self.request.user).order_by('-created_at')
        return SoldProduct.objects.none()  # Return empty queryset if not authenticated

    #/* Perform Create Method
    # * Handles product purchase process:
    # * - Validates stock availability
    # * - Updates product stock
    # * - Creates purchase record
    # * 
    # * @param {Serializer} serializer - Contains validated purchase data
    # * @raises {ValidationError} If insufficient stock
    # */
    def perform_create(self, serializer):
        # Get the product and requested quantity
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        # Check if there's enough stock
        if product.stock < quantity:
            raise serializers.ValidationError({
                'quantity': f'Not enough stock available. Only {product.stock} items left.'
            })

        # Update the stock
        product.stock -= quantity
        product.save()

        # Create the sold product
        serializer.save(buyer=self.request.user) 