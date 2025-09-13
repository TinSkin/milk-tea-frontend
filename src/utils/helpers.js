/**
 * Helper functions for common operations
 */

// Debounce function for search input
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Calculate cart total
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const itemTotal = item.basePrice + (item.toppings?.reduce((sum, topping) => sum + topping.extraPrice, 0) || 0);
    return total + (itemTotal * item.quantity);
  }, 0);
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
