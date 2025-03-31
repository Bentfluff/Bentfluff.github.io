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
        console.log('Fetched stock.json:', JSON.stringify(data)); // Debug log
        return data.products;
    } catch (error) {
        console.error('Error fetching stock:', error);
        // Fallback to a default product if fetch fails
        return [{
            id: 1,
            name: "Basic Pack",
            price: 299.99,
            stock: 0
        }];
    }
}

// Simulate stock update (client-side only for demo)
async function updateStock(productId, quantity) {
    const products = await fetchStock();
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock = Math.max(0, product.stock - quantity);
        console.log(`Updated stock for ${product.name}: ${product.stock}`); // Debug log
    }
    return products;
}

// Render product cards (only one item)
async function renderProducts() {
    const products = await fetchStock();
    const grid = document.getElementById('product-grid');
    if (!grid) return; // Only render if on products page
    grid.innerHTML = ''; // Clear existing content

    // Only render the first product (single item for sale)
    const product = products[0];
    if (product) {
        const stock = product.stock; // Directly use stock from JSON
        console.log('Rendering product with stock:', stock); // Debug log
        const price = product.price !== undefined ? product.price : 299.99;
        const isSoldOut = stock <= 0;

        const productHTML = `
            <div class="product-icon ${isSoldOut ? 'sold-out' : ''}" data-id="${product.id}">
                <img src="images/${product.name.toLowerCase().replace(' ', '-')}-icon.jpg" alt="${product.name} Icon">
                <h2>${product.name} - $${price.toFixed(2)}</h2>
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
                            <label for="quantity-${product.id}">Quantity: </label>
                            <select id="quantity-${product.id}">
                                ${Array.from({ length: Math.min(stock, 5) }, (_, i) => i + 1).map(q => `<option value="${q}">${q}</option>`).join('')}
                            </select>
                        </div>
                        <form onsubmit="handlePurchase(event, ${product.id})">
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
    if (document.getElementById('product-grid')) {
        renderProducts();
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