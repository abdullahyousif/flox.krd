// --- Global Elements ---
const mainContent = document.getElementById('main-content');
const signInPage = document.getElementById('sign-in');
const signUpPage = document.getElementById('sign-up');
const mainFooter = document.getElementById('main-footer');
const allAuthNavButtons = document.querySelectorAll('.auth-nav-btn');
const allBackToSiteLinks = document.querySelectorAll('.back-to-site');
const logoLink = document.getElementById('logo-link');
const mainNavItems = document.querySelectorAll('.nav-item'); // Links that go to main content sections
const menuToggle = document.getElementById('menu-toggle');
const mobileNavContainer = document.getElementById('mobile-nav-container');
const desktopNavLinks = document.querySelectorAll('#desktop-nav-links a');
const sections = document.querySelectorAll('#main-content section'); // Target sections within MAIN content ONLY

// --- Function to Switch Views ---
function showView(viewId) {
    // Hide all views first
    mainContent.classList.add('hidden');
    signInPage.classList.remove('active');
    signUpPage.classList.remove('active');
    mainFooter.classList.add('hidden'); // Hide footer on auth pages

    // Show the target view
    if (viewId === 'main') {
        mainContent.classList.remove('hidden');
         mainFooter.classList.remove('hidden');
         // Delay slightly to ensure content is visible before scrolling/highlighting
         setTimeout(setActiveDesktopLink, 50); // Re-check active link
    } else {
        const targetPage = document.getElementById(viewId);
        if (targetPage) {
            targetPage.classList.add('active');
             // Remove active class from main nav items when viewing auth pages
             desktopNavLinks.forEach(link => link.classList.remove('active'));
        }
    }
    window.scrollTo(0, 0); // Scroll to top when switching views
}

// --- Event Listeners for Auth Buttons/Links ---
allAuthNavButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default if it's a link
        const targetView = button.getAttribute('data-target');
        showView(targetView);

        // Close mobile nav if open
         if (mobileNavContainer.classList.contains('active')) {
             mobileNavContainer.classList.remove('active');
             menuToggle.setAttribute('aria-expanded', 'false');
         }
    });
});

// --- Event Listeners for Back to Site Links & Logo ---
[...allBackToSiteLinks, logoLink].forEach(link => {
     link.addEventListener('click', (e) => {
         const isLogo = link === logoLink;
         const href = link.getAttribute('href');
         // Only prevent default and switch view if it's a back link
         // OR the logo link clicked from an auth page
         // OR the logo link clicked when already at the top (hash is #home or empty)
         if (!isLogo || signInPage.classList.contains('active') || signUpPage.classList.contains('active') || href === '#home' || !window.location.hash || window.location.hash === '#') {
             e.preventDefault();
             showView('main');
             // If it was the logo link targeting home, explicitly scroll after showing main
             if (isLogo && href === '#home') {
                 // Need a slight delay for the browser to recalculate layout after view change
                 setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
             }
         }
         // Allow normal scroll behavior for logo/nav links if already on main content area
         // and the link points to a specific section (#about, etc.)
     });
 });


// --- Event Listeners for Main Nav Links ---
mainNavItems.forEach(link => {
    link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        // Check if the target section exists within the main content
        const targetId = href.substring(1); // Get ID without '#'
        const targetSection = mainContent.querySelector(`#${targetId}`);

        // If clicking a main nav link (like 'Home', 'About', etc.)
        if (href.startsWith('#') && targetSection) {
             // Ensure main view is shown if clicking from an auth page
             if (mainContent.classList.contains('hidden')) {
                 event.preventDefault(); // Prevent immediate jump
                 showView('main');
                 // Scroll to the section after the view is switched and content is visible
                 setTimeout(() => {
                     const element = document.getElementById(targetId);
                     if(element) {
                        // Calculate position considering the fixed header
                        const headerOffset = document.getElementById('main-header')?.offsetHeight || 70;
                        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - headerOffset - 10; // Add small buffer

                         window.scrollTo({
                             top: offsetPosition,
                             behavior: 'smooth'
                         });
                     }
                 }, 100); // Delay to allow rendering
            }
            // If main content is already visible, default scroll behavior is fine.
        }

        // Close mobile nav if clicking a link inside it
        if (mobileNavContainer.classList.contains('active')) {
            mobileNavContainer.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});


// --- Mobile Menu Toggle ---
if (menuToggle && mobileNavContainer) {
    menuToggle.addEventListener('click', () => {
        const isActive = mobileNavContainer.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
    });
     // Closing mobile menu on link click is now handled within the mainNavItems listener
}


// --- Active Link Highlighting (Top Nav - Desktop) ---
function setActiveDesktopLink() {
    // Only run if desktop nav is potentially visible and main content is shown
    if (window.innerWidth < 992 || !mainContent || mainContent.classList.contains('hidden')) {
        desktopNavLinks.forEach(link => link.classList.remove('active'));
        return;
    }

    let currentSectionId = '';
    const headerHeight = document.getElementById('main-header')?.offsetHeight || 70;
    // Adjust the offset point: closer to the actual header bottom or slightly below
    const offsetPoint = headerHeight + 20; // 20px below header
    const scrollPosition = window.scrollY;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - offsetPoint;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
           currentSectionId = section.id;
        }
    });

     // Check if scrolled near the bottom of the page - activate last section link
     if ((window.innerHeight + window.scrollY + 50) >= document.body.offsetHeight && sections.length > 0) { // Increased buffer for bottom detection
         currentSectionId = sections[sections.length - 1].id;
     }

    // If no section is detected (likely at the very top before #home offset is met)
     if (currentSectionId === '' && sections.length > 0 && scrollPosition < sections[0].offsetTop - offsetPoint) {
          currentSectionId = 'home';
     } else if (currentSectionId === '' && sections.length === 0) {
         // Fallback if there are no sections in main for some reason
         currentSectionId = 'home';
     }

    desktopNavLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

if (desktopNavLinks.length > 0 && sections.length > 0) {
     window.addEventListener('scroll', setActiveDesktopLink, { passive: true });
     window.addEventListener('load', () => {
         // Ensure main view is shown on load, unless hash points to auth page
         if (window.location.hash === '#sign-in') {
            showView('sign-in');
         } else if (window.location.hash === '#sign-up') {
            showView('sign-up');
         } else {
            // If there's a valid section hash, scroll to it after showing main
            const hash = window.location.hash;
            showView('main'); // Shows main content and calls initial setActiveDesktopLink
            if (hash && hash !== '#home') {
                setTimeout(() => {
                     const targetId = hash.substring(1);
                     const element = document.getElementById(targetId);
                     if(element) {
                         const headerOffset = document.getElementById('main-header')?.offsetHeight || 70;
                         const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                         const offsetPosition = elementPosition - headerOffset - 10;
                          window.scrollTo({ top: offsetPosition, behavior: 'auto' }); // Use auto for initial load scroll
                     }
                }, 150); // Slightly longer delay on load
            }
         }
     });
     window.addEventListener('resize', setActiveDesktopLink);
}


// --- Placeholder Form Submissions ---
function handlePlaceholderFormSubmit(formId, messageId) {
    const form = document.getElementById(formId);
    const messageDiv = document.getElementById(messageId);
    if (form && messageDiv) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            messageDiv.textContent = 'Processing...';
            messageDiv.className = 'form-message'; // Reset class
            setTimeout(() => {
                if (formId === 'sign-in-form') messageDiv.textContent = 'Sign in successful! (Placeholder)';
                else if (formId === 'sign-up-form') messageDiv.textContent = 'Account created! (Placeholder)';
                else messageDiv.textContent = 'Thank you! Message received. (Placeholder)';
                messageDiv.classList.add('success');
                form.reset();
            }, 1200);
        });
    }
}
handlePlaceholderFormSubmit('sign-in-form', 'signin-form-message');
handlePlaceholderFormSubmit('sign-up-form', 'signup-form-message');
handlePlaceholderFormSubmit('contact-form-main', 'contact-form-message');

// --- Set Current Year in Footer ---
const footerYearSpan = document.getElementById('footer-year');
if (footerYearSpan) footerYearSpan.textContent = new Date().getFullYear();

// --- Basic Calendar Interaction Placeholder ---
const calendarDays = document.querySelectorAll('.calendar-grid .day-number:not(.other-month)');
calendarDays.forEach(day => {
    day.addEventListener('click', () => {
        alert(`Clicked on day ${day.textContent}. (Placeholder)`);
    });
});