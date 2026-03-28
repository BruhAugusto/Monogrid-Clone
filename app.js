// Hide preloader on load
window.addEventListener('load', () => {
    const preloader = document.getElementById('app-loading-container');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 500); // Small delay to let Three.js compile
    }
});

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LENIS SMOOTH SCROLL ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // lenis.on('scroll', (e) => {
    //     console.log(e);
    // });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // --- 2. CUSTOM CURSOR ---
    const cursor = document.querySelector('.custom-cursor');
    const hoverElements = document.querySelectorAll('a, button, input, textarea, .fw-item, .w-item');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Appear on first move
        if (cursor.style.opacity == 0 || cursor.style.opacity === '') {
            cursor.style.opacity = 1;
        }
    });

    // Smooth cursor follow
    gsap.ticker.add(() => {
        const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
        cursorX += (mouseX - cursorX) * dt;
        cursorY += (mouseY - cursorY) * dt;
        
        cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
    });

    // Hover effects
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            
            // If it has data-cursor-text, show text inside cursor
            if(el.dataset.cursorText) {
                cursor.innerHTML = el.dataset.cursorText;
            }
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursor.innerHTML = '';
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = 0;
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = 1;
    });

    // --- 2.5 FLOATING IMAGE REVEAL (WORKS PAGE) ---
    const revealContainer = document.querySelector('.hover-reveal-container');
    const listItems = document.querySelectorAll('.works-list-item');
    
    if (revealContainer && listItems.length > 0) {
        let revealX = 0;
        let revealY = 0;
        
        // Smooth follow for the image container (slightly lagged behind cursor)
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.1, gsap.ticker.deltaRatio());
            revealX += (mouseX - revealX) * dt;
            revealY += (mouseY - revealY) * dt;
            
            gsap.set(revealContainer, {
                x: revealX,
                y: revealY
            });
        });

        listItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const imgUrl = item.dataset.image;
                if(imgUrl) {
                    revealContainer.innerHTML = `<img src="${imgUrl}" class="hover-reveal-image" />`;
                    
                    // Animate container in
                    gsap.killTweensOf(revealContainer);
                    gsap.to(revealContainer, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        ease: "power3.out"
                    });
                }
            });

            item.addEventListener('mouseleave', () => {
                // Animate container out
                gsap.killTweensOf(revealContainer);
                gsap.to(revealContainer, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    ease: "power2.in"
                });
            });
            
            // Mouse move internal parallax effect for the image inside container
            item.addEventListener('mousemove', (e) => {
                const img = revealContainer.querySelector('img');
                if(img) {
                    // Slight move opposite to mouse direction inside the container
                    const targetX = (e.clientX - (window.innerWidth / 2)) * 0.05;
                    const targetY = (e.clientY - (window.innerHeight / 2)) * 0.05;
                    gsap.to(img, {
                        x: targetX,
                        y: targetY,
                        duration: 0.5
                    });
                }
            });
        });
    }

    // --- 2.8 WORKS SPLIT PAGE LOGIC ---
    const wItems = document.querySelectorAll('.w-item');
    const wPreviewImg = document.getElementById('w-preview-img');

    if(wItems.length > 0 && wPreviewImg) {
        wItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                // Remove active class from all
                wItems.forEach(i => i.classList.remove('active'));
                
                // Add active to current
                item.classList.add('active');
                
                // Change image with a fade effect
                const newImg = item.dataset.img;
                
                gsap.to(wPreviewImg, {
                    opacity: 0.5,
                    duration: 0.2,
                    onComplete: () => {
                        wPreviewImg.src = newImg;
                        gsap.to(wPreviewImg, {
                            opacity: 1,
                            duration: 0.2
                        });
                    }
                });
            });
        });
    }

    // --- 3. GSAP ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // Hero title split text animation (simplified)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // Basic entry animation for hero
        gsap.fromTo(heroTitle, 
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", delay: 0.5 }
        );
        gsap.fromTo('.hero-subtitle', 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", delay: 0.8 }
        );
    }

    // Parallax hero text on scroll
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(heroContent, {
            yPercent: 50,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // Reveal Featured Work Items on Scroll
    const fwItems = document.querySelectorAll('.fw-item');
    if (fwItems.length > 0) {
        fwItems.forEach((item, index) => {
            gsap.fromTo(item, 
                { y: 50, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%", // Trigger when top of element hits 85% of viewport
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Parallax effect on featured work images
        const fwImages = document.querySelectorAll('.fw-image img');
        fwImages.forEach(img => {
            gsap.to(img, {
                yPercent: 15, // Moves image slightly downwards while scrolling
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    }

    // Update ScrollTrigger when Lenis scrolls
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0);
});
