// Show notification
function showNotification(message) {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Fetch stock data
async function fetchStock() {
    try {
        const response = await fetch('stock.json');
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error fetching stock:', error);
        return [];
    }
}

// Simulate stock update (client-side only for demo)
async function updateStock(productId, quantity) {
    const products = await fetchStock();
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock = Math.max(0, product.stock - quantity); // Ensure stock doesn't go negative
        console.log(`Updated stock for ${product.name}: ${product.stock}`);
    }
    return products;
}

// Render product cards
async function renderProducts() {
    const products = await fetchStock();
    const grid = document.getElementById('product-grid');
    grid.innerHTML = ''; // Clear existing content

    // Only render the product with id === 1 ("Basic Pack")
    const firstProduct = products.find(p => p.id === 1);
    if (firstProduct) {
        const stock = firstProduct.stock;
        const isSoldOut = stock <= 0; // True, since stock is 0

        const productHTML = `
            <div class="product-icon ${isSoldOut ? 'sold-out' : ''}" data-id="${firstProduct.id}">
                <img src="images/${firstProduct.name.toLowerCase().replace(' ', '-')}-icon.jpg" alt="${firstProduct.name} Icon">
                <h2>${firstProduct.name} - $299</h2>
                <p>${isSoldOut ? 'Sold Out!' : `Available: ${stock}`}</p>
                ${isSoldOut ? '<button class="sold-out-btn">Sold Out</button>' : `
                    <style>
                        .pp-B4BU4HLTV58FS {
                            text-align: center;
                            border: none;
                            border-radius: 0.25rem;
                            padding: 0 1.75rem;
                            height: 2.25rem;
                            font-weight: bold;
                            background-color: #FFD140;
                            color: #000000;
                            font-family: "Helvetica Neue", Arial, sans-serif;
                            font-size: 1rem;
                            line-height: 1.25rem;
                            cursor: pointer;
                            width: 100%;
                            box-sizing: border-box;
                        }
                        .paypal-form-container {
                            width: 65%;
                            margin: 0 auto;
                            text-align: center;
                        }
                        .paypal-form-container form {
                            width: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 0.3rem;
                        }
                        .paypal-form-container img.credit-cards {
                            width: 110px;
                            max-width: 110px;
                            height: auto;
                        }
                        .paypal-form-container section {
                            width: 100%;
                            text-align: center;
                            font-size: 0.875rem;
                        }
                        .paypal-form-container section img {
                            height: 0.75rem;
                            vertical-align: middle;
                        }
                        .quantity-selector {
                            margin-bottom: 10px;
                            font-family: 'Roboto', sans-serif;
                            font-size: 14px;
                            color: #2E8B57;
                        }
                        .quantity-selector select {
                            padding: 5px;
                            border: 2px solid #000080;
                            border-radius: 5px;
                            font-size: 14px;
                        }
                    </style>
                    <div class="paypal-form-container">
                        <div class="quantity-selector">
                            <label for="quantity-${firstProduct.id}">Quantity: </label>
                            <select id="quantity-${firstProduct.id}">
                                ${Array.from({ length: Math.min(stock, 5) }, (_, i) => i + 1).map(q => `<option value="${q}">${q}</option>`).join('')}
                            </select>
                        </div>
                        <form onsubmit="handlePurchase(event, ${firstProduct.id})">
                            <input class="pp-B4BU4HLTV58FS" type="submit" value="Buy Now" />
                            <img class="credit-cards" src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" />
                            <section>Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" /></section>
                        </form>
                    </div>
                `}
            </div>
        `;

        grid.insertAdjacentHTML('beforeend', productHTML);
    }
}

// Handle purchase with quantity
function handlePurchase(event, productId) {
    event.preventDefault();
    const quantitySelect = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantitySelect.value);

    updateStock(productId, quantity).then(() => {
        renderProducts(); // Re-render to update stock display
        showNotification(`Purchased ${quantity} ${quantity === 1 ? 'item' : 'items'} successfully!`);
        window.open('https://www.paypal.com/ncp/payment/B4BU4HLTV58FS', '_blank');
    });
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();

    // Contact page logic
    if (window.location.pathname === '/contact.html' || window.location.pathname === '/contact') {
        const contactPopup = document.getElementById('contact-form-popup');
        if (contactPopup) contactPopup.style.display = 'block';
    }

    // Sneak Peek button logic for index.html
    const peekButton = document.getElementById('peek-button');
    const peekImage = document.getElementById('peek-image');
    if (peekButton && peekImage) {
        peekButton.addEventListener('click', function() {
            peekImage.style.display = 'block';
        });
    }
});