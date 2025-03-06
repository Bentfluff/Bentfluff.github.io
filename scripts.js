// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let inventory = {
    'Basic Pack': 0, // Out of stock
    'Premium Pack': 0, // Out of stock
    'Limited Edition Pack': 0 // Out of stock
};

// Load Stripe with test key (replace with your real test key later)
const stripe = Stripe('pk_test_51J3XJ2KZm9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9x9');

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
    cartElement.addEventListener('click', openCheckoutScreen);

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
        productDiv.className = `product-icon ${product.inventory === 0 ? 'coming-soon' : ''}`;
        productDiv.setAttribute('data-id', product.id);
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name} Icon">
            <h2>${product.name} - $${product.price.toFixed(2)}</h2>
            <p>Rip into the ${product.name} for $${product.price.toFixed(2)} and uncover a mystery graded coin—silver or gold, the thrill is yours!</p>
            <button class="${product.inventory === 0 ? 'coming-soon-btn' : 'buy-btn'}" 
                    ${product.inventory === 0 ? '' : `id="buy-btn-${product.id}" onclick="addToCart(this)"`}>
                ${product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        `;
        productGrid.appendChild(productDiv);
    });
}

// Add item to cart
function addToCart(productElement) {
    const productId = productElement.getAttribute('data-id');
    const productName = productElement.parentElement.querySelector('h2').textContent.split(' - ')[0];
    const productPrice = parseFloat(productElement.parentElement.querySelector('h2').textContent.split(' - ')[1].replace('$', ''));

    if (inventory[productName] <= 0) {
        showNotification("Sorry, this pack is out of stock.");
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
    inventory[productName] -= 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateCartIcon(cart.reduce((sum, item) => sum + item.quantity, 0));
    showNotification(`${productName} added to cart!`);
    updateBuyButtons();
}

// Update cart icon display
function updateCartIcon(count) {
    document.getElementById('cart-count').textContent = count;
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Open all-in-one checkout screen
function openCheckoutScreen() {
    const checkoutPopup = document.createElement('div');
    checkoutPopup.id = 'checkout-popup';
    checkoutPopup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; z-index: 1000;';
    
    let cartHtml = '<h2>Checkout</h2>';
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.length) {
        cartHtml += '<p>Your cart is empty!</p>';
    } else {
        let subtotal = 0;
        cartHtml += '<div id="cart-items">';
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            cartHtml += `
                <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
            `;
        });
        const shippingCost = 10.00;
        const total = subtotal + shippingCost;
        cartHtml += `
            <p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
            <p><strong>Shipping: $${shippingCost.toFixed(2)}</strong></p>
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
        </div>
        <form id="checkout-form">
            <label>Name: <input type="text" id="name" required></label><br>
            <label>Email: <input type="email" id="email" required></label><br>
            <label>Address: <textarea id="address" required></textarea></label><br>
            <div id="card-element"></div>
            <button type="submit">Pay Now</button>
            <button type="button" onclick="closeCheckoutScreen()">Close</button>
        </form>`;
    }
    
    checkoutPopup.innerHTML = cartHtml;
    document.body.appendChild(checkoutPopup);

    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;

        let stockAvailable = true;
        cart.forEach(item => {
            if (inventory[item.name] < item.quantity) {
                stockAvailable = false;
                showNotification(`${item.name} is out of stock.`);
            }
        });

        if (!stockAvailable) return;

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
            billing_details: { name, email }
        });

        if (error) {
            showNotification(`Payment failed: ${error.message}`);
        } else {
            showNotification('Payment confirmed! Order placed.');
            cart.forEach(item => {
                inventory[item.name] -= item.quantity;
            });
            clearCart();
            closeCheckoutScreen();
        }
    });
}

// Close checkout screen
function closeCheckoutScreen() {
    const checkoutPopup = document.getElementById('checkout-popup');
    if (checkoutPopup) checkoutPopup.remove();
}

// Clear cart
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateCartIcon(0);
}

// Load and display hits data
function loadHitsData() {
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

// Display hits table
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

// Open contact form
document.getElementById('open-contact-form')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('contact-form-popup').style.display = 'block';
});

// Handle contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: data
        });
        const result = await response.json();
        if (result.success) {
            form.reset();
            document.getElementById('contact-form-popup').style.display = 'none';
            showNotification('Message sent successfully!');
        } else {
            console.error('Submission failed:', result.message);
            showNotification('Failed to send message. Check your key or try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Something went wrong. Please try again.');
    }
});