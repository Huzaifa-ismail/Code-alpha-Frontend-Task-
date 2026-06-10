document.querySelectorAll('.nav-links a, .hero-buttons a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId === "#" || targetId === "") return;
            const targetEl = document.querySelector(targetId);
            if(targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Animate skill bars on scroll
    const progressBars = document.querySelectorAll('.skill-progress');
    function animateSkills() {
        progressBars.forEach(bar => {
            const widthVal = bar.getAttribute('data-width');
            const rect = bar.getBoundingClientRect();
            if(rect.top < window.innerHeight - 100 && rect.bottom > 0 && !bar.style.width) {
                bar.style.width = widthVal + '%';
            }
        });
    }

    // Scroll reveal observer
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -20px 0px" });
    revealElements.forEach(el => observer.observe(el));

    // Resume buttons - dummy action (alert to mock download)
    const downloadBtn = document.getElementById('downloadResumeBtn');
    const viewBtn = document.getElementById('viewResumeBtn');
    if(downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("📄 Resume PDF download simulation: 'Alex_Rivera_Resume.pdf' would be downloaded. (Portfolio ready for deployment)");
        });
    }
    if(viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("👨‍💻 Resume Preview: Alex Rivera - 4+ years of experience, expertise in React, frontend architecture, and creative direction.");
        });
    }

    // contact form message simulation
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedback = document.getElementById('formFeedback');
            feedback.innerHTML = "✨ Thanks! I'll get back to you within 24 hours.";
            feedback.style.color = "#1f6e8c";
            form.reset();
            setTimeout(() => { feedback.innerHTML = ""; }, 3500);
        });
    }

    // initial skill bar trigger + animation on load
    window.addEventListener('load', () => {
        animateSkills();
        // small trigger to show progress on visible ones
        setTimeout(animateSkills, 400);
    });
    window.addEventListener('scroll', () => {
        animateSkills();
    });

    // additional hover + active state for the navbar consistency
    console.log("Portfolio active — smooth scroll, animations, responsive ready.");