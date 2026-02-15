// Loader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('loaded');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500); // Matches CSS transition duration
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const totalProjects = 15;
    const itemsPerCategory = 5;
    
    // --- Elements ---

    const langToggleBtn = document.getElementById('lang-toggle');
    const body = document.body;
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const profileContainer = document.querySelector('.profile-img-container');
    
    // Mobile Menu Elements
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenuBtn = document.querySelector('.close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    // Modal Elements
    const modal = document.getElementById('project-modal');
    const modalImg = document.getElementById('modal-img');
    const captionText = document.getElementById('modal-caption');
    const closeModalSpan = document.querySelector('.close-modal');
    const prevBtn = document.querySelector('.modal-nav.prev-btn');
    const nextBtn = document.querySelector('.modal-nav.next-btn');

    let currentGalleryImages = [];
    let currentImageIndex = 0;

    // --- State ---
    let currentLang = 'en';

    // --- Initialization ---
    initPortfolio();
    updateLanguage();
    initTheme(); // Initialize Theme
    initColorPicker(); // Initialize Color Picker
    initAchievementsSlider(); // Initialize Achievements Slider
    initCursor();
    initParticles();
    initPortfolioStars();

    initNavbarIndicator();
    initScrollAnimations();
    initLanguageModal(); // New Feature

    // --- Navbar Indicator Logic ---


    function initLanguageModal() {
        const modal = document.getElementById('language-modal');
        const btns = document.querySelectorAll('.lang-btn');
        
        // Check if language is already selected
        const savedLang = localStorage.getItem('language_selected');
        
        if (!savedLang) {
            // Show modal with a slight delay
            setTimeout(() => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Disable scroll
            }, 500);
        } else {
            // Ensure correct lang is applied (already handled by updateLanguage, but good to verify)
            // updateLanguage() is called at top level
        }

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                
                // Set language
                if (lang === 'ar') {
                    document.body.classList.add('rtl');
                    document.documentElement.setAttribute('dir', 'rtl');
                    currentLang = 'ar';
                } else {
                    document.body.classList.remove('rtl');
                    document.documentElement.setAttribute('dir', 'ltr');
                    currentLang = 'en';
                }
                
                // Update text content
                document.querySelectorAll('[data-i18n]').forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    if (translations[currentLang][key]) {
                        element.textContent = translations[currentLang][key];
                    }
                });

                // Save to storage
                localStorage.setItem('language_selected', 'true'); // Flag to not show again
                localStorage.setItem('preferred_language', lang); // Actual lang pref
                
                // Hide modal
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Enable scroll
            });
        });
    }


    // --- Dynamic Scroll Animations & Background ---
    function initScrollAnimations() {
        // 1. Prepare Elements for Animation
        const sections = document.querySelectorAll('section');
        const revealSelectors = [
            'h1', 'h2', 'h3', 'p', 
            '.btn', 
            '.project-card', 
            '.software-card', 
            '.achievement-slide', 
            '.contact-card'
        ];
        
        sections.forEach(section => {
            // Add class to section itself
            section.classList.add('reveal-section');
            
            // Find children to animate
            revealSelectors.forEach(selector => {
                const children = section.querySelectorAll(selector);
                children.forEach(child => {
                    child.classList.add('reveal-child');
                });
            });
        });

        // 2. Intersection Observer (Visibility & Navbar)
        const observerOptions = {
            threshold: 0.2, // Trigger when 20% visible
            rootMargin: "-50px 0px -50px 0px" 
        };



        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Activate Animations
                    entry.target.classList.add('in-view');
                    
                    // Update Navbar Active State
                    const id = entry.target.getAttribute('id');
                    if (id) {
                        const navLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                        const mobileLink = document.querySelector(`.mobile-menu a[href="#${id}"]`);
                        
                        if (navLink) {
                            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                            navLink.classList.add('active');
                            // Move indicator
                            const indicator = document.querySelector('.nav-indicator');
                             // We need to access the moveIndicator function or replicate logic
                             // Replicating simple logic here for scope access
                            const navLinksContainer = document.querySelector('.nav-links');
                            if (indicator && navLinksContainer) {
                                const itemRect = navLink.getBoundingClientRect();
                                const containerRect = navLinksContainer.getBoundingClientRect();
                                const left = itemRect.left - containerRect.left;
                                const width = itemRect.width;
                                indicator.style.width = `${width}px`;
                                indicator.style.transform = `translateX(${left}px)`;
                                indicator.style.opacity = '1';
                            }
                        }
                        
                        // Body Background Color Transition
                        updateBodyBackground(id);
                    }
                } else {
                     // Optional: Remove class to re-animate when scrolling back up?
                     // entry.target.classList.remove('in-view'); 
                }
            });
        }, observerOptions);

        sections.forEach(sec => sectionObserver.observe(sec));

        // 3. Parallax / Response with Screen
        window.addEventListener('scroll', () => {
             // Disable heavy scroll calculations on mobile/tablets
             if (window.innerWidth < 1024) return;

             const scrolled = window.scrollY;
             
             // Move background elements slowly
             const picassoBg = document.querySelector('.picasso-bg');
             if (picassoBg) {
                 picassoBg.style.transform = `translateY(${scrolled * 0.1}px)`;
             }
             
             // Move hero particles slightly
             const heroCanvas = document.getElementById('hero-particles');
             if (heroCanvas) {
                 heroCanvas.style.transform = `translateY(${scrolled * 0.2}px)`;
             }
             
             // Navbar Scroll State
             const navbar = document.querySelector('.navbar');
             if (navbar) {
                 if (scrolled > 50) {
                     navbar.classList.add('scrolled');
                 } else {
                     navbar.classList.remove('scrolled');
                 }
             }
        });
    }

    function updateBodyBackground(sectionId) {
        const body = document.body;
        // Check theme
        const isLight = body.classList.contains('light-mode');
        
        let color;
        if (isLight) {
            // Light Mode Colors
            switch(sectionId) {
                case 'home': color = '#f0f0f0'; break;
                case 'about': color = '#e8e8e8'; break; // Light Grey
                case 'portfolio': color = '#f5f5f5'; break; // White Smoke
                case 'achievements': color = '#e8e8e8'; break;
                case 'contact': color = '#ffffff'; break;
                default: color = '#f0f0f0';
            }
        } else {
            // Dark Mode Colors
            switch(sectionId) {
                case 'home': color = '#0a0a0a'; break;
                case 'about': color = '#111111'; break; // Slightly lighter
                case 'portfolio': color = '#050510'; break; // Deep Blue mix
                case 'achievements': color = '#111111'; break;
                case 'contact': color = '#000000'; break; // Pitch Black
                default: color = '#0a0a0a';
            }
        }
        
        body.style.backgroundColor = color;
    }
    function initNavbarIndicator() {
        const indicator = document.querySelector('.nav-indicator');
        const items = document.querySelectorAll('.nav-links a');
        const navLinks = document.querySelector('.nav-links');

        function moveIndicator(el) {
            // Get position relative to the container
            const itemRect = el.getBoundingClientRect();
            const containerRect = navLinks.getBoundingClientRect();

            const left = itemRect.left - containerRect.left;
            const width = itemRect.width;

            indicator.style.width = `${width}px`;
            indicator.style.transform = `translateX(${left}px)`;
            indicator.style.opacity = '1';
        }

        items.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                moveIndicator(e.target);
            });
            
            // Optional: Click to set active class logic is handled by scroll observer usually,
            // but we can add immediate feedback
            item.addEventListener('click', (e) => {
                 items.forEach(i => i.classList.remove('active'));
                 e.target.classList.add('active');
            });
        });

        navLinks.addEventListener('mouseleave', () => {
            // Return to active item
            const activeItem = document.querySelector('.nav-links a.active');
            if (activeItem) {
                moveIndicator(activeItem);
            } else {
                indicator.style.opacity = '0';
            }
        });
        
        // Initial set if there's an active class
        const activeItem = document.querySelector('.nav-links a.active');
        if (activeItem) moveIndicator(activeItem);

        // Update on resize
        window.addEventListener('resize', () => {
             const active = document.querySelector('.nav-links a.active');
             if (active) moveIndicator(active);
        });
    }
    
    // --- Glitch Scroll Transition ---
    const viewProjectsBtn = document.querySelector('a[href="#portfolio"]');
    const glitchOverlay = document.getElementById('glitch-overlay');

    if (viewProjectsBtn && glitchOverlay) {
        viewProjectsBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop default jump
            
            // 1. Activate Overlay (Glitch In)
            glitchOverlay.style.display = 'block'; // Ensure visible first
            // Small delay to allow display block to apply before adding class (for transitions if needed, though keyframes handle it)
            requestAnimationFrame(() => {
                glitchOverlay.classList.add('active');
            });

            // 2. Wait for cover (e.g., 400ms) then scroll
            setTimeout(() => {
                document.getElementById('portfolio').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 400);

            // 3. Remove Overlay (Glitch Out) after total duration (e.g., 1s)
            setTimeout(() => {
                glitchOverlay.classList.remove('active');
                setTimeout(() => {
                    glitchOverlay.style.display = 'none';
                }, 100); // Wait for class removal
            }, 1000);
        });
    }

    // --- Pixel Wipe Transition (Contact) ---
    const contactBtn = document.querySelector('a[href="#contact"]');
    const pixelOverlay = document.getElementById('pixel-overlay');

    if (contactBtn && pixelOverlay) {
        // Generate Pixels
        for (let i = 0; i < 100; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixelOverlay.appendChild(pixel);
        }

        const pixels = pixelOverlay.querySelectorAll('.pixel');

        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pixelOverlay.style.display = 'flex';
            
            // Randomize Order
            const shuffledIndices = Array.from({length: 100}, (_, i) => i).sort(() => Math.random() - 0.5);
            
            // Animate In
            shuffledIndices.forEach((index, i) => {
                setTimeout(() => {
                    pixels[index].classList.add('active');
                }, i * 5); // Fast sequence
            });

            // Scroll & Reset
            setTimeout(() => {
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                
                // Fade out pixels
                pixels.forEach(p => p.classList.remove('active'));
                
                setTimeout(() => {
                    pixelOverlay.style.display = 'none';
                }, 500);
            }, 800);
        });
    }

    // --- Curtain Wipe Transition (Nav Links) ---
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    const curtainOverlay = document.getElementById('curtain-overlay');

    if (curtainOverlay) {
        navLinks.forEach(link => {
            // Skip if it's the specific View Projects or Contact button handled above
            if (link.getAttribute('href') === '#portfolio' || link.getAttribute('href') === '#contact') return;

            link.addEventListener('click', (e) => {
                // If it's a hash link
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    
                    curtainOverlay.style.display = 'block';
                    requestAnimationFrame(() => {
                        curtainOverlay.classList.add('in');
                    });

                    setTimeout(() => {
                        const target = document.querySelector(href);
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                        
                        // Open curtain
                        curtainOverlay.classList.remove('in');
                        setTimeout(() => {
                            curtainOverlay.style.display = 'none';
                        }, 500);
                    }, 500); // Wait for close
                }
            });
        });
    }


    function initAchievementsSlider() {
        const switcherBtns = document.querySelectorAll('.switcher-btn');
        const slides = document.querySelectorAll('.achievement-slide');

        switcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                switcherBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                btn.classList.add('active');

                // Get target slide id
                const targetId = btn.getAttribute('data-target');

                // Hide all slides
                slides.forEach(slide => {
                    slide.classList.remove('active');
                    slide.style.display = 'none'; // Force hide
                });

                // Show target slide
                const targetSlide = document.getElementById(targetId);
                if (targetSlide) {
                   targetSlide.style.display = 'block';
                   // Small timeout for animation class trigger
                   setTimeout(() => {
                        targetSlide.classList.add('active');
                   }, 10);
                }
            });
        });

        // Read More Button Logic
        const readMoreBtns = document.querySelectorAll('.read-more-btn');
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent propagation
                
                // Identify parent slide to determine content
                const slide = btn.closest('.achievement-slide');
                if (slide) {
                    const slideId = slide.id;
                    if (slideId === 'slide-1') {
                        window.openTextModal('book_title', 'book_desc');
                    } else if (slideId === 'slide-2') {
                        window.openTextModal('scenario_title', 'scenario_desc');
                    }
                }
            });
        });
        
        // Text Modal Logic
        const textModal = document.getElementById('text-modal');
        const modalTitle = document.getElementById('text-modal-title');
        const modalBody = document.getElementById('text-modal-body');

        window.openTextModal = function(titleKey, contentKey) {
            // Get content based on current language
            const title = translations[currentLang][titleKey];
            const content = translations[currentLang][contentKey];
            
            modalTitle.innerText = title; 
            modalBody.innerHTML = content;
            
            textModal.style.display = "flex";
            document.body.style.overflow = "hidden"; 
        }

        window.closeTextModal = function() {
            textModal.style.display = "none";
            document.body.style.overflow = "auto";
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target == textModal) {
                window.closeTextModal();
            }
        });
    }

    // --- Color Picker ---
    function initColorPicker() {
        const colorPicker = document.getElementById('accent-color-picker');
        const resetBtn = document.getElementById('reset-color-btn');
        const root = document.documentElement;
        const defaultColor = '#00ffff';
        
        // Load saved color
        const savedColor = localStorage.getItem('accent-color');
        if (savedColor) {
            root.style.setProperty('--accent-color', savedColor);
            colorPicker.value = savedColor;
        }

        colorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            applyColor(color);
        });

        resetBtn.addEventListener('click', () => {
            applyColor(defaultColor);
            colorPicker.value = defaultColor;
            localStorage.removeItem('accent-color'); // Optional: clear storage or save default
        });

        function applyColor(color) {
             root.style.setProperty('--accent-color', color);
             localStorage.setItem('accent-color', color);
        }
    }

    // --- Theme Toggle ---
    function initTheme() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
        const body = document.body;
        
        // Check local storage
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            body.classList.add('light-mode');
        }
        
        updateThemeIcon();

        function toggleTheme() {
            body.classList.toggle('light-mode');
            
            // Save preference
            if (body.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
            
            updateThemeIcon();
        }

        themeToggleBtn.addEventListener('click', toggleTheme);
        if (mobileThemeToggleBtn) {
            mobileThemeToggleBtn.addEventListener('click', toggleTheme);
        }
        
        function updateThemeIcon() {
            const isLight = body.classList.contains('light-mode');
            const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></svg>';
            const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"></path></svg>';
            
            themeToggleBtn.innerHTML = isLight ? moonIcon : sunIcon;
            /* Update mobile button icon only if it has an icon container, 
               but simpler to just toggle class or handle click. 
               The current mobile button has text 'Theme' and an SVG. 
               Visual update for mobile button can be simple opacity or just functional. 
            */
        }
    }

    // --- Custom Cursor ---
    function initCursor() {
        // Disable on touch devices and small screens (increased to 1024px for performance on tablets/low-end laptops)
        if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024) return;

        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        if (!cursor || !follower) return; // Guard clause

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Small delay for follower
            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 50);
        });

        // Add hover effect
        const links = document.querySelectorAll('a, button, .project-card, .profile-img-container');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.border = '1px solid cyan';
                follower.style.transform = 'translate(-50%, -50%) scale(2)';
                follower.style.borderColor = 'rgba(0, 255, 255, 0.8)';
            });
            link.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.backgroundColor = 'cyan';
                cursor.style.border = 'none';
                follower.style.transform = 'translate(-50%, -50%) scale(1)';
                follower.style.borderColor = 'rgba(0, 255, 255, 0.5)';
            });
        });
    }

    // --- Geometric Web Particles ---
    function initParticles() {
        // Disable heavy particles on mobile and tablets (save battery/CPU)
        if (window.innerWidth < 1024) return;

        const canvas = document.getElementById('about-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        function resize() {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        }

        let resizeTimeout;
        function debouncedResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resize, 250);
        }

        window.addEventListener('resize', debouncedResize);
        resize();

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.dx = (Math.random() - 0.5) * 1;
                this.dy = (Math.random() - 0.5) * 1;
                this.size = Math.random() * 3 + 1;
                this.shape = Math.random() < 0.33 ? 'circle' : (Math.random() < 0.5 ? 'square' : 'triangle');
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            draw(color) {
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.globalAlpha = this.opacity;
                
                if (this.shape === 'circle') {
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                } else if (this.shape === 'square') {
                    ctx.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                } else if (this.shape === 'triangle') {
                    ctx.moveTo(this.x, this.y - this.size);
                    ctx.lineTo(this.x + this.size, this.y + this.size);
                    ctx.lineTo(this.x - this.size, this.y + this.size);
                }
                
                ctx.fill();
                ctx.globalAlpha = 1.0; // Reset
            }

            update(color) {
                // Movement
                this.x += this.dx;
                this.y += this.dy;

                // Wall collision
                if (this.x < 0 || this.x > width) this.dx = -this.dx;
                if (this.y < 0 || this.y > height) this.dy = -this.dy;

                // Mouse Interaction
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = forceDirectionX * force * 3;
                        const directionY = forceDirectionY * force * 3;

                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }

                this.draw(color);
            }
        }

        // Initialize particles
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Get current accent color from CSS variable
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

            for (let i = 0; i < particles.length; i++) {
                particles[i].update(accentColor);
                
                // Draw connections
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        // Convert hex to rgb for opacity handling if needed, 
                        // but here we just use the color with opacity calc manually or simple trick
                        // Since accentColor is hex, we can't easily append alpha. 
                        // However, we can use globalAlpha for lines too.
                        ctx.strokeStyle = accentColor;
                        ctx.globalAlpha = 1 - distance / 100;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        animate();
    }
    
    // --- 3D Tilt Effect ---
    if (profileContainer && window.innerWidth >= 768) {
        profileContainer.addEventListener('mousemove', (e) => {
            const rect = profileContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 20deg)
            const rotateX = ((y - centerY) / centerY) * -20; 
            const rotateY = ((x - centerX) / centerX) * 20;

            profileContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        profileContainer.addEventListener('mouseleave', () => {
            profileContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }

    // --- Language Switcher ---
    langToggleBtn.addEventListener('click', () => {
        const oldLang = currentLang;
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        
        body.classList.remove(`lang-${oldLang}`);
        body.classList.add(`lang-${currentLang}`);
        
        langToggleBtn.textContent = currentLang === 'en' ? 'AR / EN' : 'EN / AR';
        updateLanguage();
    });

    function updateLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang] && translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key]; // Changed to innerHTML to support formatting
            }
        });
    }

    // --- Mobile Menu Logic ---
    function openMenu() {
        mobileMenu.classList.add('active');
        body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeMenu() {
        mobileMenu.classList.remove('active');
        body.style.overflow = 'auto';
    }

    hamburgerBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- Mobile Settings Logic ---
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const mobileLangToggle = document.getElementById('mobile-lang-toggle');

    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            // Trigger main theme toggle logic
            themeToggleBtn.click();
            // Update mobile button text/icon if needed (optional, but good for feedback)
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', () => {
            // Trigger main lang toggle logic
            langToggleBtn.click();
        });
    }

    // --- Portfolio Generation ---
    function initPortfolio() {
        // Clear existing grid first
        portfolioGrid.innerHTML = '';
        
        // Standard categories
        const categories = ['graphic', '3d']; // Removed 'video'
        categories.forEach(cat => {
            for (let i = 1; i <= 10; i++) { 
                createProjectItem(cat, i);
            }
        });

        // Video Editing (YouTube Channel)
        const youtubeCard = document.createElement('div');
        youtubeCard.classList.add('project-item', 'video', 'youtube-card');
        youtubeCard.setAttribute('data-category', 'video');
        
        // Custom content for YouTube card
        youtubeCard.innerHTML = `
            <div class="project-inner" onclick="window.open('https://www.youtube.com/@AYOUBGAMES-r7v', '_blank')">
                <div class="project-img-container">
                    <div class="icon-wrapper youtube-wrapper">
                        <img src="assets/images/youtube_icon.png" alt="YouTube Channel" class="youtube-custom-icon" loading="lazy">
                    </div>
                </div>
                <div class="project-info">
                    <h3 data-i18n="youtube_title">YouTube Channel</h3>
                    <p data-i18n="youtube_desc">Watch my video editing work</p>
                    <button class="project-btn" data-i18n="visit_channel">Visit Channel</button>
                </div>
            </div>
        `;
        portfolioGrid.appendChild(youtubeCard);

        // Instagram (Video Editing)
        const instaCard = document.createElement('div');
        instaCard.classList.add('project-item', 'video', 'instagram-card');
        instaCard.setAttribute('data-category', 'video');
        
        instaCard.innerHTML = `
            <div class="project-inner" onclick="window.open('https://www.instagram.com/dabit.design/', '_blank')">
                <div class="project-img-container">
                    <div class="icon-wrapper instagram-wrapper">
                         <!-- Changed to a filled gradient style placeholder via CSS, using SVG for shape -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#instaGradient)" width="80" height="80">
                            <defs>
                                <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#405de6;stop-opacity:1" />
                                    <stop offset="50%" style="stop-color:#c13584;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#fd1d1d;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </div>
                </div>
                <div class="project-info">
                    <h3 data-i18n="instagram_title">Instagram</h3>
                    <p data-i18n="instagram_desc">Follow my design journey</p>
                    <button class="project-btn" data-i18n="visit_insta">Visit Profile</button>
                </div>
            </div>
        `;
        portfolioGrid.appendChild(instaCard);

        // Logo & Branding Specific Projects
        const logoProjects = [
            {
                title: "Perfume Brand Identity",
                category: "logo-branding",
                id: "perfume",
                images: [
                    'assets/images/logo_branding_perfume_1.jpg',
                    'assets/images/logo_branding_perfume_2.png',
                    'assets/images/logo_branding_perfume_3.png',
                    'assets/images/logo_branding_perfume_4.png'
                ]
            },
            {
                title: "Fes City Branding",
                category: "logo-branding",
                id: "fes",
                images: [
                    'assets/images/logo_branding_fes_1.png',
                    'assets/images/logo_branding_fes_2.jpg',
                    'assets/images/logo_branding_fes_3.jpg',
                    'assets/images/logo_branding_fes_4.jpg'
                ]
            }
        ];

        logoProjects.forEach((proj, index) => {
            createProjectItem(proj.category, index + 1, proj);
        });
    }

    function createProjectItem(category, index, customProject = null) {
        const card = document.createElement('div');
        const directionClass = index % 2 !== 0 ? 'from-left' : 'from-right';
        card.className = `project-card ${category} project-reveal ${directionClass}`;
        card.setAttribute('data-category', category);
        
        let imgUrl, title, galleryImages;

        if (customProject) {
            // Use the first image as the thumbnail
            imgUrl = customProject.images[0];
            title = customProject.title;
            galleryImages = customProject.images;
        } else {
            // Standard naming convention
            imgUrl = `assets/images/project_${category}_${index}.jpg`;
            title = `Project ${category} - ${index}`;
            galleryImages = [imgUrl]; // Single image "gallery"
        }
        
        card.innerHTML = `
            <img src="${imgUrl}" alt="${title}" class="project-img" loading="lazy" onerror="this.src='https://placehold.co/600x400/222/FFF?text=${customProject ? customProject.id : category}+${index}'">
            <div class="project-overlay">
                <h3>${title}</h3>
            </div>
        `;
        
        // Add click event for Lightbox
        card.addEventListener('click', () => {
             openModal(galleryImages, title);
        });

        portfolioGrid.appendChild(card);
    }

    // --- Modal / Lightbox Logic ---
    function openModal(images, caption) {
        modal.style.display = 'flex'; // Changed to flex for centering
        currentGalleryImages = images;
        currentImageIndex = 0;
        updateModalImage();
        captionText.innerHTML = caption;
        body.style.overflow = 'hidden';

        // Show/Hide navigation buttons based on gallery size
        if (images.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    function updateModalImage() {
        // Reset to default while loading
        const rootStyles = getComputedStyle(document.documentElement);
        const defaultAccent = rootStyles.getPropertyValue('--accent-color').trim();
        modalImg.style.setProperty('--project-glow-color', defaultAccent);
        
        modalImg.src = currentGalleryImages[currentImageIndex];
        
        // Analyze color when image loads
        modalImg.onload = function() {
            const dominantColor = getAverageRGB(modalImg);
            // Apply to the modal content wrapper, not just the image if possible, 
            // but the animation is on .modal-content. 
            // We need to set the variable on .modal-content
            const modalContent = document.querySelector('.modal-content');
            modalContent.style.setProperty('--project-glow-color', dominantColor);
        }
    }

    function getAverageRGB(imgEl) {
        var blockSize = 5, // only visit every 5 pixels
            defaultRGB = {r:0,g:255,b:255}, // for non-supporting envs
            canvas = document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            data, width, height,
            i = -4,
            length,
            rgb = {r:0,g:0,b:0},
            count = 0;

        if (!context) {
            return 'rgb(' + defaultRGB.r + ',' + defaultRGB.g + ',' + defaultRGB.b + ')';
        }

        height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
        width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

        context.drawImage(imgEl, 0, 0);

        try {
            data = context.getImageData(0, 0, width, height);
        } catch(e) {
            /* security error, img on diff domain */
            return 'rgb(' + defaultRGB.r + ',' + defaultRGB.g + ',' + defaultRGB.b + ')';
        }

        length = data.data.length;

        while ( (i += blockSize * 4) < length ) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i+1];
            rgb.b += data.data[i+2];
        }

        // ~~ used to floor values
        rgb.r = ~~(rgb.r/count);
        rgb.g = ~~(rgb.g/count);
        rgb.b = ~~(rgb.b/count);

        // Boost saturation/brightness slightly for the glow effect
        return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        updateModalImage();
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateModalImage();
    }

    // Event Listeners for Modal
    closeModalSpan.onclick = closeModal;
    prevBtn.onclick = (e) => { e.stopPropagation(); prevImage(); };
    nextBtn.onclick = (e) => { e.stopPropagation(); nextImage(); };

    function closeModal() {
        modal.style.display = "none";
        body.style.overflow = 'auto';
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // --- Collection Toggle Button Logic ---
    const collectionToggleBtn = document.getElementById('collection-toggle-btn');
    let isCollectionVisible = true; // Projects are visible by default
    let isAnimating = false; // Prevent multiple clicks during animation

    if (collectionToggleBtn) {
        collectionToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent clicks during animation
            if (isAnimating) return;
            isAnimating = true;
            
            // Toggle visibility state
            isCollectionVisible = !isCollectionVisible;
            
            // Get all project cards
            const allProjects = document.querySelectorAll('.project-card, .project-item');
            
            if (isCollectionVisible) {
                // Show all projects with animation
                collectionToggleBtn.textContent = '📁';
                collectionToggleBtn.classList.remove('collection-hidden');
                
                allProjects.forEach((project, index) => {
                    setTimeout(() => {
                        project.style.display = 'block';
                        // Force reflow
                        project.offsetHeight;
                        project.style.opacity = '1';
                        project.style.transform = 'scale(1)';
                    }, index * 20);
                });
                
                // Re-enable after animation completes
                setTimeout(() => {
                    isAnimating = false;
                }, allProjects.length * 20 + 300);
                
            } else {
                // Hide all projects with animation
                collectionToggleBtn.textContent = '📂';
                collectionToggleBtn.classList.add('collection-hidden');
                
                allProjects.forEach((project, index) => {
                    setTimeout(() => {
                        project.style.opacity = '0';
                        project.style.transform = 'scale(0.8)';
                    }, index * 15);
                });
                
                // Hide after animation
                setTimeout(() => {
                    allProjects.forEach(project => {
                        project.style.display = 'none';
                    });
                    isAnimating = false;
                }, allProjects.length * 15 + 300);
            }
        });
    }

    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'Escape') closeModal();
        }
    });

    // --- Filtering ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Skip if it's the collection toggle button
            if (btn.id === 'collection-toggle-btn') return;
            
            // Active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            const cards = document.querySelectorAll('.project-card, .project-item');

            cards.forEach(card => {
                // Reset animation state for re-filtering
                card.classList.remove('reveal', 'active');
                
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    // Small timeout to allow display:block to apply before opacity transition
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9) translateY(20px)';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
            
            // Reset collection state when other filters are clicked
            if (collectionToggleBtn) {
                isCollectionVisible = true;
                collectionToggleBtn.textContent = '📁';
                collectionToggleBtn.classList.remove('collection-hidden');
            }
        });
    });

    // --- Scroll Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.section-title, .about-text, .skills-list, .contact-item');
    const projectCards = document.querySelectorAll('.project-card');
    
    // Add reveal class to generic elements
    revealElements.forEach(el => el.classList.add('reveal'));

    // Project cards already have 'project-reveal' class from creation

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        root: null,
        threshold: 0.15, 
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
    projectCards.forEach(el => revealObserver.observe(el));

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Portfolio Stars Animation ---
    function initPortfolioStars() {
        const canvas = document.getElementById('portfolio-stars');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId; // To manage requestAnimationFrame
        
        // Star class definition
        class Star {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.side = Math.random() < 0.5 ? 0 : 1;
                
                if (initial) {
                     this.x = Math.random() * width;
                     this.y = Math.random() * height;
                     this.side = this.x < width/2 ? 0 : 1;
                } else {
                    this.x = this.side === 0 ? 0 : width;
                    this.y = Math.random() * height;
                }

                this.size = Math.random() * 2 + 0.5;
                this.speed = Math.random() * 1 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.3;
                
                const targetX = width / 2;
                const targetY = height / 2 + (Math.random() - 0.5) * (height * 0.8);
                
                const angle = Math.atan2(targetY - this.y, targetX - this.x);
                this.dx = Math.cos(angle) * this.speed;
                this.dy = Math.sin(angle) * this.speed;
            }

            update() {
                this.x += this.dx;
                this.y += this.dy;
                
                if (Math.abs(this.x - width / 2) < 20) {
                    this.opacity -= 0.02;
                }

                if (this.opacity <= 0 || (this.side === 0 && this.x > width/2 + 50) || (this.side === 1 && this.x < width/2 - 50)) {
                    this.reset();
                }
            }

            draw(color) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }

        let stars = [];
        
        function initStars() {
            const parent = canvas.parentElement;
            width = canvas.width = parent.offsetWidth;
            height = canvas.height = parent.offsetHeight;
            
            stars = [];
            // Optimize star count for mobile
            const isMobile = window.innerWidth < 768;
            const starCount = isMobile ? 15 : 100; // Ultra-optimized for low-end
            
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
        }
        
        // Debounce resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                initStars();
            }, 250); // Wait 250ms after resize stops
        });
        
        initStars(); // Initial call

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Get current accent color
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            
            // Only animate if in viewport (simple optimization)
            const rect = canvas.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                stars.forEach(star => {
                    star.update();
                    star.draw(accentColor);
                });
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();
    }





});
