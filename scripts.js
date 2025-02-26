// Show Notification Function
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); // Disappears after 3 seconds
}

// Navigation Humor
document.querySelectorAll('.fun-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        let message;
        switch (href) {
            case 'index.html': message = "Back to the coin cave! Did you bring snacks?"; break;
            case 'about.html': message = "Meet the stash squad—spoiler: we’re coin nerds!"; break;
            case 'coins.html': message = "Slab time! Hope you’ve got a coin flipside ready!"; break;
            case 'contact.html': message = "Yelling ‘HELLO’ into the coin void—echo back soon!"; break;
        }
        showSpinner();
        setTimeout(() => {
            showNotification(message);
            hideSpinner();
            window.location.href = href;
        }, 1000);
    });
});

// Button Humor with Fake Checkout
document.querySelectorAll('.fun-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        if (button.id === 'start-stash') {
            startCheckout();
        } else if (button.closest('#contact-form')) {
            submitContactForm();
        } else {
            const messages = [
                "Grabbing a slab! Did it just jingle in your pocket?",
                "Coin chaos incoming! Hide your piggy bank!",
                "Slab secured! Now, where’s my treasure map?",
                "Whoops, almost dropped a dime—off we go!"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showSpinner();
            setTimeout(() => {
                showNotification(randomMessage);
                hideSpinner();
                window.location.href = button.getAttribute('href');
            }, 1000);
        }
    });
});

// Coin Card Previews
document.querySelectorAll('.coin-card').forEach(card => {
    const coinName = card.getAttribute('data-coin');
    const info = card.querySelector('.coin-info');
    const previews = {
        'Silver Rush': 'Could be a shiny 1964 Kennedy Half!',
        'Gold Fever': 'Maybe a 1907 Gold Eagle—fingers crossed!',
        'Platinum Blitz': 'Dreamin’ of a rare 2008 Platinum Proof?'
    };
    info.textContent = previews[coinName] || 'Mystery awaits!';
});

// Fake Checkout Flow (Still Uses Prompts for Input)
function startCheckout() {
    showSpinner();
    setTimeout(() => {
        hideSpinner();
        const slabChoice = prompt("Pick your slab, treasure hunter!\n1. Silver Rush\n2. Gold Fever\n3. Platinum Blitz\n(Enter 1, 2, or 3)");
        if (slabChoice && ['1', '2', '3'].includes(slabChoice)) {
            showSpinner();
            setTimeout(() => {
                hideSpinner();
                const name = prompt("Who’s snagging this slab? (Your name)");
                if (name) {
                    showSpinner();
                    setTimeout(() => {
                        hideSpinner();
                        showNotification(`Cha-ching! ${name}, your ${slabChoice === '1' ? 'Silver Rush' : slabChoice === '2' ? 'Gold Fever' : 'Platinum Blitz'} slab is reserved—well, in spirit!`);
                    }, 1000);
                }
            }, 1000);
        } else {
            showNotification("No slab, no glory! Try again, coin champ.");
        }
    }, 1000);
}

// Fake Contact Form Submission
function submitContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showSpinner();
        setTimeout(() => {
            hideSpinner();
            showNotification("Message launched into the coin cosmos! We’ll catch it soon—thanks for the vibes!");
            form.reset();
        }, 1000);
    });
}

// Spinner Functions
function showSpinner() {
    let spinner = document.querySelector('.spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.className = 'spinner';
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'block';
}

function hideSpinner() {
    const spinner = document.querySelector('.spinner');
    if (spinner) spinner.style.display = 'none';
}