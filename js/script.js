/* ========================================
   PORTFOLIO WEBSITE - PREMIUM JAVASCRIPT
   By Dhanesh Sharma
   
   Features:
   - Performance optimized with passive listeners
   - Accessibility enhanced with keyboard navigation
   - Respects user motion preferences
   - Debounced scroll handlers
   - Lazy-loaded particles
   - Lenis smooth scroll
   - Theme toggle with system preference
   - Scroll progress indicator
======================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Utility: Debounce function for performance
    function debounce(func, wait = 10, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }
    
    // Utility: Throttle function for scroll events
    function throttle(func, limit = 16) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================
    // LENIS SMOOTH SCROLL INITIALIZATION
    // ========================================
    let lenis = null;
    
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });
        
        // Animation frame loop for Lenis
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        // Integrate Lenis with anchor scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    lenis.scrollTo(target, {
                        offset: -90,
                        duration: 1.2,
                    });
                    
                    // Update URL
                    history.pushState(null, '', href);
                    
                    // Set focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    setTimeout(() => target.focus({ preventScroll: true }), 100);
                }
            });
        });
    }
    
    // ========================================
    // SCROLL PROGRESS INDICATOR
    // ========================================
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
        }
    }
    
    // Update on scroll (use Lenis scroll event if available)
    if (lenis) {
        lenis.on('scroll', updateScrollProgress);
    } else {
        window.addEventListener('scroll', throttle(updateScrollProgress, 16), { passive: true });
    }
    
    // Initial update
    updateScrollProgress();
    
    // ========================================
    // HERO ROLE ROTATION
    // ========================================
    const heroRoles = document.querySelectorAll('.hero-role');
    if (heroRoles.length > 0) {
        let currentRoleIndex = 0;
        
        function rotateRoles() {
            heroRoles.forEach(role => role.classList.remove('active'));
            currentRoleIndex = (currentRoleIndex + 1) % heroRoles.length;
            heroRoles[currentRoleIndex].classList.add('active');
        }
        
        // Rotate every 3 seconds
        setInterval(rotateRoles, 3000);
    }
    
    // Theme is fixed - no toggle functionality needed

    // Update copyright year dynamically
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Page Loader
    const loader = document.querySelector('.loader');
    
    const hideLoader = () => {
        if (loader) {
            loader.classList.add('hidden');
            document.body.classList.remove('loading');
            // Remove loader from DOM after transition for better performance
            setTimeout(() => {
                loader.remove();
            }, 500);
        }
    };
    
    // Hide loader when page is fully loaded or after timeout
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
        // Fallback timeout
        setTimeout(hideLoader, 2500);
    }

    // Custom Cursor (only on non-touch devices)
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (cursor && cursorDot && !isTouchDevice && !prefersReducedMotion) {
        let cursorX = 0;
        let cursorY = 0;
        let currentX = 0;
        let currentY = 0;
        
        // Use requestAnimationFrame for smooth cursor movement
        function animateCursor() {
            const dx = cursorX - currentX;
            const dy = cursorY - currentY;
            
            currentX += dx * 0.15;
            currentY += dy * 0.15;
            
            cursor.style.transform = `translate(${currentX - 10}px, ${currentY - 10}px)`;
            cursorDot.style.transform = `translate(${cursorX - 2.5}px, ${cursorY - 2.5}px)`;
            
            requestAnimationFrame(animateCursor);
        }
        
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        }, { passive: true });
        
        animateCursor();

        // Cursor effects on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .service-card, .skill-item, [role="button"]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'), { passive: true });
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'), { passive: true });
        });
    } else {
        // Hide custom cursor on touch devices
        if (cursor) cursor.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // Create Particles (lazy loaded, respects reduced motion)
    function createParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer || prefersReducedMotion) return;

        // Use requestIdleCallback or setTimeout for non-blocking creation
        const createParticle = (callback) => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(callback, { timeout: 2000 });
            } else {
                setTimeout(callback, 100);
            }
        };

        const colors = [
            'rgba(176, 170, 164, 0.15)',
            'rgba(122, 117, 111, 0.12)',
            'rgba(237, 234, 230, 0.08)',
            'rgba(176, 170, 164, 0.1)'
        ];
        const fragment = document.createDocumentFragment();
        const particleCount = window.innerWidth < 768 ? 12 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 3 + 1;
            const duration = Math.random() * 15 + 20;
            const delay = Math.random() * duration;
            
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${size}px;
                color: ${colors[Math.floor(Math.random() * colors.length)]};
                background: currentColor;
                --duration: ${duration}s;
                --delay: -${delay}s;
            `;
            fragment.appendChild(particle);
        }
        
        createParticle(() => {
            particlesContainer.appendChild(fragment);
        });
    }
    createParticles();

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    const handleNavScroll = throttle(() => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    }, 100);
    
    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Hamburger Menu Toggle with Accessibility
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        const toggleMenu = () => {
            const isActive = hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
            
            // Trap focus within menu when open
            if (isActive) {
                const firstLink = navLinks.querySelector('a');
                firstLink?.focus();
            }
        };
        
        hamburger.addEventListener('click', toggleMenu);
        
        // Keyboard support for hamburger
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });
    }

    // Premium Smooth Scrolling with easing (fallback when Lenis not available)
    if (!lenis) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return; // Skip empty hash links
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 90;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    // Use native smooth scroll with fallback for premium feel
                    if (prefersReducedMotion) {
                        window.scrollTo({ top: offsetPosition, behavior: 'auto' });
                    } else {
                        // Enhanced smooth scroll
                        smoothScrollTo(offsetPosition, 800);
                    }
                    
                    // Update URL without triggering scroll
                    history.pushState(null, '', href);
                    
                    // Set focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });
    }
    
    // Custom eased smooth scroll for premium feel
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        // Ease out quart for smooth deceleration
        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeOutQuart(progress);
            
            window.scrollTo(0, startPosition + (distance * ease));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }

    // Intersection Observer for Animations (with reduced motion support)
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (prefersReducedMotion) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'none';
                } else {
                    // Add slight delay based on position for staggered effect
                    const delay = Array.from(document.querySelectorAll('.fade-in')).indexOf(entry.target) * 50;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, Math.min(delay, 200));
                }
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    // Observe fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Timeline Animation Observer
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.timeline-item').forEach(item => {
        timelineObserver.observe(item);
    });

    // ========================================
    // ACTIVE NAVIGATION ON SCROLL
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');
    
    if (sections.length > 0 && navLinksAll.length > 0) {
        // Create a map of section IDs to nav links
        const navLinkMap = new Map();
        navLinksAll.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                navLinkMap.set(href.substring(1), link);
            }
        });
        
        // Track which section is currently active
        let currentActiveSection = null;
        
        function setActiveNavLink(sectionId) {
            if (currentActiveSection === sectionId) return;
            
            currentActiveSection = sectionId;
            
            // Remove active class and aria-current from all nav links
            navLinksAll.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            
            // Add active class to matching nav link
            const activeLink = navLinkMap.get(sectionId);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'true');
            }
        }
        
        // Intersection Observer for sections
        const navObserverOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Trigger when section is in upper-middle of viewport
            threshold: 0
        };
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveNavLink(entry.target.id);
                }
            });
        }, navObserverOptions);
        
        // Observe all sections
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
        
        // Handle click navigation - immediately update active state
        navLinksAll.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    setActiveNavLink(sectionId);
                }
            });
        });
        
        // Set initial active state on page load based on hash or scroll position
        function setInitialActiveState() {
            const hash = window.location.hash;
            if (hash && navLinkMap.has(hash.substring(1))) {
                setActiveNavLink(hash.substring(1));
            } else {
                // Find which section is currently in view
                let foundActive = false;
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    // Check if section is in the upper portion of the viewport
                    if (!foundActive && rect.top <= viewportHeight * 0.4 && rect.bottom > viewportHeight * 0.2) {
                        setActiveNavLink(section.id);
                        foundActive = true;
                    }
                });
            }
        }
        
        // Run on load
        setInitialActiveState();
        
        // Handle hash changes (back/forward navigation)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash && navLinkMap.has(hash.substring(1))) {
                setActiveNavLink(hash.substring(1));
            }
        });
    }

    // Stats Counter Animation (respects reduced motion)
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            if (isNaN(target)) return;
            
            if (prefersReducedMotion) {
                // Show final value immediately if reduced motion
                counter.textContent = Number.isInteger(target) ? target + '+' : target;
                return;
            }
            
            const duration = 2000;
            const isDecimal = !Number.isInteger(target);
            let startTime = null;
            
            const updateCounter = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = target * easeOutQuart;
                
                if (isDecimal) {
                    counter.textContent = current.toFixed(2);
                } else {
                    counter.textContent = Math.floor(current) + '+';
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = isDecimal ? target : target + '+';
                }
            };
            
            requestAnimationFrame(updateCounter);
        });
    }

    // Observe stats section
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Project Card Tilt Effect (only if reduced motion not preferred)
    const projectCards = document.querySelectorAll('.project-card');
    
    if (!prefersReducedMotion) {
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Subtle tilt for premium feel
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                
                // Use transform3d for GPU acceleration
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.01)`;
            }, { passive: true });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            }, { passive: true });
        });
    }

    // Service Cards Hover Effect
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (prefersReducedMotion) return;
            serviceCards.forEach(c => {
                if (c !== card) {
                    c.style.opacity = '0.5';
                }
            });
        }, { passive: true });
        
        card.addEventListener('mouseleave', () => {
            serviceCards.forEach(c => {
                c.style.opacity = '1';
            });
        }, { passive: true });
    });

    // Parallax Effect for Blobs (throttled, respects reduced motion)
    if (!prefersReducedMotion) {
        const handleParallax = throttle(() => {
            const scrolled = window.scrollY;
            const blobs = document.querySelectorAll('.blob');
            
            blobs.forEach((blob, index) => {
                const speed = 0.05 * (index + 1);
                blob.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, 16);
        
        window.addEventListener('scroll', handleParallax, { passive: true });
    }

    // Skill Items Stagger Animation
    const skillCategories = document.querySelectorAll('.skill-category');
    
    skillCategories.forEach(category => {
        const skillItems = category.querySelectorAll('.skill-item');
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillItems.forEach((item, index) => {
                        if (prefersReducedMotion) {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        } else {
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, index * 100);
                        }
                    });
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        // Initial state
        skillItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = prefersReducedMotion ? 'none' : 'all 0.4s ease';
        });
        
        skillObserver.observe(category);
    });

    // Magnetic Button Effect (only if reduced motion not preferred)
    if (!prefersReducedMotion) {
        const magneticButtons = document.querySelectorAll('.btn-primary, .nav-btn');
        
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            }, { passive: true });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            }, { passive: true });
        });
    }

    // Lazy load images when they enter viewport with skeleton loading
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add loading class for skeleton effect
                    img.parentElement?.classList.add('image-loading');
                    
                    // Create new image to preload
                    const newImg = new Image();
                    newImg.onload = () => {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        // Remove skeleton after image loads
                        setTimeout(() => {
                            img.parentElement?.classList.remove('image-loading');
                            img.parentElement?.classList.add('loaded');
                        }, 100);
                    };
                    newImg.src = img.dataset.src;
                    
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // Add skeleton loading to preview placeholders on initial load
    const previewPlaceholders = document.querySelectorAll('.preview-placeholder');
    previewPlaceholders.forEach(placeholder => {
        placeholder.classList.add('image-loading');
        // Simulate content loaded after brief delay
        setTimeout(() => {
            placeholder.classList.remove('image-loading');
            placeholder.classList.add('loaded');
        }, 800 + Math.random() * 400);
    });

    // ========================================
    // PROJECT CAROUSEL WITH AUTO-SLIDE
    // ========================================
    const projectCarousel = document.getElementById('project-carousel');
    const projectShowcase = document.querySelector('.project-showcase');
    const projectPrev = document.getElementById('project-prev');
    const projectNext = document.getElementById('project-next');
    const projectDots = document.querySelectorAll('.project-dot');
    
    if (projectCarousel && projectPrev && projectNext) {
        const projects = projectCarousel.querySelectorAll('.featured-project');
        let currentProject = 0;
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Auto-slide configuration
        const autoSlideInterval = 3000; // 3 seconds
        let autoSlideTimer = null;
        let isHovering = false;

        function showProject(index) {
            // Clamp index to valid range (loop)
            if (index < 0) index = projects.length - 1;
            if (index >= projects.length) index = 0;
            
            currentProject = index;
            
            // Update visibility with proper classes
            projects.forEach((project, i) => {
                if (i === currentProject) {
                    project.hidden = false;
                    project.classList.add('active');
                } else {
                    project.hidden = true;
                    project.classList.remove('active');
                }
            });
            
            // Update dots
            projectDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentProject);
                dot.setAttribute('aria-selected', i === currentProject);
            });
            
            // Update ARIA labels
            projects.forEach((project, i) => {
                project.setAttribute('aria-label', `Project ${i + 1} of ${projects.length}`);
            });
        }
        
        // Auto-slide functions
        function startAutoSlide() {
            stopAutoSlide();
            if (!isHovering) {
                autoSlideTimer = setInterval(() => {
                    showProject(currentProject + 1);
                }, autoSlideInterval);
            }
        }
        
        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }
        
        function resetAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }
        
        // Pause on hover (desktop)
        if (projectShowcase) {
            projectShowcase.addEventListener('mouseenter', () => {
                isHovering = true;
                stopAutoSlide();
            }, { passive: true });
            
            projectShowcase.addEventListener('mouseleave', () => {
                isHovering = false;
                startAutoSlide();
            }, { passive: true });
        }
        
        // Arrow navigation (resets auto-slide timer)
        projectPrev.addEventListener('click', () => {
            showProject(currentProject - 1);
            resetAutoSlide();
        });
        
        projectNext.addEventListener('click', () => {
            showProject(currentProject + 1);
            resetAutoSlide();
        });
        
        // Dot navigation (resets auto-slide timer)
        projectDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                showProject(i);
                resetAutoSlide();
            });
        });
        
        // Keyboard navigation (resets auto-slide timer)
        projectCarousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                showProject(currentProject - 1);
                resetAutoSlide();
            } else if (e.key === 'ArrowRight') {
                showProject(currentProject + 1);
                resetAutoSlide();
            }
        });
        
        // Touch/Swipe support for mobile (resets auto-slide timer)
        projectCarousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        projectCarousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next
                    showProject(currentProject + 1);
                } else {
                    // Swipe right - prev
                    showProject(currentProject - 1);
                }
                resetAutoSlide();
            }
        }
        
        // Initialize first project and start auto-slide
        showProject(0);
        startAutoSlide();
        
        // Pause auto-slide when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        });
    }

    // Console Easter Egg
    console.log('%c🚀 Welcome to Dhanesh\'s Portfolio!', 'color: #5b7cfa; font-size: 20px; font-weight: bold;');
    console.log('%cBuilt with ❤️ using HTML, CSS & JavaScript', 'color: #8c52ff; font-size: 14px;');
    console.log('%cLooking for a developer? Contact: dhaneshsharma635@gmail.com', 'color: #00d4ff; font-size: 12px;');
    console.log('%cMotion preference: ' + (prefersReducedMotion ? 'Reduced' : 'Normal'), 'color: #6b6b7b; font-size: 11px;');
    console.log('%cSmooth scroll: ' + (lenis ? 'Lenis' : 'Native'), 'color: #6b6b7b; font-size: 11px;');
    console.log('%cTheme: ' + (document.documentElement.getAttribute('data-theme') || 'system'), 'color: #6b6b7b; font-size: 11px;');
});
