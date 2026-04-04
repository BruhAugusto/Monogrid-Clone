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

        // Contact Background Interactive Follow
        const contactBg = document.querySelector('.contact-bg-green');
        if (contactBg) {
            const x = (cursorX / window.innerWidth) * 100;
            const y = (cursorY / window.innerHeight) * 100;
            contactBg.style.setProperty('--mouse-x', `${x.toFixed(2)}%`);
            contactBg.style.setProperty('--mouse-y', `${y.toFixed(2)}%`);
        }
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

    // --- 2.8 WORKS SPLIT PAGE LOGIC (Video + Image preview) ---
    const wItems = document.querySelectorAll('.w-item');
    const wPreviewImg = document.getElementById('w-preview-img');
    const wPreviewVideo = document.getElementById('w-preview-video');
    const wPreviewLabel = document.getElementById('w-preview-label');
    const wPreviewType = document.getElementById('w-preview-type');
    const wSearch = document.querySelector('.wt-search');

    // Helper: load a preview without animation (instant)
    function loadPreviewInstant(item) {
        const src = item.dataset.img;
        const type = item.dataset.type;
        const label = item.querySelector('.w-item-title')?.textContent || '';
        const tag = item.querySelector('.w-item-tag')?.textContent || '';

        if (type === 'video' && wPreviewVideo) {
            if (wPreviewImg) { wPreviewImg.style.display = 'none'; wPreviewImg.style.opacity = 0; }
            wPreviewVideo.style.display = 'block';
            wPreviewVideo.style.opacity = 1;
            wPreviewVideo.src = src;
            wPreviewVideo.load();
            wPreviewVideo.play().catch(() => {});
        } else if (wPreviewImg) {
            if (wPreviewVideo) { wPreviewVideo.style.display = 'none'; wPreviewVideo.style.opacity = 0; }
            wPreviewImg.style.display = 'block';
            wPreviewImg.style.opacity = 1;
            wPreviewImg.src = src;
        }
        if (wPreviewLabel) wPreviewLabel.textContent = label;
        if (wPreviewType) wPreviewType.textContent = tag;
    }

    // Helper: load a preview with GSAP fade
    function loadPreviewAnimated(item) {
        const src = item.dataset.img;
        const type = item.dataset.type;
        const label = item.querySelector('.w-item-title')?.textContent || '';
        const tag = item.querySelector('.w-item-tag')?.textContent || '';

        if (type === 'video' && wPreviewVideo) {
            if (wPreviewImg) wPreviewImg.style.display = 'none';
            wPreviewVideo.style.display = 'block';
            gsap.to(wPreviewVideo, {
                opacity: 0, duration: 0.15, onComplete: () => {
                    wPreviewVideo.src = src;
                    wPreviewVideo.load();
                    wPreviewVideo.play().catch(() => {});
                    gsap.to(wPreviewVideo, { opacity: 1, duration: 0.25 });
                }
            });
        } else if (wPreviewImg) {
            if (wPreviewVideo) wPreviewVideo.style.display = 'none';
            wPreviewImg.style.display = 'block';
            gsap.to(wPreviewImg, {
                opacity: 0, duration: 0.15, onComplete: () => {
                    wPreviewImg.src = src;
                    gsap.to(wPreviewImg, { opacity: 1, duration: 0.25 });
                }
            });
        }
        if (wPreviewLabel) wPreviewLabel.textContent = label;
        if (wPreviewType) wPreviewType.textContent = tag;
    }

    if (wItems.length > 0) {
        // Load the first active item immediately on page load
        const firstActive = document.querySelector('.w-item.active') || wItems[0];
        if (firstActive) loadPreviewInstant(firstActive);

        wItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                wItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                loadPreviewAnimated(item);
            });
        });

        // --- Filter Tabs ---
        const filterBtns = document.querySelectorAll('.wt-filters span');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                wItems.forEach(item => {
                    const itemFilter = item.dataset.filter || 'all';
                    if (filter === 'all' || itemFilter.includes(filter)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // --- Search Filter ---
        if (wSearch) {
            wSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                wItems.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(query) ? 'flex' : 'none';
                });
            });
        }
    }

    // --- 2.85 HOME PAGE VIDEO ITEMS (Click to play/pause) ---
    const fwVideoItems = document.querySelectorAll('.fw-video-item');
    fwVideoItems.forEach(item => {
        const video = item.querySelector('.portfolio-video');
        const overlay = item.querySelector('.video-play-overlay');
        if (!video) return;

        // On hover: show cursor VIEW text is already handled globally
        item.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                if (overlay) overlay.style.opacity = '0';
            } else {
                video.pause();
                if (overlay) overlay.style.opacity = '1';
            }
        });

        item.addEventListener('mouseenter', () => {
            // Hint: show overlay glow
            if (video.paused && overlay) overlay.style.opacity = '1';
        });
        item.addEventListener('mouseleave', () => {
            if (video.paused && overlay) overlay.style.opacity = '0.7';
        });
    });

    // --- 2.9 CONTACT FORM HANDLER ---
    const contactForm = document.querySelector('.cv-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.cv-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "SENT SUCCESSFULLY!";
            submitBtn.style.backgroundColor = "#fff";
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = "#00ff00";
                contactForm.reset();
            }, 3000);
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
