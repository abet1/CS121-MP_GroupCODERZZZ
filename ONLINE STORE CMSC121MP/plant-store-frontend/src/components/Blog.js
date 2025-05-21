// Import necessary React hooks and routing components
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// NavigationBar component - Renders the main navigation header
const NavigationBar = () => {
  // Hook to programmatically navigate between routes
  const navigate = useNavigate();
  return (
    // Main navigation container with styling
    <nav className="bg-primary py-4 sticky top-0 z-50 shadow-md">
      {/* Responsive container with maximum width and padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex container for logo, navigation links, and auth buttons */}
        <div className="flex justify-between items-center">
          {/* Logo and brand name section */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/garden-of-eden-logo.png" 
              alt="Garden of Eden" 
              className="h-12 w-auto"
            />
            <span className="text-white text-2xl font-bold">Garden of Eden</span>
          </Link>
          
          {/* Navigation links - hidden on mobile, visible on medium screens and up */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-secondary transition-colors">Home</Link>
            <Link to="/shop" className="text-white hover:text-secondary transition-colors">Shop</Link>
            <Link to="/blog" className="text-white hover:text-secondary transition-colors">Blog</Link>
            <Link to="/cart" className="text-white hover:text-secondary transition-colors">Cart</Link>
          </div>
          
          {/* Authentication buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/login')} 
              className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="bg-secondary text-primary px-4 py-2 rounded hover:bg-accent transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Blog component - Main blog page component
const Blog = () => {
  // State to manage the currently selected article for modal display
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Sample blog articles data
  const articles = [
    {
      id: 1,
      title: "Essential Tips for Indoor Plant Care",
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
      date: "March 15, 2024",
      excerpt: "Learn the fundamental principles of keeping your indoor plants thriving. From proper watering techniques to ideal lighting conditions, discover how to create the perfect environment for your green companions.",
      content: `Indoor plants bring life and beauty to our homes, but they require specific care to flourish. Here are some essential tips:

1. Watering: Most indoor plants prefer their soil to dry out slightly between waterings. Stick your finger about an inch into the soil - if it's dry, it's time to water.

2. Lighting: Different plants have different light requirements. Place sun-loving plants near south-facing windows, while shade-tolerant plants can thrive in north-facing rooms.

3. Humidity: Many indoor plants come from tropical environments and appreciate higher humidity. Consider using a humidifier or placing plants on a pebble tray with water.

4. Temperature: Most indoor plants prefer temperatures between 65-75°F (18-24°C). Avoid placing plants near drafts or heating vents.

5. Fertilizing: During the growing season (spring and summer), feed your plants with a balanced fertilizer every 2-4 weeks.`
    },
    {
      id: 2,
      title: "Creating a Sustainable Garden: A Beginner's Guide",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
      date: "March 10, 2024",
      excerpt: "Start your journey towards sustainable gardening with these practical tips. Learn about composting, water conservation, and natural pest control methods.",
      content: `Sustainable gardening is not just about growing plants - it's about creating a harmonious ecosystem in your backyard. Here's how to get started:

1. Composting: Start a compost pile with kitchen scraps, yard waste, and other organic materials. This creates nutrient-rich soil while reducing waste.

2. Water Conservation: Install a rain barrel to collect rainwater for your garden. Use drip irrigation systems to minimize water waste.

3. Natural Pest Control: Encourage beneficial insects like ladybugs and lacewings. Plant companion plants that naturally repel pests.

4. Native Plants: Choose plants native to your region. They're adapted to local conditions and require less maintenance.

5. Mulching: Use organic mulch to retain moisture, suppress weeds, and improve soil quality.`
    },
    {
      id: 3,
      title: "Seasonal Plant Care: Spring Edition",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
      date: "March 5, 2024",
      excerpt: "Prepare your garden for spring with these essential tasks. From pruning to planting, learn how to give your plants the best start to the growing season.",
      content: `Spring is a crucial time for gardeners. Here's your comprehensive guide to spring plant care:

1. Clean Up: Remove dead leaves and debris from your garden beds. This prevents disease and pest problems.

2. Pruning: Prune dead or damaged branches from trees and shrubs. This encourages new growth and improves plant health.

3. Soil Preparation: Test your soil and add necessary amendments. Work in compost to improve soil structure and fertility.

4. Planting: Start seeds indoors for warm-season crops. Plant cool-season vegetables and flowers directly in the garden.

5. Fertilizing: Apply a balanced fertilizer to established plants as they begin their active growth phase.

6. Mulching: Add a fresh layer of mulch to garden beds to conserve moisture and suppress weeds.`
    }
  ];

  // Handler to close the article modal
  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  return (
    // Main container with minimum height and background color
    <div className="min-h-screen bg-light">
      {/* Include the navigation bar component */}
      <NavigationBar />

      {/* Hero Section - Background image with overlay and text */}
      <div className="relative h-[300px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('homepage_background.jpg')" }}
        >
          <div className="absolute inset-0 bg-primary bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4">Blog</h1>
              <p className="text-xl">Discover tips, tricks, and insights for your gardening journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content Section - Grid of article cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Map through articles array to create article cards */}
          {articles.map(article => (
            <article key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Article image container */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Article content container */}
              <div className="p-6">
                <div className="text-primary text-sm mb-2">{article.date}</div>
                <h2 className="text-2xl font-bold text-primary mb-4">{article.title}</h2>
                <p className="text-primary mb-4">{article.excerpt}</p>
                <button 
                  onClick={() => setSelectedArticle(article)}
                  className="text-primary hover:text-accent transition-colors font-semibold"
                >
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal for displaying full article content */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header with image and close button */}
            <div className="relative">
              <div className="h-64 overflow-hidden">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Close modal button */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal content */}
            <div className="p-8">
              <div className="text-primary text-sm mb-2">{selectedArticle.date}</div>
              <h2 className="text-3xl font-bold text-primary mb-6">{selectedArticle.title}</h2>
              {/* Article content split into paragraphs */}
              <div className="prose prose-lg max-w-none">
                {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-primary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-primary text-white py-16 px-4">
        {/* Footer content grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company information */}
          <div>
            <div className="text-xl font-bold mb-4">Garden of Eden</div>
            <div className="text-secondary">Your one-stop shop for all things green.</div>
          </div>
          {/* Quick Links section */}
          <div>
            <div className="text-xl font-bold mb-4">Quick Links</div>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-secondary hover:text-accent transition-colors">Home</Link>
              <Link to="/shop" className="text-secondary hover:text-accent transition-colors">Shop</Link>
              <Link to="/blog" className="text-secondary hover:text-accent transition-colors">Blog</Link>
              <Link to="/cart" className="text-secondary hover:text-accent transition-colors">Cart</Link>
            </div>
          </div>
          {/* Contact Information section */}
          <div>
            <div className="text-xl font-bold mb-4">Contact Us</div>
            <div className="flex flex-col space-y-2 text-secondary">
              <p>123 Green St, City</p>
              <p>(555) 123-4567</p>
              <p>info@gardenofeden.com</p>
            </div>
          </div>
        </div>
        {/* Copyright section */}
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-secondary text-center text-secondary">
          &copy; {new Date().getFullYear()} Garden of Eden. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Export the Blog component as the default export
export default Blog; 