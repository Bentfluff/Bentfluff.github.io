let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Clean up cart to ensure only one Basic Pack exists
    cart = cart.filter(item => item.name === "Basic Pack" && item.quantity === 1);
    if (cart.length > 1) {
        cart = [cart[0]]; // Keep only the first instance
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
});

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

    const shipping = 10.00; // Fixed shipping fee
    const total = subtotal + shipping;
    cartItems.innerHTML += `<p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>`;
    cartItems.innerHTML += `<p><strong>Shipping: $${shipping.toFixed(2)}</strong></p>`;
    cartItems.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;

    if (!name || !email || !address) {
        showNotification('Please fill in all fields.');
        return;
    }

    showNotification('Processing payment...');
    setTimeout(() => {
        showNotification(`Order confirmed! We’ll ship your ${cart.map(item => item.name).join(', ')} to ${address}.`);
        console.log({
            customer: { name, email, address },
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 10.00 // Include shipping
        });
        clearCart();
        window.location.href = 'index.html';
    }, 2000);
});

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon(0);
    displayCart();
}

function updateCartIcon(count) {
    document.getElementById('cart-count').textContent = count;
}
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Clean up cart to ensure only one instance per product exists with correct quantities
    cart = cart.reduce((unique, item) => {
        const existing = unique.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity; // Combine quantities for duplicates
        } else {
            unique.push(item);
        }
        return unique;
    }, []);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
});

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
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        cartItems.innerHTML += `
            <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</p>
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

    // Simulate Stripe payment (replace with actual backend integration)
    try {
        const response = await fetch('/create-payment-intent', {
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

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon(0);
    displayCart();
}

function updateCartIcon(count) {
    document.getElementById('cart-count').textContent = count;
}