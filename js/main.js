// ==================== VARIABLES ====================
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const scrollTopBtn = document.getElementById('scroll-top');
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const contactForm = document.getElementById('contact-form');

// ==================== NAVIGATION & SCROLL ====================
let lastScrollY = window.scrollY;
let isScrolling = false;
let currentHash = window.location.hash; // Pour éviter les mises à jour inutiles de l'URL

function onScroll() {
    lastScrollY = window.scrollY;
    
    // 1. Effet Navbar (devient plus sombre au scroll)
    if (lastScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // 2. Bouton "Retour en haut"
    if (lastScrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }

    // 3. Mise à jour du lien actif et de l'URL
    updateActiveLink();

    isScrolling = false;
}

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(onScroll);
        isScrolling = true;
    }
});

function updateActiveLink() {
    const sections = document.querySelectorAll('section');
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // On détecte la section visible (avec un décalage de 300px pour l'anticipation)
        if (lastScrollY >= sectionTop - 300) {
            current = section.getAttribute('id');
        }
    });

    // Mise à jour visuelle des liens du menu
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });

    // Mise à jour de l'URL dans la barre d'adresse sans recharger
    if (current && current !== currentHash) {
        history.replaceState(null, null, '#' + current);
        currentHash = current;
    }
}

// ==================== MENU MOBILE ====================
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Fermer le menu quand on clique sur un lien
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ==================== CUSTOM CURSOR (Optimisé) ====================
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Le point central suit instantanément
    if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
});

// Le cercle suit avec un léger retard (effet fluide)
function animateFollower() {
    if (cursorFollower) {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        cursorFollower.style.transform = `translate3d(${cursorX - 10}px, ${cursorY - 10}px, 0)`; // -10 pour centrer par rapport à la souris
    }
    requestAnimationFrame(animateFollower);
}
animateFollower();

// Effets de survol (agrandissement du curseur)
const interactiveElements = document.querySelectorAll('a, button, .project-card, input, textarea');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if(cursor) cursor.classList.add('hovered');
        if(cursorFollower) cursorFollower.classList.add('hovered');
    });
    
    el.addEventListener('mouseleave', () => {
        if(cursor) cursor.classList.remove('hovered');
        if(cursorFollower) cursorFollower.classList.remove('hovered');
    });
});

// ==================== TYPED TEXT EFFECT ====================
const typedTextSpan = document.querySelector('.typed-text');
const texts = ['Étudiant BTS SIO SLAM', 'Développeur Web', 'Passionné de Code'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!typedTextSpan) return;

    const currentText = texts[textIndex];
    let typeSpeed = 100;
    
    if (isDeleting) {
        typedTextSpan.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typedTextSpan.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000; // Pause à la fin du mot
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typeSpeed = 500; // Pause avant de taper le mot suivant
    }
    
    setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(type, 1000);
});

// ==================== SCROLL ANIMATIONS (AOS) ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target); // L'animation ne se joue qu'une fois
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// ==================== CONTACT FORM (FORMSPREE) ====================
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        
        const formUrl = "https://formspree.io/f/xwpgbdvl";

        try {
            const response = await fetch(formUrl, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                alert("Merci ! Votre message a été envoyé avec succès.");
                contactForm.reset();
            } else {
                alert("Oups ! Il y a eu un problème. Vérifiez que vous avez bien mis votre URL Formspree dans le fichier main.js.");
            }
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'envoi.");
        }
    });
}

// ==================== SCROLL TO TOP ====================
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==================== SMOOTH SCROLL POUR LES ANCRES ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            // Mise à jour de l'URL manuelle au clic
            history.pushState(null, null, targetId);
            currentHash = targetId;

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});