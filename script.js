const onboardingState = {
  email: "",
  password: "",
  rememberFor30Days: false,
  authMethod: null,
  companyName: "",
  website: "",
  ecommercePlatform: "Shopify",
  industry: "",
  primaryProductLine: "",
  monthlyTraffic: "10k-50k",
  connectedSources: {
    shopify: true,
    metaAds: false,
    ga4: false,
    klaviyo: false,
    googleAds: false,
  },
  selectedPersonaMethod: "manual",
  personas: [],
  currentPersonaIndex: 0,
  currentLanguageModule: "cultural",
  editingIndex: null,
  personaFormOrigin: "5.1",
  editingSection: null,
  focusedPersona: null,
  activePersonaTab: "athlete",
  viewMode: "side-by-side",
  experienceEditingSection: "header",
  experienceDraft: null,
  launching: false,
  appliedRecommendations: [],
  brandSystemDraft: null,
  brandSystem: {
    source: {
      domain: "orbital.world",
      otherPages: 11,
      pagesAnalyzed: 12,
      copyBlocks: 84,
      imagesScanned: 37,
    },
    colors: [
      { name: "Midnight", hex: "#002838" },
      { name: "Frost", hex: "#E3F5FC" },
      { name: "Powder", hex: "#BFE2F2" },
      { name: "Slate", hex: "#8BB7CB" },
      { name: "Brand", hex: "#5DA5F7" },
      { name: "Active", hex: "#01549A" },
    ],
    logos: [
      { id: "light", variant: 0 },
      { id: "dark", variant: 0 },
      { id: "favicon", variant: 0 },
    ],
    imagery: {
      tiles: [0, 0, 0, 0],
      tags: ["Clean & bright", "Product forward", "Minimal styling", "Soft natural light"],
    },
    typography: {
      heading: "Own your world.",
      body: "Orbital routes ad traffic into persona-specific landing pages, built from your brand system.",
    },
    voice: {
      tags: ["Playful", "Direct", "Science-backed", "Warm"],
      quotes: [
        { text: "Own your world.", source: "Homepage · hero headline" },
        { text: "Feel good, look good — every single day.", source: "About page · intro paragraph" },
        { text: "Backed by science, loved by your gut.", source: "Product page · Purr description" },
      ],
    },
    buttons: {
      primary: "Primary action",
      secondary: "Secondary action",
    },
  },
};

const PERSONA_DRAFTS = [
  {
    name: "Deal Seeker",
    audience: "25–34 · Value-conscious · Mobile-first shoppers",
    description:
      "Price-driven shoppers who wait for sales and compare deals before buying. Motivated by urgency and visible savings.",
    exampleLanguage: "“50% Off Ends Tonight — Grab It Before It's Gone”",
    languageModule: "cultural",
    landingPageNotes: "“50% Off Ends Tonight — Grab It Before It's Gone”",
  },
  {
    name: "Performance Pro",
    audience: "18–34 · Fitness enthusiasts · Repeat athletic gear buyers",
    description:
      "Performance-focused customers who want proof a product works before buying. Motivated by data, credibility, and results.",
    exampleLanguage: "“Train Smarter. Hit Your PRs This Summer.”",
    languageModule: "cultural",
    landingPageNotes: "“Train Smarter. Hit Your PRs This Summer.”",
  },
  {
    name: "Wellness Curious",
    audience: "22–38 · Wellness & self-care focused · Instagram-active",
    description:
      "Lifestyle-driven shoppers exploring wellness routines. Motivated by aesthetic appeal and how a product fits their identity.",
    exampleLanguage: "“Feel Good, Look Good — Your Everyday Ritual”",
    languageModule: "cultural",
    landingPageNotes: "“Feel Good, Look Good — Your Everyday Ritual”",
  },
  {
    name: "Loyal Subscriber",
    audience: "All ages · Existing customers · 2+ past purchases",
    description:
      "Existing customers who've purchased before. Motivated by recognition, convenience, and rewards for repeat behavior.",
    exampleLanguage: "“Welcome Back — Your Favorites, Restocked”",
    languageModule: "cultural",
    landingPageNotes: "“Welcome Back — Your Favorites, Restocked”",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let currentStep = 1;
let toastTimer = null;

function getScreen(step) {
  if (step === "loading") return document.querySelector('[data-step="loading"]');
  if (step === "brand") return document.querySelector('[data-step="brand"]');
  if (step === "campaign") return document.querySelector('[data-step="campaign"]');
  if (step === "experience") return document.querySelector('[data-step="experience"]');
  if (step === "launch") return document.querySelector('[data-step="launch"]');
  if (step === "overview") return document.querySelector('[data-step="overview"]');
  if (step === 1) return document.querySelector('[data-step="1"]');
  return document.querySelector('[data-step="onboarding"]');
}

function updateStepper(step) {
  document.querySelectorAll(".step[data-step-index]").forEach((el) => {
    const index = Number(el.dataset.stepIndex);
    el.classList.remove("is-complete", "is-current", "is-upcoming");

    if (index < step) el.classList.add("is-complete");
    else if (index === step) el.classList.add("is-current");
    else el.classList.add("is-upcoming");

    const icon = el.querySelector(".step-icon");
    if (!icon) return;

    if (index < step) {
      icon.innerHTML = '<img src="assets/icon-check.svg" alt="" />';
    } else {
      icon.textContent = String(index);
    }
  });
}

function panelIdFor(step) {
  if (step === 5 || step === "5" || step === "5.1") return "5.1";
  return String(step);
}

function stepperIndexFor(step) {
  const numeric = Number(step);
  if (Number.isNaN(numeric)) return 5;
  return Math.floor(numeric);
}

function showOnboardingPanel(step) {
  const main = document.querySelector(".onboarding-main");
  const panelId = panelIdFor(step);

  document.querySelectorAll(".onboarding-panel").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== panelId;
  });

  if (main) {
    main.classList.toggle("is-centered", panelId === "3" || panelId === "5.1");
    main.classList.toggle("is-form", panelId === "5.2");
    main.classList.toggle("is-wide", panelId === "4" || panelId === "5.3");
  }
}

function resetScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.querySelectorAll(".onboarding-main, .experience-body, .dashboard-main").forEach((el) => {
    el.scrollTop = 0;
  });
}

function goToStep(step) {
  resetScroll();
  requestAnimationFrame(resetScroll);

  if (step === "overview") {
    document.querySelectorAll(".screen").forEach((screen) => {
      const isActive = screen.dataset.step === "overview";
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.body.classList.remove("is-loading");
    if (currentStep === "loading") stopLoadingOrbit();
    currentStep = "overview";
    renderOverviewScreen();
    return;
  }

  if (step === "launch") {
    document.querySelectorAll(".screen").forEach((screen) => {
      const isActive = screen.dataset.step === "launch";
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.body.classList.remove("is-loading");
    if (currentStep === "loading") stopLoadingOrbit();
    currentStep = "launch";
    onboardingState.launching = false;
    renderLaunchScreen();
    return;
  }

  if (step === "experience") {
    document.querySelectorAll(".screen").forEach((screen) => {
      const isActive = screen.dataset.step === "experience";
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.body.classList.remove("is-loading");
    if (currentStep === "loading") stopLoadingOrbit();
    currentStep = "experience";
    resetExperienceReview();
    renderExperienceReview();
    return;
  }

  if (step === "campaign") {
    document.querySelectorAll(".screen").forEach((screen) => {
      const isActive = screen.dataset.step === "campaign";
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.body.classList.remove("is-loading");
    if (currentStep === "loading") stopLoadingOrbit();
    currentStep = "campaign";
    renderCampaignDashboard();
    return;
  }

  if (step === "brand") {
    document.querySelectorAll(".screen").forEach((screen) => {
      const isActive = screen.dataset.step === "brand";
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.body.classList.remove("is-loading");
    if (currentStep === "loading") stopLoadingOrbit();
    currentStep = "brand";
    renderBrandSystem();
    return;
  }

  if (step === "loading") {
    document.querySelectorAll(".screen").forEach((screen) => {
      const isActive = screen.dataset.step === "loading";
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    document.body.classList.add("is-loading");
    currentStep = "loading";
    startLoadingOrbit();
    return;
  }

  document.body.classList.remove("is-loading");
  if (currentStep === "loading") stopLoadingOrbit();

  const stepperStep = stepperIndexFor(step);
  const next = getScreen(stepperStep);
  if (!next) return;

  document.querySelectorAll(".screen").forEach((screen) => {
    const isAuth = screen.dataset.step === "1";
    const isOnboarding = screen.dataset.step === "onboarding";
    const isActive = stepperStep === 1 ? isAuth : isOnboarding;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });

  if (stepperStep >= 2) {
    showOnboardingPanel(step);
    updateStepper(stepperStep);
  }

  currentStep = typeof step === "string" && step.startsWith("5.") ? step : stepperStep;

  if (panelIdFor(step) === "5.3") renderReviewPersonas();
}

function nextStep() {
  goToStep(stepperIndexFor(currentStep) + 1);
}

function previousStep() {
  goToStep(Math.max(1, stepperIndexFor(currentStep) - 1));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function persistCreateWorkspaceState() {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const remember = document.getElementById("remember");

  onboardingState.email = email ? email.value.trim() : "";
  onboardingState.password = password ? password.value : "";
  onboardingState.rememberFor30Days = Boolean(remember && remember.checked);
}

function setFieldError(name, message) {
  const field = document.querySelector(`[data-field="${name}"]`);
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (!field || !error) return;

  const invalid = Boolean(message);
  field.classList.toggle("is-invalid", invalid);
  error.hidden = !invalid;
  error.textContent = message || "";
}

function clearFieldError(name) {
  setFieldError(name, "");
}

function validateCreateWorkspaceForm() {
  persistCreateWorkspaceState();

  let isValid = true;

  if (!onboardingState.email) {
    setFieldError("email", "Enter your work email.");
    isValid = false;
  } else if (!EMAIL_PATTERN.test(onboardingState.email)) {
    setFieldError("email", "Enter a valid work email.");
    isValid = false;
  } else {
    clearFieldError("email");
  }

  if (!onboardingState.password) {
    setFieldError("password", "Create a password.");
    isValid = false;
  } else {
    clearFieldError("password");
  }

  return isValid;
}

function bindCreateWorkspaceScreen() {
  const form = document.getElementById("create-workspace-form");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const remember = document.getElementById("remember");
  const togglePassword = document.getElementById("toggle-password");
  const googleButton = document.getElementById("google-signin");
  const forgotPassword = document.getElementById("forgot-password");
  const signUp = document.getElementById("sign-up");

  email.addEventListener("input", () => {
    persistCreateWorkspaceState();
    if (email.value.trim()) clearFieldError("email");
  });
  password.addEventListener("input", () => {
    persistCreateWorkspaceState();
    if (password.value) clearFieldError("password");
  });
  remember.addEventListener("change", persistCreateWorkspaceState);

  togglePassword.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    togglePassword.setAttribute("aria-pressed", String(show));
    togglePassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateCreateWorkspaceForm()) return;

    onboardingState.authMethod = onboardingState.authMethod || "email";
    nextStep();
  });

  googleButton.addEventListener("click", () => {
    if (googleButton.disabled) return;

    const label = googleButton.querySelector(".google-signin-label");
    const original = label.textContent;
    googleButton.disabled = true;
    label.textContent = "Connecting…";

    window.setTimeout(() => {
      email.value = onboardingState.email || "alex@company.com";
      password.value = onboardingState.password || "orbital-demo";
      remember.checked = true;
      onboardingState.authMethod = "google";
      persistCreateWorkspaceState();
      clearFieldError("email");
      clearFieldError("password");
      label.textContent = original;
      googleButton.disabled = false;
      showToast("Google sign-in simulated.");
    }, 900);
  });

  forgotPassword.addEventListener("click", () => {
    showToast("Password reset is simulated in this prototype.");
  });

  signUp.addEventListener("click", () => {
    showToast("Account creation is simulated in this prototype.");
  });
}

function getBusinessFormState() {
  return {
    companyName: onboardingState.companyName,
    website: onboardingState.website,
    ecommercePlatform: onboardingState.ecommercePlatform,
    industry: onboardingState.industry,
    primaryProductLine: onboardingState.primaryProductLine,
    monthlyTraffic: onboardingState.monthlyTraffic,
  };
}

function selectPill(group, value) {
  group.querySelectorAll(".pill").forEach((pill) => {
    pill.classList.toggle("is-selected", pill.dataset.value === value);
  });
}

function bindPillGroup(group) {
  const key = group.dataset.group;
  group.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      onboardingState[key] = pill.dataset.value;
      selectPill(group, pill.dataset.value);
    });
  });
}

function bindIndustrySelect() {
  const root = document.querySelector('[data-select="industry"]');
  if (!root) return;

  const trigger = root.querySelector(".select-trigger");
  const valueEl = root.querySelector(".select-value");
  const menu = root.querySelector(".select-menu");

  const close = () => {
    root.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const open = () => {
    root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  trigger.addEventListener("click", () => {
    if (menu.hidden) open();
    else close();
  });

  menu.querySelectorAll("[role='option']").forEach((option) => {
    option.addEventListener("click", () => {
      onboardingState.industry = option.dataset.value;
      valueEl.textContent = option.dataset.value;
      valueEl.classList.remove("is-placeholder");
      menu.querySelectorAll("[role='option']").forEach((item) => {
        item.setAttribute("aria-selected", String(item === option));
      });
      close();
    });
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) close();
  });
}

function bindBusinessScreen() {
  const form = document.getElementById("business-form");
  const companyName = document.getElementById("company-name");
  const website = document.getElementById("website");
  const productLine = document.getElementById("product-line");

  if (!form) return;

  companyName.addEventListener("input", () => {
    onboardingState.companyName = companyName.value;
  });
  website.addEventListener("input", () => {
    onboardingState.website = website.value;
  });
  productLine.addEventListener("input", () => {
    onboardingState.primaryProductLine = productLine.value;
  });

  document.querySelectorAll(".pill-group").forEach(bindPillGroup);
  bindIndustrySelect();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Continue clicked", getBusinessFormState());
    goToStep(3);
  });
}

function isShopifyConnected() {
  return Boolean(onboardingState.connectedSources.shopify);
}

function canContinueSources() {
  return isShopifyConnected();
}

function getConnectionState() {
  return { ...onboardingState.connectedSources };
}

function updateSourcesContinue() {
  const button = document.getElementById("sources-continue");
  if (!button) return;
  button.disabled = !canContinueSources();
}

function renderSourceCard(card) {
  const key = card.dataset.source;
  const connected = Boolean(onboardingState.connectedSources[key]);
  const button = card.querySelector(".btn-connect");
  const icon = card.querySelector(".btn-connect-icon");
  const label = button.querySelector("span");

  card.classList.toggle("is-connected", connected);
  button.classList.toggle("is-connected", connected);
  button.classList.remove("is-loading");
  if (icon) icon.hidden = !connected;
  if (label) label.textContent = connected ? "Connected" : "Connect";
}

function setSourceConnected(key, connected) {
  onboardingState.connectedSources[key] = connected;
  const card = document.querySelector(`.source-card[data-source="${key}"]`);
  if (card) renderSourceCard(card);
  updateSourcesContinue();
}

function bindSourcesScreen() {
  const continueButton = document.getElementById("sources-continue");
  if (!continueButton) return;

  document.querySelectorAll(".source-card").forEach((card) => {
    const key = card.dataset.source;
    const locked = card.dataset.locked === "true";
    const button = card.querySelector(".btn-connect");

    renderSourceCard(card);

    button.addEventListener("click", () => {
      if (locked) {
        showToast("Shopify is required and can't be disconnected");
        return;
      }

      if (button.classList.contains("is-loading")) return;

      const currentlyConnected = Boolean(onboardingState.connectedSources[key]);

      if (currentlyConnected) {
        setSourceConnected(key, false);
        return;
      }

      const label = button.querySelector("span");
      button.classList.add("is-loading");
      label.textContent = "Connecting…";

      window.setTimeout(() => {
        setSourceConnected(key, true);
      }, 500);
    });
  });

  updateSourcesContinue();

  continueButton.addEventListener("click", () => {
    if (!canContinueSources()) return;
    const connectionState = getConnectionState();
    console.log("Continue clicked", connectionState);
    goToStep(4);
  });
}

function applyAdSearch(query) {
  const needle = query.trim().toLowerCase();

  document.querySelectorAll(".campaign-section").forEach((section) => {
    const rows = section.querySelectorAll(".ad-table-row:not(.ad-table-head)");
    let visibleCount = 0;

    rows.forEach((row) => {
      const name = (row.dataset.adName || "").toLowerCase();
      const matches = !needle || name.includes(needle);
      row.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    section.hidden = Boolean(needle) && visibleCount === 0;
  });
}

function setFiltersOpen(open) {
  const wrap = document.querySelector(".filters-wrap");
  const toggle = document.getElementById("filters-toggle");
  const panel = document.getElementById("filters-panel");
  if (!wrap || !toggle || !panel) return;

  wrap.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  panel.hidden = !open;
}

function bindCampaignsScreen() {
  const search = document.getElementById("ad-search");
  const resync = document.getElementById("resync-meta");
  const filtersToggle = document.getElementById("filters-toggle");
  const continueButton = document.getElementById("campaigns-continue");
  if (!search || !resync || !filtersToggle || !continueButton) return;

  search.addEventListener("input", () => {
    applyAdSearch(search.value);
  });

  document.addEventListener("keydown", (event) => {
    const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (!isModK) return;
    if (currentStep !== 4) return;
    event.preventDefault();
    search.focus();
  });

  resync.addEventListener("click", () => {
    console.log("Redirect to Meta");
  });

  filtersToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = filtersToggle.getAttribute("aria-expanded") === "true";
    setFiltersOpen(!isOpen);
  });

  document.addEventListener("click", (event) => {
    const wrap = document.querySelector(".filters-wrap");
    if (!wrap || wrap.contains(event.target)) return;
    setFiltersOpen(false);
  });

  continueButton.addEventListener("click", () => {
    console.log("Continue clicked", { publishedCount: 4, draftCount: 2 });
    goToStep(5);
  });

  document.querySelectorAll(".ad-table").forEach((table) => {
    table.addEventListener("click", (event) => {
      const action = event.target.closest("[data-ad-open]");
      if (!action) return;
      const row = action.closest(".ad-table-row");
      console.log("Open ad", { name: row?.dataset.adName });
    });
  });
}

function renderPersonaMethodCards() {
  document.querySelectorAll(".method-card").forEach((card) => {
    const selected = card.dataset.method === onboardingState.selectedPersonaMethod;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-checked", String(selected));
  });
}

function setPersonaMethod(method) {
  onboardingState.selectedPersonaMethod = method;
  renderPersonaMethodCards();
}

function bindPersonaMethodScreen() {
  const continueButton = document.getElementById("personas-method-continue");
  if (!continueButton) return;

  document.querySelectorAll(".method-card").forEach((card) => {
    card.addEventListener("click", () => {
      setPersonaMethod(card.dataset.method);
    });
  });

  renderPersonaMethodCards();

  continueButton.addEventListener("click", () => {
    const method = onboardingState.selectedPersonaMethod;
    console.log("Continue clicked", { method });

    if (method === "manual") {
      openNewPersonaForm("5.1");
    }
  });
}

const PERSONA_MATERIAL_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"];
const PERSONA_MATERIAL_EXTS = [".svg", ".png", ".jpg", ".jpeg", ".gif"];

let personaFormMaterials = [];

function isPersonaMaterialFile(file) {
  const name = String(file.name || "").toLowerCase();
  const extOk = PERSONA_MATERIAL_EXTS.some((ext) => name.endsWith(ext));
  const typeOk = !file.type || PERSONA_MATERIAL_TYPES.includes(file.type);
  return extOk && typeOk;
}

function renderPersonaMaterials() {
  const list = document.getElementById("persona-upload-files");
  if (!list) return;
  if (!personaFormMaterials.length) {
    list.hidden = true;
    list.innerHTML = "";
    return;
  }
  list.hidden = false;
  list.innerHTML = personaFormMaterials
    .map((file) => `<li>${escapeHtml(file.name)}</li>`)
    .join("");
}

function addPersonaMaterials(fileList) {
  const incoming = Array.from(fileList || []).filter(isPersonaMaterialFile);
  incoming.forEach((file) => {
    if (personaFormMaterials.some((item) => item.name === file.name && item.size === file.size)) return;
    personaFormMaterials.push({ name: file.name, size: file.size });
  });
  renderPersonaMaterials();
}

function bindPersonaUpload() {
  const zone = document.querySelector(".persona-upload");
  const input = document.getElementById("persona-materials");
  if (!zone || !input) return;

  input.addEventListener("change", () => {
    addPersonaMaterials(input.files);
    input.value = "";
  });

  zone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    zone.classList.add("is-dragging");
  });
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("is-dragging");
  });
  zone.addEventListener("dragleave", (event) => {
    if (zone.contains(event.relatedTarget)) return;
    zone.classList.remove("is-dragging");
  });
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-dragging");
    addPersonaMaterials(event.dataTransfer ? event.dataTransfer.files : []);
  });
}

function getPersonaFormFields() {
  return {
    name: document.getElementById("persona-name"),
    audience: document.getElementById("persona-audience"),
    description: document.getElementById("persona-description"),
    exampleLanguage: document.getElementById("persona-example"),
    landingPageNotes: document.getElementById("persona-landing"),
  };
}

function readPersonaForm() {
  const fields = getPersonaFormFields();
  return {
    name: fields.name ? fields.name.value.trim() : "",
    audience: fields.audience ? fields.audience.value.trim() : "",
    description: fields.description ? fields.description.value.trim() : "",
    exampleLanguage: fields.exampleLanguage ? fields.exampleLanguage.value.trim() : "",
    languageModule: onboardingState.currentLanguageModule || "cultural",
    landingPageNotes: fields.landingPageNotes ? fields.landingPageNotes.value.trim() : "",
    materials: personaFormMaterials.map((file) => ({ name: file.name, size: file.size })),
  };
}

function renderLanguageModuleCards() {
  document.querySelectorAll(".module-card").forEach((card) => {
    const selected = card.dataset.module === onboardingState.currentLanguageModule;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-checked", String(selected));
  });
}

function setLanguageModule(module) {
  onboardingState.currentLanguageModule = module;
  renderLanguageModuleCards();
}

function updatePersonaCounter() {
  const counter = document.getElementById("persona-counter");
  if (!counter) return;
  const n = Math.min(onboardingState.currentPersonaIndex + 1, 4);
  counter.textContent = `Persona ${n} of 4 · Tell Orbital who you're building this experience for.`;
}

function updateAddAnotherState() {
  const button = document.getElementById("persona-add-another");
  if (!button) return;
  button.disabled = onboardingState.currentPersonaIndex >= 3 || onboardingState.personas.length >= 4;
}

function fillPersonaForm(draft) {
  const fields = getPersonaFormFields();
  if (fields.name) fields.name.value = draft.name;
  if (fields.audience) fields.audience.value = draft.audience;
  if (fields.description) fields.description.value = draft.description;
  if (fields.exampleLanguage) fields.exampleLanguage.value = draft.exampleLanguage;
  if (fields.landingPageNotes) fields.landingPageNotes.value = draft.landingPageNotes;
  personaFormMaterials = Array.isArray(draft.materials)
    ? draft.materials.map((file) => ({ name: file.name, size: file.size }))
    : [];
  renderPersonaMaterials();
  setLanguageModule(draft.languageModule || "cultural");
  updatePersonaCounter();
  updateAddAnotherState();
}

function openNewPersonaForm(origin) {
  onboardingState.editingIndex = null;
  onboardingState.personaFormOrigin = origin;
  onboardingState.currentPersonaIndex = Math.min(onboardingState.personas.length, 3);
  const draft = PERSONA_DRAFTS[onboardingState.currentPersonaIndex] || PERSONA_DRAFTS[0];
  fillPersonaForm(draft);
  goToStep("5.2");
}

function openEditPersonaForm(index) {
  const persona = onboardingState.personas[index];
  if (!persona) return;

  onboardingState.editingIndex = index;
  onboardingState.personaFormOrigin = "5.3";
  onboardingState.currentPersonaIndex = index;
  fillPersonaForm(persona);
  goToStep("5.2");
}

function saveCurrentPersona() {
  const persona = readPersonaForm();
  const index = onboardingState.editingIndex;

  if (index !== null && index >= 0 && index < onboardingState.personas.length) {
    onboardingState.personas[index] = persona;
  } else {
    onboardingState.personas.push(persona);
  }

  onboardingState.editingIndex = null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function languageModuleLabel(module) {
  return module === "scientific" ? "Scientific / Mechanism Language" : "Cultural Language";
}

function renderReviewPersonas() {
  const grid = document.getElementById("review-grid");
  const subtitle = document.getElementById("review-subtitle");
  const addButton = document.getElementById("review-add");
  if (!grid) return;

  const count = onboardingState.personas.length;
  if (subtitle) {
    subtitle.textContent = `These are your ${count} personas. Edit anything that’s off.`;
  }
  if (addButton) addButton.hidden = count >= 4;

  grid.innerHTML = onboardingState.personas
    .map((persona, index) => {
      const moduleClass = persona.languageModule === "scientific" ? "is-scientific" : "is-cultural";
      return `
        <article class="review-card" data-persona-index="${index}">
          <div class="review-card-top">
            <h2 class="review-card-name">${escapeHtml(persona.name)}</h2>
            <span class="module-badge ${moduleClass}">${escapeHtml(languageModuleLabel(persona.languageModule))}</span>
          </div>
          <div class="review-block">
            <p class="review-label">Description (ICP)</p>
            <p class="review-value">${escapeHtml(persona.description)}</p>
          </div>
          <div class="review-block">
            <p class="review-label">Target audience</p>
            <p class="review-value">${escapeHtml(persona.audience)}</p>
          </div>
          <div class="review-block review-example">
            <p class="review-label">Example language</p>
            <p class="review-value">${escapeHtml(persona.exampleLanguage)}</p>
          </div>
          <p class="review-included">
            <span class="review-included-label">Also included in every experience:</span>
            <span class="review-included-value">Social Proof · Offer</span>
          </p>
          <div class="review-card-actions">
            <button type="button" class="btn-outline is-sm" data-edit-persona="${index}">
              <span>Edit</span>
            </button>
            <button type="button" class="btn-outline is-sm" data-regenerate-persona="${index}">
              <img src="assets/icon-regenerate.svg" alt="" width="16" height="16" />
              <span>Regenerate</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function bindAddPersonaScreen() {
  const form = document.getElementById("persona-form");
  const back = document.getElementById("persona-back");
  const addAnother = document.getElementById("persona-add-another");
  if (!form || !back || !addAnother) return;

  document.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => {
      setLanguageModule(card.dataset.module);
    });
  });

  bindPersonaUpload();

  back.addEventListener("click", () => {
    const origin = onboardingState.personaFormOrigin === "5.3" || onboardingState.editingIndex !== null ? "5.3" : "5.1";
    onboardingState.editingIndex = null;
    goToStep(origin);
  });

  addAnother.addEventListener("click", () => {
    if (addAnother.disabled) return;
    saveCurrentPersona();
    if (onboardingState.personas.length >= 4) {
      goToStep("5.3");
      return;
    }
    onboardingState.personaFormOrigin = onboardingState.personaFormOrigin === "5.3" ? "5.3" : "5.1";
    onboardingState.currentPersonaIndex = onboardingState.personas.length;
    fillPersonaForm(PERSONA_DRAFTS[onboardingState.currentPersonaIndex]);
    resetScroll();
    requestAnimationFrame(resetScroll);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCurrentPersona();
    console.log("Save Persona", onboardingState.personas);
    goToStep("5.3");
  });
}

function bindReviewPersonasScreen() {
  const addButton = document.getElementById("review-add");
  const continueButton = document.getElementById("review-continue");
  const grid = document.getElementById("review-grid");
  if (!addButton || !continueButton || !grid) return;

  addButton.addEventListener("click", () => {
    if (onboardingState.personas.length >= 4) return;
    openNewPersonaForm("5.3");
  });

  continueButton.addEventListener("click", () => {
    console.log("Continue clicked", onboardingState.personas);
    goToStep("loading");
  });

  grid.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-persona]");
    if (edit) {
      openEditPersonaForm(Number(edit.dataset.editPersona));
      return;
    }

    const regenerate = event.target.closest("[data-regenerate-persona]");
    if (!regenerate) return;

    const card = regenerate.closest(".review-card");
    if (!card || card.classList.contains("is-loading")) return;

    card.classList.add("is-loading");
    window.setTimeout(() => {
      card.classList.remove("is-loading");
    }, 600);
  });
}

const LOADING_STOP_COUNT = 7;
const LOADING_DWELL_MS = 1200;
const LOADING_TRAVEL_MS = 700;
const LOADING_CHECKLIST = [
  { title: "Reading ad creatives", sub: "12 creatives across 3 campaigns" },
  { title: "Identifying audience intent", sub: "5 primary intent patterns" },
  { title: "Clustering personas", sub: "Grouping by motivation & behavior" },
  { title: "Mapping content opportunities", sub: "" },
  { title: "Generating experiences", sub: "" },
];
const LOADING_SUBHEADS = [
  "Gathering customer context from your store and campaigns...",
  "Reading signals across creatives, clicks, and audiences...",
  "Running the context engine to connect ad to intent...",
  "Updating the decision state for each visitor...",
  "Asking the decision engine which experience should serve next...",
  "Analyzing your campaigns and generating personalized experiences...",
  "Learning from the loop so the next pass is sharper...",
];

let loadingRaf = null;
let loadingRunning = false;
let loadingChecklistIndex = 0;
let loadingSubheadIndex = 0;
let loadingAdvanceTimer = null;
const LOADING_AUTO_ADVANCE_MS = 8000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cubicBezierEase(t, x1, y1, x2, y2) {
  const sample = (a, b, u) => {
    const inv = 1 - u;
    return 3 * inv * inv * u * a + 3 * inv * u * u * b + u * u * u;
  };
  const sampleDerivative = (a, b, u) => {
    const inv = 1 - u;
    return 3 * inv * inv * a + 6 * inv * u * (b - a) + 3 * u * u * (1 - b);
  };

  let u = t;
  for (let i = 0; i < 8; i += 1) {
    const x = sample(x1, x2, u);
    const d = sampleDerivative(x1, x2, u);
    if (Math.abs(d) < 1e-6) break;
    u = Math.min(1, Math.max(0, u - (x - t) / d));
  }

  return sample(y1, y2, u);
}

function checklistIndexForStop(stopIndex) {
  return Math.min(stopIndex, 4);
}

function setActiveLoadingBadge(index) {
  document.querySelectorAll(".loading-badge").forEach((badge) => {
    badge.classList.toggle("is-active", Number(badge.dataset.stop) === index);
  });
}

function applyLoadingProgress(progress) {
  const orbit = document.querySelector(".loading-orbit");
  if (!orbit) return;

  const angleDeg = -90 + (progress / LOADING_STOP_COUNT) * 360;
  const rad = (angleDeg * Math.PI) / 180;
  orbit.style.left = `${50 + 40 * Math.cos(rad)}%`;
  orbit.style.top = `${50 + 40 * Math.sin(rad)}%`;
}

function createLoadingCheckRow(index) {
  const item = LOADING_CHECKLIST[index];
  const row = document.createElement("div");
  row.className = "loading-check-row";
  row.dataset.check = String(index);
  row.innerHTML = `
    <div class="loading-check-rail">
      <span class="loading-check-glyph">
        <img src="assets/icon-check.svg" alt="" width="10" height="8" />
      </span>
      <span class="loading-check-stem" aria-hidden="true"></span>
    </div>
    <div class="loading-check-copy">
      <p class="loading-check-title">${item.title}</p>
      ${item.sub ? `<p class="loading-check-sub">${item.sub}</p>` : ""}
    </div>
  `;
  return row;
}

function tickerSwap(slot, incoming, { animate }) {
  const outgoing = slot.querySelector(":scope > :not(.is-leave)");

  if (!animate || !outgoing || prefersReducedMotion()) {
    slot.innerHTML = "";
    slot.appendChild(incoming);
    return;
  }

  incoming.classList.add("is-enter");
  outgoing.classList.add("is-leave");
  outgoing.addEventListener(
    "animationend",
    () => {
      outgoing.remove();
    },
    { once: true }
  );
  slot.appendChild(incoming);
}

function setLoadingChecklistIndex(index, { animate } = { animate: true }) {
  if (index === loadingChecklistIndex && animate) return;

  const slot = document.getElementById("loading-checklist-slot");
  if (!slot) return;

  loadingChecklistIndex = index;
  tickerSwap(slot, createLoadingCheckRow(index), { animate });
}

function createLoadingSubhead(index) {
  const line = document.createElement("p");
  line.className = "loading-subhead";
  line.dataset.stop = String(index);
  line.textContent = LOADING_SUBHEADS[index];
  return line;
}

function setLoadingSubhead(index, { animate } = { animate: true }) {
  if (index === loadingSubheadIndex && animate) return;

  const slot = document.getElementById("loading-subhead-slot");
  if (!slot) return;

  loadingSubheadIndex = index;
  tickerSwap(slot, createLoadingSubhead(index), { animate });
}

function stopLoadingOrbit() {
  loadingRunning = false;
  if (loadingRaf !== null) {
    cancelAnimationFrame(loadingRaf);
    loadingRaf = null;
  }
  window.clearTimeout(loadingAdvanceTimer);
  loadingAdvanceTimer = null;
}

function startLoadingOrbit() {
  stopLoadingOrbit();
  loadingRunning = true;
  loadingChecklistIndex = 0;
  loadingSubheadIndex = 0;

  applyLoadingProgress(0);
  setActiveLoadingBadge(0);
  setLoadingChecklistIndex(0, { animate: false });
  setLoadingSubhead(0, { animate: false });

  const reduced = prefersReducedMotion();
  let stopIndex = 0;
  let phase = "dwell";
  let phaseStart = performance.now();

  const tick = (now) => {
    if (!loadingRunning) return;

    const elapsed = now - phaseStart;

    if (reduced) {
      if (elapsed >= LOADING_DWELL_MS) {
        stopIndex = (stopIndex + 1) % LOADING_STOP_COUNT;
        phaseStart = now;
        applyLoadingProgress(stopIndex);
        setActiveLoadingBadge(stopIndex);
        setLoadingChecklistIndex(checklistIndexForStop(stopIndex), { animate: true });
        setLoadingSubhead(stopIndex, { animate: true });
      }
      loadingRaf = requestAnimationFrame(tick);
      return;
    }

    if (phase === "dwell") {
      applyLoadingProgress(stopIndex);
      setActiveLoadingBadge(stopIndex);
      if (elapsed >= LOADING_DWELL_MS) {
        const nextStop = (stopIndex + 1) % LOADING_STOP_COUNT;
        phase = "travel";
        phaseStart = now;
        setLoadingChecklistIndex(checklistIndexForStop(nextStop), { animate: true });
        setLoadingSubhead(nextStop, { animate: true });
      }
    } else {
      const t = Math.min(1, elapsed / LOADING_TRAVEL_MS);
      const eased = cubicBezierEase(t, 0.22, 1, 0.36, 1);
      const progress = stopIndex + eased;
      applyLoadingProgress(progress);

      const nextStop = (stopIndex + 1) % LOADING_STOP_COUNT;
      setActiveLoadingBadge(eased >= 0.5 ? nextStop : stopIndex);

      if (t >= 1) {
        stopIndex = nextStop;
        phase = "dwell";
        phaseStart = now;
        applyLoadingProgress(stopIndex);
        setActiveLoadingBadge(stopIndex);
      }
    }

    loadingRaf = requestAnimationFrame(tick);
  };

  loadingRaf = requestAnimationFrame(tick);

  window.clearTimeout(loadingAdvanceTimer);
  loadingAdvanceTimer = window.setTimeout(() => {
    goToStep("brand");
  }, LOADING_AUTO_ADVANCE_MS);
}

const LOGO_VARIANTS = {
  light: [
    { bg: "#ffffff", src: "assets/brand-logo-light.svg", color: "#5da5f7" },
    { bg: "#f7f8f9", src: "assets/brand-logo-favicon.svg", color: "#01549a" },
    { bg: "#e3f5fc", src: "assets/brand-logo-light.svg", color: "#002838" },
  ],
  dark: [
    { bg: "#002838", src: "assets/brand-logo-dark.svg", color: "#ffffff" },
    { bg: "#01549a", src: "assets/brand-logo-dark.svg", color: "#e3f5fc" },
    { bg: "#161c20", src: "assets/brand-logo-dark.svg", color: "#bfe2f2" },
  ],
  favicon: [
    { bg: "#f7f8f9", src: "assets/brand-logo-favicon.svg", color: "#6b7e8a" },
    { bg: "#edeef1", src: "assets/brand-logo-light.svg", color: "#3c4850" },
    { bg: "#e3f5fc", src: "assets/brand-logo-favicon.svg", color: "#01549a" },
  ],
};

const LOGO_LABELS = { light: "On light", dark: "On dark", favicon: "Favicon" };

const IMAGERY_VARIANTS = [
  [
    "linear-gradient(158deg, #e3f5fc 11%, #bfe2f2 82%)",
    "linear-gradient(158deg, #8bb7cb 11%, #002838 82%)",
    "linear-gradient(158deg, #5da5f7 11%, #e3f5fc 82%)",
    "linear-gradient(158deg, #01549a 11%, #bfe2f2 82%)",
  ],
  [
    "linear-gradient(135deg, #002838 0%, #5da5f7 100%)",
    "linear-gradient(135deg, #bfe2f2 0%, #01549a 100%)",
    "linear-gradient(135deg, #e3f5fc 0%, #8bb7cb 100%)",
    "linear-gradient(135deg, #5da5f7 0%, #002838 100%)",
  ],
  [
    "linear-gradient(180deg, #f3f8fe 0%, #5da5f7 100%)",
    "linear-gradient(180deg, #002838 0%, #8bb7cb 100%)",
    "linear-gradient(180deg, #01549a 0%, #e3f5fc 100%)",
    "linear-gradient(180deg, #bfe2f2 0%, #161c20 100%)",
  ],
];

function cloneBrand(system) {
  return JSON.parse(JSON.stringify(system));
}

function getBrandView() {
  return onboardingState.editingSection && onboardingState.brandSystemDraft
    ? onboardingState.brandSystemDraft
    : onboardingState.brandSystem;
}

function brandCardActions(section, editing) {
  if (editing) {
    return `
      <div class="brand-card-actions">
        <button type="button" class="brand-cancel-btn" data-brand-cancel="${section}">Cancel</button>
        <button type="button" class="brand-save-btn" data-brand-save="${section}">Save</button>
      </div>
    `;
  }
  return `
    <div class="brand-card-actions">
      <button type="button" class="brand-edit-btn brand-edit" data-brand-edit="${section}">Edit</button>
    </div>
  `;
}

function renderBrandTags(tags, editing, kind) {
  const pills = tags
    .map((tag, index) => {
      const remove = editing
        ? `<button type="button" class="brand-tag-remove" data-brand-remove-tag="${kind}" data-index="${index}" aria-label="Remove ${escapeHtml(tag)}">×</button>`
        : "";
      return `<span class="brand-tag ${kind === "voice" ? "is-voice" : ""}">${escapeHtml(tag)}${remove}</span>`;
    })
    .join("");
  const add = editing
    ? `<input class="brand-inline-input brand-tag-input" data-brand-tag-input="${kind}" type="text" placeholder="+ Add tag" />`
    : "";
  return `<div class="brand-tag-row">${pills}${add}</div>`;
}

function renderBrandSourceCard(data, editing) {
  const stats = [
    { key: "pagesAnalyzed", label: "Pages analyzed", value: data.source.pagesAnalyzed },
    { key: "copyBlocks", label: "Copy blocks read", value: data.source.copyBlocks },
    { key: "imagesScanned", label: "Images scanned", value: data.source.imagesScanned },
  ]
    .map((stat) => {
      const value = editing
        ? `<input class="brand-stat-input" data-brand-stat="${stat.key}" type="number" min="0" value="${escapeHtml(stat.value)}" />`
        : `<p class="brand-stat-value">${escapeHtml(stat.value)}</p>`;
      return `<div class="brand-stat">${value}<p class="brand-stat-label">${stat.label}</p></div>`;
    })
    .join("");

  return `
    <article class="brand-card is-snapshot ${editing ? "is-editing" : ""}" data-section="source">
      ${brandCardActions("source", editing)}
      <div class="brand-thumb">
        <img src="assets/snapshot-chrome.svg" alt="" />
      </div>
      <div class="brand-snapshot-copy">
        <div class="brand-card-header">
          <h2>Source snapshot</h2>
          <p>This is what Orbital actually crawled – not a guess</p>
        </div>
        <div class="brand-url-row">
          <span class="brand-url-badge">${escapeHtml(data.source.domain)}</span>
          <span class="brand-url-more">+ ${escapeHtml(data.source.otherPages)} other pages</span>
        </div>
        <div class="brand-stat-row">${stats}</div>
      </div>
    </article>
  `;
}

function renderColorsCard(data, editing) {
  const swatches = data.colors
    .map((color, index) => {
      const labels = editing
        ? `<div class="brand-swatch-fields">
            <input class="brand-inline-input" data-brand-color-name="${index}" type="text" value="${escapeHtml(color.name)}" />
            <input class="brand-inline-input" data-brand-color-hex="${index}" type="text" value="${escapeHtml(color.hex)}" />
          </div>`
        : `<p class="brand-swatch-name">${escapeHtml(color.name)}</p><p class="brand-swatch-hex">${escapeHtml(color.hex)}</p>`;
      return `
        <div class="brand-swatch">
          <div class="brand-swatch-chip" style="background:${escapeHtml(color.hex)}"></div>
          ${labels}
        </div>
      `;
    })
    .join("");
  const add = editing
    ? `<button type="button" class="brand-swatch-add" data-brand-add-color aria-label="Add color"><img src="assets/icon-plus.svg" alt="" /></button>`
    : "";

  return `
    <article class="brand-card ${editing ? "is-editing" : ""}" data-section="colors">
      ${brandCardActions("colors", editing)}
      <div class="brand-card-header">
        <h2>Colors</h2>
        <p>Extracted from your site’s primary palette</p>
      </div>
      <div class="brand-swatch-row">${swatches}${add}</div>
    </article>
  `;
}

function renderLogoCard(data, editing) {
  const tiles = data.logos
    .map((logo) => {
      const variants = LOGO_VARIANTS[logo.id];
      const variant = variants[logo.variant % variants.length];
      const replace = editing
        ? `<button type="button" class="brand-logo-replace" data-brand-logo-replace="${logo.id}">Replace</button>`
        : "";
      return `
        <div class="brand-logo-tile" style="background:${variant.bg}">
          <img src="${variant.src}" alt="" width="36" height="36" />
          <p style="color:${variant.color}">${LOGO_LABELS[logo.id]}</p>
          ${replace}
        </div>
      `;
    })
    .join("");

  return `
    <article class="brand-card ${editing ? "is-editing" : ""}" data-section="logo">
      ${brandCardActions("logo", editing)}
      <div class="brand-card-header">
        <h2>Logo</h2>
        <p>Extracted from your site header and favicon</p>
      </div>
      <div class="brand-logo-row">${tiles}</div>
    </article>
  `;
}

function renderImageryCard(data, editing) {
  const tiles = data.imagery.tiles
    .map((variant, index) => {
      const set = IMAGERY_VARIANTS[variant % IMAGERY_VARIANTS.length];
      return `<button type="button" class="brand-img-tile ${editing ? "is-editing" : ""}" data-brand-tile="${index}" style="background-image:${set[index]}" ${editing ? "" : "disabled"} aria-label="Imagery sample ${index + 1}"></button>`;
    })
    .join("");

  return `
    <article class="brand-card ${editing ? "is-editing" : ""}" data-section="imagery">
      ${brandCardActions("imagery", editing)}
      <div class="brand-card-header">
        <h2>Imagery style</h2>
        <p>Sampled from 37 product and lifestyle images across your site</p>
      </div>
      <div class="brand-img-row">${tiles}</div>
      ${renderBrandTags(data.imagery.tags, editing, "imagery")}
    </article>
  `;
}

function renderTypographyCard(data, editing) {
  const samples = editing
    ? `<div class="brand-type-sample">
        <input class="brand-type-heading-input" data-brand-type="heading" type="text" value="${escapeHtml(data.typography.heading)}" />
        <textarea class="brand-type-body-input" data-brand-type="body">${escapeHtml(data.typography.body)}</textarea>
      </div>`
    : `<div class="brand-type-sample">
        <p class="brand-type-heading">${escapeHtml(data.typography.heading)}</p>
        <p class="brand-type-body">${escapeHtml(data.typography.body)}</p>
      </div>`;

  return `
    <article class="brand-card ${editing ? "is-editing" : ""}" data-section="typography">
      ${brandCardActions("typography", editing)}
      <div class="brand-card-header">
        <h2>Typography</h2>
        <p>Primary typeface: Grosa Trial (fallback: Inter)</p>
      </div>
      ${samples}
    </article>
  `;
}

function renderVoiceCard(data, editing) {
  const quotes = data.voice.quotes
    .map((quote, index) => {
      if (editing) {
        return `
          <div class="brand-quote">
            <textarea data-brand-quote="${index}">${escapeHtml(quote.text)}</textarea>
            <input class="brand-inline-input" data-brand-quote-source="${index}" type="text" value="${escapeHtml(quote.source)}" />
          </div>
        `;
      }
      const link = index === 0
        ? `<img src="assets/icon-link.svg" alt="" width="16" height="16" />`
        : "";
      return `
        <div class="brand-quote">
          <p class="brand-quote-text">“${escapeHtml(quote.text.replace(/^[“”"]|[“”"]$/g, ""))}”</p>
          <p class="brand-quote-source">${link}Source: ${escapeHtml(quote.source)}</p>
        </div>
      `;
    })
    .join("");

  return `
    <article class="brand-card ${editing ? "is-editing" : ""}" data-section="voice">
      ${brandCardActions("voice", editing)}
      <div class="brand-card-header">
        <h2>Brand voice &amp; language</h2>
        <p>Every phrase below is pulled directly from your site – nothing here is granted</p>
      </div>
      ${renderBrandTags(data.voice.tags, editing, "voice")}
      ${quotes}
    </article>
  `;
}

function renderButtonsCard(data, editing) {
  const previews = editing
    ? `<div class="brand-btn-row">
        <div class="brand-btn-edit">
          <span class="brand-preview-primary">${escapeHtml(data.buttons.primary)}</span>
          <input class="brand-inline-input" data-brand-button="primary" type="text" value="${escapeHtml(data.buttons.primary)}" />
        </div>
        <div class="brand-btn-edit">
          <span class="brand-preview-secondary">${escapeHtml(data.buttons.secondary)}</span>
          <input class="brand-inline-input" data-brand-button="secondary" type="text" value="${escapeHtml(data.buttons.secondary)}" />
        </div>
      </div>`
    : `<div class="brand-btn-row">
        <span class="brand-preview-primary">${escapeHtml(data.buttons.primary)}</span>
        <span class="brand-preview-secondary">${escapeHtml(data.buttons.secondary)}</span>
      </div>`;

  return `
    <article class="brand-card ${editing ? "is-editing" : ""}" data-section="buttons">
      ${brandCardActions("buttons", editing)}
      <div class="brand-card-header">
        <h2>Buttons</h2>
        <p>Primary and secondary actions</p>
      </div>
      ${previews}
    </article>
  `;
}

function renderBrandSystem() {
  const root = document.getElementById("brand-sections");
  const subtitle = document.getElementById("brand-subtitle");
  if (!root) return;

  const data = getBrandView();
  const editing = onboardingState.editingSection;
  const domain = onboardingState.website || "loremipsum.com";
  if (subtitle) {
    subtitle.textContent = `Pulled from ${domain} • 12 pages crawled • Last synced 2 hours ago`;
  }

  root.innerHTML = [
    renderBrandSourceCard(data, editing === "source"),
    renderColorsCard(data, editing === "colors"),
    renderLogoCard(data, editing === "logo"),
    renderImageryCard(data, editing === "imagery"),
    renderTypographyCard(data, editing === "typography"),
    renderVoiceCard(data, editing === "voice"),
    renderButtonsCard(data, editing === "buttons"),
  ].join("");
}

function enterBrandEdit(section) {
  if (onboardingState.editingSection && onboardingState.editingSection !== section) {
    onboardingState.brandSystemDraft = null;
  }
  onboardingState.editingSection = section;
  onboardingState.brandSystemDraft = cloneBrand(onboardingState.brandSystem);
  renderBrandSystem();
}

function cancelBrandEdit() {
  onboardingState.editingSection = null;
  onboardingState.brandSystemDraft = null;
  renderBrandSystem();
}

function saveBrandEdit() {
  if (onboardingState.brandSystemDraft) {
    onboardingState.brandSystem = cloneBrand(onboardingState.brandSystemDraft);
  }
  onboardingState.editingSection = null;
  onboardingState.brandSystemDraft = null;
  renderBrandSystem();
}

function addBrandTag(kind, value) {
  const tag = value.trim();
  if (!tag || !onboardingState.brandSystemDraft) return;
  const list = kind === "voice" ? onboardingState.brandSystemDraft.voice.tags : onboardingState.brandSystemDraft.imagery.tags;
  if (list.includes(tag)) return;
  list.push(tag);
  renderBrandSystem();
}

function bindBrandSystem() {
  const root = document.getElementById("brand-sections");
  const flag = document.getElementById("brand-flag");
  const continueButton = document.getElementById("brand-continue");
  if (!root || !flag || !continueButton) return;

  root.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-brand-edit]");
    if (edit) {
      enterBrandEdit(edit.dataset.brandEdit);
      return;
    }
    if (event.target.closest("[data-brand-save]")) {
      saveBrandEdit();
      return;
    }
    if (event.target.closest("[data-brand-cancel]")) {
      cancelBrandEdit();
      return;
    }
    if (event.target.closest("[data-brand-add-color]")) {
      onboardingState.brandSystemDraft.colors.push({ name: "New color", hex: "#3F8BEF" });
      renderBrandSystem();
      return;
    }
    const replace = event.target.closest("[data-brand-logo-replace]");
    if (replace) {
      const logo = onboardingState.brandSystemDraft.logos.find((item) => item.id === replace.dataset.brandLogoReplace);
      if (!logo) return;
      logo.variant = (logo.variant + 1) % LOGO_VARIANTS[logo.id].length;
      renderBrandSystem();
      return;
    }
    const tile = event.target.closest("[data-brand-tile]");
    if (tile && onboardingState.editingSection === "imagery") {
      const index = Number(tile.dataset.brandTile);
      const tiles = onboardingState.brandSystemDraft.imagery.tiles;
      tiles[index] = (tiles[index] + 1) % IMAGERY_VARIANTS.length;
      renderBrandSystem();
      return;
    }
    const removeTag = event.target.closest("[data-brand-remove-tag]");
    if (removeTag) {
      const kind = removeTag.dataset.brandRemoveTag;
      const index = Number(removeTag.dataset.index);
      const list = kind === "voice" ? onboardingState.brandSystemDraft.voice.tags : onboardingState.brandSystemDraft.imagery.tags;
      list.splice(index, 1);
      renderBrandSystem();
    }
  });

  root.addEventListener("input", (event) => {
    const draft = onboardingState.brandSystemDraft;
    if (!draft) return;
    const target = event.target;

    if (target.dataset.brandStat) {
      draft.source[target.dataset.brandStat] = Number(target.value) || 0;
      return;
    }
    if (target.dataset.brandColorName) {
      draft.colors[Number(target.dataset.brandColorName)].name = target.value;
      return;
    }
    if (target.dataset.brandColorHex) {
      const index = Number(target.dataset.brandColorHex);
      draft.colors[index].hex = target.value;
      const chip = target.closest(".brand-swatch")?.querySelector(".brand-swatch-chip");
      if (chip) chip.style.background = target.value;
      return;
    }
    if (target.dataset.brandType) {
      draft.typography[target.dataset.brandType] = target.value;
      return;
    }
    if (target.dataset.brandQuote) {
      draft.voice.quotes[Number(target.dataset.brandQuote)].text = target.value;
      return;
    }
    if (target.dataset.brandQuoteSource) {
      draft.voice.quotes[Number(target.dataset.brandQuoteSource)].source = target.value;
      return;
    }
    if (target.dataset.brandButton) {
      draft.buttons[target.dataset.brandButton] = target.value;
      const preview = target.parentElement?.querySelector("[class^='brand-preview-']");
      if (preview) preview.textContent = target.value;
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest("[data-brand-tag-input]");
    if (!input) return;
    event.preventDefault();
    addBrandTag(input.dataset.brandTagInput, input.value);
  });

  root.addEventListener("focusout", (event) => {
    const input = event.target.closest("[data-brand-tag-input]");
    if (!input || !input.value.trim()) return;
    addBrandTag(input.dataset.brandTagInput, input.value);
  });

  flag.addEventListener("click", () => {
    showToast("Flagged for Orbital review.");
  });

  continueButton.addEventListener("click", () => {
    if (onboardingState.editingSection) cancelBrandEdit();
    console.log("Looks good, continue", onboardingState.brandSystem);
    goToStep("campaign");
  });
}

const CAMPAIGN_DASH_PERSONAS = [
  {
    id: "deal-seeker",
    name: "Deal Seeker",
    cvr: 74,
    lift: "+24.6%",
    icon: "assets/persona-tag.svg",
    tone: "amber",
    avatar: "#fde8d4",
    bar: "#f58040",
    logBg: "#fef5ee",
    logBorder: "#fde8d4",
  },
  {
    id: "loyal-subscriber",
    name: "Loyal Subscriber",
    cvr: 61,
    lift: "+18.4%",
    icon: "assets/persona-repeat.svg",
    tone: "violet",
    avatar: "#e9dffc",
    bar: "#8f5ff3",
    logBg: "#f5effe",
    logBorder: "#e9dffc",
  },
  {
    id: "performance-pro",
    name: "Performance Pro",
    cvr: 48,
    lift: "+9.2%",
    icon: "assets/persona-zap.svg",
    tone: "blue",
    avatar: "#d9eafc",
    bar: "#4059f3",
    logBg: "#eef5fe",
    logBorder: "#d9eafc",
  },
  {
    id: "wellness-curious",
    name: "Wellness Curious",
    cvr: 31,
    lift: "+1.1%",
    icon: "assets/persona-heart.svg",
    tone: "green",
    avatar: "#d4fce7",
    bar: "#30ed8e",
    logBg: "#edfef5",
    logBorder: "#d4fce7",
  },
];

const CAMPAIGN_DASH_LOG = [
  {
    personaId: "deal-seeker",
    testVariable: "Copy change",
    whatChanged: "Urgency messaging added to hero headline",
    date: "Jun 12",
    impact: "+24.6%",
    positive: true,
  },
  {
    personaId: "deal-seeker",
    testVariable: "Offer test",
    whatChanged: "Countdown timer added to bundle offer",
    date: "Jun 3",
    impact: "+6.1%",
    positive: true,
  },
  {
    personaId: "loyal-subscriber",
    testVariable: "Module reorder",
    whatChanged: "Loyalty perks moved above the field",
    date: "Jun 10",
    impact: "+18.4%",
    positive: true,
  },
  {
    personaId: "performance-pro",
    testVariable: "Copy change",
    whatChanged: "Performance metrics headline swapped in",
    date: "Jun 9",
    impact: "+9.2%",
    positive: true,
  },
  {
    personaId: "performance-pro",
    testVariable: "Content change",
    whatChanged: "Added athlete testimonial video",
    date: "May 28",
    impact: "-1.4%",
    positive: false,
  },
  {
    personaId: "wellness-curious",
    testVariable: "Module added",
    whatChanged: "Ingredient transparency block inserted",
    date: "Jun 5",
    impact: "+1.1%",
    positive: true,
  },
];

function campaignPersonaById(id) {
  return CAMPAIGN_DASH_PERSONAS.find((persona) => persona.id === id);
}

function campaignAvatarMarkup(persona, size) {
  return `<span class="campaign-log-avatar" style="width:${size}px;height:${size}px;background:${persona.logBg};border-color:${persona.logBorder}"><img src="${persona.icon}" alt="" width="${Math.round(size / 2)}" height="${Math.round(size / 2)}" /></span>`;
}

function renderCampaignPersonas() {
  const root = document.getElementById("campaign-personas");
  if (!root) return;

  const focused = onboardingState.focusedPersona;
  const items = CAMPAIGN_DASH_PERSONAS.map((persona) => {
    const focusedClass = focused === persona.id ? " is-focused" : "";
    const dimmedClass = focused && focused !== persona.id ? " is-dimmed" : "";
    return `
      <button type="button" class="campaign-persona${focusedClass}${dimmedClass}" data-campaign-persona="${persona.id}">
        <span class="campaign-persona-avatar" style="background:${persona.avatar};color:${persona.bar}">
          <img src="${persona.icon}" alt="" width="28" height="28" />
        </span>
        <span class="campaign-persona-name">${escapeHtml(persona.name)}</span>
        <span class="campaign-persona-cvr">${persona.cvr}%</span>
      </button>
    `;
  }).join("");

  root.innerHTML = `${items}
    <div class="campaign-persona is-add" aria-disabled="true">
      <span class="campaign-persona-avatar">
        <img src="assets/persona-add.svg" alt="" width="56" height="56" />
      </span>
      <span class="campaign-persona-name">Add persona</span>
      <span class="campaign-add-tip">You&rsquo;ve reached the 4-persona limit for this campaign.</span>
    </div>
  `;
}

function renderCampaignChart() {
  const root = document.getElementById("campaign-chart");
  if (!root) return;

  const focused = onboardingState.focusedPersona;
  const max = Math.max(...CAMPAIGN_DASH_PERSONAS.map((persona) => persona.cvr));

  root.innerHTML = CAMPAIGN_DASH_PERSONAS.map((persona) => {
    const focusedClass = focused === persona.id ? " is-focused" : "";
    const dimmedClass = focused && focused !== persona.id ? " is-dimmed" : "";
    const width = `${(persona.cvr / max) * 100}%`;
    return `
      <div class="campaign-bar-row${focusedClass}${dimmedClass}">
        <div class="campaign-bar-label">
          <span class="campaign-bar-icon" style="background:${persona.avatar}">
            <img src="${persona.icon}" alt="" width="11" height="11" />
          </span>
          <span class="campaign-bar-name">${escapeHtml(persona.name)}</span>
        </div>
        <div class="campaign-bar-track">
          <div class="campaign-bar-fill" style="width:${width};background:${persona.bar}"></div>
        </div>
        <div class="campaign-bar-meta">
          <span class="campaign-bar-value">${persona.cvr}%</span>
          <span class="campaign-pill is-up">${persona.lift}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderCampaignLog() {
  const root = document.getElementById("campaign-log");
  if (!root) return;

  const focused = onboardingState.focusedPersona;
  const rows = CAMPAIGN_DASH_LOG.filter((row) => !focused || row.personaId === focused);

  root.innerHTML = `
    <table class="campaign-log">
      <thead>
        <tr>
          <th>Persona</th>
          <th>Test Variable</th>
          <th>What Changed</th>
          <th>Date</th>
          <th>Impact</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const persona = campaignPersonaById(row.personaId);
            const pillClass = row.positive ? "is-up" : "is-down";
            return `
              <tr>
                <td>
                  <div class="campaign-log-persona">
                    ${campaignAvatarMarkup(persona, 32)}
                    <span>${escapeHtml(persona.name)}</span>
                  </div>
                </td>
                <td><span class="campaign-pill is-neutral">${escapeHtml(row.testVariable)}</span></td>
                <td>${escapeHtml(row.whatChanged)}</td>
                <td>${escapeHtml(row.date)}</td>
                <td><span class="campaign-pill ${pillClass}">${escapeHtml(row.impact)}</span></td>
                <td>
                  <button type="button" class="campaign-log-review" data-campaign-review data-persona="${escapeHtml(persona.name)}" data-variable="${escapeHtml(row.testVariable)}" data-changed="${escapeHtml(row.whatChanged)}">
                    <span>Review</span>
                    <img src="assets/icon-arrow-right.svg" alt="" width="20" height="20" />
                  </button>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderCampaignDashboard() {
  const subtitle = document.getElementById("campaign-subtitle");
  const company = onboardingState.companyName || "Lorem Ipsum Co.";
  if (subtitle) {
    subtitle.textContent = `${company} • 4 personas testing • Since Jun 1`;
  }
  renderCampaignPersonas();
  renderCampaignChart();
  renderCampaignLog();
}

function setFocusedCampaignPersona(id) {
  onboardingState.focusedPersona = onboardingState.focusedPersona === id ? null : id;
  renderCampaignDashboard();
}

function bindCampaignDashboard() {
  const personas = document.getElementById("campaign-personas");
  const log = document.getElementById("campaign-log");
  const launch = document.getElementById("campaign-launch");
  const reviewExperiences = document.getElementById("campaign-review-experiences");
  if (!personas || !log || !launch || !reviewExperiences) return;

  personas.addEventListener("click", (event) => {
    const button = event.target.closest("[data-campaign-persona]");
    if (!button) return;
    setFocusedCampaignPersona(button.dataset.campaignPersona);
  });

  log.addEventListener("click", (event) => {
    const review = event.target.closest("[data-campaign-review]");
    if (!review) return;
    console.log("Review clicked", {
      persona: review.dataset.persona,
      testVariable: review.dataset.variable,
      whatChanged: review.dataset.changed,
    });
  });

  launch.addEventListener("click", () => {
    goToStep("launch");
  });

  reviewExperiences.addEventListener("click", () => {
    goToStep("experience");
  });
}

const EXPERIENCE_PERSONAS = [
  {
    id: "athlete",
    label: "The Performance Athlete",
    headline: "New customers: save 20% on first order",
  },
  {
    id: "value",
    label: "The Value Savvy-Shopper",
    headline: "Limited time: 30% off your first order",
  },
  {
    id: "lifestyle",
    label: "The Lifestyle Enthusiast",
    headline: "Join thousands loving their first order",
  },
  {
    id: "loyal",
    label: "The Loyal Returner",
    headline: "Welcome back — enjoy 20% off again",
  },
];

const EXPERIENCE_DEFAULT_COPY = {
  headline: "New customers: save 20% on first order",
  subtext: "Free shipping included. No code needed.",
  benefits: [
    {
      icon: "assets/xp-icon-chat.svg",
      title: "Share team inboxes",
      desc: "Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.",
    },
    {
      icon: "assets/xp-icon-zap.svg",
      title: "Deliver instant answers",
      desc: "An all-in-one customer service platform that helps you balance everything your customers need to be happy.",
    },
    {
      icon: "assets/xp-icon-chart.svg",
      title: "Manage your team with reports",
      desc: "Measure what matters with Untitled’s easy-to-use reports. You can filter, export, and drilldown on the data in a couple clicks.",
    },
  ],
  socialTitle: "Hear from other customers",
  socialSub: "Hear first-hand from our incredible community of customers.",
  quotes: [
    {
      quote: "We’ve been using Untitled to kick start every new project and can’t imagine working without it.",
      name: "Sienna Hewitt",
      handle: "@siennahewitt",
      avatar: "assets/xp-avatar-sienna.png",
    },
    {
      quote: "From concept to completion, Untitled helps us deliver outstanding designs faster than ever.",
      name: "Kari Rasmussen",
      handle: "@itskari",
      avatar: "assets/xp-avatar-kari.png",
    },
    {
      quote: "Every project starts with Untitled which has 10x’d our output. It saves us time while keeping the quality top-notch.",
      name: "Amélie Laurent",
      handle: "@alaurent_",
      avatar: "assets/xp-avatar-amelie.png",
    },
  ],
};

function experiencePersonaHeadline(id) {
  return EXPERIENCE_PERSONAS.find((persona) => persona.id === id)?.headline || EXPERIENCE_DEFAULT_COPY.headline;
}

function createExperienceDraft(personaId) {
  return {
    headline: experiencePersonaHeadline(personaId),
    subtext: EXPERIENCE_DEFAULT_COPY.subtext,
    benefits: EXPERIENCE_DEFAULT_COPY.benefits.map((item) => ({ ...item })),
    socialTitle: EXPERIENCE_DEFAULT_COPY.socialTitle,
    socialSub: EXPERIENCE_DEFAULT_COPY.socialSub,
    quotes: EXPERIENCE_DEFAULT_COPY.quotes.map((item) => ({ ...item })),
  };
}

function resetExperienceReview() {
  onboardingState.activePersonaTab = "athlete";
  onboardingState.viewMode = "side-by-side";
  onboardingState.experienceEditingSection = "header";
  onboardingState.experienceDraft = createExperienceDraft("athlete");
}

function captureExperienceDraft() {
  const root = document.getElementById("experience-compare");
  const draft = onboardingState.experienceDraft;
  if (!root || !draft) return;

  root.querySelectorAll(".xp-panel--orbital [data-xp-field]").forEach((el) => {
    const field = el.dataset.xpField;
    const value = el.textContent.trim();
    if (field === "headline") draft.headline = value;
    if (field === "subtext") draft.subtext = value;
    if (field === "social-title") draft.socialTitle = value;
    if (field === "social-sub") draft.socialSub = value;
    if (field?.startsWith("benefit-title-")) {
      const index = Number(field.slice("benefit-title-".length));
      if (draft.benefits[index]) draft.benefits[index].title = value;
    }
    if (field?.startsWith("benefit-desc-")) {
      const index = Number(field.slice("benefit-desc-".length));
      if (draft.benefits[index]) draft.benefits[index].desc = value;
    }
    if (field?.startsWith("quote-")) {
      const index = Number(field.slice("quote-".length));
      if (draft.quotes[index]) draft.quotes[index].quote = value;
    }
  });
}

function xpStars() {
  return `<div class="xp-stars">${Array.from({ length: 5 }, () => {
    return `<span class="xp-star"><img src="assets/xp-star-bg.svg" alt="" /><img src="assets/xp-star.svg" alt="" /></span>`;
  }).join("")}</div>`;
}

function xpFieldAttr(editable, field) {
  return editable ? ` contenteditable="true" spellcheck="false" data-xp-field="${field}"` : "";
}

function renderExperienceNav() {
  return `
    <div class="xp-section xp-section--locked">
      <span class="xp-tag xp-tag--lock">
        <img src="assets/xp-lock.svg" alt="" width="8" height="8" />
        Nav - Locked by Template
      </span>
      <div class="xp-frame">
        <div class="xp-nav">
          <div class="xp-nav-brand">
            <img class="xp-nav-logo" src="assets/logo.svg" alt="" width="20" height="20" />
            <img class="xp-nav-wordmark" src="assets/wordmark-dashboard.svg" alt="Orbital" width="35" height="10" />
          </div>
          <div class="xp-nav-links">
            <span>Products <img src="assets/xp-chevron.svg" alt="" width="11" height="11" /></span>
            <span>Pricing</span>
            <span>About</span>
          </div>
          <div class="xp-nav-actions">
            <span class="xp-btn-login">Log in</span>
            <span class="xp-btn-signup">Sign up</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExperienceHeader(copy, options) {
  const { editable, editing } = options;
  return `
    <div class="xp-section xp-section--editable${editing === "header" ? " is-editing" : ""}" data-xp-section="header">
      <span class="xp-tag">Header</span>
      <div class="xp-frame">
        <div class="xp-hero">
          <div class="xp-hero-copy">
            <div class="xp-hero-heading">
              <div class="xp-hiring">
                <span class="xp-hiring-pill">
                  <img src="assets/xp-dot-hiring.svg" alt="" width="4" height="4" />
                  We’re hiring!
                </span>
                <span class="xp-hiring-link">
                  Join our remote team
                  <img src="assets/xp-arrow.svg" alt="" width="9" height="9" />
                </span>
              </div>
              <div class="xp-edit-target">
                ${editing === "header" ? '<span class="xp-editing-now">Editing Now</span>' : ""}
                <p class="xp-headline"${xpFieldAttr(editable && editing === "header", "headline")}>${escapeHtml(copy.headline)}</p>
                <p class="xp-subtext"${xpFieldAttr(editable && editing === "header", "subtext")}>${escapeHtml(copy.subtext)}</p>
              </div>
            </div>
            <div class="xp-email-row">
              <div class="xp-email-input">Enter your email</div>
              <span class="xp-btn-subscribe">Subscribe + Save 20%</span>
            </div>
          </div>
          <div class="xp-hero-image">
            <img src="assets/xp-hero.jpg" alt="" />
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExperienceBenefits(copy, options) {
  const { editable, editing } = options;
  const canEdit = editable && editing === "benefits";
  return `
    <div class="xp-section xp-section--editable${editing === "benefits" ? " is-editing" : ""}" data-xp-section="benefits">
      <span class="xp-tag">Benefits Panel</span>
      <div class="xp-frame">
        <div class="xp-edit-target">
          ${editing === "benefits" ? '<span class="xp-editing-now">Editing Now</span>' : ""}
          <div class="xp-benefits">
            ${copy.benefits
              .map((benefit, index) => {
                return `
                  <div class="xp-benefit">
                    <div class="xp-benefit-icon">
                      <img src="${benefit.icon}" alt="" width="9" height="9" />
                    </div>
                    <p class="xp-benefit-title"${xpFieldAttr(canEdit, `benefit-title-${index}`)}>${escapeHtml(benefit.title)}</p>
                    <p class="xp-benefit-desc"${xpFieldAttr(canEdit, `benefit-desc-${index}`)}>${escapeHtml(benefit.desc)}</p>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExperienceSocial(copy, options) {
  const { editable, editing } = options;
  const canEdit = editable && editing === "socialProof";
  return `
    <div class="xp-section xp-section--editable${editing === "socialProof" ? " is-editing" : ""}" data-xp-section="socialProof">
      <span class="xp-tag">Social Proof Panel</span>
      <div class="xp-frame">
        <div class="xp-social">
          <div class="xp-edit-target">
            ${editing === "socialProof" ? '<span class="xp-editing-now">Editing Now</span>' : ""}
            <div class="xp-social-heading">
              <p class="xp-social-title"${xpFieldAttr(canEdit, "social-title")}>${escapeHtml(copy.socialTitle)}</p>
              <p class="xp-social-sub"${xpFieldAttr(canEdit, "social-sub")}>${escapeHtml(copy.socialSub)}</p>
            </div>
          </div>
          <div class="xp-quotes">
            ${copy.quotes
              .map((item, index) => {
                return `
                  <article class="xp-quote">
                    <div>
                      ${xpStars()}
                      <p class="xp-quote-text"${xpFieldAttr(canEdit, `quote-${index}`)}>${escapeHtml(item.quote)}</p>
                    </div>
                    <div class="xp-quote-author">
                      <img class="xp-quote-avatar" src="${item.avatar}" alt="" width="17" height="17" />
                      <div class="xp-quote-meta">
                        <p class="xp-quote-name">
                          <span>${escapeHtml(item.name)}</span>
                          <span class="xp-verified">
                            <img src="assets/xp-verified-bg.svg" alt="" />
                            <img src="assets/xp-verified-check.svg" alt="" />
                          </span>
                        </p>
                        <p class="xp-quote-handle">${escapeHtml(item.handle)}</p>
                      </div>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExperiencePanel(variant, copy, editing) {
  const editable = variant === "orbital";
  const options = { editable, editing };
  const badge =
    variant === "orbital"
      ? `<span class="xp-badge xp-badge--orbital"><img src="assets/xp-sparkle.svg" alt="" width="15" height="15" />Orbital Experience</span>`
      : `<span class="xp-badge">Default</span>`;

  return `
    <article class="xp-panel xp-panel--${variant}">
      <div class="xp-panel-meta">
        ${badge}
        <span class="xp-live">
          <img src="assets/xp-dot-live.svg" alt="" width="6" height="6" />
          Live Preview
        </span>
      </div>
      ${renderExperienceNav()}
      ${renderExperienceHeader(copy, options)}
      ${renderExperienceBenefits(copy, options)}
      ${renderExperienceSocial(copy, options)}
    </article>
  `;
}

function renderExperienceReview() {
  const compare = document.getElementById("experience-compare");
  const tabs = document.getElementById("experience-tabs");
  const toggle = document.getElementById("experience-view-toggle");
  if (!compare || !tabs || !toggle) return;

  if (!onboardingState.experienceDraft) {
    onboardingState.experienceDraft = createExperienceDraft(onboardingState.activePersonaTab);
  }

  const editing = onboardingState.experienceEditingSection;
  const defaultCopy = {
    ...EXPERIENCE_DEFAULT_COPY,
    benefits: EXPERIENCE_DEFAULT_COPY.benefits.map((item) => ({ ...item })),
    quotes: EXPERIENCE_DEFAULT_COPY.quotes.map((item) => ({ ...item })),
  };

  tabs.querySelectorAll("[data-persona-tab]").forEach((tab) => {
    const isActive = tab.dataset.personaTab === onboardingState.activePersonaTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  toggle.querySelectorAll("[data-view-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewMode === onboardingState.viewMode);
  });

  compare.classList.toggle("is-preview", onboardingState.viewMode === "preview");
  compare.innerHTML = `
    ${renderExperiencePanel("default", defaultCopy, editing)}
    ${renderExperiencePanel("orbital", onboardingState.experienceDraft, editing)}
  `;
}

function setExperiencePersonaTab(id) {
  if (!EXPERIENCE_PERSONAS.some((persona) => persona.id === id)) return;
  onboardingState.activePersonaTab = id;
  onboardingState.experienceEditingSection = "header";
  onboardingState.experienceDraft = createExperienceDraft(id);
  renderExperienceReview();
}

function setExperienceViewMode(mode) {
  if (mode !== "side-by-side" && mode !== "preview") return;
  captureExperienceDraft();
  onboardingState.viewMode = mode;
  renderExperienceReview();
}

function setExperienceEditingSection(section) {
  if (!["header", "benefits", "socialProof"].includes(section)) return;
  if (onboardingState.experienceEditingSection === section) return;
  captureExperienceDraft();
  onboardingState.experienceEditingSection = section;
  renderExperienceReview();
}

function bindExperienceReview() {
  const tabs = document.getElementById("experience-tabs");
  const toggle = document.getElementById("experience-view-toggle");
  const compare = document.getElementById("experience-compare");
  const launch = document.getElementById("experience-launch");
  if (!tabs || !toggle || !compare || !launch) return;

  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-persona-tab]");
    if (!tab) return;
    setExperiencePersonaTab(tab.dataset.personaTab);
  });

  toggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-mode]");
    if (!button) return;
    setExperienceViewMode(button.dataset.viewMode);
  });

  compare.addEventListener("click", (event) => {
    if (event.target.closest(".xp-section--locked")) {
      event.preventDefault();
      return;
    }
    const section = event.target.closest("[data-xp-section]");
    if (!section) return;
    setExperienceEditingSection(section.dataset.xpSection);
  });

  compare.addEventListener("input", (event) => {
    if (!event.target.closest("[data-xp-field]")) return;
    captureExperienceDraft();
  });

  launch.addEventListener("click", () => {
    goToStep("launch");
  });
}

function renderLaunchScreen() {
  const button = document.getElementById("launch-orbital");
  if (!button) return;
  const busy = Boolean(onboardingState.launching);
  button.classList.toggle("is-launching", busy);
  button.disabled = busy;
  button.setAttribute("aria-busy", String(busy));
  const label = button.querySelector(".launch-orbital-label");
  const loading = button.querySelector(".launch-orbital-busy");
  if (label) label.hidden = busy;
  if (loading) loading.hidden = !busy;
}

function startOrbitalLaunch() {
  if (onboardingState.launching) return;
  onboardingState.launching = true;
  renderLaunchScreen();
  window.setTimeout(() => {
    onboardingState.launching = false;
    renderLaunchScreen();
    console.log("Orbital launched");
    goToStep("overview");
  }, 1200);
}

const OVERVIEW_RECS = {
  wellness: {
    persona: "Wellness Curious",
    headline: "Low module engagement — ingredient transparency missing",
  },
  performance: {
    persona: "Performance Pro",
    headline: "Urgency block absent — high-intent segment going unconverted",
  },
  deal: {
    persona: "Deal Seeker",
    headline: "CTA underperforms on mobile — form friction killing conversions",
  },
};

function renderOverviewScreen() {
  const subtitle = document.getElementById("overview-subtitle");
  const company = onboardingState.companyName || "Lorem Ipsum";
  if (subtitle) {
    subtitle.textContent = `Orbital vs. control · ${company} · Jun 1–15, 2025 · 4 personas active`;
  }

  document.querySelectorAll("[data-apply-rec]").forEach((button) => {
    const id = button.dataset.applyRec;
    const applied = onboardingState.appliedRecommendations.includes(id);
    button.classList.toggle("is-applied", applied);
    button.classList.remove("is-busy");
    button.disabled = applied;
    button.textContent = applied ? "✓ Applied" : "Apply recommendation →";
  });
}

function applyOverviewRecommendation(id) {
  if (!OVERVIEW_RECS[id] || onboardingState.appliedRecommendations.includes(id)) return;
  const button = document.querySelector(`[data-apply-rec="${id}"]`);
  if (!button) return;
  button.classList.add("is-busy");
  button.disabled = true;
  button.textContent = "Applying...";
  window.setTimeout(() => {
    onboardingState.appliedRecommendations.push(id);
    renderOverviewScreen();
    console.log("Applied recommendation", OVERVIEW_RECS[id]);
  }, 600);
}

function bindOverviewScreen() {
  const recs = document.getElementById("overview-recs");
  if (!recs) return;
  recs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-apply-rec]");
    if (!button || button.disabled) return;
    applyOverviewRecommendation(button.dataset.applyRec);
  });
}

function bindLaunchScreen() {
  const button = document.getElementById("launch-orbital");
  const grid = document.querySelector(".launch-exp-grid");
  if (!button || !grid) return;

  button.addEventListener("click", () => {
    startOrbitalLaunch();
  });

  grid.addEventListener("click", (event) => {
    const view = event.target.closest("[data-launch-view]");
    if (view) {
      console.log("View experience", view.dataset.launchView);
      return;
    }
    const preview = event.target.closest("[data-launch-preview]");
    if (preview) {
      console.log("Preview clicked", preview.dataset.launchPreview);
    }
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;

  if (trigger.dataset.action === "previous") previousStep();
  if (trigger.dataset.action === "next") nextStep();
});

document.addEventListener("DOMContentLoaded", () => {
  goToStep(1);
  bindCreateWorkspaceScreen();
  bindBusinessScreen();
  bindSourcesScreen();
  bindCampaignsScreen();
  bindPersonaMethodScreen();
  bindAddPersonaScreen();
  bindReviewPersonasScreen();
  bindBrandSystem();
  bindCampaignDashboard();
  bindExperienceReview();
  bindLaunchScreen();
  bindOverviewScreen();
});
