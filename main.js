// Intro animation: lock scroll while the title writes on, then crossfade away
(function () {
    const intro = document.getElementById('intro');
    if (!intro) { document.body.classList.add('intro-ready'); return; }

    const finish = function () {
        document.documentElement.style.overflow = '';
        if (intro.parentNode) intro.remove();
        // Trigger the hero elements to reveal in around the title
        document.body.classList.add('intro-ready');
    };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip the intro for reduced-motion users, or via ?nointro (handy for deep-linking/QA)
    if (prefersReduced || window.location.search.indexOf('nointro') !== -1) {
        finish();
        return;
    }

    document.documentElement.style.overflow = 'hidden';

    // Writing finishes ~1.4s in; hold briefly, then crossfade the white screen out.
    setTimeout(function () {
        intro.classList.add('intro-hide');
        setTimeout(finish, 900); // remove after the 0.8s fade completes
    }, 1900);
})();


window.addEventListener('scroll', function() {
    let page = window.scrollY > 0
    let nav = document.querySelector('#navbar');
    if (nav) nav.classList.toggle('nav-active', page)
});



// Contact map (Leaflet + free CARTO/OpenStreetMap tiles, no API key)
(function () {
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    const lat = 54.81768317761617;
    const lng = -1.8186773671425782;

    const map = L.map(mapEl, {
        scrollWheelZoom: false, // don't hijack page scroll
        zoomControl: true,
    }).setView([lat, lng], 14);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Custom dark teardrop pin
    const pin = L.divIcon({
        className: "wpl-pin",
        html: '<svg width="34" height="46" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.37 18.63 0 12 0z" fill="#1C1715"/><circle cx="12" cy="12" r="4.4" fill="#fff"/></svg>',
        iconSize: [34, 46],
        iconAnchor: [17, 46],
    });
    L.marker([lat, lng], { icon: pin }).addTo(map);

    // Ensure tiles lay out correctly once the container has its final size
    setTimeout(function () { map.invalidateSize(); }, 250);
})();

// Scroll-reveal: fade + rise each .scroll element in as it enters the viewport
(function () {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // leave everything visible; no motion

    // Hide first (in JS, so content stays visible if scripts fail), then reveal on enter
    gsap.set(".scroll", { opacity: 0, y: 40 });

    ScrollTrigger.batch(".scroll", {
        start: "top 88%",
        once: true, // reveal once, don't re-hide on scroll back
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.12,
            overwrite: true,
        }),
    });

    // Recalculate positions once images / the map have loaded
    window.addEventListener("load", () => ScrollTrigger.refresh());
})();


// Mobile hamburger / kebab menu
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
    const icon = menuToggle.querySelector("i");

    const setMenu = (open) => {
        mobileMenu.classList.toggle("open", open);
        menuToggle.setAttribute("aria-expanded", open);
        if (icon) icon.className = open ? "fa fa-times" : "fa fa-bars";
    };

    menuToggle.addEventListener("click", function () {
        setMenu(!mobileMenu.classList.contains("open"));
    });

    // Close the menu after tapping any link inside it
    mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            setMenu(false);
        });
    });
}


const openPdfButton = document.getElementById("openPdfButton");

// Add a click event listener to the button
openPdfButton.addEventListener("click", function() {
    // Replace 'your-pdf-file.pdf' with the path to your PDF file
    const pdfUrl = 'Privacy Notice.pdf';

    // Open the PDF in a new tab or window
    window.open(pdfUrl, '_blank');
});