(() => {
  const supported = ["ta", "ar", "en"];
  const languageButtons = document.querySelectorAll("[data-language]");
  const currentPage = document.body.dataset.currentPage;
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const defaultLang = "ta";

  function setLanguage(lang) {
    if (!supported.includes(lang)) lang = defaultLang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("lang-ar", lang === "ar");
    document.querySelectorAll("[data-ta][data-en][data-ar]").forEach(el => {
      const value = el.dataset[lang];
      if (value !== undefined) el.textContent = value;
    });
    languageButtons.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.language === lang)));
    document.querySelectorAll(".main-nav a[data-page]").forEach(a => {
      if (a.dataset.page === currentPage) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const titles = {
      ta: document.title.replace(/ \| .*/, " | கீழக்கரை நகர ஜமாஅத்துல் உலமா சபை"),
      en: document.title.replace(/ \| .*/, " | Kilakarai Town Jamaathul Ulama Sabha"),
      ar: document.title.replace(/ \| .*/, " | مجلس علماء جماعة كيلكاراي المدينة")
    };
    document.title = titles[lang];
    try { localStorage.setItem("sabha-language", lang); } catch (_) {}
  }

  languageButtons.forEach(btn => btn.addEventListener("click", () => setLanguage(btn.dataset.language)));
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }
  document.getElementById("year")?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));

  let lang = defaultLang;
  try { lang = localStorage.getItem("sabha-language") || defaultLang; } catch (_) {}
  setLanguage(lang);

  const list = document.getElementById("announcementList");
  if (!list) return;
  const search = document.getElementById("announcementSearch");
  let announcements = [];

  function renderAnnouncements() {
    const query = (search?.value || "").trim().toLowerCase();
    const langNow = document.documentElement.lang || defaultLang;
    const filtered = announcements.filter(item => {
      const content = [item["title_" + langNow], item["body_" + langNow], item["category_" + langNow], item.date]
        .filter(Boolean).join(" ").toLowerCase();
      return content.includes(query);
    });
    list.replaceChildren();
    if (!filtered.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = langNow === "ar" ? "لا توجد إعلانات مطابقة." : langNow === "en" ? "No matching announcements." : "பொருந்தும் அறிவிப்புகள் இல்லை.";
      list.appendChild(p);
      return;
    }
    filtered.forEach(item => {
      const article = document.createElement("article");
      article.className = "announcement-card";
      const meta = document.createElement("div"); meta.className = "announcement-meta";
      const tag = document.createElement("span"); tag.className = "announcement-tag";
      tag.textContent = item["category_" + langNow] || item.category_ta || "";
      const date = document.createElement("time"); date.textContent = item.date || "";
      meta.append(tag, date);
      const title = document.createElement("h2"); title.textContent = item["title_" + langNow] || item.title_ta || "";
      const body = document.createElement("p"); body.textContent = item["body_" + langNow] || item.body_ta || "";
      article.append(meta, title, body);
      if (item.attachment && item.attachment !== "#") {
        const a = document.createElement("a"); a.href = item.attachment; a.textContent = langNow === "ar" ? "عرض المرفق" : langNow === "en" ? "View attachment" : "இணைப்பைப் பார்க்க";
        a.rel = "noopener"; article.appendChild(a);
      }
      list.appendChild(article);
    });
  }

  fetch("data/announcements.json")
    .then(response => { if (!response.ok) throw new Error("Announcement data could not be loaded"); return response.json(); })
    .then(data => { announcements = Array.isArray(data) ? data : []; renderAnnouncements(); })
    .catch(() => {
      list.replaceChildren();
      const p = document.createElement("p"); p.className = "muted";
      p.textContent = "அறிவிப்புகளை ஏற்ற முடியவில்லை. / Unable to load announcements. / تعذر تحميل الإعلانات.";
      list.appendChild(p);
    });
  search?.addEventListener("input", renderAnnouncements);
  languageButtons.forEach(btn => btn.addEventListener("click", () => renderAnnouncements()));
})();
