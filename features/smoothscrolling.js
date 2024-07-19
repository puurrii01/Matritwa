
document.addEventListener("DOMContentLoaded", function() {
    // Smooth scroll on the same page
    const scrollLinks = document.querySelectorAll(".scroll-link");

    scrollLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            if (this.pathname === window.location.pathname) {
                event.preventDefault();
                const targetId = this.getAttribute("href").split("#")[1];
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });

    // Smooth scroll if the URL has a hash on page load
    const hash = window.location.hash;
    if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    }
    const externalLinks = document.querySelectorAll(".scroll-link");
    
    externalLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            if (this.pathname !== window.location.pathname) {
                event.preventDefault();
                const targetUrl = this.getAttribute("href");
                window.location.href = targetUrl;
            }
        });
    });
});

