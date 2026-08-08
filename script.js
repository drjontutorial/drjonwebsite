const testimonials = [
  {
    quote:
      "He is an exceptional teacher who helped me to achieved my dream to study engineering in at the University of Oxford. With his help, I constantly gain confidence and be able to achieve get 84 out of 100marks, top 5% of all candidates, in PAT.",
    name: "Rex, A-Level Physics & Further Maths, and Oxford PAT"
  },
  {
    quote:
      "The structure of lessons, the exam-style drills and the weekly feedback kept me focused. I felt much more prepared for the highest-mark questions than I ever did with ordinary past papers.",
    name: "Student, A-Level Maths and Physics"
  },
  {
    quote:
      "Dr Jon combines deep subject knowledge with a very clear teaching style. The sessions built confidence quickly and helped turn weak topics into scoring opportunities.",
    name: "Parent feedback, GCSE & A-Level support"
  }
];

const cards = Array.from(document.querySelectorAll("[data-testimonial]"));
const dots = Array.from(document.querySelectorAll(".dot"));
const testimonialProgress = document.querySelector("[data-testimonial-progress]");
const testimonialShell = document.querySelector(".testimonial-shell");
const testimonialStage = document.querySelector(".testimonial-stage");
let activeIndex = 0;
let timerId = null;
const testimonialDurationMs = 5000;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let isPointerDragging = false;
let pointerStartX = 0;
let pointerDeltaX = 0;

function restartTestimonialProgress() {
  if (!testimonialProgress) {
    return;
  }
  testimonialProgress.style.animation = "none";
  void testimonialProgress.offsetWidth;
  testimonialProgress.style.animation = `testimonialProgressFill ${testimonialDurationMs}ms linear forwards`;
}

function showTestimonial(index) {
  activeIndex = index;
  cards.forEach((card, idx) => {
    card.classList.toggle("active", idx === index);
  });
  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === index);
    dot.setAttribute("aria-pressed", String(idx === index));
  });
  restartTestimonialProgress();
}

function nextTestimonial() {
  showTestimonial((activeIndex + 1) % cards.length);
}

function prevTestimonial() {
  showTestimonial((activeIndex - 1 + cards.length) % cards.length);
}

function resetTimer() {
  if (prefersReducedMotion.matches || cards.length < 2) {
    return;
  }
  if (timerId) {
    clearInterval(timerId);
  }
  timerId = setInterval(nextTestimonial, testimonialDurationMs);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showTestimonial(index);
    resetTimer();
  });
});

if (cards.length && dots.length) {
  showTestimonial(0);
  resetTimer();
}

if (testimonialShell && testimonialStage && cards.length > 1) {
  testimonialShell.addEventListener("mouseenter", () => {
    stopTimer();
    if (testimonialProgress) {
      testimonialProgress.style.animationPlayState = "paused";
    }
  });

  testimonialShell.addEventListener("mouseleave", () => {
    if (testimonialProgress) {
      testimonialProgress.style.animationPlayState = "running";
    }
    restartTestimonialProgress();
    resetTimer();
  });

  testimonialShell.addEventListener("pointerdown", (event) => {
    isPointerDragging = true;
    pointerStartX = event.clientX;
    pointerDeltaX = 0;
    testimonialShell.classList.add("is-dragging");
    testimonialStage.style.transition = "none";
    stopTimer();
    if (testimonialProgress) {
      testimonialProgress.style.animationPlayState = "paused";
    }
  });

  window.addEventListener("pointermove", (event) => {
    if (!isPointerDragging) {
      return;
    }

    pointerDeltaX = event.clientX - pointerStartX;
    const constrained = Math.max(-72, Math.min(72, pointerDeltaX * 0.22));
    testimonialStage.style.transform = `translate3d(${constrained}px, 0, 0)`;
  });

  window.addEventListener("pointerup", () => {
    if (!isPointerDragging) {
      return;
    }

    isPointerDragging = false;
    testimonialShell.classList.remove("is-dragging");
    testimonialStage.style.transition = "";
    testimonialStage.style.transform = "";

    if (pointerDeltaX <= -52) {
      nextTestimonial();
    } else if (pointerDeltaX >= 52) {
      prevTestimonial();
    } else {
      showTestimonial(activeIndex);
    }

    if (testimonialProgress) {
      testimonialProgress.style.animationPlayState = "running";
    }
    resetTimer();
  });
}

const revealCards = Array.from(document.querySelectorAll(".reveal-card"));

if (revealCards.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px"
  });

  revealCards.forEach((card) => {
    revealObserver.observe(card);
  });
}

const counters = Array.from(document.querySelectorAll("[data-counter-target]"));

function animateCounter(element) {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.getAttribute("data-counter-target") || "0");
  const suffix = element.getAttribute("data-counter-suffix") || "";
  const duration = 1600;
  const start = performance.now();
  element.dataset.counted = "true";

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      element.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(frame);
}

if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.45
  });

  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });
}

const parallaxSections = Array.from(document.querySelectorAll(
  ".hero, .results, .about-hero-band, .tp-support, .tp-method, .sp-hero, .sp-map, .mock-hero, .mock-showcase, .faq-section"
));

if (parallaxSections.length && !prefersReducedMotion.matches) {
  let parallaxFrame = 0;

  const updateParallax = () => {
    const viewportHeight = window.innerHeight || 1;

    parallaxSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > viewportHeight + 120) {
        return;
      }

      const midpoint = rect.top + rect.height / 2;
      const distance = midpoint - viewportHeight / 2;
      const shift = distance * -0.045;
      section.style.setProperty("--parallax-shift", `${shift.toFixed(2)}px`);
    });

    parallaxFrame = 0;
  };

  const requestParallax = () => {
    if (parallaxFrame) {
      return;
    }
    parallaxFrame = requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
  requestParallax();
}

const yearSlot = document.querySelector("[data-year]");
if (yearSlot) {
  yearSlot.textContent = String(new Date().getFullYear());
}

const publicationsBlock = document.querySelector("[data-publications]");
const publicationsToggle = document.querySelector("[data-publications-toggle]");

if (publicationsBlock && publicationsToggle) {
  publicationsToggle.addEventListener("click", () => {
    const expanded = publicationsBlock.getAttribute("data-expanded") === "true";
    const next = !expanded;
    publicationsBlock.setAttribute("data-expanded", String(next));
    publicationsToggle.setAttribute("aria-expanded", String(next));
    publicationsToggle.textContent = next ? "Read less" : "Read more";
  });
}

const faqTabs = Array.from(document.querySelectorAll("[data-faq-tab]"));
const faqItems = Array.from(document.querySelectorAll(".faq-item"));
const faqSearch = document.querySelector("[data-faq-search]");

function setFaqTab(category) {
  faqTabs.forEach((tab) => {
    const active = tab.getAttribute("data-faq-tab") === category;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  faqItems.forEach((item) => {
    const visible = item.getAttribute("data-faq-category") === category;
    item.hidden = !visible;
  });
}

faqTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setFaqTab(tab.getAttribute("data-faq-tab"));
  });
});

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const open = item.classList.contains("is-open");
    item.classList.toggle("is-open", !open);
    button.setAttribute("aria-expanded", String(!open));
  });
});

if (faqSearch) {
  faqSearch.addEventListener("input", () => {
    const query = faqSearch.value.trim().toLowerCase();
    faqItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const matches = !query || text.includes(query);
      item.hidden = !matches;
    });

    faqTabs.forEach((tab) => {
      tab.classList.remove("is-active");
      tab.setAttribute("aria-selected", "false");
    });
  });
}

if (faqTabs.length && faqItems.length) {
  setFaqTab("general");
}

const contactForms = Array.from(document.querySelectorAll(".contact-form"));
const whatsappNumber = "447770898727";

function buildWhatsappMessage(form) {
  const formData = new FormData(form);
  const firstName = String(formData.get("first-name") || "").trim();
  const lastName = String(formData.get("last-name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const programme = String(formData.get("programme") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return [
    "Hello Dr Jon, I would like to book an assessment.",
    "",
    `Name: ${fullName || "Not provided"}`,
    `Email: ${email || "Not provided"}`,
    `Phone: ${phone || "Not provided"}`,
    `Programme interested: ${programme || "Not provided"}`,
    "",
    `Message: ${message || "Not provided"}`
  ].join("\n");
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
  }

  return copied;
}

contactForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const text = buildWhatsappMessage(form);

    try {
      await copyTextToClipboard(text);
    } catch (error) {
      // WhatsApp still opens with the message pre-filled if clipboard access is blocked.
    }

    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  });
});
