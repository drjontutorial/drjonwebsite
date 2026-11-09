"use strict";
// Dr Jon's Solution Bank — student view.
// Lightweight model chosen by Dr Jon (same as his ESAT/TMUA portal): student
// code + password stored in Firebase Realtime Database, checked in the browser,
// and only the courses/exercises assigned to that student are shown. This is a
// convenience gate, NOT server-enforced security.
(function () {
  const DB = "https://tmua-esat-homework-default-rtdb.firebaseio.com/esatTmuaGate7f2Kx9Lw/solutionBank";
  const SESSION_KEY = "drjonBankSession";

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getJSON = async path => {
    const r = await fetch(DB + path + ".json", { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  };

  function readSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
  function toLogin() {
    location.replace("/login/?next=" + encodeURIComponent(location.pathname));
  }
  window.bankLogout = function () { clearSession(); location.replace("/login/"); };

  // /notes-solutions/                 -> home
  // /notes-solutions/<course>/        -> course
  // /notes-solutions/<course>/<ex>/   -> exercise
  function route() {
    const parts = location.pathname.replace(/^\/notes-solutions\/?/, "").split("/").filter(Boolean);
    return { course: parts[0] || null, exercise: parts[1] || null };
  }

  const hasAccess = (student, course, ex) => !!(student.access && student.access[course] && student.access[course][ex]);

  // Keep only what this student is assigned, preserving the catalog's order.
  function filterCatalog(catalog, student) {
    const courses = [];
    (catalog.courses || []).forEach(c => {
      if (!c) return;
      const chapters = [];
      (c.chapters || []).forEach(ch => {
        if (!ch) return;
        const exercises = (ch.exercises || []).filter(e => e && hasAccess(student, c.slug, e.slug));
        if (exercises.length) chapters.push(Object.assign({}, ch, { exercises }));
      });
      if (chapters.length) courses.push(Object.assign({}, c, { chapters }));
    });
    return courses;
  }

  function topBar(student) {
    return '<div class="bank-userbar"><span>Signed in as <strong>' + esc(student.name || student.code) + '</strong></span>'
      + '<button type="button" class="bank-logout" onclick="bankLogout()">Log out</button></div>';
  }

  function renderHome(student, courses) {
    let html = topBar(student) + '<p class="solutions-eyebrow">DR JON\'S NOTES</p><h1>Solution Bank</h1>';
    if (!courses.length) {
      return html + '<p>No solutions have been assigned to you yet. Please contact Dr Jon.</p>';
    }
    html += '<p>Your assigned worked solutions. Try each question first, then use these to check.</p><div class="solutions-grid bank-course-grid">';
    courses.forEach(c => {
      const n = c.chapters.reduce((s, ch) => s + ch.exercises.length, 0);
      html += '<a class="solutions-course bank-course-card" href="/notes-solutions/' + esc(c.slug) + '/">'
        + '<p class="solutions-eyebrow">' + esc(c.board || "") + '</p><h2>' + esc(c.title) + '</h2>'
        + '<span class="solutions-status">' + n + ' exercise' + (n === 1 ? '' : 's') + ' &rarr;</span></a>';
    });
    return html + '</div>';
  }

  function renderCourse(student, course) {
    let html = topBar(student)
      + '<nav class="bank-crumbs"><a href="/notes-solutions/">Solution Bank</a> &rsaquo; ' + esc(course.title) + '</nav>'
      + '<h1>' + esc(course.title) + '</h1>';
    course.chapters.forEach(ch => {
      html += '<section class="bank-chapter"><h2>' + esc(ch.title) + '</h2><ul class="bank-exercises">';
      ch.exercises.forEach(e => {
        html += '<li><a href="/notes-solutions/' + esc(course.slug) + '/' + esc(e.slug) + '/">' + esc(e.title) + '</a></li>';
      });
      html += '</ul></section>';
    });
    return html;
  }

  function renderExercise(student, course, ex, flat) {
    const i = flat.findIndex(x => x.slug === ex.slug);
    const prev = flat[i - 1], next = flat[i + 1];
    const id = encodeURIComponent(ex.driveId || "");
    let html = topBar(student)
      + '<nav class="bank-crumbs"><a href="/notes-solutions/">Solution Bank</a> &rsaquo; <a href="/notes-solutions/' + esc(course.slug) + '/">' + esc(course.title) + '</a> &rsaquo; ' + esc(ex.title) + '</nav>'
      + '<h1>' + esc(ex.title) + '</h1>';
    if (!ex.driveId) {
      return html + '<p>These solutions are not ready yet. Please check back later.</p>';
    }
    html += '<div class="bank-actions">'
      + '<a class="bank-btn" href="https://drive.google.com/uc?export=download&amp;id=' + id + '">Download PDF</a>'
      + '<a class="bank-btn bank-btn-ghost" href="https://drive.google.com/file/d/' + id + '/view" target="_blank" rel="noopener">Open in new tab</a></div>'
      + '<iframe class="bank-viewer" src="https://drive.google.com/file/d/' + id + '/preview" title="' + esc(ex.title) + ' solutions" allow="autoplay"></iframe>'
      + '<div class="bank-pagination">'
      + (prev ? '<a href="/notes-solutions/' + esc(course.slug) + '/' + esc(prev.slug) + '/">&larr; ' + esc(prev.title) + '</a>' : '<span></span>')
      + (next ? '<a href="/notes-solutions/' + esc(course.slug) + '/' + esc(next.slug) + '/">' + esc(next.title) + ' &rarr;</a>' : '<span></span>')
      + '</div>';
    return html;
  }

  async function run() {
    const gate = document.getElementById("bank-gate");
    const out = document.getElementById("bank");
    const session = readSession();
    if (!session || !session.code) return toLogin();

    let student, catalog;
    try {
      [student, catalog] = await Promise.all([
        getJSON("/students/" + encodeURIComponent(session.code)),
        getJSON("/catalog")
      ]);
    } catch (e) {
      if (gate) gate.hidden = true;
      out.innerHTML = '<p>Could not load the Solution Bank. Please check your internet connection and refresh.</p>';
      out.hidden = false;
      return;
    }
    // Re-check on every page so a changed password or a deactivated account
    // takes effect straight away.
    if (!student || student.password !== session.password || student.active === false) {
      clearSession();
      return toLogin();
    }
    student.code = session.code;

    const courses = filterCatalog(catalog || {}, student);
    const r = route();
    let html;
    if (!r.course) {
      html = renderHome(student, courses);
    } else {
      const course = courses.find(c => c.slug === r.course);
      if (!course) {
        html = topBar(student) + '<h1>Not available</h1><p>This course has not been assigned to you. <a href="/notes-solutions/">Back to your Solution Bank</a></p>';
      } else if (!r.exercise) {
        html = renderCourse(student, course);
      } else {
        const flat = [];
        course.chapters.forEach(ch => ch.exercises.forEach(e => flat.push(e)));
        const ex = flat.find(e => e.slug === r.exercise);
        html = ex
          ? renderExercise(student, course, ex, flat)
          : topBar(student) + '<h1>Not available</h1><p>This exercise has not been assigned to you. <a href="/notes-solutions/' + esc(course.slug) + '/">Back to ' + esc(course.title) + '</a></p>';
      }
    }
    if (gate) gate.hidden = true;
    out.className = "solutions-wrap bank-main";
    out.innerHTML = html;
    out.hidden = false;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
