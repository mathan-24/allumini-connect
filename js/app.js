// =====================================================
// AlumniConnect – Main App
// =====================================================

// ── Auth ───────────────────────────────────────────
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const ADMIN_EMAILS = [
  'msironman007@gmail.com',
  'admin@gmail.com',
  'admin@example.com'
];

let currentUser = null;

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('ac_session')); } catch { return null; }
}

function setSession(user) {
  sessionStorage.setItem('ac_session', JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem('ac_session');
}

function getUserRole(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (ADMIN_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
    return { role: 'Super Admin', roleKey: 'admin' };
  }
  return { role: 'Alumni', roleKey: 'alumni' };
}

function isAdmin() {
  return currentUser?.roleKey === 'admin';
}

// ── State ──────────────────────────────────────────
const state = {
  page: 'dashboard',
  directoryFilter: { search: '', branch: '', batch: '', sector: '', institution: '' },
  jobFilter: 'All',
  eventTab: 'Upcoming',
};

// ── DOM Refs ────────────────────────────────────────
const $content  = document.getElementById('pageContent');
const $title    = document.getElementById('pageTitle');
const $overlay  = document.getElementById('modalOverlay');
const $mTitle   = document.getElementById('modalTitle');
const $mBody    = document.getElementById('modalBody');
const $toast    = document.getElementById('toast');
const $sidebar  = document.getElementById('sidebar');
const $main     = document.getElementById('main');

// ── Router ──────────────────────────────────────────
function navigate(page) {
  if (!currentUser) return;
  state.page = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById(`nav-${page}`);
  if (navEl) navEl.classList.add('active');

  const titles = { dashboard: 'Dashboard', directory: 'Alumni Directory', events: 'Events', jobs: 'Job Board', analytics: 'Analytics' };
  $title.textContent = titles[page] || page;

  $content.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'page-enter';

  switch(page) {
    case 'dashboard':  wrapper.innerHTML = renderDashboard(); break;
    case 'directory':  wrapper.innerHTML = renderDirectory(); break;
    case 'events':     wrapper.innerHTML = renderEvents(); break;
    case 'jobs':       wrapper.innerHTML = renderJobs(); break;
    case 'analytics':  wrapper.innerHTML = renderAnalytics(); break;
  }

  $content.appendChild(wrapper);
  bindPageEvents(page);

  if (page === 'dashboard') animateCounters();
  if (page === 'analytics') renderCharts();
}

// ── Nav clicks ──────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigate(el.dataset.page);
    if (window.innerWidth < 768) $sidebar.classList.remove('open');
  });
});

document.getElementById('menuBtn').addEventListener('click', () => {
  if (window.innerWidth < 768) {
    $sidebar.classList.toggle('open');
  } else {
    $sidebar.classList.toggle('collapsed');
    $main.classList.toggle('expanded');
  }
});

// Global search – jump to directory
document.getElementById('globalSearch').addEventListener('input', e => {
  const q = e.target.value.trim();
  if (q.length > 0) {
    state.directoryFilter.search = q;
    navigate('directory');
    const inp = document.getElementById('dirSearch');
    if (inp) inp.value = q;
  }
});

// ── Modal helpers ────────────────────────────────────
function openModal(title, html) {
  $mTitle.textContent = title;
  $mBody.innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ── Toast ────────────────────────────────────────────
function showToast(msg, type = 'success') {
  $toast.textContent = msg;
  $toast.className = `toast ${type} show`;
  setTimeout(() => { $toast.classList.remove('show'); }, 3000);
}

// =====================================================
// DASHBOARD
// =====================================================
function renderDashboard() {
  const totalAlumni  = alumni.length;
  const eventsCount  = events.length;
  const jobsCount    = jobs.length;
  const batchesCount = [...new Set(alumni.map(a => a.batch))].length;

  return `
  <div class="stats-grid">
    ${statCard('Total Alumni', totalAlumni, '+12 this month', 'up', '#6C63FF', `
      <svg viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    `)}
    ${statCard('Upcoming Events', eventsCount, '3 this week', 'up', '#00D9FF', `
      <svg viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    `)}
    ${statCard('Active Job Posts', jobsCount, '+2 this week', 'up', '#00E676', `
      <svg viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    `)}
    ${statCard('Graduation Batches', batchesCount, 'Years covered', '', '#FFB300', `
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFB300" stroke-width="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    `)}
  </div>

  <div class="section-grid">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Alumni by Batch Year</div>
          <div class="card-subtitle">Graduation distribution</div>
        </div>
      </div>
      <div id="batchChart"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Recent Activity</div>
      </div>
      <div class="activity-list">
        ${activities.map(a => `
          <div class="activity-item">
            <div class="activity-dot" style="background:${a.color}"></div>
            <div>
              <div class="activity-text">${a.text}</div>
              <div class="activity-time">${a.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <div class="section-grid">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Top Companies</div>
        <button class="btn btn-secondary btn-sm" onclick="navigate('analytics')">View All</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Company</th><th>Alumni</th><th></th></tr></thead>
          <tbody>
            ${topCompanies.slice(0,6).map(([co, count]) => `
              <tr>
                <td><strong>${co}</strong></td>
                <td>${count}</td>
                <td><div style="height:6px;background:var(--border-subtle);border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.round(count/topCompanies[0][1]*100)}%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:3px;"></div></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Upcoming Events</div>
        <button class="btn btn-secondary btn-sm" onclick="navigate('events')">View All</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${events.slice(0,4).map(ev => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--surface);border-radius:8px;border:1px solid var(--border-subtle)">
            <div class="event-date-box" style="width:42px;height:48px">
              <span class="event-day" style="font-size:16px">${ev.date}</span>
              <span class="event-mon">${ev.month}</span>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev.title}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${ev.rsvp} RSVPs · ${ev.type}</div>
            </div>
            <span class="badge ${eventBadgeClass(ev.type)}">${ev.type}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  `;
}

function statCard(label, value, change, dir, color, iconSvg) {
  return `
  <div class="stat-card">
    <div class="stat-icon" style="background:${color}22;border:1px solid ${color}33">${iconSvg}</div>
    <div class="stat-info">
      <div class="stat-value" data-count="${value}">${value}</div>
      <div class="stat-label">${label}</div>
      ${change ? `<span class="stat-change ${dir}">${dir === 'up' ? '↑' : dir === 'down' ? '↓' : '·'} ${change}</span>` : ''}
    </div>
  </div>`;
}

function animateCounters() {
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

// =====================================================
// DIRECTORY
// =====================================================
function renderDirectory() {
  const f = state.directoryFilter;
  const branches     = [...new Set(alumni.map(a => a.branch))].sort();
  const batches      = [...new Set(alumni.map(a => a.batch))].sort();
  const sectors      = [...new Set(alumni.map(a => a.sector))].sort();
  const institutions = [...new Set(alumni.map(a => a.institution).filter(Boolean))].sort();

  const filtered = filterAlumni(f);

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div>
      <div style="font-size:22px;font-weight:800;color:var(--text)">${filtered.length}
        <span style="color:var(--text-muted);font-weight:400;font-size:15px">alumni found</span>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" id="exportCsvBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export CSV
      </button>
      ${isAdmin() ? `
      <button class="btn btn-primary" id="addAlumniBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Alumni
      </button>
      ` : (!alumni.some(a => a.email && a.email.toLowerCase() === currentUser.email.toLowerCase()) ? `
      <button class="btn btn-primary" id="addAlumniBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add My Profile
      </button>
      ` : '')}
    </div>
  </div>

  <div class="filter-bar">
    <input class="filter-input" id="dirSearch" placeholder="🔍  Search name, company, institution, roll no..." value="${f.search}" />
    <select class="filter-select" id="filterBranch">
      <option value="">All Branches</option>
      ${branches.map(b => `<option value="${b}" ${f.branch===b?'selected':''}>${b}</option>`).join('')}
    </select>
    <select class="filter-select" id="filterBatch">
      <option value="">All Batches</option>
      ${batches.map(b => `<option value="${b}" ${f.batch==b?'selected':''}>${b}</option>`).join('')}
    </select>
    <select class="filter-select" id="filterInstitution">
      <option value="">All Institutions</option>
      ${institutions.map(i => `<option value="${i}" ${f.institution===i?'selected':''}>${i}</option>`).join('')}
    </select>
    <select class="filter-select" id="filterSector">
      <option value="">All Sectors</option>
      ${sectors.map(s => `<option value="${s}" ${f.sector===s?'selected':''}>${s}</option>`).join('')}
    </select>
    <button class="btn btn-ghost btn-sm" id="clearFilters">Clear</button>
  </div>

  <div class="alumni-grid" id="alumniGrid">
    ${filtered.length ? filtered.map(a => alumniCard(a)).join('') : emptyState('🔍', 'No alumni found', 'Try adjusting your filters')}
  </div>`;
}

function filterAlumni(f) {
  return alumni.filter(a => {
    const q = f.search.toLowerCase();
    const matchSearch = !q
      || a.name.toLowerCase().includes(q)
      || a.company.toLowerCase().includes(q)
      || a.location.toLowerCase().includes(q)
      || a.designation.toLowerCase().includes(q)
      || (a.institution || '').toLowerCase().includes(q)
      || (a.rollNo || '').toLowerCase().includes(q)
      || (a.degree || '').toLowerCase().includes(q);
    const matchBranch      = !f.branch      || a.branch === f.branch;
    const matchBatch       = !f.batch       || a.batch == f.batch;
    const matchSector      = !f.sector      || a.sector === f.sector;
    const matchInstitution = !f.institution || a.institution === f.institution;
    return matchSearch && matchBranch && matchBatch && matchSector && matchInstitution;
  });
}

function emptyState(icon, text, sub) {
  return `<div class="empty-state" style="grid-column:1/-1">
    <div class="empty-icon">${icon}</div>
    <div class="empty-text">${text}</div>
    <div class="empty-sub">${sub}</div>
  </div>`;
}

function alumniCard(a) {
  const cgpaColor = parseFloat(a.cgpa) >= 9 ? 'var(--success)' : parseFloat(a.cgpa) >= 7.5 ? 'var(--accent)' : 'var(--warning)';
  return `
  <div class="alumni-card" data-id="${a.id}">
    <div class="alumni-card-header">
      <div class="alumni-avatar" style="background:${a.color}">${a.initials}</div>
      <div>
        <div class="alumni-name">${a.name}</div>
        <div class="alumni-role">${a.designation}</div>
      </div>
    </div>

    <!-- Graduation highlight strip -->
    <div style="background:var(--surface);border-radius:8px;padding:10px 12px;margin-bottom:12px;border:1px solid var(--border-subtle)">
      <div style="font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🎓 Graduation</div>
      <div style="font-size:12px;font-weight:600;color:var(--text)">${a.degree || 'B.E.'} · ${a.branch}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${a.institution || '—'}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:6px">
        <span style="font-size:12px;font-weight:700;color:${cgpaColor}">CGPA ${a.cgpa || '—'}</span>
        <span style="font-size:11px;color:var(--text-faint)">·</span>
        <span style="font-size:11px;color:var(--text-muted)">Batch ${a.batch}</span>
        ${a.rollNo ? `<span style="font-size:11px;color:var(--text-faint)">· ${a.rollNo}</span>` : ''}
      </div>
    </div>

    <div class="alumni-details">
      <div class="alumni-detail-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        ${a.company}
      </div>
      <div class="alumni-detail-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${a.location}
      </div>
    </div>

    <div class="alumni-card-footer">
      <span class="badge badge-primary">${a.sector}</span>
      <div class="alumni-actions">
        <button class="btn btn-ghost btn-sm btn-icon view-alumni" data-id="${a.id}" title="View Profile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        ${(isAdmin() || (currentUser && a.email && a.email.toLowerCase() === currentUser.email.toLowerCase())) ? `
        <button class="btn btn-secondary btn-sm btn-icon edit-alumni" data-id="${a.id}" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-danger btn-sm btn-icon del-alumni" data-id="${a.id}" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
        ` : ''}
      </div>
    </div>
  </div>`;
}

// ── Alumni Form (Add / Edit) ─────────────────────────
function alumniForm(a = {}) {
  return `
  <div style="margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle)">🎓 Graduation Details</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Degree</label>
        <select class="form-select" id="fDegree">
          ${DEGREES.map(d => `<option value="${d}" ${a.degree===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Branch / Department</label>
        <select class="form-select" id="fBranch">
          ${BRANCHES.map(b => `<option value="${b}" ${a.branch===b?'selected':''}>${b}</option>`).join('')}
        </select>
      </div>
      <div class="form-group full">
        <label class="form-label">Institution / University</label>
        <input class="form-input" id="fInstitution" placeholder="Anna University, Chennai" value="${a.institution||''}" list="institutionList" />
        <datalist id="institutionList">
          ${INSTITUTIONS.map(i => `<option value="${i}">`).join('')}
        </datalist>
      </div>
      <div class="form-group">
        <label class="form-label">Batch Year (Graduation)</label>
        <input class="form-input" id="fBatch" type="number" placeholder="2020" min="2000" max="2030" value="${a.batch||''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Roll Number</label>
        <input class="form-input" id="fRollNo" placeholder="20CS001" value="${a.rollNo||''}" />
      </div>
      <div class="form-group">
        <label class="form-label">CGPA (out of 10)</label>
        <input class="form-input" id="fCgpa" type="number" step="0.01" min="0" max="10" placeholder="8.75" value="${a.cgpa||''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Percentage (%)</label>
        <input class="form-input" id="fPercentage" type="number" step="0.1" min="0" max="100" placeholder="82.5" value="${a.percentage||''}" />
      </div>
    </div>
  </div>

  <div style="margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle)">👤 Personal Details</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">First Name</label>
        <input class="form-input" id="fName" placeholder="Arjun" value="${a.name ? a.name.split(' ')[0] : (isAdmin() ? '' : currentUser.name.split(' ')[0])}" />
      </div>
      <div class="form-group">
        <label class="form-label">Last Name</label>
        <input class="form-input" id="fLast" placeholder="Kumar" value="${a.name ? a.name.split(' ').slice(1).join(' ') : (isAdmin() ? '' : currentUser.name.split(' ').slice(1).join(' '))}" />
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="fEmail" type="email" placeholder="arjun@gmail.com" value="${a.email || (isAdmin() ? '' : currentUser.email)}" ${!isAdmin() ? 'disabled' : ''} />
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input class="form-input" id="fPhone" placeholder="+91 98765 43210" value="${a.phone||''}" />
      </div>
      <div class="form-group full">
        <label class="form-label">LinkedIn URL</label>
        <input class="form-input" id="fLinkedin" placeholder="linkedin.com/in/username" value="${a.linkedin||''}" />
      </div>
    </div>
  </div>

  <div>
    <div style="font-size:11px;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle)">💼 Professional Details</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Company</label>
        <input class="form-input" id="fCompany" placeholder="Google" value="${a.company||''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Designation</label>
        <input class="form-input" id="fDesig" placeholder="Software Engineer" value="${a.designation||''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Location</label>
        <input class="form-input" id="fLocation" placeholder="Chennai" value="${a.location||''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Sector</label>
        <select class="form-select" id="fSector">
          ${SECTORS.map(s => `<option value="${s}" ${a.sector===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>

  <div class="form-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" id="saveAlumniBtn" data-id="${a.id||''}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ${a.id ? 'Save Changes' : 'Add Alumni'}
    </button>
  </div>`;
}

// ── Profile View ─────────────────────────────────────
function viewProfile(a) {
  const cgpaColor = parseFloat(a.cgpa) >= 9 ? 'var(--success)' : parseFloat(a.cgpa) >= 7.5 ? 'var(--accent)' : 'var(--warning)';
  const honorColor = a.honor === 'First Class with Distinction' ? 'badge-success' : a.honor === 'First Class' ? 'badge-accent' : 'badge-warning';

  return `
  <div class="profile-hero">
    <div class="profile-avatar-lg" style="background:${a.color}">${a.initials}</div>
    <div>
      <div class="profile-name">${a.name}</div>
      <div class="profile-sub">${a.designation} at ${a.company}</div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
        <span class="badge badge-primary">${a.sector}</span>
        <span class="badge badge-gray">Batch ${a.batch}</span>
        <span class="badge badge-accent">${a.branch}</span>
        ${a.honor ? `<span class="badge ${honorColor}">${a.honor}</span>` : ''}
      </div>
    </div>
  </div>

  <!-- Graduation Card -->
  <div style="background:linear-gradient(135deg,var(--primary-light),var(--accent-light));border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:18px">
    <div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px">🎓 Graduation Details</div>
    <div class="profile-info-grid">
      <div class="profile-field">
        <div class="profile-field-label">Degree</div>
        <div class="profile-field-value">${a.degree || '—'}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Department</div>
        <div class="profile-field-value">${a.branch}</div>
      </div>
      <div class="profile-field" style="grid-column:1/-1">
        <div class="profile-field-label">Institution</div>
        <div class="profile-field-value" style="color:var(--text)">${a.institution || '—'}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Graduation Year</div>
        <div class="profile-field-value">${a.batch}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Roll Number</div>
        <div class="profile-field-value">${a.rollNo || '—'}</div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">CGPA</div>
        <div class="profile-field-value" style="color:${cgpaColor};font-size:17px;font-weight:800">${a.cgpa || '—'} <span style="font-size:11px;font-weight:400;color:var(--text-muted)">/ 10</span></div>
      </div>
      <div class="profile-field">
        <div class="profile-field-label">Percentage</div>
        <div class="profile-field-value">${a.percentage ? a.percentage + ' %' : '—'}</div>
      </div>
    </div>
  </div>

  <!-- Contact & Professional -->
  <div class="profile-info-grid">
    <div class="profile-field">
      <div class="profile-field-label">📧 Email</div>
      <div class="profile-field-value">${a.email}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">📱 Phone</div>
      <div class="profile-field-value">${a.phone}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">📍 Location</div>
      <div class="profile-field-value">${a.location}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">🏢 Company</div>
      <div class="profile-field-value">${a.company}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">💼 Designation</div>
      <div class="profile-field-value">${a.designation}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">🌐 LinkedIn</div>
      <div class="profile-field-value" style="color:var(--primary)">${a.linkedin || '—'}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">📅 Joined Platform</div>
      <div class="profile-field-value">${a.joined || '—'}</div>
    </div>
    <div class="profile-field">
      <div class="profile-field-label">🏭 Sector</div>
      <div class="profile-field-value">${a.sector}</div>
    </div>
  </div>`;
}

// ── CSV Export ───────────────────────────────────────
function exportCSV() {
  const headers = ['Name','Roll No','Degree','Branch','Institution','Batch','CGPA','Percentage','Honor','Company','Designation','Location','Sector','Email','Phone','LinkedIn'];
  const rows = filterAlumni(state.directoryFilter).map(a => [
    a.name, a.rollNo || '', a.degree || '', a.branch, a.institution || '', a.batch,
    a.cgpa || '', a.percentage || '', a.honor || '',
    a.company, a.designation, a.location, a.sector,
    a.email, a.phone, a.linkedin || ''
  ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'alumni_data.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast(`Exported ${rows.length} records`, 'success');
}

// =====================================================
// EVENTS
// =====================================================
function eventBadgeClass(type) {
  const map = { Reunion: 'badge-primary', Networking: 'badge-accent', Webinar: 'badge-success', Sports: 'badge-warning', Workshop: 'badge-danger', Cultural: 'badge-warning' };
  return map[type] || 'badge-gray';
}

function renderEvents() {
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div class="tab-bar" style="border-bottom:none;margin-bottom:0">
      ${['Upcoming','Past'].map(t => `<button class="tab ${state.eventTab===t?'active':''}" onclick="state.eventTab='${t}';navigate('events')">${t}</button>`).join('')}
    </div>
    ${isAdmin() ? `
    <button class="btn btn-primary" id="addEventBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Create Event
    </button>
    ` : ''}
  </div>
  <div class="events-list">
    ${events.map(ev => `
      <div class="event-card">
        <div class="event-date-box">
          <span class="event-day">${ev.date}</span>
          <span class="event-mon">${ev.month}</span>
        </div>
        <div class="event-info">
          <div class="event-title">${ev.title}</div>
          <div class="event-meta">
            📍 ${ev.location} &nbsp;·&nbsp; 🕐 ${ev.time} &nbsp;·&nbsp;
            <strong style="color:var(--success)">${ev.rsvp}</strong> / ${ev.capacity} RSVPs
          </div>
          <div style="margin-top:8px">
            <div style="height:4px;background:var(--border-subtle);border-radius:2px;overflow:hidden;width:200px">
              <div style="height:100%;width:${Math.round(ev.rsvp/ev.capacity*100)}%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:2px;transition:width 0.6s ease"></div>
            </div>
          </div>
        </div>
        <div class="event-actions">
          <span class="badge ${eventBadgeClass(ev.type)}">${ev.type}</span>
          <button class="btn btn-primary btn-sm rsvp-btn" data-id="${ev.id}">RSVP</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function eventForm() {
  return `
  <div class="form-grid">
    <div class="form-group full">
      <label class="form-label">Event Title</label>
      <input class="form-input" id="eTitle" placeholder="Annual Alumni Reunion 2025" />
    </div>
    <div class="form-group">
      <label class="form-label">Date</label>
      <input class="form-input" id="eDate" type="date" />
    </div>
    <div class="form-group">
      <label class="form-label">Time</label>
      <input class="form-input" id="eTime" type="time" />
    </div>
    <div class="form-group">
      <label class="form-label">Type</label>
      <select class="form-select" id="eType">
        ${['Reunion','Networking','Webinar','Sports','Workshop','Cultural'].map(t => `<option>${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Capacity</label>
      <input class="form-input" id="eCapacity" type="number" placeholder="200" />
    </div>
    <div class="form-group full">
      <label class="form-label">Location</label>
      <input class="form-input" id="eLocation" placeholder="Main Auditorium, Campus" />
    </div>
  </div>
  <div class="form-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" id="saveEventBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Create Event
    </button>
  </div>`;
}

// =====================================================
// JOB BOARD
// =====================================================
function renderJobs() {
  const types    = ['All', 'Full-time', 'Internship', 'Remote'];
  const filtered = state.jobFilter === 'All' ? jobs : jobs.filter(j => j.type === state.jobFilter);

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div class="tab-bar" style="border-bottom:none;margin-bottom:0">
      ${types.map(t => `<button class="tab ${state.jobFilter===t?'active':''}" onclick="state.jobFilter='${t}';navigate('jobs')">${t}</button>`).join('')}
    </div>
    ${isAdmin() ? `
    <button class="btn btn-primary" id="postJobBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Post a Job
    </button>
    ` : ''}
  </div>
  <div class="jobs-list">
    ${filtered.map(j => `
      <div class="job-card">
        <div class="job-logo" style="background:${j.color}">${j.logo}</div>
        <div class="job-info">
          <div class="job-title">${j.title}</div>
          <div class="job-company">${j.company} · ${j.location}</div>
          <div class="job-tags">
            ${j.tags.map(t => `<span class="badge badge-gray">${t}</span>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--text-faint);margin-top:8px">Posted by ${j.postedBy} · ${j.posted}</div>
        </div>
        <div class="job-actions">
          <div class="job-salary">${j.salary}</div>
          <span class="badge ${j.type==='Full-time'?'badge-success':j.type==='Internship'?'badge-warning':'badge-accent'}">${j.type}</span>
          <button class="btn btn-primary btn-sm" onclick="showToast('Application submitted!','success')">Apply</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function jobForm() {
  return `
  <div class="form-grid">
    <div class="form-group full">
      <label class="form-label">Job Title</label>
      <input class="form-input" id="jTitle" placeholder="Senior Frontend Engineer" />
    </div>
    <div class="form-group">
      <label class="form-label">Company</label>
      <input class="form-input" id="jCompany" placeholder="Your Company" />
    </div>
    <div class="form-group">
      <label class="form-label">Location</label>
      <input class="form-input" id="jLocation" placeholder="Bangalore / Remote" />
    </div>
    <div class="form-group">
      <label class="form-label">Type</label>
      <select class="form-select" id="jType">
        ${['Full-time','Internship','Remote'].map(t => `<option>${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Salary / Stipend</label>
      <input class="form-input" id="jSalary" placeholder="₹20–30 LPA" />
    </div>
    <div class="form-group full">
      <label class="form-label">Skills Required (comma separated)</label>
      <input class="form-input" id="jSkills" placeholder="React, Node.js, AWS" />
    </div>
  </div>
  <div class="form-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" id="saveJobBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Post Job
    </button>
  </div>`;
}

// =====================================================
// ANALYTICS
// =====================================================
function renderAnalytics() {
  const donutColors   = ['#6C63FF','#00D9FF','#00E676','#FFB300','#FF6B6B','#AB47BC','#26C6DA'];
  const branchEntries = Object.entries(branchData).sort((a,b) => b[1]-a[1]);
  const sectorEntries = Object.entries(sectorData).sort((a,b) => b[1]-a[1]);
  const instEntries   = Object.entries(institutionData).sort((a,b) => b[1]-a[1]);
  const degreeEntries = Object.entries(degreeData).sort((a,b) => b[1]-a[1]);
  const total = alumni.length;

  return `
  <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:24px">
    ${[
      ['Total Alumni',  alumni.length,                    '#6C63FF'],
      ['Institutions',  Object.keys(institutionData).length, '#00D9FF'],
      ['Branches',      Object.keys(branchData).length,    '#00E676'],
      ['Locations',     Object.keys(locationData).length,  '#FFB300'],
      ['Companies',     Object.keys(companyData).length,   '#FF6B6B'],
    ].map(([l,v,c]) => `
      <div class="card" style="padding:18px;margin-bottom:0;border-top:2px solid ${c}">
        <div style="font-size:28px;font-weight:800;color:var(--text)">${v}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${l}</div>
      </div>
    `).join('')}
  </div>

  <div class="section-grid">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Batch Year Distribution</div>
      </div>
      <div id="batchChartAnalytics"></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">Branch Distribution</div>
      </div>
      <div class="donut-wrap" id="donutWrap">
        <svg id="donutSvg" width="150" height="150" viewBox="0 0 150 150"></svg>
        <div class="donut-legend">
          ${branchEntries.map(([b,c],i) => `
            <div class="legend-item">
              <div class="legend-dot" style="background:${donutColors[i%donutColors.length]}"></div>
              <span>${b} <strong style="color:var(--text)">${c}</strong></span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- Graduation-specific analytics -->
  <div class="section-grid">
    <div class="card">
      <div class="card-header">
        <div class="card-title">🎓 Top Institutions</div>
        <span class="badge badge-primary">${instEntries.length} colleges</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${instEntries.slice(0,8).map(([inst, count], i) => `
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:20px;font-size:11px;font-weight:700;color:var(--text-faint);text-align:right">#${i+1}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;margin-bottom:5px">
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${inst}</span>
                <span style="color:var(--accent);flex-shrink:0;margin-left:8px">${count}</span>
              </div>
              <div style="height:6px;background:var(--border-subtle);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${Math.round(count/instEntries[0][1]*100)}%;background:linear-gradient(90deg,var(--accent),#00E676);border-radius:3px;transition:width 1s ${i*0.08}s ease"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">📜 Degree Distribution</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${degreeEntries.map(([d, c], i) => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
              <span style="font-weight:700">${d}</span>
              <span style="color:var(--text-muted)">${c} (${Math.round(c/total*100)}%)</span>
            </div>
            <div style="height:8px;background:var(--border-subtle);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${Math.round(c/total*100)}%;background:${donutColors[i%donutColors.length]};border-radius:4px;transition:width 1s ${i*0.1}s ease"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <div class="section-grid">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Top Hiring Companies</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${topCompanies.map(([co, count], i) => `
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:20px;font-size:11px;font-weight:700;color:var(--text-faint);text-align:right">#${i+1}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:5px">
                <span>${co}</span><span style="color:var(--primary)">${count}</span>
              </div>
              <div style="height:6px;background:var(--border-subtle);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${Math.round(count/topCompanies[0][1]*100)}%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:3px;transition:width 1s ${i*0.08}s ease"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Sector Breakdown</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${sectorEntries.map(([s, c], i) => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
              <span style="font-weight:600">${s}</span>
              <span style="color:var(--text-muted)">${c} (${Math.round(c/total*100)}%)</span>
            </div>
            <div style="height:8px;background:var(--border-subtle);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${Math.round(c/total*100)}%;background:${donutColors[i%donutColors.length]};border-radius:4px;transition:width 1s ${i*0.1}s ease"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title">Geographic Distribution</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">
      ${Object.entries(locationData).sort((a,b)=>b[1]-a[1]).map(([loc, cnt]) => `
        <div style="padding:14px;background:var(--surface);border-radius:10px;border:1px solid var(--border-subtle);text-align:center">
          <div style="font-size:20px;font-weight:800;color:var(--primary)">${cnt}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">📍 ${loc}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// =====================================================
// CHARTS
// =====================================================
function renderCharts() {
  renderBatchChart('batchChartAnalytics');
  renderDonut();
}

function renderBatchChart(containerId) {
  const container = document.getElementById(containerId) || document.getElementById('batchChart');
  if (!container) return;

  const entries = Object.entries(batchData).sort((a,b) => a[0]-b[0]);
  const max = Math.max(...entries.map(e => e[1]));

  container.innerHTML = `<div class="chart-bar-group">${entries.map(([year, count]) => {
    const pct = Math.round((count / max) * 100);
    return `<div class="chart-bar-wrap" title="${year}: ${count} alumni">
      <div class="chart-bar" style="height:0" data-h="${pct}%" data-tip="${count}"></div>
      <div class="chart-bar-label">${String(year).slice(2)}</div>
    </div>`;
  }).join('')}</div>`;

  requestAnimationFrame(() => {
    container.querySelectorAll('.chart-bar').forEach((bar, i) => {
      setTimeout(() => { bar.style.height = bar.dataset.h; }, i * 40);
    });
  });
}

function renderDonut() {
  const svg = document.getElementById('donutSvg');
  if (!svg) return;
  const entries = Object.entries(branchData);
  const total   = entries.reduce((s,e) => s + e[1], 0);
  const colors  = ['#6C63FF','#00D9FF','#00E676','#FFB300','#FF6B6B','#AB47BC','#26C6DA'];
  const cx = 75, cy = 75, r = 55, ir = 35;
  let angle = -Math.PI / 2;
  const paths = entries.map(([, count], i) => {
    const slice = (count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle),  y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + slice), y2 = cy + r * Math.sin(angle + slice);
    const ix1 = cx + ir * Math.cos(angle), iy1 = cy + ir * Math.sin(angle);
    const ix2 = cx + ir * Math.cos(angle + slice), iy2 = cy + ir * Math.sin(angle + slice);
    const large = slice > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
    angle += slice;
    return `<path d="${d}" fill="${colors[i%colors.length]}" opacity="0.85" style="cursor:pointer;transition:opacity 0.2s" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.85"/>`;
  }).join('');
  svg.innerHTML = `${paths}
    <text x="${cx}" y="${cy-6}" text-anchor="middle" fill="var(--text)" font-size="18" font-weight="800" font-family="Inter">${total}</text>
    <text x="${cx}" y="${cy+12}" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-family="Inter">alumni</text>`;
}

// =====================================================
// BIND PAGE EVENTS
// =====================================================
function bindPageEvents(page) {
  if (page === 'dashboard') {
    setTimeout(() => renderBatchChart('batchChart'), 50);
  }

  if (page === 'directory') {
    // Filters
    ['dirSearch','filterBranch','filterBatch','filterInstitution','filterSector'].forEach(id => {
      document.getElementById(id)?.addEventListener(id === 'dirSearch' ? 'input' : 'change', e => {
        const map = { dirSearch: 'search', filterBranch: 'branch', filterBatch: 'batch', filterInstitution: 'institution', filterSector: 'sector' };
        state.directoryFilter[map[id]] = e.target.value;
        document.getElementById('alumniGrid').innerHTML = renderFilteredAlumni();
      });
    });

    document.getElementById('clearFilters')?.addEventListener('click', () => {
      state.directoryFilter = { search: '', branch: '', batch: '', sector: '', institution: '' };
      navigate('directory');
    });

    document.getElementById('exportCsvBtn')?.addEventListener('click', exportCSV);

    document.getElementById('addAlumniBtn')?.addEventListener('click', () => {
      const hasOwn = alumni.some(a => a.email && a.email.toLowerCase() === currentUser.email.toLowerCase());
      if (!isAdmin() && hasOwn) { showToast('Profile already exists', 'error'); return; }
      openModal(isAdmin() ? 'Add New Alumni' : 'Add My Profile', alumniForm());
      bindAlumniFormSave();
    });

    // Delegate view / edit / delete
    document.getElementById('alumniGrid')?.addEventListener('click', e => {
      const viewBtn = e.target.closest('.view-alumni');
      const editBtn = e.target.closest('.edit-alumni');
      const delBtn  = e.target.closest('.del-alumni');

      if (viewBtn) {
        const a = alumni.find(x => x.id == viewBtn.dataset.id);
        if (a) openModal(`${a.name}'s Profile`, viewProfile(a));
      }
      if (editBtn) {
        const a = alumni.find(x => x.id == editBtn.dataset.id);
        if (!a) return;
        const isOwner = a.email && a.email.toLowerCase() === currentUser.email.toLowerCase();
        if (!isAdmin() && !isOwner) { showToast('Permission denied', 'error'); return; }
        openModal('Edit Alumni', alumniForm(a));
        bindAlumniFormSave(a.id);
      }
      if (delBtn) {
        const id  = parseInt(delBtn.dataset.id);
        const a = alumni.find(x => x.id === id);
        if (!a) return;
        const isOwner = a.email && a.email.toLowerCase() === currentUser.email.toLowerCase();
        if (!isAdmin() && !isOwner) { showToast('Permission denied', 'error'); return; }
        
        const name = a.name;
        const idx = alumni.findIndex(x => x.id === id);
        if (idx !== -1) {
          alumni.splice(idx, 1);
          saveAlumni();
          showToast(`${name} removed`, 'success');
          navigate('directory');
        }
      }
    });
  }

  if (page === 'events') {
    document.getElementById('addEventBtn')?.addEventListener('click', () => {
      if (!isAdmin()) { showToast('Permission denied', 'error'); return; }
      openModal('Create New Event', eventForm());
      document.getElementById('saveEventBtn')?.addEventListener('click', () => {
        const title = document.getElementById('eTitle')?.value.trim();
        if (!title) { showToast('Event title required', 'error'); return; }
        const d = new Date(document.getElementById('eDate')?.value || '2025-08-01');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        events.unshift({
          id: Date.now(), title,
          date:     String(d.getDate()).padStart(2,'0'),
          month:    months[d.getMonth()],
          year:     d.getFullYear(),
          location: document.getElementById('eLocation')?.value || 'TBD',
          type:     document.getElementById('eType')?.value,
          rsvp:     0,
          capacity: parseInt(document.getElementById('eCapacity')?.value) || 100,
          time:     document.getElementById('eTime')?.value || '10:00 AM',
        });
        saveEvents();
        closeModal();
        showToast('Event created!', 'success');
        navigate('events');
      });
    });

    document.querySelectorAll('.rsvp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ev = events.find(e => e.id == btn.dataset.id);
        if (ev) { ev.rsvp++; saveEvents(); showToast(`RSVP confirmed for "${ev.title}"`, 'success'); navigate('events'); }
      });
    });
  }

  if (page === 'jobs') {
    document.getElementById('postJobBtn')?.addEventListener('click', () => {
      if (!isAdmin()) { showToast('Permission denied', 'error'); return; }
      openModal('Post a Job', jobForm());
      document.getElementById('saveJobBtn')?.addEventListener('click', () => {
        const title = document.getElementById('jTitle')?.value.trim();
        if (!title) { showToast('Job title required', 'error'); return; }
        const skills  = (document.getElementById('jSkills')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
        const company = document.getElementById('jCompany')?.value || 'Your Company';
        const colors  = ['#6C63FF','#00D9FF','#00E676','#FFB300','#FF6B6B'];
        jobs.unshift({
          id: Date.now(), title, company,
          location: document.getElementById('jLocation')?.value || 'Remote',
          type:     document.getElementById('jType')?.value,
          salary:   document.getElementById('jSalary')?.value || 'Competitive',
          sector:   'Tech', posted: 'Just now', postedBy: 'Admin',
          tags:     skills.slice(0,3),
          logo:     company[0]?.toUpperCase() || 'J',
          color:    colors[Math.floor(Math.random()*colors.length)],
        });
        saveJobs();
        closeModal();
        showToast('Job posted!', 'success');
        navigate('jobs');
      });
    });
  }
}

function renderFilteredAlumni() {
  const filtered = filterAlumni(state.directoryFilter);
  return filtered.length
    ? filtered.map(a => alumniCard(a)).join('')
    : emptyState('🔍', 'No alumni found', 'Try adjusting your filters');
}

// ── Save Alumni with CGPA-derived honor ──────────────
function bindAlumniFormSave(editId = null) {
  document.getElementById('saveAlumniBtn')?.addEventListener('click', () => {
    const first = document.getElementById('fName')?.value.trim();
    const last  = document.getElementById('fLast')?.value.trim();
    if (!first || !last) { showToast('Name is required', 'error'); return; }

    const cgpa = parseFloat(document.getElementById('fCgpa')?.value) || null;
    const honor = cgpa
      ? cgpa >= 9 ? 'First Class with Distinction' : cgpa >= 7.5 ? 'First Class' : cgpa >= 6 ? 'Second Class' : 'Pass Class'
      : '';
    const colors = ['linear-gradient(135deg,#6C63FF,#00D9FF)','linear-gradient(135deg,#FF6B6B,#FF8E53)','linear-gradient(135deg,#00E676,#00BCD4)'];

    let emailVal = document.getElementById('fEmail')?.value.trim();
    if (!isAdmin()) {
      emailVal = editId ? (alumni.find(x => x.id === editId)?.email || currentUser.email) : currentUser.email;
    }

    if (editId) {
      const a = alumni.find(x => x.id === editId);
      if (a) {
        if (!isAdmin() && a.email.toLowerCase() !== currentUser.email.toLowerCase()) {
          showToast('Permission denied', 'error');
          return;
        }
        a.name        = `${first} ${last}`;
        a.initials    = `${first[0]}${last[0]}`;
        a.degree      = document.getElementById('fDegree')?.value        || a.degree;
        a.branch      = document.getElementById('fBranch')?.value        || a.branch;
        a.institution = document.getElementById('fInstitution')?.value   || a.institution;
        a.batch       = parseInt(document.getElementById('fBatch')?.value)|| a.batch;
        a.rollNo      = document.getElementById('fRollNo')?.value        || a.rollNo;
        a.cgpa        = document.getElementById('fCgpa')?.value          || a.cgpa;
        a.percentage  = document.getElementById('fPercentage')?.value    || a.percentage;
        a.honor       = honor || a.honor;
        a.email       = emailVal;
        a.phone       = document.getElementById('fPhone')?.value         || a.phone;
        a.linkedin    = document.getElementById('fLinkedin')?.value      || a.linkedin;
        a.company     = document.getElementById('fCompany')?.value       || a.company;
        a.designation = document.getElementById('fDesig')?.value         || a.designation;
        a.location    = document.getElementById('fLocation')?.value      || a.location;
        a.sector      = document.getElementById('fSector')?.value        || a.sector;
        showToast('Alumni updated!', 'success');
      }
    } else {
      if (!isAdmin() && alumni.some(x => x.email && x.email.toLowerCase() === currentUser.email.toLowerCase())) {
        showToast('Profile already exists', 'error');
        return;
      }
      const newId = alumni.length ? Math.max(...alumni.map(a => a.id)) + 1 : 1;
      alumni.unshift({
        id:          newId,
        name:        `${first} ${last}`,
        initials:    `${first[0]}${last[0]}`,
        degree:      document.getElementById('fDegree')?.value      || 'B.E.',
        branch:      document.getElementById('fBranch')?.value      || 'Computer Science',
        institution: document.getElementById('fInstitution')?.value || '',
        batch:       parseInt(document.getElementById('fBatch')?.value) || 2023,
        rollNo:      document.getElementById('fRollNo')?.value      || '',
        cgpa:        document.getElementById('fCgpa')?.value        || '',
        percentage:  document.getElementById('fPercentage')?.value  || '',
        honor,
        email:       emailVal,
        phone:       document.getElementById('fPhone')?.value       || 'N/A',
        linkedin:    document.getElementById('fLinkedin')?.value    || '',
        company:     document.getElementById('fCompany')?.value     || 'Unknown',
        designation: document.getElementById('fDesig')?.value       || 'Alumni',
        location:    document.getElementById('fLocation')?.value    || 'India',
        sector:      document.getElementById('fSector')?.value      || 'Tech',
        color:       colors[newId % colors.length],
        joined:      new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      });
      showToast('Alumni added!', 'success');
    }

    saveAlumni();
    closeModal();
    navigate('directory');
  });
}

// =====================================================
// AUTH – GOOGLE & MOCK AUTH
// =====================================================
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Google Sign-In SDK Callback
window.handleCredentialResponse = function(response) {
  const payload = decodeJwt(response.credential);
  if (payload) {
    const email = payload.email;
    const name = payload.name || payload.given_name || email.split('@')[0];
    const picture = payload.picture || '';
    const { role, roleKey } = getUserRole(email);

    loginSuccess({ email, name, picture, role, roleKey });
  } else {
    showToast('Google Sign-In failed', 'error');
  }
};

function loginSuccess(user) {
  currentUser = user;
  setSession(user);

  const loginScreen = document.getElementById('loginScreen');
  const appShell    = document.getElementById('appShell');

  loginScreen.classList.add('hidden');
  appShell.classList.add('visible');
  applyUserUI();
  
  navigate('dashboard');

  setTimeout(() => { loginScreen.style.display = 'none'; }, 450);
  showToast(`Signed in as ${user.name}`, 'success');
}

function injectGoogleChooser() {
  if (document.getElementById('gChooserOverlay')) return;
  const chooser = document.createElement('div');
  chooser.id = 'gChooserOverlay';
  chooser.className = 'g-chooser-overlay';
  chooser.innerHTML = `
    <div class="g-chooser-modal">
      <div class="g-chooser-header">
        <div class="g-chooser-logo">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.81-1.02-1.78-1.02-2.72z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <h3 class="g-chooser-title">Choose an account</h3>
        <p class="g-chooser-subtitle">to continue to AlumniConnect</p>
      </div>

      <div class="g-chooser-accounts">
        <button class="g-chooser-account" data-email="msironman007@gmail.com" data-name="Mathan">
          <div class="g-chooser-avatar" style="background:#6C63FF">M</div>
          <div class="g-chooser-info">
            <span class="g-chooser-name">Mathan</span>
            <span class="g-chooser-email">msironman007@gmail.com</span>
          </div>
          <span class="g-chooser-role-tag admin">Admin</span>
        </button>
        <button class="g-chooser-account" data-email="alumni@example.com" data-name="Alumni User">
          <div class="g-chooser-avatar" style="background:#00D9FF">A</div>
          <div class="g-chooser-info">
            <span class="g-chooser-name">Alumni User</span>
            <span class="g-chooser-email">alumni@example.com</span>
          </div>
          <span class="g-chooser-role-tag user">User</span>
        </button>
      </div>

      <div class="g-chooser-divider">or use a custom account</div>

      <form class="g-chooser-form" id="gChooserForm">
        <div class="g-chooser-input-group">
          <label class="g-chooser-label">Display Name</label>
          <input class="g-chooser-input" id="gChooserName" type="text" placeholder="e.g. John Doe" required />
        </div>
        <div class="g-chooser-input-group">
          <label class="g-chooser-label">Email Address</label>
          <input class="g-chooser-input" id="gChooserEmail" type="email" placeholder="e.g. john.doe@gmail.com" required />
        </div>
        <button class="g-chooser-submit-btn" type="submit">Sign In</button>
      </form>

      <button class="g-chooser-cancel-btn" id="gChooserCancel">Cancel</button>
    </div>
  `;
  document.body.appendChild(chooser);
}

function initAuth() {
  const loginScreen = document.getElementById('loginScreen');
  const appShell    = document.getElementById('appShell');

  // Inject Custom accounts selector
  injectGoogleChooser();

  const gChooserOverlay = document.getElementById('gChooserOverlay');

  // Click handler for mock google button
  document.getElementById('mockGoogleBtn')?.addEventListener('click', () => {
    gChooserOverlay.classList.add('open');
  });

  document.getElementById('gChooserCancel')?.addEventListener('click', () => {
    gChooserOverlay.classList.remove('open');
  });

  // Account selector list clicks
  gChooserOverlay.querySelectorAll('.g-chooser-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.dataset.email;
      const name = btn.dataset.name;
      const { role, roleKey } = getUserRole(email);
      loginSuccess({ email, name, picture: '', role, roleKey });
      gChooserOverlay.classList.remove('open');
    });
  });

  // Form submit for custom mock account
  document.getElementById('gChooserForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('gChooserName').value.trim();
    const email = document.getElementById('gChooserEmail').value.trim();
    if (!name || !email) return;

    const { role, roleKey } = getUserRole(email);
    loginSuccess({ email, name, picture: '', role, roleKey });
    gChooserOverlay.classList.remove('open');
  });

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearSession();
    currentUser = null;

    loginScreen.style.display = 'flex';
    setTimeout(() => {
      loginScreen.classList.remove('hidden');
      appShell.classList.remove('visible');
    }, 10);
    
    showToast('Signed out successfully', 'success');
  });

  // Check existing session
  const session = getSession();
  if (session) {
    currentUser = session;
    loginScreen.style.display = 'none';
    appShell.classList.add('visible');
    applyUserUI();
    navigate('dashboard');
  }

  // Load real Google One-tap/button if Client ID is configured and not default
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    const realBtn = document.getElementById('realGoogleBtn');
    if (realBtn) realBtn.style.display = 'block';
    
    const onloadEl = document.getElementById('g_id_onload');
    if (onloadEl) {
      onloadEl.setAttribute('data-client_id', GOOGLE_CLIENT_ID);
    }
  }
}

function applyUserUI() {
  if (!currentUser) return;
  
  // Sidebar avatar: if Google photo is available, render it! Otherwise render initials.
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (currentUser.picture) {
    sidebarAvatar.innerHTML = `<img src="${currentUser.picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    sidebarAvatar.style.background = 'transparent';
  } else {
    sidebarAvatar.textContent = currentUser.name[0].toUpperCase();
    sidebarAvatar.style.background = '';
  }

  document.getElementById('sidebarName').textContent   = currentUser.name;
  document.getElementById('sidebarRole').textContent   = currentUser.role;

  // Topbar badge
  const badge = document.getElementById('topbarRoleBadge');
  badge.textContent  = currentUser.role;
  badge.className    = `topbar-role-badge ${currentUser.roleKey}`;
}

// ── Boot ─────────────────────────────────────────────
initAuth();
