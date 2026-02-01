// Advanced Scroll Effects System
class ScrollEffectsManager {
    constructor() {
        this.scrollY = 0;
        this.ticking = false;
        this.elements = {
            hero: document.querySelector('.hero'),
            heroVisual: document.querySelector('.hero-visual'),
            phoneMockups: document.querySelectorAll('.phone-mockup'),
            nexusCanvas: document.querySelector('.nexus-canvas'),
            priceCards: document.querySelectorAll('.price-card'),
            compCards: document.querySelectorAll('.comp-card'),
            sectionHeaders: document.querySelectorAll('.section-header'),
            brandLogos: document.querySelectorAll('.brand-logo')
        };

        this.init();
    }

    init() {
        // Scroll listener
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            this.requestTick();
        }, { passive: true });

        // Initial update
        this.update();
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.update());
            this.ticking = true;
        }
    }

    update() {
        this.ticking = false;

        // 1. Parallax Direccional - Hero Mockups
        this.applyParallax();

        // 2. Zoom Gradual - Nexus Background
        this.applyNexusZoom();

        // 3. Scroll-Sync - Price Cards & Comparison Cards
        this.applyScrollSync();

        // 4. Smart Sticky - Section Headers
        this.applyStickyHeaders();
    }

    // Parallax effect for hero mockups
    applyParallax() {
        if (!this.elements.heroVisual) return;

        const heroHeight = this.elements.hero?.offsetHeight || 0;
        const scrollProgress = Math.min(this.scrollY / heroHeight, 1);

        // Main visual container - subtle movement
        const translateY = scrollProgress * 100;
        this.elements.heroVisual.style.transform = `translateY(${translateY}px)`;

        // Individual phone mockups - different speeds for depth
        this.elements.phoneMockups.forEach((phone, index) => {
            const speed = index === 0 ? 0.5 : 0.3; // Primary phone slower
            const phoneTranslate = scrollProgress * 150 * speed;
            const rotation = scrollProgress * 5 * (index === 0 ? 1 : -1);
            phone.style.transform = `translateY(${phoneTranslate}px) rotate(${rotation}deg)`;
        });
    }

    // Zoom effect for Nexus background
    applyNexusZoom() {
        if (!this.elements.nexusCanvas) return;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = this.scrollY / maxScroll;

        // Subtle zoom from 1 to 1.2
        const scale = 1 + (scrollProgress * 0.2);
        const opacity = 1 - (scrollProgress * 0.3); // Fade out gradually

        this.elements.nexusCanvas.style.transform = `scale(${scale})`;
        this.elements.nexusCanvas.style.opacity = opacity;
    }

    // Scroll-sync animations for cards
    applyScrollSync() {
        // Price Cards
        this.elements.priceCards.forEach((card, index) => {
            const progress = this.getElementScrollProgress(card);

            if (progress > 0 && progress < 1) {
                // Scale and opacity based on scroll position
                const scale = 0.9 + (progress * 0.1);
                const opacity = Math.max(0.3, progress);
                const translateY = (1 - progress) * 50;

                card.style.transform = `translateY(${translateY}px) scale(${scale})`;
                card.style.opacity = opacity;

                // Stagger effect
                card.style.transitionDelay = `${index * 0.1}s`;
            }
        });

        // Comparison Cards
        this.elements.compCards.forEach((card, index) => {
            const progress = this.getElementScrollProgress(card);

            if (progress > 0 && progress < 1) {
                const translateX = (1 - progress) * (index === 0 ? -50 : 50);
                const opacity = Math.max(0.3, progress);

                card.style.transform = `translateX(${translateX}px)`;
                card.style.opacity = opacity;
            }
        });

        // Brand Logos - Wave effect
        this.elements.brandLogos.forEach((logo, index) => {
            const container = logo.closest('.brand-item');
            if (!container) return;

            const progress = this.getElementScrollProgress(container);

            if (progress > 0 && progress < 1) {
                const delay = index * 0.05;
                const waveProgress = Math.max(0, Math.min(1, (progress - delay) * 1.5));
                const translateY = (1 - waveProgress) * 30;
                const scale = 0.8 + (waveProgress * 0.2);

                container.style.transform = `translateY(${translateY}px) scale(${scale})`;
                container.style.opacity = waveProgress;
            }
        });
    }

    // Smart sticky headers
    applyStickyHeaders() {
        this.elements.sectionHeaders.forEach(header => {
            const section = header.closest('section');
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const windowHeight = window.innerHeight;

            // Sticky range: when section is in view
            if (sectionTop < windowHeight * 0.2 && sectionBottom > windowHeight * 0.2) {
                const progress = Math.max(0, Math.min(1, (windowHeight * 0.2 - sectionTop) / 100));

                header.style.position = 'sticky';
                header.style.top = '100px';
                header.style.zIndex = '10';
                header.style.transform = `scale(${1 - progress * 0.1})`;
                header.style.opacity = 1 - (progress * 0.3);
            } else {
                header.style.position = 'relative';
                header.style.transform = 'scale(1)';
                header.style.opacity = '1';
            }
        });
    }

    // Helper: Calculate scroll progress for an element (0 to 1)
    getElementScrollProgress(element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + this.scrollY;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Start animating when element enters viewport
        const startScroll = elementTop - windowHeight;
        const endScroll = elementTop + elementHeight;
        const scrollRange = endScroll - startScroll;

        const progress = (this.scrollY - startScroll) / scrollRange;
        return Math.max(0, Math.min(1, progress));
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScrollEffectsManager();
    });
} else {
    new ScrollEffectsManager();
}
