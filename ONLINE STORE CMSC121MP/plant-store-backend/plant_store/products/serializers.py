# Import necessary Django and DRF modules
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, SoldProduct

# Get the active User model
User = get_user_model()

#/* User Serializer
# * Handles serialization of User model data
# * Used for reading user data and displaying user information
# * Includes all essential user fields with appropriate read-only settings
# */
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_seller', 'phone_number', 'address', 'created_at')
        read_only_fields = ('id', 'created_at')

#/* User Create Serializer
# * Specialized serializer for user registration
# * Handles password field securely (write-only)
# * Implements custom create method for proper user creation
# * Includes all necessary fields for user registration
# */
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_seller', 'phone_number', 'address')

    #/* Create Method
    # * Custom implementation of user creation
    # * Uses Django's create_user method for proper password handling
    # * Sets default values for optional fields
    # * 
    # * @param {dict} validated_data - Validated user data
    # * @returns {User} Newly created user instance
    # */
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_seller=validated_data.get('is_seller', False),
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', '')
        )
        return user

#/* Product Serializer
# * Handles serialization of Product model data
# * Includes nested seller information
# * Handles price field with proper decimal formatting
# * Includes all product fields with appropriate read-only settings
# */
class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'category', 'image', 'stock', 'seller', 'created_at')
        read_only_fields = ('id', 'created_at')

#/* Sold Product Serializer
# * Handles serialization of SoldProduct model data
# * Includes nested product and buyer information
# * Provides separate product_id field for write operations
# * Includes all sold product fields with appropriate read-only settings
# */
class SoldProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    buyer = UserSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    class Meta:
        model = SoldProduct
        fields = ('id', 'product', 'product_id', 'buyer', 'quantity', 'total_price', 'status', 'shipping_address', 'created_at')
        read_only_fields = ('id', 'created_at', 'buyer') 