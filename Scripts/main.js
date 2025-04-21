// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav ul');
    
    hamburgerButton.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        hamburgerButton.setAttribute('aria-expanded', isExpanded);
        
        // Toggle between hamburger and close icons
        const icon = hamburgerButton.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.main-nav') && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            const icon = hamburgerButton.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            const icon = hamburgerButton.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}); 