// =====================================================
// MOCK DATA – AlumniConnect
// =====================================================

const BRANCHES    = ['Computer Science', 'Mechanical', 'Electronics', 'Civil', 'IT', 'Chemical', 'Biotechnology'];
const DEGREES     = ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MBA', 'MCA', 'B.Sc', 'M.Sc', 'Ph.D'];
const INSTITUTIONS = [
  'Anna University, Chennai',
  'IIT Madras',
  'IIT Bombay',
  'NIT Trichy',
  'VIT Vellore',
  'PSG College of Technology',
  'CEG, Anna University',
  'SSN College of Engineering',
  'Amrita Vishwa Vidyapeetham',
  'SRM Institute of Science & Technology',
  'Coimbatore Institute of Technology',
  'Kongu Engineering College',
];
const LOCATIONS   = ['Chennai', 'Bangalore', 'Mumbai', 'Hyderabad', 'Delhi', 'Pune', 'Coimbatore', 'San Francisco', 'London', 'Singapore'];
const COMPANIES   = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Zoho', 'Freshworks', 'Flipkart', 'Swiggy', 'BYJU\'S', 'Razorpay', 'Unacademy', 'Meesho', 'PhonePe', 'CRED', 'Ola', 'Paytm', 'Nykaa', 'MindTree'];
const DESIGNATIONS = ['Software Engineer', 'Senior Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'ML Engineer', 'Full Stack Developer', 'CTO', 'Architect', 'Engineering Manager', 'QA Lead', 'UI/UX Designer'];
const SECTORS     = ['Tech', 'Finance', 'Healthcare', 'E-Commerce', 'EdTech', 'FinTech', 'AI/ML', 'Consulting'];
const FIRST_NAMES = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya', 'Siddharth', 'Meera', 'Aditya', 'Pooja', 'Rohit', 'Lakshmi', 'Nikhil', 'Shreya', 'Akash', 'Nithya', 'Varun', 'Kavitha', 'Deepak', 'Riya', 'Suresh', 'Tanvi', 'Manoj', 'Ishita', 'Rajesh', 'Swathi', 'Harish', 'Nandini'];
const LAST_NAMES  = ['Kumar', 'Sharma', 'Patel', 'Nair', 'Singh', 'Reddy', 'Iyer', 'Gupta', 'Mehta', 'Krishnan', 'Venkat', 'Rajan', 'Das', 'Bose', 'Pillai', 'Menon', 'Rao', 'Joshi', 'Shah', 'Tiwari'];
const HONORS      = ['First Class with Distinction', 'First Class', 'Second Class', 'Pass Class'];
const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function rand(arr)         { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randCGPA()        { return (Math.random() * 3 + 7).toFixed(2); }   // 7.00 – 10.00
function randPct()         { return (Math.random() * 25 + 65).toFixed(1); } // 65 – 90 %

const AVATAR_COLORS = [
  'linear-gradient(135deg,#6C63FF,#00D9FF)',
  'linear-gradient(135deg,#FF6B6B,#FF8E53)',
  'linear-gradient(135deg,#00E676,#00BCD4)',
  'linear-gradient(135deg,#FFB300,#FF7043)',
  'linear-gradient(135deg,#AB47BC,#7E57C2)',
  'linear-gradient(135deg,#26C6DA,#00897B)',
];

// ── Default seed alumni (generated once, stored in localStorage) ──────────
const SEED_ALUMNI = [];
for (let i = 1; i <= 52; i++) {
  const first  = rand(FIRST_NAMES);
  const last   = rand(LAST_NAMES);
  const batch  = randInt(2010, 2023);
  const degree = rand(DEGREES);
  const cgpa   = randCGPA();
  const honor  = parseFloat(cgpa) >= 9 ? 'First Class with Distinction'
               : parseFloat(cgpa) >= 7.5 ? 'First Class'
               : parseFloat(cgpa) >= 6 ? 'Second Class' : 'Pass Class';

  SEED_ALUMNI.push({
    id:           i,
    name:         `${first} ${last}`,
    initials:     `${first[0]}${last[0]}`,
    // ── Graduation Details ──────────────────────
    batch,                                            // graduation year
    branch:       rand(BRANCHES),                    // department
    degree,                                          // B.E / M.Tech etc.
    institution:  rand(INSTITUTIONS),                // college / university
    cgpa,                                            // CGPA out of 10
    percentage:   randPct(),                         // % equivalent
    honor,                                           // class awarded
    rollNo:       `${batch % 100}${String(i).padStart(3,'0')}`,
    // ── Professional Details ────────────────────
    company:      rand(COMPANIES),
    designation:  rand(DESIGNATIONS),
    location:     rand(LOCATIONS),
    sector:       rand(SECTORS),
    // ── Contact ────────────────────────────────
    email:        `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
    phone:        `+91 ${randInt(70000,99999)} ${randInt(10000,99999)}`,
    linkedin:     `linkedin.com/in/${first.toLowerCase()}${last.toLowerCase()}`,
    // ── Meta ───────────────────────────────────
    color:        AVATAR_COLORS[i % AVATAR_COLORS.length],
    joined:       `${MONTHS[randInt(0,11)]} ${randInt(2020, 2025)}`,
  });
}

// ── Events seed ──────────────────────────────────────
const SEED_EVENTS = [
  { id: 1, title: 'Annual Alumni Reunion 2025',      date: '15', month: 'Jul', year: 2025, location: 'Main Auditorium, Campus',      type: 'Reunion',    rsvp: 142, capacity: 300, time: '10:00 AM' },
  { id: 2, title: 'Tech Industry Networking Night',  date: '22', month: 'Jul', year: 2025, location: 'Hotel Grand, Chennai',         type: 'Networking', rsvp: 87,  capacity: 150, time: '6:00 PM'  },
  { id: 3, title: 'Career Guidance Webinar',         date: '28', month: 'Jul', year: 2025, location: 'Online – Zoom',                type: 'Webinar',    rsvp: 215, capacity: 500, time: '4:00 PM'  },
  { id: 4, title: 'Alumni Football Tournament',      date: '05', month: 'Aug', year: 2025, location: 'Sports Complex, Campus',       type: 'Sports',     rsvp: 56,  capacity: 100, time: '8:00 AM'  },
  { id: 5, title: 'Startup Pitch Day',               date: '12', month: 'Aug', year: 2025, location: 'Innovation Hub',               type: 'Workshop',   rsvp: 98,  capacity: 120, time: '2:00 PM'  },
  { id: 6, title: 'Cultural Gala Night',             date: '20', month: 'Aug', year: 2025, location: 'Open Air Theatre, Campus',     type: 'Cultural',   rsvp: 320, capacity: 500, time: '7:00 PM'  },
  { id: 7, title: 'Coding Hackathon 2025',           date: '02', month: 'Sep', year: 2025, location: 'CS Lab Block',                 type: 'Workshop',   rsvp: 64,  capacity: 80,  time: '9:00 AM'  },
  { id: 8, title: 'CSE Batch 2018 Reunion',          date: '10', month: 'Sep', year: 2025, location: 'Taj Coromandel, Chennai',      type: 'Reunion',    rsvp: 38,  capacity: 60,  time: '7:00 PM'  },
];

// ── Jobs seed ────────────────────────────────────────
const SEED_JOBS = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Razorpay',   location: 'Bangalore',          type: 'Full-time',  salary: '₹25–40 LPA',  sector: 'FinTech',    posted: '2 days ago',  postedBy: 'Arjun Kumar (2018)',  tags: ['React', 'TypeScript', 'GraphQL'], logo: 'R', color: '#3395FF' },
  { id: 2, title: 'ML Engineer – NLP',        company: 'Freshworks', location: 'Chennai',            type: 'Full-time',  salary: '₹20–35 LPA',  sector: 'SaaS',       posted: '3 days ago',  postedBy: 'Priya Sharma (2017)', tags: ['Python', 'PyTorch', 'BERT'],      logo: 'F', color: '#00E676' },
  { id: 3, title: 'Product Manager',          company: 'Swiggy',     location: 'Bangalore',          type: 'Full-time',  salary: '₹30–50 LPA',  sector: 'E-Commerce', posted: '5 days ago',  postedBy: 'Vikram Nair (2015)',  tags: ['Product', 'Analytics', 'Strategy'],logo:'S', color: '#FF6B00' },
  { id: 4, title: 'Data Analyst Intern',      company: 'CRED',       location: 'Remote',             type: 'Internship', salary: '₹40,000/mo',  sector: 'FinTech',    posted: '1 week ago',  postedBy: 'Sneha Patel (2022)',  tags: ['SQL', 'Python', 'Tableau'],       logo: 'C', color: '#6C63FF' },
  { id: 5, title: 'DevOps Engineer',          company: 'Zoho',       location: 'Chennai',            type: 'Full-time',  salary: '₹18–28 LPA',  sector: 'SaaS',       posted: '1 week ago',  postedBy: 'Rahul Singh (2016)',  tags: ['Docker', 'Kubernetes', 'AWS'],    logo: 'Z', color: '#FFB300' },
  { id: 6, title: 'iOS Developer',            company: 'Meesho',     location: 'Bangalore (Remote)', type: 'Remote',     salary: '₹22–32 LPA',  sector: 'E-Commerce', posted: '2 weeks ago', postedBy: 'Ananya Reddy (2019)', tags: ['Swift', 'SwiftUI', 'Xcode'],      logo: 'M', color: '#FF4081' },
];

// ── localStorage persistence ─────────────────────────
function loadFromStorage(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
}

function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Live arrays (backed by localStorage) ─────────────
let alumni = loadFromStorage('ac_alumni', SEED_ALUMNI);
let events = loadFromStorage('ac_events', SEED_EVENTS);
let jobs   = loadFromStorage('ac_jobs',   SEED_JOBS);

// Helpers to persist after any mutation
function saveAlumni() {
  // Recompute derived analytics after save
  recomputeAnalytics();
  saveToStorage('ac_alumni', alumni);
}
function saveEvents() { saveToStorage('ac_events', events); }
function saveJobs()   { saveToStorage('ac_jobs',   jobs); }

// ── Activity feed (session only) ─────────────────────
const activities = [
  { text: '<span class="activity-strong">Arjun Kumar</span> updated their profile — now at Google, SWE III', time: '5 min ago',  color: '#6C63FF' },
  { text: '<span class="activity-strong">New event</span> "Startup Pitch Day" was created by Admin',          time: '32 min ago', color: '#00D9FF' },
  { text: '<span class="activity-strong">Priya Sharma</span> posted a job at Freshworks',                     time: '1 hr ago',   color: '#00E676' },
  { text: '<span class="activity-strong">Batch 2020</span> reunion confirmed — 142 RSVPs',                    time: '3 hrs ago',  color: '#FFB300' },
  { text: '<span class="activity-strong">Karthik Iyer</span> joined the platform',                            time: '5 hrs ago',  color: '#AB47BC' },
  { text: '<span class="activity-strong">Career Webinar</span> hit 200+ registrations',                       time: '1 day ago',  color: '#FF6B6B' },
];

// ── Analytics (derived, recomputed on demand) ─────────
let batchData = {}, branchData = {}, sectorData = {}, companyData = {}, locationData = {}, institutionData = {}, degreeData = {}, topCompanies = [];

function recomputeAnalytics() {
  batchData = {}; branchData = {}; sectorData = {}; companyData = {}; locationData = {}; institutionData = {}; degreeData = {};
  alumni.forEach(a => {
    batchData[a.batch]           = (batchData[a.batch]           || 0) + 1;
    branchData[a.branch]         = (branchData[a.branch]         || 0) + 1;
    sectorData[a.sector]         = (sectorData[a.sector]         || 0) + 1;
    companyData[a.company]       = (companyData[a.company]       || 0) + 1;
    locationData[a.location]     = (locationData[a.location]     || 0) + 1;
    institutionData[a.institution] = (institutionData[a.institution] || 0) + 1;
    degreeData[a.degree]         = (degreeData[a.degree]         || 0) + 1;
  });
  topCompanies = Object.entries(companyData).sort((a,b) => b[1]-a[1]).slice(0, 8);
}
recomputeAnalytics();
