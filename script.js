// Allergen Mapping Dictionary
const ALLERGEN_MAP = {
  "1": "난류 (🥚)",
  "2": "우유 (🥛)",
  "3": "메밀 (🌾)",
  "4": "땅콩 (🥜)",
  "5": "대두 (🫘)",
  "6": "밀 (🌾)",
  "7": "고등어 (🐟)",
  "8": "게 (🦀)",
  "9": "새우 (🍤)",
  "10": "돼지고기 (🐷)",
  "11": "복숭아 (🍑)",
  "12": "토마토 (🍅)",
  "13": "아황산류 (🍷)",
  "14": "호두 (🌰)",
  "15": "닭고기 (🐔)",
  "16": "쇠고기 (🐮)",
  "17": "오징어 (🦑)",
  "18": "조개류-굴,전복,홍합 등 (🐚)",
  "19": "잣 (🌲)"
};

// Meal Emoji Mapping
const MEAL_EMOJIS = {
  "조식": "🍳",
  "중식": "☀️",
  "석식": "🌙"
};

// State Variables
let currentDate = new Date();
// Wait! Let's check if the date 2026-05-18 is a good default so the user sees results right away. 
// However, starting with the actual today's date (which is 2026-05-17) is standard. 
// Let's set the initial date based on the current local date, which is 2026-05-17.
let showAllergens = true;

// DOM Elements
const datePickerInput = document.getElementById('date-picker-input');
const currentDateText = document.getElementById('current-date-text');
const dayBadge = document.getElementById('day-badge');
const prevDayBtn = document.getElementById('prev-day-btn');
const todayBtn = document.getElementById('today-btn');
const nextDayBtn = document.getElementById('next-day-btn');
const allergenToggleCheckbox = document.getElementById('allergen-toggle-checkbox');
const allergenInfoTrigger = document.getElementById('allergen-info-trigger');
const allergenModal = document.getElementById('allergen-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const mealDisplayArea = document.getElementById('meal-display-area');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Theme Setup
  initTheme();
  
  // Set initial date picker value
  updateDateUI();
  
  // Set event listeners
  prevDayBtn.addEventListener('click', navigatePrevDay);
  todayBtn.addEventListener('click', navigateToday);
  nextDayBtn.addEventListener('click', navigateNextDay);
  datePickerInput.addEventListener('change', handleDatePickerChange);
  
  allergenToggleCheckbox.addEventListener('change', handleAllergenToggle);
  allergenInfoTrigger.addEventListener('click', openAllergenModal);
  modalCloseBtn.addEventListener('click', closeAllergenModal);
  allergenModal.addEventListener('click', (e) => {
    if (e.target === allergenModal) closeAllergenModal();
  });
  
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Fetch initial meals
  fetchMealData();
  
  // Build allergen modal grid
  buildAllergenModalGrid();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeToggleIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
  themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  themeToggleBtn.setAttribute('title', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
}

// Date Management Utilities
function formatDateToYYYYMMDD(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function formatDateToDatePickerString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getKoreanDayOfWeek(date) {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[date.getDay()];
}

function updateDateUI() {
  // Update Date Display Text
  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
  const dd = String(currentDate.getDate()).padStart(2, '0');
  const dayName = getKoreanDayOfWeek(currentDate);
  
  currentDateText.textContent = `${yyyy}년 ${mm}월 ${dd}일`;
  dayBadge.textContent = dayName;
  
  // Dynamic color for Sunday / Saturday
  dayBadge.className = 'day-badge';
  const day = currentDate.getDay();
  if (day === 0 || day === 6) {
    dayBadge.classList.add('weekend');
  }
  
  // Sync Date Input Value
  datePickerInput.value = formatDateToDatePickerString(currentDate);
}

function navigatePrevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateUI();
  fetchMealData();
}

function navigateNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDateUI();
  fetchMealData();
}

function navigateToday() {
  currentDate = new Date();
  updateDateUI();
  fetchMealData();
}

function handleDatePickerChange(e) {
  if (e.target.value) {
    currentDate = new Date(e.target.value);
    updateDateUI();
    fetchMealData();
  }
}

// Allergen Logic
function handleAllergenToggle(e) {
  showAllergens = e.target.checked;
  const cards = document.querySelectorAll('.meal-card');
  cards.forEach(card => {
    if (showAllergens) {
      card.classList.remove('allergen-hidden');
    } else {
      card.classList.add('allergen-hidden');
    }
  });
}

function buildAllergenModalGrid() {
  const grid = document.getElementById('allergen-grid');
  grid.innerHTML = '';
  
  Object.entries(ALLERGEN_MAP).forEach(([key, val]) => {
    const item = document.createElement('div');
    item.className = 'allergen-badge-item';
    item.innerHTML = `
      <span class="allergen-number">${key}</span>
      <span class="allergen-name">${val}</span>
    `;
    grid.appendChild(item);
  });
}

function openAllergenModal() {
  allergenModal.classList.add('active');
}

function closeAllergenModal() {
  allergenModal.classList.remove('active');
}

// Parse Allergen Numbers into Tooltip
function parseAllergenTooltip(allergenStr) {
  if (!allergenStr) return '';
  // allergenStr will be like "5.6.13.16"
  const numbers = allergenStr.split('.');
  const names = numbers.map(num => ALLERGEN_MAP[num.trim()] || num).join(', ');
  return `알레르기 유발 물질: ${names}`;
}

// Parse Dish and separate Allergens
function parseDishInfo(dishText) {
  // Regex to extract parentheses with numbers separated by dots: e.g. (5.6.13.16)
  const regex = /\(([0-9.]+)\)/;
  const match = dishText.match(regex);
  
  if (match) {
    const allergenCodes = match[1];
    const cleanDishName = dishText.replace(regex, '').trim();
    const tooltip = parseAllergenTooltip(allergenCodes);
    
    return {
      name: cleanDishName,
      allergen: allergenCodes,
      tooltip: tooltip
    };
  }
  
  return {
    name: dishText.trim(),
    allergen: '',
    tooltip: ''
  };
}

// Parse Nutritional Information
function parseNutrients(nutStr) {
  if (!nutStr) return { macro: [], extra: '' };
  
  // Split nutrition data by <br/>
  const items = nutStr.split(/<br\s*\/?>/i);
  
  const parsed = [];
  const macros = {
    '탄수화물': { icon: '🍞', order: 1 },
    '단백질': { icon: '🥩', order: 2 },
    '지방': { icon: '🥑', order: 3 }
  };
  
  let macroList = [];
  let extraList = [];
  
  items.forEach(item => {
    // E.g. "탄수화물(g) : 104.9" or "에너지(kcal) : 650"
    const parts = item.split(':');
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const val = parts[1].trim();
      
      // Check if it's macro (Carb, Protein, Fat)
      const cleanLabel = label.split('(')[0].trim(); // "탄수화물"
      const unit = label.includes('(') ? label.substring(label.indexOf('(')) : ''; // "(g)"
      
      if (macros[cleanLabel]) {
        macroList.push({
          name: cleanLabel,
          icon: macros[cleanLabel].icon,
          value: val + unit,
          order: macros[cleanLabel].order
        });
      } else {
        extraList.push(`${cleanLabel}: ${val}${unit}`);
      }
    }
  });
  
  // Sort macros (Carb -> Protein -> Fat)
  macroList.sort((a, b) => a.order - b.order);
  
  return {
    macro: macroList,
    extra: extraList.join('  •  ')
  };
}

// Parse Country of Origins
function parseOrigins(originStr) {
  if (!originStr) return '등록된 원산지 정보가 없습니다.';
  // Split and clean origins
  const items = originStr.split(/<br\s*\/?>/i);
  const cleanedItems = items
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => `<li>${item}</li>`);
  
  return `<ul style="list-style-position: inside; padding-left: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">${cleanedItems.join('')}</ul>`;
}

// Render Loading Skeleton UI
function renderSkeletons() {
  mealDisplayArea.innerHTML = `
    <div class="meal-card skeleton-card">
      <div class="skeleton-element skeleton-title"></div>
      <div class="skeleton-element skeleton-badge"></div>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <div class="skeleton-element skeleton-line"></div>
        <div class="skeleton-element skeleton-line"></div>
        <div class="skeleton-element skeleton-line"></div>
      </div>
    </div>
    <div class="meal-card skeleton-card">
      <div class="skeleton-element skeleton-title"></div>
      <div class="skeleton-element skeleton-badge"></div>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <div class="skeleton-element skeleton-line"></div>
        <div class="skeleton-element skeleton-line"></div>
        <div class="skeleton-element skeleton-line"></div>
      </div>
    </div>
  `;
}

// Fetch Meal Data from NEIS API
async function fetchMealData() {
  renderSkeletons();
  
  const yyyymmdd = formatDateToYYYYMMDD(currentDate);
  const officeCode = 'J10'; // Gyeonggi Provincial Office of Education
  const schoolCode = '7030820'; // Buheung High School
  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${yyyymmdd}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    parseAndRenderMealXML(text);
  } catch (error) {
    console.error('Fetch error:', error);
    renderErrorState('네트워크 오류가 발생했습니다.<br/>인터넷 연결을 확인하고 다시 시도해주세요.');
  }
}

// Parse XML Response and Render DOM
function parseAndRenderMealXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check if result returned error/empty code
  const resultTag = xmlDoc.getElementsByTagName('RESULT')[0];
  if (resultTag) {
    const code = resultTag.getElementsByTagName('CODE')[0]?.textContent;
    const message = resultTag.getElementsByTagName('MESSAGE')[0]?.textContent;
    
    // INFO-200 represents "No matching data found" (E.g. weekend or holiday)
    if (code === 'INFO-200') {
      renderEmptyState();
      return;
    } else if (code && code !== 'INFO-000') {
      renderErrorState(`API 오류가 발생했습니다. (${code})<br/>${message}`);
      return;
    }
  }
  
  // Extract Meal rows
  const rows = xmlDoc.getElementsByTagName('row');
  if (rows.length === 0) {
    renderEmptyState();
    return;
  }
  
  mealDisplayArea.innerHTML = '';
  
  // Iterate and build meal cards
  Array.from(rows).forEach((row, idx) => {
    const mealName = row.getElementsByTagName('MMEAL_SC_NM')[0]?.textContent || '급식';
    const dishText = row.getElementsByTagName('DDISH_NM')[0]?.textContent || '';
    const calories = row.getElementsByTagName('CAL_INFO')[0]?.textContent || '정보 없음';
    const nutrientsStr = row.getElementsByTagName('NTR_INFO')[0]?.textContent || '';
    const originStr = row.getElementsByTagName('ORPLC_INFO')[0]?.textContent || '';
    
    const emoji = MEAL_EMOJIS[mealName] || '🍽️';
    
    // Split and parse dishes
    const rawDishes = dishText.split(/<br\s*\/?>/i);
    const parsedDishes = rawDishes
      .map(dish => dish.trim())
      .filter(dish => dish.length > 0)
      .map(dish => parseDishInfo(dish));
    
    // Create card element
    const card = document.createElement('div');
    card.className = `meal-card ${showAllergens ? '' : 'allergen-hidden'}`;
    card.style.animationDelay = `${idx * 0.1}s`;
    
    // Dish list HTML
    const dishListHtml = parsedDishes.map(dish => {
      const allergenSpan = dish.allergen 
        ? `<span class="allergen-indicator" title="${dish.tooltip}">${dish.allergen}</span>`
        : '';
      return `
        <li class="dish-item">
          <span>${dish.name}</span>
          ${allergenSpan}
        </li>
      `;
    }).join('');
    
    // Parse Nutrients and Origins
    const parsedNtr = parseNutrients(nutrientsStr);
    
    // Nutrients Macro Grid HTML
    const macroHtml = parsedNtr.macro.map(m => `
      <div class="nutrient-card">
        <div class="nutrient-title">${m.icon} ${m.name}</div>
        <div class="nutrient-value">${m.value}</div>
      </div>
    `).join('');
    
    // Render Complete Card
    card.innerHTML = `
      <div class="meal-header">
        <div class="meal-title-group">
          <span class="meal-icon">${emoji}</span>
          <span class="meal-name">${mealName}</span>
        </div>
        <span class="calorie-badge">${calories}</span>
      </div>
      
      <ul class="meal-menu">
        ${dishListHtml}
      </ul>
      
      <!-- Nutrients Drawer -->
      <div class="drawer-section">
        <button class="drawer-trigger" onclick="toggleCardDrawer(this, 'nutrients-drawer-${idx}')">
          <span>📊 영양 성분 정보</span>
          <span class="drawer-trigger-icon">▼</span>
        </button>
        <div id="nutrients-drawer-${idx}" class="drawer-content">
          <div class="nutrients-grid">
            ${macroHtml}
          </div>
          ${parsedNtr.extra ? `<div class="nutrient-full-list"><strong>기타 영양소:</strong><br/>${parsedNtr.extra}</div>` : ''}
        </div>
      </div>
      
      <!-- Origin Drawer -->
      <div class="drawer-section">
        <button class="drawer-trigger" onclick="toggleCardDrawer(this, 'origin-drawer-${idx}')">
          <span>🌾 식재료 원산지 정보</span>
          <span class="drawer-trigger-icon">▼</span>
        </button>
        <div id="origin-drawer-${idx}" class="drawer-content">
          <div class="origin-list">
            ${parseOrigins(originStr)}
          </div>
        </div>
      </div>
    `;
    
    mealDisplayArea.appendChild(card);
  });
}

// Global Drawer Trigger Handler
window.toggleCardDrawer = function(btnElement, drawerId) {
  const drawer = document.getElementById(drawerId);
  const isActive = drawer.classList.contains('active');
  
  if (isActive) {
    drawer.classList.remove('active');
    btnElement.classList.remove('active');
  } else {
    drawer.classList.add('active');
    btnElement.classList.add('active');
  }
};

// Render Empty State UI
function renderEmptyState() {
  mealDisplayArea.innerHTML = `
    <div class="empty-state-card">
      <span class="empty-state-icon">🍱</span>
      <h2 class="empty-state-title">급식 정보가 없습니다</h2>
      <p class="empty-state-desc">주말, 공휴일 또는 재량 휴업일과 같이 급식이 제공되지 않는 날입니다.</p>
    </div>
  `;
}

// Render Error State UI
function renderErrorState(errorMessage) {
  mealDisplayArea.innerHTML = `
    <div class="empty-state-card" style="border-color: #fca5a5;">
      <span class="empty-state-icon" style="animation: none;">⚠️</span>
      <h2 class="empty-state-title" style="color: #ef4444;">오류 발생</h2>
      <p class="empty-state-desc">${errorMessage}</p>
      <button onclick="fetchMealData()" class="nav-btn today-btn" style="margin-top: 0.5rem;">
        🔄 다시 시도하기
      </button>
    </div>
  `;
}
