/* ================================================================
   EduTrack Pro — School Result Management System
   script.js — FIXED: Navigation, Charts, Interactions
   ================================================================ */

   'use strict';

   /* ================================================================
      GLOBAL STATE
      ================================================================ */
   let chartsInitialised  = false;
   let analyticsInitialised = false;
   
   /* ================================================================
      1. INIT — DOM ready
      ================================================================ */
   document.addEventListener('DOMContentLoaded', () => {
     /* Lucide icons — must run first so SVGs exist before anything else */
     safeCreateIcons();
   
     initSidebar();
     initTopbar();
     initTheme();
     initCharts();
     injectTableData();
     injectReportScores();
     initModal();
     initSettings();
     initReportCard();
     initSearch();
     animateCounters();
   
     /* Wire sidebar nav clicks here (NOT via inline onclick) */
     initNavigation();
   });
   
   /* Safe wrapper — guards against Lucide not loaded yet */
   function safeCreateIcons() {
     if (typeof lucide !== 'undefined') {
       try { lucide.createIcons(); } catch(e) { /* ignore */ }
     }
   }
   
   /* ================================================================
      2. NAVIGATION — attach listeners in JS, not inline HTML
      ================================================================ */
   function initNavigation() {
     document.querySelectorAll('.nav-item[data-page]').forEach(item => {
       item.addEventListener('click', (e) => {
         e.preventDefault();
         const pageId = item.getAttribute('data-page');
         navigateTo(pageId, item);
       });
     });
   }
   
   function navigateTo(pageId, navEl) {
     /* Hide all pages */
     document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
   
     /* Show target */
     const target = document.getElementById('page-' + pageId);
     if (target) {
       target.classList.add('active');
     } else {
       /* Fallback: show dashboard if page not found */
       const fallback = document.getElementById('page-dashboard');
       if (fallback) fallback.classList.add('active');
     }
   
     /* Active nav state */
     document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
     if (navEl) navEl.classList.add('active');
   
     /* Breadcrumb */
     const labels = {
       dashboard:  'Dashboard',
       students:   'Students',
       results:    'Results',
       subjects:   'Subjects',
       teachers:   'Teachers',
       attendance: 'Attendance',
       analytics:  'Analytics',
       report:     'Report Card',
       messages:   'Messages',
       settings:   'Settings',
     };
     const bc = document.getElementById('bcCurrent');
     if (bc) bc.textContent = labels[pageId] || pageId;
   
     /* Close mobile sidebar */
     closeMobileSidebar();
   
     /* Lazy-draw analytics charts */
     if (pageId === 'analytics') {
       setTimeout(initAnalyticsCharts, 60);
     }
   
     /* Scroll page wrapper to top */
     const pw = document.querySelector('.page-wrapper');
     if (pw) pw.scrollTop = 0;
   
     /* Re-render Lucide icons for newly visible content */
     safeCreateIcons();
   }
   
   /* ================================================================
      3. SIDEBAR — Mobile toggle
      ================================================================ */
   function initSidebar() {
     const btn     = document.getElementById('hamburgerBtn');
     const sidebar = document.getElementById('sidebar');
     const overlay = document.getElementById('sidebarOverlay');
   
     btn?.addEventListener('click', () => {
       const isOpen = sidebar.classList.toggle('mobile-open');
       overlay.classList.toggle('active', isOpen);
     });
     overlay?.addEventListener('click', closeMobileSidebar);
   }
   
   function closeMobileSidebar() {
     document.getElementById('sidebar')?.classList.remove('mobile-open');
     document.getElementById('sidebarOverlay')?.classList.remove('active');
   }
   
   /* ================================================================
      4. TOPBAR — Admin dropdown
      ================================================================ */
   function initTopbar() {
     const profileBtn = document.getElementById('adminProfileBtn');
   
     profileBtn?.addEventListener('click', (e) => {
       e.stopPropagation();
       profileBtn.classList.toggle('open');
     });
   
     document.addEventListener('click', () => {
       profileBtn?.classList.remove('open');
     });
   }
   
   /* ================================================================
      5. THEME — Dark / Light
      ================================================================ */
   function initTheme() {
     const saved = localStorage.getItem('edutrack-theme') || 'light';
     applyTheme(saved);
   
     document.getElementById('themeToggle')?.addEventListener('click', () => {
       const current = document.documentElement.getAttribute('data-theme');
       applyTheme(current === 'dark' ? 'light' : 'dark');
     });
   }
   
   function applyTheme(theme) {
     document.documentElement.setAttribute('data-theme', theme);
     localStorage.setItem('edutrack-theme', theme);
   
     const moon = document.querySelector('.icon-moon');
     const sun  = document.querySelector('.icon-sun');
     if (moon) moon.style.display = theme === 'dark'  ? 'none' : '';
     if (sun)  sun.style.display  = theme === 'light' ? 'none' : '';
   
     setTimeout(updateChartsTheme, 50);
   }
   
   /* Called from Settings panel */
   function setTheme(theme, el) {
     document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
     el?.classList.add('active');
     applyTheme(theme);
   }
   
   /* ================================================================
      6. COUNTER ANIMATION
      ================================================================ */
   function animateCounters() {
     document.querySelectorAll('.stat-value[data-count]').forEach(el => {
       const target = parseInt(el.dataset.count);
       const suffix = el.textContent.replace(/[\d,]/g, '');
       let current  = 0;
       const step   = Math.ceil(target / 50);
       const timer  = setInterval(() => {
         current = Math.min(current + step, target);
         el.textContent = current.toLocaleString() + suffix;
         if (current >= target) clearInterval(timer);
       }, 28);
     });
   }
   
   /* ================================================================
      7. TABLE DATA
      ================================================================ */
   const STUDENTS = [
     { name: 'Amaka Okafor',    id: 'GHS/001', class: 'SS 2A',  subjects: 6, total: 468, avg: 78.0, grade: 'B', remark: 'Excellent',          status: 'pass' },
     { name: 'Ibrahim Musa',    id: 'GHS/002', class: 'SS 3A',  subjects: 6, total: 510, avg: 85.0, grade: 'A', remark: 'Outstanding',         status: 'pass' },
     { name: 'Chioma Eze',      id: 'GHS/003', class: 'JSS 2B', subjects: 8, total: 392, avg: 49.0, grade: 'F', remark: 'Needs Improvement',   status: 'fail' },
     { name: 'Emeka Nwosu',     id: 'GHS/004', class: 'SS 1A',  subjects: 7, total: 427, avg: 61.0, grade: 'C', remark: 'Average',             status: 'pass' },
     { name: 'Fatima Aliyu',    id: 'GHS/005', class: 'SS 2B',  subjects: 6, total: 495, avg: 82.5, grade: 'A', remark: 'Outstanding',         status: 'pass' },
     { name: 'Tunde Adeyemi',   id: 'GHS/006', class: 'JSS 3A', subjects: 8, total: 356, avg: 44.5, grade: 'F', remark: 'Needs Improvement',   status: 'fail' },
     { name: 'Grace Okoro',     id: 'GHS/007', class: 'SS 3B',  subjects: 6, total: 451, avg: 75.2, grade: 'B', remark: 'Good',                status: 'pass' },
     { name: 'Yusuf Bello',     id: 'GHS/008', class: 'SS 1B',  subjects: 7, total: 480, avg: 68.6, grade: 'B', remark: 'Good',                status: 'pass' },
   ];
   
   const AVATAR_COLORS = ['#3B82F6','#7C3AED','#22C55E','#F59E0B','#EF4444','#60A5FA','#EC4899','#14B8A6'];
   
   function gradeClass(grade) {
     return { A:'grade-a', B:'grade-b', C:'grade-c', F:'grade-f' }[grade] || 'grade-c';
   }
   
   function buildRow(s, idx) {
     const initials = s.name.split(' ').map(n => n[0]).join('').slice(0,2);
     const color    = AVATAR_COLORS[idx % AVATAR_COLORS.length];
     return `
       <tr>
         <td>
           <div class="student-cell">
             <div class="student-photo-placeholder" style="background:${color};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:white;flex-shrink:0;">${initials}</div>
             <div>
               <div class="student-name">${s.name}</div>
               <div class="student-id">${s.id}</div>
             </div>
           </div>
         </td>
         <td>${s.class}</td>
         <td>${s.subjects}</td>
         <td>${s.total}</td>
         <td>${s.avg.toFixed(1)}%</td>
         <td><span class="grade-badge ${gradeClass(s.grade)}">${s.grade}</span></td>
         <td>
           <span class="status-badge status-${s.status}">
             <span class="status-dot"></span>
             ${s.status === 'pass' ? 'Passed' : 'Failed'}
           </span>
         </td>
         <td>
           <div class="action-btns">
             <button class="action-btn view" title="View"   data-idx="${idx}"><i data-lucide="eye"></i></button>
             <button class="action-btn edit" title="Edit"   data-idx="${idx}"><i data-lucide="edit-3"></i></button>
             <button class="action-btn del"  title="Delete"              ><i data-lucide="trash-2"></i></button>
           </div>
         </td>
       </tr>`;
   }
   
   function injectTableData() {
     const rows = STUDENTS.map((s, i) => buildRow(s, i)).join('');
     const tb1  = document.getElementById('resultsTableBody');
     const tb2  = document.getElementById('fullResultsBody');
     if (tb1) tb1.innerHTML = rows;
     if (tb2) tb2.innerHTML = rows;
   
     /* Attach action button listeners after injection */
     document.querySelectorAll('.action-btn.view, .action-btn.edit').forEach(btn => {
       btn.addEventListener('click', () => openModal(parseInt(btn.dataset.idx)));
     });
     document.querySelectorAll('.action-btn.del').forEach(btn => {
       btn.addEventListener('click', () => deleteRow(btn));
     });
   
     safeCreateIcons();
   }
   
   function deleteRow(btn) {
     const row = btn.closest('tr');
     row.style.transition = 'opacity .3s, transform .3s';
     row.style.opacity    = '0';
     row.style.transform  = 'translateX(20px)';
     setTimeout(() => { row.remove(); showToast('Result deleted successfully'); }, 300);
   }
   
   /* ================================================================
      8. MODAL
      ================================================================ */
   function initModal() {
     document.getElementById('modalClose')?.addEventListener('click',  closeModal);
     document.getElementById('modalCancel')?.addEventListener('click', closeModal);
     document.getElementById('modalSave')?.addEventListener('click',   () => { closeModal(); showToast('Result saved successfully!'); });
     document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
       if (e.target === document.getElementById('modalBackdrop')) closeModal();
     });
   }
   
   function openModal(idx) {
     const s = STUDENTS[idx];
     if (!s) return;
     document.getElementById('modalStudentName').value = s.name;
     document.getElementById('modalClass').value       = s.class;
     document.getElementById('modalTotal').value       = s.total;
     document.getElementById('modalAvg').value         = s.avg.toFixed(1);
     document.getElementById('modalGrade').value       = s.grade;
     document.getElementById('modalRemark').value      = s.remark;
     document.getElementById('modalBackdrop').classList.add('open');
   }
   
   function closeModal() {
     document.getElementById('modalBackdrop')?.classList.remove('open');
   }
   
   /* ================================================================
      9. TOAST
      ================================================================ */
   function showToast(msg, duration = 3000) {
     const toast = document.getElementById('toast');
     const msgEl = document.getElementById('toastMsg');
     if (!toast || !msgEl) return;
     msgEl.textContent = msg;
     toast.classList.add('show');
     setTimeout(() => toast.classList.remove('show'), duration);
   }
   
   /* ================================================================
      10. SEARCH
      ================================================================ */
   function initSearch() {
     document.getElementById('tableSearch')?.addEventListener('input', (e) => {
       const q = e.target.value.toLowerCase();
       document.querySelectorAll('#resultsTableBody tr').forEach(row => {
         const name = row.querySelector('.student-name')?.textContent.toLowerCase() || '';
         row.style.display = name.includes(q) ? '' : 'none';
       });
     });
   }
   
   /* ================================================================
      11. CHARTS
      ================================================================ */
   const isDark    = () => document.documentElement.getAttribute('data-theme') === 'dark';
   const textColor = () => isDark() ? '#8B949E' : '#94A3B8';
   const gridColor = () => isDark() ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
   
   const chartRegistry = {};
   function reg(id, inst) {
     if (chartRegistry[id]) { try { chartRegistry[id].destroy(); } catch(e){} }
     chartRegistry[id] = inst;
   }
   
   function initCharts() {
     if (chartsInitialised) return;
     chartsInitialised = true;
     drawSparklines();
     drawPerformanceChart();
     drawGradeDonut();
   }
   
   /* Sparklines */
   function drawSparklines() {
     const datasets = [
       [30,35,32,40,38,42,48,45,50,55,52,58],
       [80,95,110,100,120,115,130,125,135,140,138,145],
       [65,68,70,67,71,72,74,70,73,75,72,78],
       [300,320,310,340,335,350,365,360,375,385,380,398],
       [95,90,88,85,92,89,86,90,87,85,84,84],
       [88,90,87,91,89,92,91,93,90,91,92,91],
     ];
     const colors = ['#3B82F6','#7C3AED','#22C55E','#22C55E','#EF4444','#F59E0B'];
   
     for (let i = 1; i <= 6; i++) {
       const canvas = document.getElementById(`sparkline${i}`);
       if (!canvas) continue;
       const color = colors[i - 1];
       reg(`sparkline${i}`, new Chart(canvas.getContext('2d'), {
         type: 'line',
         data: {
           labels: datasets[i-1].map(() => ''),
           datasets: [{ data: datasets[i-1], borderColor: color, borderWidth: 2, pointRadius: 0, fill: true,
             backgroundColor: (ctx) => {
               const g = ctx.chart.ctx.createLinearGradient(0,0,0,40);
               g.addColorStop(0, color + '44'); g.addColorStop(1, color + '00'); return g;
             }, tension: 0.4 }]
         },
         options: { responsive:false, animation:{duration:800}, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:{x:{display:false},y:{display:false}} }
       }));
     }
   }
   
   /* Performance bar chart */
   function drawPerformanceChart() {
     const canvas = document.getElementById('performanceChart');
     if (!canvas) return;
     reg('performance', new Chart(canvas.getContext('2d'), {
       type: 'bar',
       data: {
         labels: ['Mathematics','English','Physics','Chemistry','Biology','Economics','Agric','Civic'],
         datasets: [
           { label:'This Term', data:[68,74,62,59,71,78,65,73], backgroundColor:'#3B82F6CC', borderRadius:6, borderSkipped:false },
           { label:'Last Term', data:[62,70,58,55,68,74,61,70], backgroundColor:'#7C3AED66', borderRadius:6, borderSkipped:false },
         ]
       },
       options: {
         responsive:true, animation:{duration:900},
         plugins:{
           legend:{position:'top',labels:{color:textColor(),font:{family:'Inter',size:11},padding:16,boxWidth:10,borderRadius:4,useBorderRadius:true}},
           tooltip:{backgroundColor:isDark()?'#1E293B':'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8},
         },
         scales:{
           x:{grid:{display:false},ticks:{color:textColor(),font:{family:'Inter',size:11}},border:{color:gridColor()}},
           y:{grid:{color:gridColor()},ticks:{color:textColor(),font:{family:'Inter',size:11},callback:v=>v+'%'},border:{display:false},max:100,min:0}
         }
       }
     }));
   }
   
   /* Grade donut */
   function drawGradeDonut() {
     const canvas = document.getElementById('gradeChart');
     if (!canvas) return;
     reg('gradeDonut', new Chart(canvas.getContext('2d'), {
       type: 'doughnut',
       data: {
         labels: ['A (80–100)','B (65–79)','C (50–64)','F (0–49)'],
         datasets: [{ data:[22,31,29,18], backgroundColor:['#3B82F6','#22C55E','#F59E0B','#EF4444'], borderWidth:0, hoverOffset:8 }]
       },
       options: { cutout:'70%', responsive:true, animation:{animateRotate:true,duration:900},
         plugins:{legend:{display:false},tooltip:{backgroundColor:isDark()?'#1E293B':'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}}
       }
     }));
   }
   
   /* Analytics charts (lazy) */
   function initAnalyticsCharts() {
     if (analyticsInitialised) return;
     analyticsInitialised = true;
   
     /* Trend chart */
     const t = document.getElementById('trendChart');
     if (t) reg('trend', new Chart(t.getContext('2d'), {
       type:'line',
       data:{
         labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8','Wk9','Wk10'],
         datasets:[
           {label:'1st Term',data:[62,64,63,65,67,66,68,70,69,72],borderColor:'#3B82F6',backgroundColor:'#3B82F618',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#3B82F6'},
           {label:'2nd Term',data:[68,70,72,71,74,73,76,75,78,80],borderColor:'#7C3AED',backgroundColor:'#7C3AED18',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#7C3AED'},
           {label:'3rd Term',data:[72,74,75,77,76,78,79,81,80,83],borderColor:'#22C55E',backgroundColor:'#22C55E18',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#22C55E'},
         ]
       },
       options:{
         responsive:true,
         plugins:{
           legend:{position:'top',labels:{color:textColor(),font:{family:'Inter',size:11},padding:16,boxWidth:10}},
           tooltip:{mode:'index',intersect:false,backgroundColor:isDark()?'#1E293B':'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8},
         },
         scales:{
           x:{grid:{color:gridColor()},ticks:{color:textColor(),font:{family:'Inter',size:11}},border:{display:false}},
           y:{grid:{color:gridColor()},ticks:{color:textColor(),font:{family:'Inter',size:11},callback:v=>v+'%'},border:{display:false},min:55,max:90}
         }
       }
     }));
   
     /* Subject bar */
     const s = document.getElementById('subjectChart');
     if (s) reg('subject', new Chart(s.getContext('2d'), {
       type:'bar',
       data:{
         labels:['Math','English','Physics','Chemistry','Biology','Econ'],
         datasets:[{label:'Avg Score (%)',data:[68,74,62,59,71,78],
           backgroundColor:['#3B82F6','#22C55E','#F59E0B','#7C3AED','#EF4444','#60A5FA'].map(c=>c+'CC'),
           borderRadius:6,borderSkipped:false}]
       },
       options:{
         indexAxis:'y',responsive:true,
         plugins:{legend:{display:false},tooltip:{backgroundColor:isDark()?'#1E293B':'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}},
         scales:{
           x:{grid:{color:gridColor()},ticks:{color:textColor(),font:{family:'Inter',size:11},callback:v=>v+'%'},border:{display:false},max:100},
           y:{grid:{display:false},ticks:{color:textColor(),font:{family:'Inter',size:11}},border:{display:false}}
         }
       }
     }));
   
     /* Attendance bar */
     const a = document.getElementById('attendanceChart');
     if (a) reg('attendance', new Chart(a.getContext('2d'), {
       type:'bar',
       data:{
         labels:['SS 1A','SS 1B','SS 2A','SS 2B','SS 3A','SS 3B','JSS 1','JSS 2','JSS 3'],
         datasets:[{label:'Attendance %',data:[93,88,95,82,91,79,94,87,85],
           backgroundColor:(ctx)=>{const v=ctx.raw;return v>=90?'#22C55ECC':v>=80?'#F59E0BCC':'#EF4444CC';},
           borderRadius:6,borderSkipped:false}]
       },
       options:{
         responsive:true,
         plugins:{legend:{display:false},tooltip:{backgroundColor:isDark()?'#1E293B':'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}},
         scales:{
           x:{grid:{display:false},ticks:{color:textColor(),font:{family:'Inter',size:10}},border:{display:false}},
           y:{grid:{color:gridColor()},ticks:{color:textColor(),font:{family:'Inter',size:11},callback:v=>v+'%'},border:{display:false},min:70,max:100}
         }
       }
     }));
   
     /* Grade bar */
     const g = document.getElementById('gradeBarChart');
     if (g) reg('gradebar', new Chart(g.getContext('2d'), {
       type:'bar',
       data:{
         labels:['A (80–100)','B (65–79)','C (50–64)','D (45–49)','F (0–44)'],
         datasets:[{label:'Students',data:[108,153,143,40,38],
           backgroundColor:['#22C55E','#3B82F6','#F59E0B','#7C3AED','#EF4444'].map(c=>c+'CC'),
           borderRadius:8,borderSkipped:false}]
       },
       options:{
         responsive:true,
         plugins:{legend:{display:false},tooltip:{backgroundColor:isDark()?'#1E293B':'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}},
         scales:{
           x:{grid:{display:false},ticks:{color:textColor(),font:{family:'Inter',size:11}},border:{display:false}},
           y:{grid:{color:gridColor()},ticks:{color:textColor(),font:{family:'Inter',size:11}},border:{display:false}}
         }
       }
     }));
   
     safeCreateIcons();
   }
   
   function updateChartsTheme() {
     Object.values(chartRegistry).forEach(c => { try { c.update(); } catch(e){} });
   }
   
   /* ================================================================
      12. REPORT CARD
      ================================================================ */
   const REPORT_SUBJECTS = ['Mathematics','English Language','Physics','Chemistry','Biology','Economics','Civic Education','Agricultural Science'];
   
   function calcGrade(total) {
     if (total >= 80) return 'A';
     if (total >= 65) return 'B';
     if (total >= 50) return 'C';
     if (total >= 45) return 'D';
     return 'F';
   }
   
   function injectReportScores() {
     const tbody = document.getElementById('scoresBody');
     if (!tbody) return;
     tbody.innerHTML = REPORT_SUBJECTS.map((subj, i) => `
       <tr>
         <td>${subj}</td>
         <td><input type="number" min="0" max="30" placeholder="0" class="ca-input" data-row="${i}" /></td>
         <td><input type="number" min="0" max="70" placeholder="0" class="ex-input" data-row="${i}" /></td>
         <td class="total-cell" id="rt-${i}">—</td>
         <td class="grade-cell" id="rg-${i}">—</td>
       </tr>`).join('');
   
     /* Listen for input changes */
     tbody.addEventListener('input', recalcScores);
   }
   
   function recalcScores() {
     const rows = document.querySelectorAll('#scoresBody tr');
     let grandTotal = 0, count = 0;
     rows.forEach((row, i) => {
       const ca  = parseFloat(row.querySelector('.ca-input')?.value) || 0;
       const ex  = parseFloat(row.querySelector('.ex-input')?.value) || 0;
       const tot = ca + ex;
       const grd = calcGrade(tot);
       const tc  = document.getElementById(`rt-${i}`);
       const gc  = document.getElementById(`rg-${i}`);
       if (tc) tc.textContent = (ca || ex) ? tot : '—';
       if (gc) gc.innerHTML   = (ca || ex) ? `<span class="grade-badge ${gradeClass(grd)}">${grd}</span>` : '—';
       if (ca || ex) { grandTotal += tot; count++; }
     });
     const avg = count ? (grandTotal / count).toFixed(1) : '0.0';
     const grd = count ? calcGrade(parseFloat(avg)) : '—';
     const ts  = document.getElementById('totalScore');
     const as  = document.getElementById('avgScore');
     const og  = document.getElementById('overallGrade');
     if (ts) ts.textContent = grandTotal || '—';
     if (as) as.textContent = count ? avg + '%' : '—';
     if (og) og.textContent = grd;
   }
   
   function gradeClass(grade) {
     return { A:'grade-a', B:'grade-b', C:'grade-c', F:'grade-f' }[grade] || 'grade-c';
   }
   
   function initReportCard() {
     /* Term tabs */
     document.querySelectorAll('.term-tab').forEach(tab => {
       tab.addEventListener('click', () => {
         document.querySelectorAll('.term-tab').forEach(t => t.classList.remove('active'));
         tab.classList.add('active');
         showToast(`Switched to ${tab.textContent} scores.`);
       });
     });
   
     /* Logo upload */
     const area  = document.getElementById('logoUploadArea');
     const input = document.getElementById('logoUpload');
     area?.addEventListener('click', () => input?.click());
     input?.addEventListener('change', () => {
       if (input.files[0]) showToast('Logo uploaded successfully!');
     });
   }
   
   /* ================================================================
      13. SETTINGS
      ================================================================ */
   function initSettings() {
     /* Settings tabs */
     document.querySelectorAll('.set-tab').forEach(tab => {
       tab.addEventListener('click', () => {
         const target = tab.dataset.set;
         document.querySelectorAll('.set-tab').forEach(t => t.classList.remove('active'));
         tab.classList.add('active');
         document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
         const panel = document.getElementById('set-' + target);
         if (panel) panel.classList.add('active');
       });
     });
   
     /* Color swatches */
     document.querySelectorAll('.swatch').forEach(sw => {
       sw.addEventListener('click', () => {
         document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
         sw.classList.add('active');
         document.documentElement.style.setProperty('--primary', sw.dataset.color);
         showToast('Accent color updated!');
       });
     });
   }
   
   /* ================================================================
      14. KEYBOARD SHORTCUTS
      ================================================================ */
   document.addEventListener('keydown', (e) => {
     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
       e.preventDefault();
       document.getElementById('globalSearch')?.focus();
     }
     if (e.key === 'Escape') {
       closeModal();
       document.getElementById('adminProfileBtn')?.classList.remove('open');
       document.getElementById('globalSearch')?.blur();
     }
   });
   
   /* ================================================================
      15. DATA-PAGE-LINK BUTTONS (e.g. "View All Results" buttons)
      ================================================================ */
   document.addEventListener('DOMContentLoaded', () => {
     document.querySelectorAll('[data-page-link]').forEach(btn => {
       btn.addEventListener('click', (e) => {
         e.preventDefault();
         const pageId = btn.getAttribute('data-page-link');
         const navEl  = document.querySelector(`.nav-item[data-page="${pageId}"]`);
         navigateTo(pageId, navEl);
       });
     });
   });

 

   
 

