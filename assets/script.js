// Data storage using localStorage
const FOOD_ITEMS_KEY = "goldenBites_foodItems"
const ORDERS_KEY = "goldenBites_orders"
const USER_KEY = "goldenBites_user"
const SHOP_NAME_KEY = "goldenBites_shopName"
const WORKING_DATE_KEY = "goldenBites_workingDate"
const REVIEWS_KEY = "goldenBites_reviews"
const RESET_TOKENS_KEY = "goldenBites_resetTokens"

// Initialize data
function initializeData() {
  // Initialize food items if not exists
  if (!localStorage.getItem(FOOD_ITEMS_KEY)) {
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify([]))
  }

  // Initialize orders if not exists
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]))
  }

  // Set default shop name if not exists
  if (!localStorage.getItem(SHOP_NAME_KEY)) {
    localStorage.setItem(SHOP_NAME_KEY, "Your Shop")
  }

  // Initialize reviews if not exists
  if (!localStorage.getItem(REVIEWS_KEY)) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify([]))
  }

  // Initialize reset tokens if not exists
  if (!localStorage.getItem(RESET_TOKENS_KEY)) {
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify([]))
  }

  // Set working date to today if not exists
  if (!localStorage.getItem(WORKING_DATE_KEY)) {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem(WORKING_DATE_KEY, today)
  }

  // Update shop name in all pages
  updateShopName()
}

// Update shop name in the header
function updateShopName() {
  const shopNameHeading = document.getElementById("shopNameHeading")
  if (shopNameHeading) {
    shopNameHeading.textContent = localStorage.getItem(SHOP_NAME_KEY) || "Your Shop"
  }
}

// Navigation functions
function navigateTo(page) {
  window.location.href = page
}

// Toggle password visibility
function togglePasswordVisibility(inputId, toggleElement) {
  const passwordInput = document.getElementById(inputId)
  const eyeIcon = toggleElement.querySelector(".eye-icon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    eyeIcon.src = "assets/eye-open.png"
  } else {
    passwordInput.type = "password"
    eyeIcon.src = "assets/eye-close.png"
  }
}

// Food Item Management
function addFoodItem(name, price, image, ingredients, details, category) {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []

  const newItem = {
    id: Date.now().toString(),
    name: name,
    price: price,
    image: image || "/placeholder.svg?height=80&width=80",
    ingredients: ingredients || "",
    details: details || "",
    category: category || "Breakfast",
    rating: 0,
    reviewCount: 0,
    sales: 0,
    dateAdded: new Date().toISOString(),
  }

  foodItems.push(newItem)
  localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems))

  return newItem
}

function updateFoodItem(id, updates) {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []
  const index = foodItems.findIndex((item) => item.id === id)

  if (index !== -1) {
    foodItems[index] = { ...foodItems[index], ...updates }
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems))
    return foodItems[index]
  }

  return null
}

function deleteFoodItem(id) {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []
  const updatedItems = foodItems.filter((item) => item.id !== id)

  localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems))
  return updatedItems
}

function getFoodItems() {
  return JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []
}

function getFoodItemsSortedBySales() {
  const foodItems = getFoodItems()
  return foodItems.sort((a, b) => b.sales - a.sales)
}

// Order Management
function addOrder(foodItemId, quantity = 1, customerName, instructions, paymentMethod, deliveryOption, deliveryTime) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || []
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []

  const foodItem = foodItems.find((item) => item.id === foodItemId)
  if (!foodItem) return null

  const newOrder = {
    id: "S" + Math.floor(1000 + Math.random() * 9000),
    foodItemId: foodItemId,
    foodName: foodItem.name,
    price: foodItem.price,
    quantity: quantity,
    total: Number.parseFloat(foodItem.price) * quantity,
    status: "Pending", // Start as pending
    customerName: customerName || "Customer",
    instructions: instructions || "",
    paymentMethod: paymentMethod || "Cash",
    deliveryOption: deliveryOption || "Pick-up",
    deliveryTime: deliveryTime || "",
    orderDate: new Date().toISOString(),
    image: foodItem.image,
  }

  orders.push(newOrder)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

  return newOrder
}

function updateOrderStatus(id, status) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || []
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []
  const index = orders.findIndex((order) => order.id === id)

  if (index !== -1) {
    orders[index].status = status
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

    // If order is completed, update food item sales
    if (status === "Completed") {
      const order = orders[index]
      const foodItemIndex = foodItems.findIndex((item) => item.id === order.foodItemId)

      if (foodItemIndex !== -1) {
        foodItems[foodItemIndex].sales = (foodItems[foodItemIndex].sales || 0) + order.quantity
        localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems))
      }
    }

    return orders[index]
  }

  return null
}

function getOrders(status = null, timeFilter = "Today") {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || []

  // Filter by status if provided
  let filteredOrders = status ? orders.filter((order) => order.status === status) : orders

  // Apply time filter
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 7) // Last 7 days
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  switch (timeFilter) {
    case "Today":
    case "24 hours":
      filteredOrders = filteredOrders.filter((order) => new Date(order.orderDate) >= today)
      break
    case "Yesterday":
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.orderDate)
        return orderDate >= yesterday && orderDate < today
      })
      break
    case "Week":
    case "7 days":
      filteredOrders = filteredOrders.filter((order) => new Date(order.orderDate) >= weekStart)
      break
    case "Month":
    case "30 days":
      filteredOrders = filteredOrders.filter((order) => new Date(order.orderDate) >= monthStart)
      break
    case "12 months":
      const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      filteredOrders = filteredOrders.filter((order) => new Date(order.orderDate) >= yearStart)
      break
  }

  return filteredOrders
}

function calculateSales(timeFilter = "Today") {
  const orders = getOrders(null, timeFilter).filter((order) => order.status === "Completed")

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length

  return {
    totalSales,
    totalOrders,
  }
}

// Review Management
function addReview(foodItemId, rating, comment, customerName) {
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || []

  const newReview = {
    id: Date.now().toString(),
    foodItemId,
    rating,
    comment,
    customerName: customerName || "Customer",
    date: new Date().toISOString(),
  }

  reviews.push(newReview)
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))

  // Update food item rating
  const foodItemIndex = foodItems.findIndex((item) => item.id === foodItemId)
  if (foodItemIndex !== -1) {
    const foodItemReviews = reviews.filter((review) => review.foodItemId === foodItemId)
    const avgRating = foodItemReviews.reduce((sum, review) => sum + review.rating, 0) / foodItemReviews.length

    foodItems[foodItemIndex].rating = avgRating
    foodItems[foodItemIndex].reviewCount = foodItemReviews.length

    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems))
  }

  return newReview
}

function getReviews(foodItemId = null) {
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []

  if (foodItemId) {
    return reviews.filter((review) => review.foodItemId === foodItemId)
  }

  return reviews
}

// User Authentication
function registerUser(name, shopName, email, password, phone) {
  const user = {
    name,
    shopName,
    email,
    password, // In a real app, this should be hashed
    phone,
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(SHOP_NAME_KEY, shopName)

  return user
}

// Fix the loginUser function to properly compare passwords
function loginUser(email, password) {
  const user = JSON.parse(localStorage.getItem(USER_KEY))

  if (user && user.email === email && user.password === password) {
    console.log("Login successful")
    return user
  }

  console.log("Login failed")
  return null
}

function logoutUser() {
  // In a real app, you would clear session data
  // For this demo, we'll just redirect to the welcome page
  window.location.href = "welcome.html"
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY))
}

// Password Reset Functions
function generateResetToken(email) {
  const resetTokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)) || []

  // Check if user exists
  const user = JSON.parse(localStorage.getItem(USER_KEY))
  if (!user || user.email !== email) {
    return null
  }

  // Generate a token (in a real app, this would be a secure random token)
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  // Store the token with the email and expiration time (24 hours)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const resetToken = {
    email,
    token,
    expiresAt: expiresAt.toISOString(),
  }

  // Remove any existing tokens for this email
  const filteredTokens = resetTokens.filter((t) => t.email !== email)
  filteredTokens.push(resetToken)

  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(filteredTokens))

  return token
}

function validateResetToken(token) {
  const resetTokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)) || []

  // Find the token
  const tokenData = resetTokens.find((t) => t.token === token)

  if (!tokenData) {
    return null
  }

  // Check if token is expired
  const now = new Date()
  const expiresAt = new Date(tokenData.expiresAt)

  if (now > expiresAt) {
    // Token expired, remove it
    const filteredTokens = resetTokens.filter((t) => t.token !== token)
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(filteredTokens))
    return null
  }

  return tokenData.email
}

function resetPassword(token, newPassword) {
  const email = validateResetToken(token)

  if (!email) {
    return false
  }

  // Update the user's password
  const user = JSON.parse(localStorage.getItem(USER_KEY))

  if (user && user.email === email) {
    user.password = newPassword
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    // Remove the used token
    const resetTokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY)) || []
    const filteredTokens = resetTokens.filter((t) => t.token !== token)
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(filteredTokens))

    return true
  }

  return false
}

// Working Date Management
function setWorkingDate(date) {
  localStorage.setItem(WORKING_DATE_KEY, date)
}

function getWorkingDate() {
  return localStorage.getItem(WORKING_DATE_KEY) || new Date().toISOString().split("T")[0]
}

// Export data as text
function exportDataAsText(data, filename) {
  let text = ""

  if (Array.isArray(data)) {
    // Convert array of objects to text
    data.forEach((item, index) => {
      text += `Item ${index + 1}:\n`
      Object.keys(item).forEach((key) => {
        text += `${key}: ${item[key]}\n`
      })
      text += "\n"
    })
  } else if (typeof data === "object") {
    // Convert single object to text
    Object.keys(data).forEach((key) => {
      text += `${key}: ${data[key]}\n`
    })
  } else {
    text = String(data)
  }

  // Create a blob and download link
  const blob = new Blob([text], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename || "export.txt"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Page-specific initialization
function initPage() {
  // Initialize data
  initializeData()

  // Get current page
  const currentPage = window.location.pathname.split("/").pop()

  // Common elements
  setupNavigation()
  setupSettingsModal()
  setupLogoNavigation()

  // Page-specific initialization
  switch (currentPage) {
    case "welcome.html":
      initWelcomePage()
      break
    case "sign-up.html":
      initSignUpPage()
      break
    case "sign-in.html":
      initSignInPage()
      break
    case "dashboard.html":
      initDashboardPage()
      break
    case "food-list.html":
      initFoodListPage()
      break
    case "add-item.html":
      initAddItemPage()
      break
    case "orders.html":
      initOrdersPage()
      break
    case "order-summary.html":
      initOrderSummaryPage()
      break
    case "overview.html":
      initOverviewPage()
      break
    case "forgot-password.html":
      initForgotPasswordPage()
      break
    case "reset-password.html":
      initResetPasswordPage()
      break
    case "policy.html":
      initPolicyPage()
      break
  }
}

// Setup navigation
function setupNavigation() {
  // Setup navigation bar links
  const homeNavItem = document.querySelector(".nav-item:nth-child(1)")
  if (homeNavItem) {
    homeNavItem.addEventListener("click", () => navigateTo("dashboard.html"))
  }

  const ordersNavItem = document.querySelector(".nav-item:nth-child(2)")
  if (ordersNavItem) {
    ordersNavItem.addEventListener("click", () => navigateTo("orders.html"))
  }

  const addButton = document.querySelector(".add-button")
  if (addButton) {
    addButton.addEventListener("click", () => navigateTo("add-item.html"))
  }

  const summaryNavItem = document.querySelector(".nav-item:nth-child(4)")
  if (summaryNavItem) {
    summaryNavItem.addEventListener("click", () => navigateTo("overview.html"))
  }

  const salesReportNavItem = document.querySelector(".nav-item:nth-child(5)")
  if (salesReportNavItem) {
    salesReportNavItem.addEventListener("click", () => navigateTo("order-summary.html"))
  }

  // Setup back button
  const backIcon = document.querySelector(".back-icon")
  if (backIcon) {
    backIcon.addEventListener("click", () => window.history.back())
  }

  // Setup food list link
  const foodListLink = document.querySelector(".food-list-link")
  if (foodListLink) {
    foodListLink.addEventListener("click", (e) => {
      e.preventDefault()
      navigateTo("food-list.html")
    })
  }

  // Highlight active nav item based on current page
  const currentPage = window.location.pathname.split("/").pop()
  const navItems = document.querySelectorAll(".nav-item")

  navItems.forEach((item) => item.classList.remove("active"))

  if (currentPage === "dashboard.html") {
    navItems[0]?.classList.add("active")
  } else if (currentPage === "orders.html") {
    navItems[1]?.classList.add("active")
  } else if (currentPage === "overview.html") {
    navItems[2]?.classList.add("active")
  } else if (currentPage === "order-summary.html") {
    navItems[3]?.classList.add("active")
  }
}

// Setup logo navigation to dashboard
function setupLogoNavigation() {
  const logo = document.querySelector(".logo")
  if (logo) {
    logo.style.cursor = "pointer"
    logo.addEventListener("click", () => navigateTo("dashboard.html"))
  }
}

// Setup settings modal
function setupSettingsModal() {
  const settingsIcon = document.getElementById("settingsIcon")
  const settingsModal = document.getElementById("settingsModal")

  if (settingsIcon && settingsModal) {
    settingsIcon.addEventListener("click", () => {
      settingsModal.style.display = "block"

      // Populate user info
      const user = getCurrentUser()
      if (user) {
        document.getElementById("userName").textContent = user.name
        document.getElementById("userShopName").textContent = user.shopName
        document.getElementById("userEmail").textContent = user.email
        document.getElementById("userPhone").textContent = user.phone
      }

      // Add working date input if not exists
      if (!document.getElementById("workingDateInput")) {
        const userInfoSection = document.querySelector(".user-info-section")
        if (userInfoSection) {
          const dateItem = document.createElement("div")
          dateItem.className = "user-info-item"
          dateItem.innerHTML = `
            <label>Working Date:</label>
            <input type="date" id="workingDateInput" value="${getWorkingDate()}" style="flex: 1; padding: 5px;">
          `
          userInfoSection.appendChild(dateItem)

          // Add event listener to save date when changed
          const dateInput = document.getElementById("workingDateInput")
          dateInput.addEventListener("change", () => {
            setWorkingDate(dateInput.value)
          })
        }
      } else {
        // Update date input value
        document.getElementById("workingDateInput").value = getWorkingDate()
      }
    })

    const closeModal = document.querySelector(".close-modal")
    if (closeModal) {
      closeModal.addEventListener("click", () => {
        settingsModal.style.display = "none"
      })
    }

    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logoutUser)
    }
  }
}

// Page-specific initializations
function initWelcomePage() {
  const startButton = document.querySelector(".btn-primary")
  if (startButton) {
    startButton.addEventListener("click", () => navigateTo("sign-up.html"))
  }
}

// Fix the initSignUpPage function to properly handle form submission
function initSignUpPage() {
  const signupForm = document.getElementById("signupForm")
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("Sign up form submitted")

      const name = signupForm.querySelector('[name="name"]').value
      const shopName = signupForm.querySelector('[name="shopName"]').value
      const email = signupForm.querySelector('[name="email"]').value
      const password = signupForm.querySelector('[name="password"]').value
      const confirmPassword = signupForm.querySelector('[name="confirmPassword"]').value
      const phone = signupForm.querySelector('[name="phone"]').value

      if (password !== confirmPassword) {
        alert("Passwords do not match!")
        return
      }

      console.log("Registering user:", name, shopName, email)
      registerUser(name, shopName, email, password, phone)
      navigateTo("dashboard.html")
    })
  }

  // Setup terms link
  const termsLinks = document.querySelectorAll(".terms-link")
  if (termsLinks.length > 0) {
    termsLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        navigateTo("policy.html")
      })
    })
  }
}

// Fix the initSignInPage function to properly handle form submission
function initSignInPage() {
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("Login form submitted")

      const email = loginForm.querySelector('[name="email"]').value
      const password = loginForm.querySelector('[name="password"]').value

      console.log("Attempting login with:", email)
      const user = loginUser(email, password)

      if (user) {
        console.log("Login successful, navigating to dashboard")
        navigateTo("dashboard.html")
      } else {
        alert("Invalid email or password!")
      }
    })
  }

  // Update forgot password link
  const forgotLink = document.querySelector(".forgot-link")
  if (forgotLink) {
    forgotLink.href = "forgot-password.html"
  }
}

function initForgotPasswordPage() {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm")
  const messageContainer = document.getElementById("forgotPasswordMessage")

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("forgotEmail").value
      const token = generateResetToken(email)

      if (token) {
        // In a real app, this would send an email with a reset link
        // For this demo, we'll just show a success message and redirect to reset page with token
        messageContainer.textContent = "Reset link sent! Check your email."
        messageContainer.className = "message-container success"

        // Simulate email delay then redirect
        setTimeout(() => {
          window.location.href = `reset-password.html?token=${token}&email=${encodeURIComponent(email)}`
        }, 2000)
      } else {
        messageContainer.textContent = "Email not found. Please check and try again."
        messageContainer.className = "message-container error"
      }
    })
  }

  // Setup back button to go to sign-in page
  const backIcon = document.querySelector(".back-icon")
  if (backIcon) {
    backIcon.addEventListener("click", () => {
      window.location.href = "sign-in.html"
    })
  }
}

        document.addEventListener('DOMContentLoaded', function() {
            // Add some sample orders for demonstration
            addSampleOrders();
            
            // Display orders
            displayOrders('pending');
            
            // Set up order tabs
            setupOrderTabs();
            
            // Update order counts
            updateOrderCounts();
        });
        
        function addSampleOrders() {
            // Only add sample orders if there are none
            const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
            if (orders.length === 0) {
                // Get food items
                const foodItems = getFoodItems();
                
                // Only add sample orders if there are food items
                if (foodItems.length > 0) {
                    // Add sample pending orders
                    addOrder(foodItems[0].id, 2, 'John Doe', 'Extra sauce please', 'Cash', 'Delivery', '30 minutes');
                    addOrder(foodItems[0].id, 1, 'Jane Smith', 'No onions', 'GCash', 'Pick-up', '15 minutes');
                    
                    // Add sample preparing order
                    const preparingOrder = addOrder(foodItems[0].id, 3, 'Mike Johnson', 'Extra spicy', 'Cash', 'Delivery', '45 minutes');
                    updateOrderStatus(preparingOrder.id, 'Preparing');
                    
                    // Add sample ready order
                    const readyOrder = addOrder(foodItems[0].id, 1, 'Sarah Williams', '', 'GCash', 'Pick-up', '10 minutes');
                    updateOrderStatus(readyOrder.id, 'Ready');
                    
                    // Add sample completed order
                    const completedOrder = addOrder(foodItems[0].id, 2, 'David Brown', '', 'Cash', 'Delivery', '30 minutes');
                    updateOrderStatus(completedOrder.id, 'Completed');
                    
                    // Add sample cancelled order
                    const cancelledOrder = addOrder(foodItems[0].id, 1, 'Lisa Taylor', 'Cancelled by customer', 'GCash', 'Pick-up', '20 minutes');
                    updateOrderStatus(cancelledOrder.id, 'Cancelled');
                }
            }
        }
        
        function displayOrders(status = 'pending') {
            // Get orders from localStorage
            const orders = getOrders().filter(order => 
                status === 'all' || order.status.toLowerCase() === status.toLowerCase()
            );
            
            const container = document.getElementById('ordersContainer');
            const noOrdersMessage = document.getElementById('noOrdersMessage');
            
            // Clear container
            container.innerHTML = '';
            
            if (orders.length === 0) {
                // Show no orders message
                container.appendChild(noOrdersMessage);
                return;
            }
            
            // Sort orders by date (newest first)
            orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            // Create and append order items
            orders.forEach(order => {
                const orderElement = createOrderElement(order);
                container.appendChild(orderElement);
            });
        }
        
        function createOrderElement(order) {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.dataset.id = order.id;
            
            // Format order date
            const orderDate = new Date(order.orderDate);
            const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedDate = orderDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            // Get status class
            const statusClass = `status-${order.status.toLowerCase()}`;
            
            // Create action buttons based on status
            let actionButtons = '';
            
            if (order.status === 'Pending') {
                actionButtons = `
                    <button class="btn-done" onclick="updateOrderStatusAndRefresh('${order.id}', 'Preparing')">Accept</button>
                    <button class="btn-cancel" onclick="updateOrderStatusAndRefresh('${order.id}', 'Cancelled')">Decline</button>
                `;
            } else if (order.status === 'Preparing') {
                actionButtons = `
                    <button class="btn-done" onclick="updateOrderStatusAndRefresh('${order.id}', 'Ready')">Ready</button>
                `;
            } else if (order.status === 'Ready') {
                actionButtons = `
                    <button class="btn-done" onclick="updateOrderStatusAndRefresh('${order.id}', 'Completed')">Complete</button>
                `;
            }
            
            orderItem.innerHTML = `
                <img src="${order.image}" alt="${order.foodName}" class="order-image">
                <div class="order-details">
                    <div class="order-status ${statusClass}">${order.status}</div>
                    <div class="order-name">${order.foodName} x${order.quantity}</div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-price">₱${order.total.toFixed(2)}</div>
                    <div class="order-time">${formattedTime}, ${formattedDate}</div>
                </div>
                <div class="order-actions">
                    ${actionButtons}
                </div>
            `;
            
            return orderItem;
        }
        
        function setupOrderTabs() {
            const tabs = document.querySelectorAll('.order-tab');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Get status and display filtered orders
                    const status = this.dataset.status;
                    displayOrders(status);
                });
            });
        }
        
        function updateOrderCounts() {
            const orders = getOrders();
            
            // Count orders by status
            const counts = {
                pending: 0,
                preparing: 0,
                ready: 0,
                completed: 0,
                cancelled: 0
            };
            
            orders.forEach(order => {
                const status = order.status.toLowerCase();
                if (counts.hasOwnProperty(status)) {
                    counts[status]++;
                }
            });
            
            // Update badges
            document.getElementById('pendingBadge').textContent = counts.pending;
            document.getElementById('preparingBadge').textContent = counts.preparing;
            document.getElementById('readyBadge').textContent = counts.ready;
            
            // Update header
            document.getElementById('pendingOrdersCount').textContent = counts.pending;
            document.getElementById('pendingOrdersSubtitle').textContent = 
                counts.pending === 1 ? '1 Pending Order' : `${counts.pending} Pending Orders`;
        }
        
        function updateOrderStatusAndRefresh(id, status) {
            updateOrderStatus(id, status);
            
            // Refresh the current tab
            const activeTab = document.querySelector('.order-tab.active');
            displayOrders(activeTab.dataset.status);
            
            // Update counts
            updateOrderCounts();
        }

function initResetPasswordPage() {
  // Get token and email from URL
  const params = new URLSearchParams(window.location.search)
  const token = params.get("token")
  const email = params.get("email")

  // Display email
  const emailDisplay = document.getElementById("emailDisplay")
  if (emailDisplay && email) {
    emailDisplay.textContent = email
  }

  const resetPasswordForm = document.getElementById("resetPasswordForm")
  const messageContainer = document.getElementById("resetPasswordMessage")

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const newPassword = document.getElementById("newPassword").value
      const confirmPassword = document.getElementById("confirmPassword").value

      if (newPassword !== confirmPassword) {
        messageContainer.textContent = "Passwords do not match!"
        messageContainer.className = "message-container error"
        return
      }

      if (!token) {
        messageContainer.textContent = "Invalid or expired reset token."
        messageContainer.className = "message-container error"
        return
      }

      const success = resetPassword(token, newPassword)

      if (success) {
        messageContainer.textContent = "Password reset successful!"
        messageContainer.className = "message-container success"

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigateTo("sign-in.html")
        }, 2000)
      } else {
        messageContainer.textContent = "Invalid or expired reset token."
        messageContainer.className = "message-container error"
      }
    })
  }

  // Setup back button to go to forgot-password page
  const backIcon = document.querySelector(".back-icon")
  if (backIcon) {
    backIcon.addEventListener("click", () => {
      window.location.href = "forgot-password.html"
    })
  }
}

function initPolicyPage() {
  const acceptTermsBtn = document.getElementById("acceptTermsBtn")

  if (acceptTermsBtn) {
    acceptTermsBtn.addEventListener("click", () => {
      navigateTo("sign-up.html")
    })
  }
}

function initDashboardPage() {
  // Placeholder for dashboard page initialization
}

function initFoodListPage() {
  displayFoodItems("All"); // Show all by default
  setupCategoryTabs();
}

function initAddItemPage() {
  const saveButton = document.getElementById("saveItemBtn");

  if (saveButton) {
    saveButton.addEventListener("click", function () {
      const name = document.getElementById("itemName").value.trim();
      const price = parseFloat(document.getElementById("itemPrice").value);
      const category = document.getElementById("itemCategory").value;
      const ingredients = document.getElementById("itemIngredients").value.trim();
      const details = document.getElementById("itemDetails").value.trim();

      // Optional image URL logic - could be expanded later
      const image = "/placeholder.svg?height=80&width=80";

      if (!name || isNaN(price)) {
        alert("Please enter a valid item name and price.");
        return;
      }

      const newItem = addFoodItem(name, price, image, ingredients, details, category);
      console.log("Item added:", newItem);

      alert("Item added successfully!");
      navigateTo("food-list.html");
    });
  }
}


function initOrdersPage() {
  // Orders page initialization is now handled in the inline script
  
}

function initOrderSummaryPage() {
  // Placeholder for order summary page initialization
}

function initOverviewPage() {
  // Placeholder for overview page initialization
}

// Update the forgot password link in the sign-in page
function updateForgotPasswordLink() {
  const forgotLink = document.querySelector(".forgot-link")
  if (forgotLink) {
    forgotLink.href = "forgot-password.html"
  }
}


// Navigation function
function navigateTo(page) {
  window.location.href = page;
}

// CRUD operations for food items
function addFoodItem(name, price, image, ingredients, details, category) {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || [];
  const id = Date.now().toString();
  const newItem = {
    id,
    name,
    price,
    image,
    ingredients,
    details,
    category,
    rating: 0,
    reviewCount: 0,
  };
  foodItems.push(newItem);
  localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems));
  return newItem;
}

function updateFoodItem(id, updates) {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || [];
  const index = foodItems.findIndex((item) => item.id === id);
  if (index !== -1) {
    foodItems[index] = { ...foodItems[index], ...updates };
    localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(foodItems));
    return foodItems[index];
  }
  return null;
}

function deleteFoodItem(id) {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || [];
  const updatedItems = foodItems.filter((item) => item.id !== id);
  localStorage.setItem(FOOD_ITEMS_KEY, JSON.stringify(updatedItems));
  return true;
}

// Food List Page Functions
function displayFoodItems(category = "All") {
  const foodItems = JSON.parse(localStorage.getItem(FOOD_ITEMS_KEY)) || [];
  const container = document.getElementById("foodItemsContainer");
  const noItemsMessage = document.getElementById("noItemsMessage");
  const foodCount = document.getElementById("foodCount");

  if (container) {
    container.innerHTML = "";
    const filteredItems =
      category === "All"
        ? foodItems
        : foodItems.filter((item) => item.category === category);
    if (foodCount) {
      foodCount.textContent = `Total ${filteredItems.length} Items`;
    }
    if (filteredItems.length === 0) {
      if (noItemsMessage) {
        container.appendChild(noItemsMessage);
      } else {
        container.innerHTML =
          '<div class="no-items">No food items found. Click the + button to add items.</div>';
      }
      return;
    }
    filteredItems.forEach((item) => {
      const foodItemElement = createFoodItemElement(item);
      container.appendChild(foodItemElement);
    });
  }
}

function createFoodItemElement(item) {
  const foodItem = document.createElement("div");
  foodItem.className = "food-item";
  foodItem.dataset.id = item.id;
  const formattedPrice = `₱${Number.parseFloat(item.price).toFixed(2)}`;
  const rating = item.rating || 0;
  const reviewCount = item.reviewCount || 0;

  foodItem.innerHTML = `
    <img src="${item.image}" alt="${item.name}" class="food-image">
    <div class="food-details">
        <div class="food-name">${item.name}</div>
        <div class="food-price">${formattedPrice}</div>
        <div class="food-category">${item.category}</div>
        <div class="food-rating">
            <span class="rating-star">★</span>
            <span>${rating.toFixed(1)}</span>
            <span>(${reviewCount} reviews)</span>
        </div>
    </div>
    <div class="food-actions">
        <button class="btn-edit" onclick="editFoodItem('${item.id}')">Edit</button>
        <button class="btn-delete" onclick="deleteFoodItemWithConfirm('${item.id}')">Delete</button>
    </div>
  `;
  return foodItem;
}

function setupCategoryTabs() {
  const tabs = document.querySelectorAll(".category-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      const category = this.dataset.category;
      displayFoodItems(category);
    });
  });
}

function editFoodItem(id) {
  window.location.href = `add-item.html?edit=${id}`;
}


function deleteFoodItemWithConfirm(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    deleteFoodItem(id);
    const activeTab = document.querySelector(".category-tab.active");
    if (activeTab) {
      displayFoodItems(activeTab.dataset.category);
    } else {
      displayFoodItems("All");
    }
  }
}

// Add a console log to verify the script is loaded
console.log("Script loaded successfully!");


// Add this at the very end of the file to ensure the script initializes when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initPage()
  console.log("Golden Bites app initialized")
})
