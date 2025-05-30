// Sleep Dashboard Interactive Functionality
class SleepDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigationTabs();
        this.setupSleepStageCards();
        this.setupBrainwaveCards();
        this.setupConsequenceCards();
        this.setupCycleStageInteractions();
        this.addAccessibilityFeatures();
        this.initializeAnimations();
    }

    // Navigation Tab Functionality
    setupNavigationTabs() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const sections = document.querySelectorAll('.section');

        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = tab.getAttribute('data-section');
                
                // Remove active class from all tabs and sections
                navTabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding section
                tab.classList.add('active');
                const targetSectionElement = document.getElementById(targetSection);
                if (targetSectionElement) {
                    targetSectionElement.classList.add('active');
                    
                    // Smooth scroll to top of section
                    targetSectionElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    
                    // Trigger section-specific animations
                    this.triggerSectionAnimations(targetSection);
                }
            });

            // Keyboard navigation support
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    tab.click();
                }
            });
        });
    }

    // Sleep Stage Card Expansion
    setupSleepStageCards() {
        const stageCards = document.querySelectorAll('.stage-card');

        stageCards.forEach(card => {
            card.addEventListener('click', () => {
                this.toggleStageCardExpansion(card);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleStageCardExpansion(card);
                }
            });
        });
    }

    toggleStageCardExpansion(card) {
        const details = card.querySelector('.stage-details');
        const isExpanded = card.classList.contains('expanded');

        if (isExpanded) {
            // Collapse
            card.classList.remove('expanded');
            details.classList.add('hidden');
            card.setAttribute('aria-expanded', 'false');
        } else {
            // Expand
            card.classList.add('expanded');
            details.classList.remove('hidden');
            card.setAttribute('aria-expanded', 'true');
            
            // Add entrance animation
            details.style.animation = 'slideDown 0.3s ease';
        }
    }

    // Brain Wave Card Interactions
    setupBrainwaveCards() {
        const brainwaveCards = document.querySelectorAll('.brainwave-card');

        brainwaveCards.forEach(card => {
            const waveType = card.getAttribute('data-wave');
            
            card.addEventListener('mouseenter', () => {
                this.enhanceBrainwaveVisualization(card, waveType);
            });

            card.addEventListener('mouseleave', () => {
                this.resetBrainwaveVisualization(card);
            });

            card.addEventListener('click', () => {
                this.showBrainwaveDetails(waveType);
            });

            // Add focus support
            card.addEventListener('focus', () => {
                this.enhanceBrainwaveVisualization(card, waveType);
            });

            card.addEventListener('blur', () => {
                this.resetBrainwaveVisualization(card);
            });
        });
    }

    enhanceBrainwaveVisualization(card, waveType) {
        const waveVisual = card.querySelector('.wave-visual');
        const waveInfo = card.querySelector('.wave-info');
        
        // Enhance animation speed based on wave type
        const animationSpeeds = {
            'gamma': '0.05s',
            'beta': '0.15s',
            'alpha': '0.4s',
            'theta': '0.8s',
            'delta': '1.5s'
        };

        if (waveVisual && animationSpeeds[waveType]) {
            waveVisual.style.animationDuration = animationSpeeds[waveType];
            waveVisual.style.transform = 'scale(1.05)';
        }

        if (waveInfo) {
            waveInfo.style.opacity = '1';
            waveInfo.style.transform = 'translateY(0)';
        }
    }

    resetBrainwaveVisualization(card) {
        const waveVisual = card.querySelector('.wave-visual');
        const waveInfo = card.querySelector('.wave-info');

        if (waveVisual) {
            waveVisual.style.transform = 'scale(1)';
            // Reset to original animation duration based on class
            const classList = waveVisual.classList;
            if (classList.contains('gamma-wave')) waveVisual.style.animationDuration = '0.1s';
            if (classList.contains('beta-wave')) waveVisual.style.animationDuration = '0.3s';
            if (classList.contains('alpha-wave')) waveVisual.style.animationDuration = '0.8s';
            if (classList.contains('theta-wave')) waveVisual.style.animationDuration = '1.5s';
            if (classList.contains('delta-wave')) waveVisual.style.animationDuration = '3s';
        }

        if (waveInfo) {
            waveInfo.style.opacity = '';
            waveInfo.style.transform = '';
        }
    }

    showBrainwaveDetails(waveType) {
        // Create a detailed overlay or modal for brain wave information
        const waveDetails = {
            'gamma': {
                title: 'Gamma Waves (25-100 Hz)',
                description: 'Highest frequency brain waves associated with peak cognitive performance and consciousness.',
                characteristics: [
                    'Occur during intense focus and learning',
                    'Present during problem-solving activities',
                    'Associated with heightened awareness',
                    'Minimal during normal sleep cycles'
                ]
            },
            'beta': {
                title: 'Beta Waves (12-30 Hz)',
                description: 'Active brain waves present during normal waking consciousness and REM sleep.',
                characteristics: [
                    'Dominant during active thinking',
                    'Present during alert wakefulness',
                    'Reappear during REM sleep',
                    'Associated with logical thinking'
                ]
            },
            'alpha': {
                title: 'Alpha Waves (8-12 Hz)',
                description: 'Relaxed brain waves that bridge wakefulness and sleep onset.',
                characteristics: [
                    'Present when relaxed with eyes closed',
                    'Indicate calm, peaceful state',
                    'Gradually disappear as sleep begins',
                    'Enhanced during meditation'
                ]
            },
            'theta': {
                title: 'Theta Waves (4-8 Hz)',
                description: 'Slow brain waves dominant during light sleep and deep relaxation.',
                characteristics: [
                    'Predominant in NREM Stage 1 and 2',
                    'Associated with creativity and intuition',
                    'Present during deep meditation',
                    'Important for memory processing'
                ]
            },
            'delta': {
                title: 'Delta Waves (0.5-4 Hz)',
                description: 'Slowest brain waves essential for deep, restorative sleep.',
                characteristics: [
                    'Dominant during deep sleep (Stage 3)',
                    'Highest amplitude brain waves',
                    'Critical for physical restoration',
                    'Associated with healing and growth'
                ]
            }
        };

        if (waveDetails[waveType]) {
            this.displayBrainwaveModal(waveDetails[waveType]);
        }
    }

    displayBrainwaveModal(details) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'brainwave-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${details.title}</h3>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${details.description}</p>
                    <h4>Key Characteristics:</h4>
                    <ul>
                        ${details.characteristics.map(char => `<li>${char}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 20, 25, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: var(--sleep-surface);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            max-width: 500px;
            width: 90%;
            color: var(--sleep-text-primary);
            border: 1px solid var(--sleep-bg-tertiary);
            box-shadow: var(--shadow-heavy);
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Keyboard support
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    // Consequence Card Expansion
    setupConsequenceCards() {
        const consequenceCards = document.querySelectorAll('.consequence-card');

        consequenceCards.forEach(card => {
            card.addEventListener('click', () => {
                this.toggleConsequenceCardExpansion(card);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleConsequenceCardExpansion(card);
                }
            });
        });
    }

    toggleConsequenceCardExpansion(card) {
        const details = card.querySelector('.consequence-details');
        const isExpanded = details && !details.classList.contains('hidden');

        if (isExpanded) {
            details.classList.add('hidden');
            card.setAttribute('aria-expanded', 'false');
        } else if (details) {
            details.classList.remove('hidden');
            card.setAttribute('aria-expanded', 'true');
            details.style.animation = 'slideDown 0.3s ease';
        }
    }

    // Sleep Cycle Stage Interactions
    setupCycleStageInteractions() {
        const cycleStages = document.querySelectorAll('.cycle-stage');
        const stageCards = document.querySelectorAll('.stage-card');

        cycleStages.forEach(stage => {
            stage.addEventListener('click', () => {
                const stageType = stage.getAttribute('data-stage');
                this.highlightCorrespondingStageCard(stageType);
            });

            stage.addEventListener('mouseenter', () => {
                this.showStageTooltip(stage);
            });

            stage.addEventListener('mouseleave', () => {
                this.hideStageTooltip();
            });
        });
    }

    highlightCorrespondingStageCard(stageType) {
        const stageCards = document.querySelectorAll('.stage-card');
        
        // Map cycle stages to card data attributes
        const stageMapping = {
            'n1': 'nrem1',
            'n2': 'nrem2', 
            'n3': 'nrem3',
            'rem': 'rem'
        };

        stageCards.forEach(card => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        const mappedStage = stageMapping[stageType];
        if (mappedStage) {
            const targetCard = document.querySelector(`[data-stage="${mappedStage}"]`);
            if (targetCard) {
                targetCard.style.transform = 'scale(1.05)';
                targetCard.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.3)';
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Reset after 2 seconds
                setTimeout(() => {
                    targetCard.style.transform = '';
                    targetCard.style.boxShadow = '';
                }, 2000);
            }
        }
    }

    showStageTooltip(stage) {
        const stageInfo = {
            'n1': 'NREM Stage 1: Light sleep transition (3-5% of sleep)',
            'n2': 'NREM Stage 2: Light sleep with sleep spindles (50-60% of sleep)',
            'n3': 'NREM Stage 3: Deep sleep for restoration (10-20% of sleep)',
            'rem': 'REM Sleep: Dreaming and memory consolidation (20-25% of sleep)'
        };

        const stageType = stage.getAttribute('data-stage');
        const tooltip = document.createElement('div');
        tooltip.className = 'stage-tooltip';
        tooltip.textContent = stageInfo[stageType] || '';
        
        tooltip.style.cssText = `
            position: absolute;
            background: var(--sleep-bg-primary);
            color: var(--sleep-text-primary);
            padding: var(--space-8) var(--space-12);
            border-radius: var(--radius-sm);
            font-size: var(--font-size-sm);
            white-space: nowrap;
            z-index: 100;
            border: 1px solid var(--sleep-bg-tertiary);
            box-shadow: var(--shadow-medium);
            pointer-events: none;
            animation: fadeIn 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        const updateTooltipPosition = (e) => {
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY - 30) + 'px';
        };

        stage.addEventListener('mousemove', updateTooltipPosition);
        this.currentTooltip = { element: tooltip, handler: updateTooltipPosition, stage };
    }

    hideStageTooltip() {
        if (this.currentTooltip) {
            const { element, handler, stage } = this.currentTooltip;
            stage.removeEventListener('mousemove', handler);
            if (element && element.parentNode) {
                element.style.animation = 'fadeOut 0.2s ease';
                setTimeout(() => {
                    if (element.parentNode) {
                        document.body.removeChild(element);
                    }
                }, 200);
            }
            this.currentTooltip = null;
        }
    }

    // Accessibility Features
    addAccessibilityFeatures() {
        // Add ARIA labels and roles
        const interactiveElements = document.querySelectorAll('.stage-card, .brainwave-card, .consequence-card');
        
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '0');
            element.setAttribute('role', 'button');
            element.setAttribute('aria-expanded', 'false');
        });

        // Add keyboard navigation for sections
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key >= '1' && e.key <= '5') {
                const sectionIndex = parseInt(e.key) - 1;
                const navTabs = document.querySelectorAll('.nav-tab');
                if (navTabs[sectionIndex]) {
                    navTabs[sectionIndex].click();
                }
            }
        });

        // Add screen reader announcements
        this.announceForScreenReaders('Sleep Stages Dashboard loaded. Use Alt+1 through Alt+5 to navigate sections quickly.');
    }

    announceForScreenReaders(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    // Section-specific animations
    triggerSectionAnimations(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        switch(sectionId) {
            case 'brainwaves':
                this.animateBrainwaveCards();
                break;
            case 'comparison':
                this.animateComparisonCards();
                break;
            case 'consequences':
                this.animateConsequenceCards();
                break;
            case 'monitoring':
                this.animateMonitoringSection();
                break;
        }
    }

    animateBrainwaveCards() {
        const cards = document.querySelectorAll('#brainwaves .brainwave-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateComparisonCards() {
        const healthyCard = document.querySelector('.comparison-card.healthy');
        const poorCard = document.querySelector('.comparison-card.poor');
        
        if (healthyCard && poorCard) {
            [healthyCard, poorCard].forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = index === 0 ? 'translateX(-30px)' : 'translateX(30px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0)';
                }, 200);
            });
        }
    }

    animateConsequenceCards() {
        const cards = document.querySelectorAll('.consequence-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 150);
        });
    }

    animateMonitoringSection() {
        const methodCards = document.querySelectorAll('.method-card');
        methodCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Initialize subtle animations
    initializeAnimations() {
        // Add CSS animations for fadeIn and fadeOut
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideDown {
                from { 
                    opacity: 0; 
                    transform: translateY(-10px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            .brainwave-modal {
                animation: fadeIn 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);

        // Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                }
            });
        }, observerOptions);

        // Observe cards and important elements
        const elementsToObserve = document.querySelectorAll(
            '.stage-card, .brainwave-card, .comparison-card, .consequence-card, .method-card'
        );
        
        elementsToObserve.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }
}

// Enhanced Sleep Cycle Visualization
class SleepCycleVisualizer {
    constructor() {
        this.setupCycleAnimation();
    }

    setupCycleAnimation() {
        const cycleStages = document.querySelectorAll('.cycle-stage');
        
        // Create animated progress through sleep cycle
        let currentStage = 0;
        const animationInterval = setInterval(() => {
            cycleStages.forEach((stage, index) => {
                stage.style.filter = index === currentStage ? 'brightness(1.3)' : 'brightness(1)';
                stage.style.transform = index === currentStage ? 'scale(1.05)' : 'scale(1)';
            });
            
            currentStage = (currentStage + 1) % cycleStages.length;
        }, 3000);

        // Pause animation on hover
        const cycleBar = document.querySelector('.cycle-bar');
        if (cycleBar) {
            cycleBar.addEventListener('mouseenter', () => clearInterval(animationInterval));
            cycleBar.addEventListener('mouseleave', () => this.setupCycleAnimation());
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.measureLoadTime();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Sleep Dashboard loaded in ${loadTime.toFixed(2)}ms`);
            
            // Log to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'load',
                    value: Math.round(loadTime)
                });
            }
        });
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main dashboard
    const dashboard = new SleepDashboard();
    
    // Initialize additional features
    const cycleVisualizer = new SleepCycleVisualizer();
    const performanceMonitor = new PerformanceMonitor();
    
    // Add welcome message
    console.log('🌙 Sleep Stages Dashboard initialized successfully!');
    console.log('💡 Use Alt+1 through Alt+5 for quick section navigation');
    
    // Preload critical resources
    const criticalImages = [
        'https://pplx-res.cloudinary.com/image/upload/v1748540828/pplx_project_search_images/2ef36044acbde96e243399a924e354a59e7b7662.jpg',
        'https://pplx-res.cloudinary.com/image/upload/v1748580683/pplx_project_search_images/224e750a672fbf9831aa297296f17f2387e72100.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// Service Worker registration for PWA capabilities (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you want to add PWA functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SleepDashboard, SleepCycleVisualizer, PerformanceMonitor };
}