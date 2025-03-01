// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let inventory = {
    'Basic Pack': 10,
    'Premium Pack': 0, // Now coming soon, no inventory
    'Limited Edition Pack': 5
};

// Load Stripe
const stripe = Stripe('your-publishable-key');

// Function to set or reset inventory (call manually or via admin interface)
function setInventory(productName, amount) {
    inventory[productName] = amount;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateBuyButtons();
    console.log(`Inventory for ${productName} set to ${amount} packs.`);
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    const cartElement = document.querySelector('.cart-icon');
    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
        cartElement.style.display = 'none';
    } else {
        cartElement.style.display = 'flex';
    }
    updateCartIcon(cart.reduce((sum, item) => sum + item.quantity, 0));
    loadProducts();
    updateBuyButtons();
    cartElement.addEventListener('click', openCartPopup); // Ensure cart icon opens popup

    // Show contact form popup on Contact page load
    if (window.location.pathname === '/contact.html' || window.location.pathname === '/contact') {
        document.getElementById('contact-form-popup').style.display = 'block';
    }

    // Load hits data if on Slab Stash Hits page
    if (window.location.pathname === '/slab-stash-hits.html' || window.location.pathname === '/slab-stash-hits') {
        loadHitsData();
    }
});

// Load and display products dynamically (for Products page)
function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    const products = [
        { id: 1, name: "Basic Pack", price: 49.99, inventory: inventory['Basic Pack'], image: "images/basic-pack-icon.jpg" },
        { id: 2, name: "Premium Pack", price: 99.99, inventory: inventory['Premium Pack'], image: "images/coming-soon-stock.jpg" },
        { id: 3, name: "Limited Edition Pack", price: 149.99, inventory: inventory['Limited Edition Pack'], image: "images/limited-pack-icon.jpg" }
    ];

    productGrid.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = `product-icon ${product.inventory === 0 ? 'coming-soon' : '}'}`;
        productDiv.setAttribute('data-id', product.id);
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name} Icon">
            <h2>${product.name} - $${product.price.toFixed(2)}</h2>
            <p>Rip into the ${product.name} for $${product.price.toFixed(2)} and uncover a mystery graded coin—silver or gold, the thrill is yours!</p>
            <button class="${product.inventory === 0 ? 'coming-soon-btn' : 'buy-btn'}" 
                    ${product.inventory === 0 ? '' : `id="buy-btn-${product.id}" onclick="addToCart(this)"`}>
                ${product.inventory === 0 ? 'Coming Soon' : 'Add to Cart'}
            </button>
        `;
        productGrid.appendChild(productDiv);
    });
}

// Add item to cart (initially adds 1, quantity can be adjusted in popup)
function addToCart(productElement) {
    const productId = productElement.getAttribute('data-id');
    const productName = productElement.parentElement.querySelector('h2').textContent.split(' - ')[0];
    const productPrice = parseFloat(productElement.parentElement.querySelector('h2').textContent.split(' - ')[1].replace('$', ''));

    if (inventory[productName] <= 0) {
        showNotification("Sorry, this pack is currently sold out or coming soon. Please check back later!");
        return;
    }

    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        if (existingProduct.quantity < inventory[productName]) {
            existingProduct.quantity += 1;
        } else {
            showNotification(`Only ${inventory[productName]} ${productName}(s) left.`);
            return;
        }
    } else {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
    }
    inventory[productName] -= 1; // Decrease inventory by 1
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateCartIcon(cart.reduce((sum, item) => sum + item.quantity, 0));
    showNotification(`${productName} added to cart!`);
    updateBuyButtons();
    // Do not open popup automatically; user must click cart icon
}

// Update cart icon display
function updateCartIcon(count) {
    document.getElementById('cart-count').textContent = count;
    document.querySelector('.cart-options').style.display = count > 0 ? 'flex' : 'none';
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Continue shopping
function continueShopping() {
    document.querySelector('.cart-options').style.display = 'none';
}

// Open cart popup
function openCartPopup() {
    displayCartPopup();
    document.getElementById('cart-popup').style.display = 'block';
}

// Close cart popup
function closeCartPopup() {
    document.getElementById('cart-popup').style.display = 'none';
}

// Display cart in popup
function displayCartPopup() {
    const cartItemsPopup = document.getElementById('cart-items-popup');
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.length) {
        cartItemsPopup.innerHTML = '<p>Your cart is empty!</p>';
        return;
    }

    let totalItems = 0;
    cartItemsPopup.innerHTML = '';
    cart.forEach(item => {
        totalItems += item.quantity;
        cartItemsPopup.innerHTML += `
            <p>${item.name} - $${item.price.toFixed(2)} x 
            <input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1" max="${inventory[item.name] + item.quantity}">
            <button onclick="removeFromCart(${item.id})">Remove</button>
            = $${(item.price * item.quantity).toFixed(2)}</p>
        `;
    });
    updateCartIcon(totalItems);
}

// Update cart quantity from popup
function updateCartQuantity() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalItems = 0;

    quantityInputs.forEach(input => {
        const productId = input.getAttribute('data-id');
        const newQuantity = parseInt(input.value);
        const product = cart.find(item => item.id === productId);
        const productName = product.name;

        if (newQuantity < 1) {
            input.value = 1;
            return;
        }
        if (newQuantity > (inventory[productName] + product.quantity)) {
            input.value = inventory[productName] + product.quantity;
            showNotification(`Limited to ${inventory[productName] + product.quantity} ${productName}(s) available.`);
            return;
        }

        const quantityDifference = newQuantity - product.quantity;
        product.quantity = newQuantity;
        inventory[productName] += quantityDifference; // Adjust inventory based on change
        totalItems += newQuantity;
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateCartIcon(totalItems);
    displayCartPopup();
    updateBuyButtons();
    showNotification('Cart updated successfully!');
}

// Remove item from cart
function removeFromCart(productId) {
    const productName = cart.find(item => item.id === productId).name;
    cart = cart.filter(item => item.id !== productId); // Remove the item from the cart
    inventory[productName] += 1; // Restore inventory for the removed item
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateCartIcon(cart.reduce((sum, item) => sum + item.quantity, 0));
    displayCartPopup(); // Refresh the cart popup
    updateBuyButtons(); // Update buy buttons in case inventory changes
    showNotification(`${productName} removed from cart!`);
}

// Go to checkout
function goToCheckout() {
    closeCartPopup();
    window.location.href = 'checkout.html';
}

// Update all buy buttons based on inventory
function updateBuyButtons() {
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        const productId = button.id.split('-')[2];
        const productName = document.querySelector(`[data-id="${productId}"] h2`).textContent.split(' - ')[0];
        if (inventory[productName] <= 0) {
            button.textContent = 'Sold Out';
            button.classList.add('sold-out');
            button.removeAttribute('onclick');
        } else {
            button.textContent = 'Add to Cart';
            button.classList.remove('sold-out');
            button.setAttribute('onclick', `addToCart(this)`);
        }
    });
}

// Display cart on checkout page
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.length) {
        cartItems.innerHTML = '<p>Your cart is empty!</p>';
        return;
    }

    let subtotal = 0;
    cartItems.innerHTML = '<h2>Your Packs</h2>';
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        cartItems.innerHTML += `
            <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
        `;
    });

    const shippingSelect = document.getElementById('shipping-option');
    const shippingCost = shippingSelect.value === 'express' ? 20.00 : 10.00;
    const total = subtotal + shippingCost;
    cartItems.innerHTML += `<p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>`;
    cartItems.innerHTML += `<p><strong>Shipping: $${shippingCost.toFixed(2)}</strong></p>`;
    cartItems.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;

    shippingSelect.addEventListener('change', () => displayCart());
}

// Handle checkout form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const shippingOption = document.getElementById('shipping-option').value;

    if (!name || !email || !address) {
        showNotification('Please fill in all fields.');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.');
        return;
    }

    showNotification('Processing payment...');

    // Send to backend for payment processing (replace with actual backend integration)
    try {
        const response = await fetch('http://localhost:3000/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                shipping: shippingOption === 'express' ? 20.00 : 10.00,
                customer: { name, email, address }
            })
        });

        const { clientSecret } = await response.json();

        const { error } = await stripe.confirmPayment({
            clientSecret,
            confirmParams: {
                return_url: 'https://slab-stash.com/success.html'
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        // Payment success simulation (replace with real backend logic)
        setTimeout(() => {
            showNotification(`Order confirmed! We’ll ship your ${cart.map(item => item.name).join(', ')} to ${address}.`);
            console.log({
                customer: { name, email, address },
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (shippingOption === 'express' ? 20.00 : 10.00)
            });
            clearCart();
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        showNotification('Error processing payment: ' + error.message);
    }
});

// Clear cart
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateCartIcon(0);
    displayCart();
    displayCartPopup();
}

// Load and display hits data from JSON with fallback
function loadHitsData() {
    // Fallback data in case JSON fails (for testing or errors)
    const fallbackData = [
        { coinName: "1921 Morgan Silver Dollar (MS-65)", chances: 15 },
        { coinName: "Peace Dollar (MS-63)", chances: 18 },
        { coinName: "Gold Eagle Coin (MS-70)", chances: 12 },
        { coinName: "1878-CC Morgan Dollar (MS-64)", chances: 14 },
        { coinName: "1881-S Morgan Dollar (MS-67)", chances: 16 },
        { coinName: "1922 Peace Dollar (MS-62)", chances: 22 },
        { coinName: "1986 American Gold Eagle (MS-69)", chances: 15 },
        { coinName: "1904-O Morgan Dollar (MS-63)", chances: 18 },
        { coinName: "1893-S Morgan Dollar (MS-60)", chances: 10 },
        { coinName: "1934-D Peace Dollar (MS-64)", chances: 20 },
        { coinName: "2000 American Silver Eagle (MS-70)", chances: 28 },
        { coinName: "1857 Flying Eagle Cent (MS-65)", chances: 14 },
        { coinName: "1916-D Mercury Dime (MS-63)", chances: 16 },
        { coinName: "1943 Steel Penny (MS-66)", chances: 100 },
        { coinName: "1955 Double Die Lincoln Penny (MS-64)", chances: 90 },
        { coinName: "1964 Kennedy Half Dollar (MS-65)", chances: 80 },
        { coinName: "1971 Eisenhower Dollar (MS-67)", chances: 70 },
        { coinName: "1982-D Washington Quarter (MS-68)", chances: 60 },
        { coinName: "1995-W American Silver Eagle (MS-69)", chances: 50 },
        { coinName: "2006 American Gold Buffalo (MS-70)", chances: 14 },
        { coinName: "2011 Silver Panda (MS-69)", chances: 23 },
        { coinName: "1849 Liberty Head Quarter Eagle (MS-61)", chances: 14 },
        { coinName: "1861 Confederate Cent (MS-63)", chances: 10 },
        { coinName: "1976 Bicentennial Quarter (MS-66)", chances: 100 },
        { coinName: "2009 Lincoln Bicentennial Penny (MS-67)", chances: 85 }
    ];

    fetch('hits-data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('hits-table');
            const totalChances = data.reduce((sum, item) => sum + item.chances, 0);
            if (totalChances !== 200) {
                console.warn(`Total chances (${totalChances}) do not equal 200. Using fallback data.`);
                showNotification('Error: Total chances must equal 200. Displaying fallback data.');
                displayHitsTable(fallbackData);
            } else {
                displayHitsTable(data);
            }
        })
        .catch(error => {
            console.error('Error loading hits data:', error);
            showNotification('Error loading coin hits. Displaying fallback data.');
            displayHitsTable(fallbackData);
        });
}

// Display hits table with provided data
function displayHitsTable(data) {
    const table = document.getElementById('hits-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Coin Name</th>
                <th>Chances (out of 200)</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(item => `
                <tr>
                    <td>${item.coinName}</td>
                    <td>${item.chances}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

// Add event listener for the "Click Here" link to open the contact form
document.getElementById('open-contact-form')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('contact-form-popup').style.display = 'block';
});