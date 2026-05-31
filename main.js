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

    const lat = 54.816665;
    const lng = -1.831994;

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


// Reviews carousel (scroll-snap track + arrow buttons + dots)
(function () {
    const track = document.getElementById("reviewsTrack");
    if (!track) return;
    const slides = Array.from(track.querySelectorAll(".reviewSlide"));
    if (!slides.length) return;
    const prev = document.getElementById("revPrev");
    const next = document.getElementById("revNext");
    const dotsWrap = document.getElementById("reviewsDots");
    const gap = 24; // matches gap-6

    const step = () => slides[0].getBoundingClientRect().width + gap;
    const perView = () => Math.max(1, Math.round(track.clientWidth / step()));
    const pages = () => Math.max(1, slides.length - perView() + 1);
    const activeIndex = () => Math.round(track.scrollLeft / step());

    const sync = () => {
        if (!dotsWrap) return;
        const a = activeIndex();
        Array.from(dotsWrap.children).forEach((d, i) => {
            d.className = "h-2 rounded-full transition-all duration-300 " +
                (i === a ? "w-5 bg-secondary/70" : "w-2 bg-secondary/25");
        });
    };
    // Autoplay: advance every 10s, loop at the end. Only runs while the section
    // is on screen (skipped for reduced-motion), so visitors always start at card 1.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = null;
    let visible = false;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const goNext = () => {
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
        else track.scrollBy({ left: step(), behavior: "smooth" });
    };
    const start = () => { if (reduce || !visible) return; stop(); timer = setInterval(goNext, 10000); };

    const buildDots = () => {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        for (let i = 0; i < pages(); i++) {
            const d = document.createElement("button");
            d.type = "button";
            d.setAttribute("aria-label", "Go to review " + (i + 1));
            d.addEventListener("click", () => { track.scrollTo({ left: i * step(), behavior: "smooth" }); start(); });
            dotsWrap.appendChild(d);
        }
        sync();
    };

    if (prev) prev.addEventListener("click", () => { track.scrollBy({ left: -step(), behavior: "smooth" }); start(); });
    if (next) next.addEventListener("click", () => { goNext(); start(); });

    // Pause while the visitor is interacting
    const root = document.getElementById("reviews") || track;
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });

    let st;
    track.addEventListener("scroll", () => { clearTimeout(st); st = setTimeout(sync, 80); });
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(buildDots, 150); });

    buildDots();

    // Only autoplay once the reviews are scrolled into view; pause when they leave
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                visible = e.isIntersecting;
                if (visible) start(); else stop();
            });
        }, { threshold: 0.35 });
        io.observe(root);
    } else {
        visible = true;
        start();
    }
})();


const openPdfButton = document.getElementById("openPdfButton");

// Add a click event listener to the button
openPdfButton.addEventListener("click", function() {
    // Replace 'your-pdf-file.pdf' with the path to your PDF file
    const pdfUrl = 'Privacy Notice.pdf';

    // Open the PDF in a new tab or window
    window.open(pdfUrl, '_blank');
});