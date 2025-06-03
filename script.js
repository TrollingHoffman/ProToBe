// Global variables
let isLoaded = false;
let animationQueue = [];

// Utility Functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Smooth scrolling for anchor links
const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Image loading and lazy loading
const initImageLoading = () => {
    const images = document.querySelectorAll('img');
    
    // Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Handle data-src for lazy loading
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Add loaded class when image loads
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                });
                
                // Handle already loaded images
                if (img.complete) {
                    img.classList.add('loaded');
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                }
                
                // Error handling
                img.addEventListener('error', () => {
                    console.warn(`Failed to load image: ${img.src}`);
                    img.style.opacity = '0.5';
                    img.alt = 'תמונה לא נמצאה';
                });
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    // Set initial styles and observe images
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        imageObserver.observe(img);
    });
};

// Scroll-triggered animations
const initScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add staggered delay for grid items
                if (element.parentElement.classList.contains('team-grid') || 
                    element.parentElement.classList.contains('stats') ||
                    element.parentElement.classList.contains('employer-benefits')) {
                    const siblings = Array.from(element.parentElement.children);
                    const index = siblings.indexOf(element);
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                } else {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) scale(1)';
                }
            }
        });
    }, observerOptions);

    // Elements to animate
    const elementsToAnimate = document.querySelectorAll(`
        .team-member, 
        .stat-item, 
        .partnership-card, 
        .benefit-item, 
        .amit-image, 
        .partnership-header-image, 
        .volunteers-image, 
        .special-highlight, 
        .amit-quote,
        .employers-bonus,
        .about-text,
        .amit-text
    `);
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.95)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

// Parallax effect for floating elements
const initParallaxEffect = () => {
    const parallaxElements = document.querySelectorAll('.floating-element');
    
    const updateParallax = throttle(() => {
        const scrolled = window.pageYOffset;
        const speed = 0.3;

        parallaxElements.forEach((element, index) => {
            const yPos = -(scrolled * speed * (index + 1) * 0.1);
            const rotation = scrolled * 0.05 * (index + 1);
            element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        });
    }, 16);

    window.addEventListener('scroll', updateParallax);
};

// Enhanced hover effects for team members
const initTeamMemberEffects = () => {
    document.querySelectorAll('.team-member').forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            
            // Add sparkle effect
            if (!this.querySelector('.sparkle')) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.innerHTML = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 1.2rem;
                    animation: sparkleEffect 1s ease-in-out;
                    z-index: 10;
                `;
                this.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 1000);
            }
        });

        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
};

// Enhanced hover effects for benefit items
const initBenefitItemEffects = () => {
    document.querySelectorAll('.benefit-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
            this.style.boxShadow = '0 20px 40px rgba(255,255,255,0.2)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 15px rgba(255,255,255,0.1)';
        });
    });
};

// Button ripple effect
const initButtonEffects = () => {
    // Add CSS for ripple effect
    if (!document.querySelector('#ripple-styles')) {
        const rippleStyle = document.createElement('style');
        rippleStyle.id = 'ripple-styles';
        rippleStyle.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: rippleEffect 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes sparkleEffect {
                0%, 100% { 
                    opacity: 0; 
                    transform: scale(0.5) rotate(0deg); 
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.2) rotate(180deg); 
                }
            }
        `;
        document.head.appendChild(rippleStyle);
    }

    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentElement) {
                    ripple.remove();
                }
            }, 600);
        });
    });
};

// Scroll progress indicator
const initScrollProgressIndicator = () => {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        z-index: 1000;
        transition: width 0.1s ease;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    `;
    document.body.appendChild(progressBar);
    
    const updateProgress = throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        progressBar.style.width = scrollPercent + '%';
    }, 16);
    
    window.addEventListener('scroll', updateProgress);
};

// Counter animation for statistics
const initCounterAnimations = () => {
    const animateCounter = (element, target, duration = 2000) => {
        const start = parseInt(element.textContent) || 0;
        const range = target - start;
        const startTime = performance.now();
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOut));
            
            if (target === 100) {
                element.textContent = current + '%';
            } else if (target === 0) {
                element.textContent = '0₪';
            } else {
                element.textContent = current;
            }
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Final value
                if (target === 100) {
                    element.textContent = '100%';
                } else if (target === 0) {
                    element.textContent = '0₪';
                } else if (element.textContent.includes('∞')) {
                    element.textContent = '∞';
                }
            }
        };
        
        requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stat-number');
                
                counters.forEach((counter, index) => {
                    setTimeout(() => {
                        const text = counter.textContent;
                        if (text.includes('100%')) {
                            animateCounter(counter, 100);
                        } else if (text.includes('0₪')) {
                            counter.textContent = '0₪';
                        } else if (text.includes('∞')) {
                            // Special animation for infinity
                            counter.style.animation = 'pulse 1s ease-in-out infinite';
                        }
                    }, index * 200);
                });
                
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
};

// Typewriter effect for hero title
const initTypewriterEffect = () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && window.innerWidth > 768) { // Only on desktop
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeSpeed = 100;
        
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, typeSpeed);
            }
        };
        
        // Start typing after a delay
        setTimeout(typeWriter, 1000);
    }
};

// Enhanced image hover effects
const initImageHoverEffects = () => {
    // Partnership and volunteer images
    const hoverImages = document.querySelectorAll(`
        .partnership-header-image, 
        .volunteers-image, 
        .amit-image,
        .partnership-logo
    `);
    
    hoverImages.forEach(container => {
        container.addEventListener('mouseenter', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.05)';
                img.style.filter = 'brightness(1.1) contrast(1.1)';
            }
        });
        
        container.addEventListener('mouseleave', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1)';
                img.style.filter = 'brightness(1) contrast(1)';
            }
        });
    });
};

// Section reveal animations
const initSectionRevealAnimations = () => {
    const sections = document.querySelectorAll('section:not(.hero)');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        sectionObserver.observe(section);
    });
};

// Contact link hover effects
const initContactLinkEffects = () => {
    document.querySelectorAll('.contact-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
};

// Performance monitoring
const initPerformanceMonitoring = () => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Load non-critical animations
            const performanceEntries = performance.getEntriesByType('navigation');
            if (performanceEntries.length > 0) {
                const loadTime = performanceEntries[0].loadEventEnd - performanceEntries[0].loadEventStart;
                if (loadTime > 3000) {
                    // Disable heavy animations on slow devices
                    document.documentElement.style.setProperty('--animation-duration', '0.1s');
                }
            }
        });
    }
};

// Error handling
const initErrorHandling = () => {
    window.addEventListener('error', (event) => {
        console.warn('Script error:', event.error);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.warn('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });
};

// Accessibility enhancements
const initAccessibilityEnhancements = () => {
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#about';
    skipLink.textContent = 'עבור לתוכן הראשי';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #667eea;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Enhanced focus management
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
};

// Mobile optimizations
const initMobileOptimizations = () => {
    if (window.innerWidth <= 768) {
        // Reduce parallax on mobile
        document.querySelectorAll('.floating-element').forEach(el => {
            el.style.display = 'none';
        });
        
        // Simplify animations on mobile
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        
        // Touch-friendly hover effects
        document.querySelectorAll('.team-member, .benefit-item').forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            el.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initSmoothScrolling();
    initImageLoading();
    initScrollAnimations();
    initScrollProgressIndicator();
    
    // Enhanced effects
    initTeamMemberEffects();
    initBenefitItemEffects();
    initButtonEffects();
    initImageHoverEffects();
    initContactLinkEffects();
    
    // Animations
    initCounterAnimations();
    initSectionRevealAnimations();
    
    // Performance and accessibility
    initPerformanceMonitoring();
    initErrorHandling();
    initAccessibilityEnhancements();
    initMobileOptimizations();
    
    // Parallax (only on desktop)
    if (window.innerWidth > 768) {
        initParallaxEffect();
        initTypewriterEffect();
    }
    
    // Mark as loaded
    isLoaded = true;
    document.body.classList.add('loaded');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations when page is hidden
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.animationName && style.animationName !== 'none') {
                el.style.animationPlayState = 'paused';
            }
        });
    } else {
        // Resume animations when page becomes visible
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Handle resize events
window.addEventListener('resize', debounce(() => {
    // Reinitialize mobile optimizations if screen size changes
    initMobileOptimizations();
}, 250));

// Preload critical images
const preloadCriticalImages = () => {
    const criticalImages = [
        '/images/לוגו.png',
        '/images/Me.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Start preloading immediately
preloadCriticalImages();