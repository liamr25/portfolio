const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelectorAll('.nav-lien');
const scrollTopBtn = document.getElementById('scroll-top');
const cursor = document.querySelector('.curseur');
const cursorFollower = document.querySelector('.curseur-follower');
const contactForm = document.getElementById('contact-form');

let lastScrollY = window.scrollY;
let isScrolling = false;
let currentHash = window.location.hash;

function onScroll() {
    lastScrollY = window.scrollY;
    
    if (lastScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (lastScrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }

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
        if (lastScrollY >= sectionTop - 300) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });

    if (current && current !== currentHash) {
        history.replaceState(null, null, '#' + current);
        currentHash = current;
    }
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

const typedTextSpan = document.querySelector('.typed-text');
const texts = ['Étudiant BTS SIO SISR'];
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
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typeSpeed = 500;
    }
    
    setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(type, 1000);
});

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
                alert("Merci ! Votre message a été envoyé avec succès");
                contactForm.reset();
            } else {
                alert("Oups ! Il y a eu un problème");
            }
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'envoi");
        }
    });
}

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            history.pushState(null, null, targetId);
            currentHash = targetId;

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});