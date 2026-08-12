/**
 * GR All-in-One Calculation Toolkit
 * Main Application Logic
 * Phase 1
 */

const GRApp = {
    currentCategory: 'dashboard',
    currentCalculator: null,
    favorites: new Set(),
    history: [],
    settings: { ...CalcEngine.settings },
    scientificMode: 'deg',
    scientificExpr: '',
    scientificResult: '0',

    init() {
        this.loadStorage();
        this.setupEventListeners();
        this.applyTheme();
        this.renderDashboard();
        this.updateStats();
    },

    loadStorage() {
        try {
            const fav = localStorage.getItem('gr_favorites');
            if (fav) this.favorites = new Set(JSON.parse(fav));
            
            const hist = localStorage.getItem('gr_history');
            if (hist) this.history = JSON.parse(hist);
            
            const sett = localStorage.getItem('gr_settings');
            if (sett) {
                this.settings = { ...this.settings, ...JSON.parse(sett) };
                CalcEngine.settings = { ...CalcEngine.settings, ...this.settings };
            }
        } catch (e) {
            console.error('Storage load error:', e);
        }
    },

    saveStorage() {
        try {
            localStorage.setItem('gr_favorites', JSON.stringify([...this.favorites]));
            localStorage.setItem('gr_history', JSON.stringify(this.history.slice(0, 100)));
            localStorage.setItem('gr_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Storage save error:', e);
        }
    },

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = link.dataset.category;
                this.navigateTo(cat);
                
                // Mobile: close sidebar
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('sidebarOverlay').classList.remove('active');
            });
        });

        // Mobile menu
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarOverlay').classList.toggle('active');
        });

        document.getElementById('sidebarOverlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('active');
        });

        // Theme toggles
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('themeToggleMobile').addEventListener('click', () => this.toggleTheme());

        // Global search
        const searchInput = document.getElementById('globalSearch');
        const searchResults = document.getElementById('searchResults');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }
            this.performSearch(query);
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => searchResults.classList.remove('active'), 200);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) {
                searchResults.classList.add('active');
            }
        });

        // Sidebar search
        document.getElementById('sidebarSearch').addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            this.filterSidebar(query);
        });

        // Top action buttons
        document.getElementById('btnHistory').addEventListener('click', () => this.navigateTo('history'));
        document.getElementById('btnFavorites').addEventListener('click', () => this.navigateTo('favorites'));
        document.getElementById('btnSettings').addEventListener('click', () => this.navigateTo('settings'));
    },

    navigateTo(category, calculatorId = null) {
        this.currentCategory = category;
        this.currentCalculator = calculatorId;
        
        // Update sidebar active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.category === category);
        });

        const content = document.getElementById('contentArea');
        content.innerHTML = '';

        switch(category) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'settings':
                this.renderSettings();
                break;
            case 'about':
                this.renderAbout();
                break;
            case 'formula-library':
                this.renderFormulaLibrary();
                break;
            case 'scientific':
                if (calculatorId === 'scientific-calculator') {
                    this.renderScientificCalculator();
                } else {
                    this.renderCategoryGrid('scientific');
                }
                break;
            case 'unit-converter':
                this.renderUnitConverter();
                break;
            default:
                if (calculatorId) {
                    this.renderCalculator(calculatorId);
                } else {
                    this.renderCategoryGrid(category);
                }
        }
        
        window.scrollTo(0, 0);
    },

    // ==================== RENDERERS ====================

    renderDashboard() {
        const content = document.getElementById('contentArea');
        const totalCalcs = CalculatorData.calculators.length;
        const sciCount = CalculatorData.calculators.filter(c => ['scientific', 'mathematics'].includes(c.category)).length;
        const engCount = CalculatorData.calculators.filter(c => ['civil', 'structural'].includes(c.category)).length;
        const labCount = CalculatorData.calculators.filter(c => ['chemistry', 'laboratory'].includes(c.category)).length;

        content.innerHTML = `
            <div class="dashboard-header">
                <h2>Dashboard</h2>
                <p>Welcome to GR All-in-One Calculation Toolkit</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalCalcs}</div>
                    <div class="stat-label">Total Calculators</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${sciCount}</div>
                    <div class="stat-label">Scientific & Math</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${engCount}</div>
                    <div class="stat-label">Engineering</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${labCount}</div>
                    <div class="stat-label">Laboratory</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.favorites.size}</div>
                    <div class="stat-label">Favorites</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.history.length}</div>
                    <div class="stat-label">Recent Calculations</div>
                </div>
            </div>

            <h3 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Quick Calculators
            </h3>
            <div class="quick-calc-grid">
                ${this.renderCalcCard('percentage', 'Percentage', 'Calculate percentages, ratios, and proportions', '%')}
                ${this.renderCalcCard('area-geometry', 'Area', 'Calculate area of square, rectangle, circle, triangle', '▢')}
                ${this.renderCalcCard('volume-geometry', 'Volume', 'Calculate volume of cube, sphere, cylinder', '▣')}
                ${this.renderCalcCard('concrete-volume', 'Concrete', 'Estimate concrete, cement, sand, aggregate', '🏗')}
                ${this.renderCalcCard('stress-strain', 'Stress', 'Calculate stress, strain, and modulus', 'σ')}
                ${this.renderCalcCard('molarity', 'Molarity', 'Calculate molarity and solution concentration', '⚗')}
                ${this.renderCalcCard('emi', 'EMI', 'Calculate loan EMI and amortization', '₹')}
                ${this.renderCalcCard('time-difference', 'Time Diff', 'Calculate time difference and duration', '⏱')}
                ${this.renderCalcCard('unit-converter', 'Converter', 'Convert between units of measurement', '⇄')}
                ${this.renderCalcCard('bmi', 'BMI', 'Calculate Body Mass Index', '⚖')}
                ${this.renderCalcCard('discount', 'Discount', 'Calculate discount and final price', '💰')}
                ${this.renderCalcCard('descriptive-stats', 'Statistics', 'Mean, median, mode, standard deviation', '📊')}
            </div>

            <h3 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Recent Calculations
            </h3>
            <div class="recent-list">
                ${this.history.length === 0 ? `
                    <div class="empty-state">
                        <p>No recent calculations yet.</p>
                    </div>
                ` : this.history.slice(0, 5).map(h => `
                    <div class="recent-item" onclick="GRApp.navigateTo('${h.category}', '${h.calculatorId}')">
                        <div class="recent-info">
                            <span class="recent-name">${h.calculatorName}</span>
                            <span class="recent-meta">${new Date(h.date).toLocaleString()}</span>
                        </div>
                        <span class="recent-result">${h.result}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderCalcCard(id, name, desc, icon) {
        const isFav = this.favorites.has(id);
        const calc = CalculatorData.calculators.find(c => c.id === id);
        const category = calc ? calc.category : 'general';
        
        return `
            <div class="calc-card" onclick="GRApp.navigateTo('${category}', '${id}')">
                <div class="calc-card-header">
                    <div class="calc-card-icon">${icon}</div>
                    <button class="calc-card-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); GRApp.toggleFavorite('${id}')" title="Add to favorites">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                </div>
                <h3>${name}</h3>
                <p>${desc}</p>
            </div>
        `;
    },

    renderCategoryGrid(category) {
        const content = document.getElementById('contentArea');
        const catInfo = CalculatorData.categories.find(c => c.id === category);
        const calcs = CalculatorData.calculators.filter(c => c.category === category);
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h2>${catInfo ? catInfo.name : category}</h2>
                <p>${calcs.length} calculator${calcs.length !== 1 ? 's' : ''} available</p>
            </div>
            <div class="quick-calc-grid">
                ${calcs.map(c => this.renderCalcCard(c.id, c.name, c.keywords.slice(0, 3).join(', '), this.getCategoryIcon(category))).join('')}
            </div>
        `;
    },

    renderCalculator(id) {
        const calc = CalculatorData.calculators.find(c => c.id === id);
        if (!calc) return;
        
        this.currentCalculator = id;
        const content = document.getElementById('contentArea');
        const isFav = this.favorites.has(id);
        
        let calcHTML = '';
        
        switch(id) {
            case 'percentage': calcHTML = this.buildPercentageCalc(); break;
            case 'ratio-proportion': calcHTML = this.buildRatioCalc(); break;
            case 'area-geometry': calcHTML = this.buildAreaCalc(); break;
            case 'volume-geometry': calcHTML = this.buildVolumeCalc(); break;
            case 'coordinate-geometry': calcHTML = this.buildCoordinateCalc(); break;
            case 'quadratic': calcHTML = this.buildQuadraticCalc(); break;
            case 'average': calcHTML = this.buildAverageCalc(); break;
            case 'discount': calcHTML = this.buildDiscountCalc(); break;
            case 'profit-loss': calcHTML = this.buildProfitLossCalc(); break;
            case 'gst': calcHTML = this.buildGstCalc(); break;
            case 'number-converter': calcHTML = this.buildNumberConverterCalc(); break;
            case 'concrete-volume': calcHTML = this.buildConcreteCalc(); break;
            case 'brickwork': calcHTML = this.buildBrickworkCalc(); break;
            case 'steel-weight': calcHTML = this.buildSteelWeightCalc(); break;
            case 'stress-strain': calcHTML = this.buildStressStrainCalc(); break;
            case 'youngs-modulus': calcHTML = this.buildYoungsModulusCalc(); break;
            case 'molarity': calcHTML = this.buildMolarityCalc(); break;
            case 'dilution': calcHTML = this.buildDilutionCalc(); break;
            case 'ph-calculator': calcHTML = this.buildPhCalc(); break;
            case 'rsd': calcHTML = this.buildRsdCalc(); break;
            case 'recovery': calcHTML = this.buildRecoveryCalc(); break;
            case 'emi': calcHTML = this.buildEmiCalc(); break;
            case 'simple-interest': calcHTML = this.buildSimpleInterestCalc(); break;
            case 'compound-interest': calcHTML = this.buildCompoundInterestCalc(); break;
            case 'time-difference': calcHTML = this.buildTimeDiffCalc(); break;
            case 'date-difference': calcHTML = this.buildDateDiffCalc(); break;
            case 'age-calculator': calcHTML = this.buildAgeCalc(); break;
            case 'descriptive-stats': calcHTML = this.buildStatsCalc(); break;
            case 'bmi': calcHTML = this.buildBmiCalc(); break;
            case 'bmr': calcHTML = this.buildBmrCalc(); break;
            default: calcHTML = this.buildGenericCalc(calc);
        }

        content.innerHTML = `
            <div class="calculator-view">
                <div class="calc-header">
                    <div class="calc-header-info">
                        <h2>${calc.name}</h2>
                        <span class="calc-category">${CalculatorData.categories.find(c => c.id === calc.category)?.name || calc.category}</span>
                    </div>
                    <div class="calc-header-actions">
                        <button class="btn-favorite ${isFav ? 'active' : ''}" onclick="GRApp.toggleFavorite('${id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            ${isFav ? 'Favorited' : 'Favorite'}
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="GRApp.printCalculator()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Print
                        </button>
                    </div>
                </div>
                ${calcHTML}
            </div>
        `;
    },

    // ==================== CALCULATOR BUILDERS ====================

    buildPercentageCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Input</div>
                    
                    <div class="input-group">
                        <label>What is</label>
                        <div class="input-wrapper">
                            <input type="number" id="pctValue1" placeholder="Enter value" step="any">
                            <span style="padding: 0.625rem; color: var(--text-secondary); font-weight: 600;">%</span>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label>Of</label>
                        <div class="input-wrapper">
                            <input type="number" id="pctValue2" placeholder="Enter total value" step="any">
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculatePercentage()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>

                    <div class="example-box" style="margin-top: 1.5rem;">
                        <p><strong>Example:</strong> What is 20% of 150?</p>
                        <p>Result: 30</p>
                    </div>
                </div>
                
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="pctResult"></div>
                </div>
            </div>
        `;
    },

    buildRatioCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Ratio & Proportion</div>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">Solve for X: A : B = C : X</p>
                    
                    <div class="input-group">
                        <label>A</label>
                        <input type="number" id="ratioA" placeholder="Enter A" step="any">
                    </div>
                    <div class="input-group">
                        <label>B</label>
                        <input type="number" id="ratioB" placeholder="Enter B" step="any">
                    </div>
                    <div class="input-group">
                        <label>C</label>
                        <input type="number" id="ratioC" placeholder="Enter C" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateRatio()">Calculate X</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="ratioResult"></div>
                </div>
            </div>
        `;
    },

    buildAreaCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Area Calculator</div>
                    
                    <div class="input-group">
                        <label>Shape</label>
                        <select id="areaShape" onchange="GRApp.updateAreaInputs()">
                            <option value="square">Square</option>
                            <option value="rectangle">Rectangle</option>
                            <option value="circle">Circle</option>
                            <option value="triangle">Triangle</option>
                            <option value="trapezium">Trapezium</option>
                        </select>
                    </div>
                    
                    <div id="areaInputs">
                        <div class="input-group">
                            <label>Side (a)</label>
                            <div class="input-wrapper">
                                <input type="number" id="areaA" placeholder="Side length" step="any">
                                <select id="areaUnit"><option value="m">m</option><option value="cm">cm</option><option value="mm">mm</option><option value="ft">ft</option></select>
                            </div>
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateArea()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="areaResult"></div>
                </div>
            </div>
        `;
    },

    buildVolumeCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Volume Calculator</div>
                    
                    <div class="input-group">
                        <label>Shape</label>
                        <select id="volShape" onchange="GRApp.updateVolumeInputs()">
                            <option value="cube">Cube</option>
                            <option value="cuboid">Cuboid</option>
                            <option value="cylinder">Cylinder</option>
                            <option value="cone">Cone</option>
                            <option value="sphere">Sphere</option>
                        </select>
                    </div>
                    
                    <div id="volInputs">
                        <div class="input-group">
                            <label>Side (a)</label>
                            <input type="number" id="volA" placeholder="Side length" step="any">
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateVolume()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="volResult"></div>
                </div>
            </div>
        `;
    },

    buildCoordinateCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Coordinate Geometry</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group">
                            <label>Point 1 (x₁, y₁)</label>
                            <div class="input-wrapper">
                                <input type="number" id="coordX1" placeholder="x₁" step="any">
                                <input type="number" id="coordY1" placeholder="y₁" step="any">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>Point 2 (x₂, y₂)</label>
                            <div class="input-wrapper">
                                <input type="number" id="coordX2" placeholder="x₂" step="any">
                                <input type="number" id="coordY2" placeholder="y₂" step="any">
                            </div>
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateCoordinate()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="coordResult"></div>
                </div>
            </div>
        `;
    },

    buildQuadraticCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Quadratic Equation</div>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">ax² + bx + c = 0</p>
                    
                    <div class="input-group">
                        <label>a</label>
                        <input type="number" id="quadA" placeholder="Coefficient a" step="any">
                    </div>
                    <div class="input-group">
                        <label>b</label>
                        <input type="number" id="quadB" placeholder="Coefficient b" step="any">
                    </div>
                    <div class="input-group">
                        <label>c</label>
                        <input type="number" id="quadC" placeholder="Constant c" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateQuadratic()">Solve</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="quadResult"></div>
                </div>
            </div>
        `;
    },

    buildAverageCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Average Calculator</div>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">Enter numbers separated by commas</p>
                    
                    <div class="input-group">
                        <label>Values</label>
                        <textarea id="avgValues" rows="4" placeholder="e.g. 10, 20, 30, 40, 50" style="width: 100%; padding: 0.625rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-input); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateAverage()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="avgResult"></div>
                </div>
            </div>
        `;
    },

    buildDiscountCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Discount Calculator</div>
                    
                    <div class="input-group">
                        <label>Original Price</label>
                        <input type="number" id="discPrice" placeholder="Enter price" step="any">
                    </div>
                    <div class="input-group">
                        <label>Discount (%)</label>
                        <input type="number" id="discPercent" placeholder="Enter discount %" step="any" min="0" max="100">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateDiscount()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="discResult"></div>
                </div>
            </div>
        `;
    },

    buildProfitLossCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Profit & Loss</div>
                    
                    <div class="input-group">
                        <label>Cost Price</label>
                        <input type="number" id="plCost" placeholder="Enter cost price" step="any">
                    </div>
                    <div class="input-group">
                        <label>Selling Price</label>
                        <input type="number" id="plSelling" placeholder="Enter selling price" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateProfitLoss()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="plResult"></div>
                </div>
            </div>
        `;
    },

    buildGstCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">GST Calculator</div>
                    
                    <div class="input-group">
                        <label>Amount</label>
                        <input type="number" id="gstAmount" placeholder="Enter amount" step="any">
                    </div>
                    <div class="input-group">
                        <label>GST Rate (%)</label>
                        <input type="number" id="gstRate" placeholder="e.g. 18" step="any" value="18">
                    </div>
                    <div class="input-group">
                        <label>Calculation Type</label>
                        <select id="gstType">
                            <option value="exclusive">Add GST (Exclusive)</option>
                            <option value="inclusive">Remove GST (Inclusive)</option>
                        </select>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateGst()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="gstResult"></div>
                </div>
            </div>
        `;
    },

    buildNumberConverterCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Number Base Converter</div>
                    
                    <div class="input-group">
                        <label>Input Number</label>
                        <input type="text" id="numInput" placeholder="Enter number">
                    </div>
                    <div class="input-group">
                        <label>From Base</label>
                        <select id="numFromBase">
                            <option value="2">Binary (2)</option>
                            <option value="10" selected>Decimal (10)</option>
                            <option value="16">Hexadecimal (16)</option>
                            <option value="8">Octal (8)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>To Base</label>
                        <select id="numToBase">
                            <option value="2" selected>Binary (2)</option>
                            <option value="10">Decimal (10)</option>
                            <option value="16">Hexadecimal (16)</option>
                            <option value="8">Octal (8)</option>
                        </select>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.convertNumber()">Convert</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="numResult"></div>
                </div>
            </div>
        `;
    },

    buildConcreteCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Concrete Volume Estimator</div>
                    
                    <div class="input-group">
                        <label>Length (m)</label>
                        <input type="number" id="concLength" placeholder="Length" step="any">
                    </div>
                    <div class="input-group">
                        <label>Width (m)</label>
                        <input type="number" id="concWidth" placeholder="Width" step="any">
                    </div>
                    <div class="input-group">
                        <label>Depth/Thickness (m)</label>
                        <input type="number" id="concDepth" placeholder="Depth" step="any">
                    </div>
                    <div class="input-group">
                        <label>Mix Ratio</label>
                        <select id="concRatio">
                            <option value="1:2:4">M15 - 1:2:4</option>
                            <option value="1:1.5:3">M20 - 1:1.5:3</option>
                            <option value="1:1:2">M25 - 1:1:2</option>
                        </select>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateConcrete()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="concResult"></div>
                </div>
            </div>
        `;
    },

    buildBrickworkCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Brickwork Calculator</div>
                    
                    <div class="input-group">
                        <label>Wall Length (m)</label>
                        <input type="number" id="brickLength" placeholder="Length" step="any">
                    </div>
                    <div class="input-group">
                        <label>Wall Height (m)</label>
                        <input type="number" id="brickHeight" placeholder="Height" step="any">
                    </div>
                    <div class="input-group">
                        <label>Wall Thickness (m)</label>
                        <input type="number" id="brickThickness" placeholder="e.g. 0.23 for 230mm" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateBrickwork()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="brickResult"></div>
                </div>
            </div>
        `;
    },

    buildSteelWeightCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Steel Weight Calculator</div>
                    
                    <div class="input-group">
                        <label>Bar Diameter (mm)</label>
                        <input type="number" id="steelDia" placeholder="e.g. 12, 16, 20" step="any">
                    </div>
                    <div class="input-group">
                        <label>Length (m)</label>
                        <input type="number" id="steelLength" placeholder="Total length" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateSteelWeight()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="steelResult"></div>
                </div>
            </div>
        `;
    },

    buildStressStrainCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Stress & Strain</div>
                    
                    <div class="input-group">
                        <label>Force (N)</label>
                        <div class="input-wrapper">
                            <input type="number" id="ssForce" placeholder="Applied force" step="any">
                            <select id="ssForceUnit"><option value="N">N</option><option value="kN">kN</option><option value="kgf">kgf</option></select>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Cross-sectional Area (mm²)</label>
                        <input type="number" id="ssArea" placeholder="Area" step="any">
                    </div>
                    <div class="input-group">
                        <label>Original Length (mm)</label>
                        <input type="number" id="ssOrigLength" placeholder="Original length" step="any">
                    </div>
                    <div class="input-group">
                        <label>Change in Length (mm)</label>
                        <input type="number" id="ssChangeLength" placeholder="Deformation" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateStressStrain()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="ssResult"></div>
                </div>
            </div>
        `;
    },

    buildYoungsModulusCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Young's Modulus Calculator</div>
                    
                    <div class="input-group">
                        <label>Stress (MPa)</label>
                        <input type="number" id="ymStress" placeholder="Stress value" step="any">
                    </div>
                    <div class="input-group">
                        <label>Strain (dimensionless)</label>
                        <input type="number" id="ymStrain" placeholder="Strain value" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateYoungsModulus()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="ymResult"></div>
                </div>
            </div>
        `;
    },

    buildMolarityCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Molarity Calculator</div>
                    
                    <div class="input-group">
                        <label>Mass of Solute (g)</label>
                        <input type="number" id="molMass" placeholder="Mass in grams" step="any">
                    </div>
                    <div class="input-group">
                        <label>Molecular Weight (g/mol)</label>
                        <input type="number" id="molWeight" placeholder="Molecular weight" step="any">
                    </div>
                    <div class="input-group">
                        <label>Volume of Solution (mL)</label>
                        <input type="number" id="molVolume" placeholder="Volume" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateMolarity()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="molResult"></div>
                </div>
            </div>
        `;
    },

    buildDilutionCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Dilution Calculator (C₁V₁ = C₂V₂)</div>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">Leave one field blank to solve for it</p>
                    
                    <div class="input-group">
                        <label>Initial Concentration (C₁)</label>
                        <input type="number" id="dilC1" placeholder="C₁" step="any">
                    </div>
                    <div class="input-group">
                        <label>Initial Volume (V₁)</label>
                        <input type="number" id="dilV1" placeholder="V₁" step="any">
                    </div>
                    <div class="input-group">
                        <label>Final Concentration (C₂)</label>
                        <input type="number" id="dilC2" placeholder="C₂" step="any">
                    </div>
                    <div class="input-group">
                        <label>Final Volume (V₂)</label>
                        <input type="number" id="dilV2" placeholder="V₂" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateDilution()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="dilResult"></div>
                </div>
            </div>
        `;
    },

    buildPhCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">pH Calculator</div>
                    
                    <div class="input-group">
                        <label>Calculation Mode</label>
                        <select id="phMode" onchange="GRApp.updatePhInputs()">
                            <option value="h">[H⁺] to pH</option>
                            <option value="ph">pH to [H⁺]</option>
                            <option value="ph-poh">pH to pOH</option>
                        </select>
                    </div>
                    
                    <div id="phInputContainer">
                        <div class="input-group">
                            <label>[H⁺] Concentration (mol/L)</label>
                            <input type="number" id="phHConc" placeholder="e.g. 1e-7" step="any">
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculatePh()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="phResult"></div>
                </div>
            </div>
        `;
    },

    buildRsdCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">RSD / %RSD Calculator</div>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">Enter values separated by commas</p>
                    
                    <div class="input-group">
                        <label>Measurements</label>
                        <textarea id="rsdValues" rows="4" placeholder="e.g. 10.2, 10.5, 10.3, 10.4" style="width: 100%; padding: 0.625rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-input); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateRsd()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="rsdResult"></div>
                </div>
            </div>
        `;
    },

    buildRecoveryCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">% Recovery Calculator</div>
                    
                    <div class="input-group">
                        <label>Amount Spiked (known)</label>
                        <input type="number" id="recSpike" placeholder="Spike amount" step="any">
                    </div>
                    <div class="input-group">
                        <label>Amount Recovered (measured)</label>
                        <input type="number" id="recMeasured" placeholder="Measured amount" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateRecovery()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="recResult"></div>
                </div>
            </div>
        `;
    },

    buildEmiCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">EMI Calculator</div>
                    
                    <div class="input-group">
                        <label>Loan Amount (₹)</label>
                        <input type="number" id="emiPrincipal" placeholder="Principal amount" step="any">
                    </div>
                    <div class="input-group">
                        <label>Annual Interest Rate (%)</label>
                        <input type="number" id="emiRate" placeholder="e.g. 8.5" step="any">
                    </div>
                    <div class="input-group">
                        <label>Loan Tenure (Years)</label>
                        <input type="number" id="emiYears" placeholder="Years" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateEmi()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="emiResult"></div>
                </div>
            </div>
        `;
    },

    buildSimpleInterestCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Simple Interest</div>
                    
                    <div class="input-group">
                        <label>Principal (₹)</label>
                        <input type="number" id="siPrincipal" placeholder="Principal" step="any">
                    </div>
                    <div class="input-group">
                        <label>Rate (% per annum)</label>
                        <input type="number" id="siRate" placeholder="Interest rate" step="any">
                    </div>
                    <div class="input-group">
                        <label>Time (Years)</label>
                        <input type="number" id="siTime" placeholder="Time in years" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateSimpleInterest()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="siResult"></div>
                </div>
            </div>
        `;
    },

    buildCompoundInterestCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Compound Interest</div>
                    
                    <div class="input-group">
                        <label>Principal (₹)</label>
                        <input type="number" id="ciPrincipal" placeholder="Principal" step="any">
                    </div>
                    <div class="input-group">
                        <label>Rate (% per annum)</label>
                        <input type="number" id="ciRate" placeholder="Interest rate" step="any">
                    </div>
                    <div class="input-group">
                        <label>Time (Years)</label>
                        <input type="number" id="ciTime" placeholder="Time in years" step="any">
                    </div>
                    <div class="input-group">
                        <label>Compounding Frequency</label>
                        <select id="ciFreq">
                            <option value="1">Annually</option>
                            <option value="2">Semi-annually</option>
                            <option value="4">Quarterly</option>
                            <option value="12">Monthly</option>
                        </select>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateCompoundInterest()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="ciResult"></div>
                </div>
            </div>
        `;
    },

    buildTimeDiffCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Time Difference</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group">
                            <label>Start Time</label>
                            <input type="time" id="timeStart" step="1">
                        </div>
                        <div class="input-group">
                            <label>End Time</label>
                            <input type="time" id="timeEnd" step="1">
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateTimeDiff()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="timeResult"></div>
                </div>
            </div>
        `;
    },

    buildDateDiffCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Date Difference</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group">
                            <label>Start Date</label>
                            <input type="date" id="dateStart">
                        </div>
                        <div class="input-group">
                            <label>End Date</label>
                            <input type="date" id="dateEnd">
                        </div>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateDateDiff()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="dateResult"></div>
                </div>
            </div>
        `;
    },

    buildAgeCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Age Calculator</div>
                    
                    <div class="input-group">
                        <label>Date of Birth</label>
                        <input type="date" id="ageDob">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateAge()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="ageResult"></div>
                </div>
            </div>
        `;
    },

    buildStatsCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">Descriptive Statistics</div>
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">Enter numbers separated by commas</p>
                    
                    <div class="input-group">
                        <label>Data Set</label>
                        <textarea id="statsValues" rows="4" placeholder="e.g. 12, 15, 18, 21, 24, 27, 30" style="width: 100%; padding: 0.625rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-input); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateStats()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="statsResult"></div>
                </div>
            </div>
        `;
    },

    buildBmiCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">BMI Calculator</div>
                    
                    <div class="input-group">
                        <label>Weight (kg)</label>
                        <input type="number" id="bmiWeight" placeholder="Weight in kg" step="any">
                    </div>
                    <div class="input-group">
                        <label>Height (cm)</label>
                        <input type="number" id="bmiHeight" placeholder="Height in cm" step="any">
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateBmi()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="bmiResult"></div>
                </div>
            </div>
        `;
    },

    buildBmrCalc() {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">BMR Calculator</div>
                    
                    <div class="input-group">
                        <label>Weight (kg)</label>
                        <input type="number" id="bmrWeight" placeholder="Weight" step="any">
                    </div>
                    <div class="input-group">
                        <label>Height (cm)</label>
                        <input type="number" id="bmrHeight" placeholder="Height" step="any">
                    </div>
                    <div class="input-group">
                        <label>Age (years)</label>
                        <input type="number" id="bmrAge" placeholder="Age" step="any">
                    </div>
                    <div class="input-group">
                        <label>Gender</label>
                        <select id="bmrGender">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div class="calc-buttons">
                        <button class="btn btn-primary" onclick="GRApp.calculateBmr()">Calculate</button>
                        <button class="btn btn-secondary" onclick="GRApp.resetForm()">Reset</button>
                    </div>
                </div>
                <div class="calc-panel">
                    <div class="panel-title">Result</div>
                    <div id="bmrResult"></div>
                </div>
            </div>
        `;
    },

    buildGenericCalc(calc) {
        return `
            <div class="calc-container">
                <div class="calc-panel">
                    <div class="panel-title">${calc.name}</div>
                    <p style="color: var(--text-secondary);">This calculator is coming in the next phase.</p>
                </div>
            </div>
        `;
    },

    // ==================== DYNAMIC INPUT UPDATERS ====================

    updateAreaInputs() {
        const shape = document.getElementById('areaShape').value;
        const container = document.getElementById('areaInputs');
        const unitSelect = '<select id="areaUnit"><option value="m">m</option><option value="cm">cm</option><option value="mm">mm</option><option value="ft">ft</option></select>';
        
        let html = '';
        switch(shape) {
            case 'square':
                html = `<div class="input-group"><label>Side (a)</label><div class="input-wrapper"><input type="number" id="areaA" placeholder="Side length" step="any">${unitSelect}</div></div>`;
                break;
            case 'rectangle':
                html = `<div class="input-group"><label>Length (l)</label><div class="input-wrapper"><input type="number" id="areaL" placeholder="Length" step="any">${unitSelect}</div></div>
                        <div class="input-group"><label>Width (w)</label><div class="input-wrapper"><input type="number" id="areaW" placeholder="Width" step="any">${unitSelect}</div></div>`;
                break;
            case 'circle':
                html = `<div class="input-group"><label>Radius (r)</label><div class="input-wrapper"><input type="number" id="areaR" placeholder="Radius" step="any">${unitSelect}</div></div>`;
                break;
            case 'triangle':
                html = `<div class="input-group"><label>Base (b)</label><div class="input-wrapper"><input type="number" id="areaB" placeholder="Base" step="any">${unitSelect}</div></div>
                        <div class="input-group"><label>Height (h)</label><div class="input-wrapper"><input type="number" id="areaH" placeholder="Height" step="any">${unitSelect}</div></div>`;
                break;
            case 'trapezium':
                html = `<div class="input-group"><label>Parallel Side a</label><div class="input-wrapper"><input type="number" id="areaA1" placeholder="a" step="any">${unitSelect}</div></div>
                        <div class="input-group"><label>Parallel Side b</label><div class="input-wrapper"><input type="number" id="areaA2" placeholder="b" step="any">${unitSelect}</div></div>
                        <div class="input-group"><label>Height (h)</label><div class="input-wrapper"><input type="number" id="areaH" placeholder="Height" step="any">${unitSelect}</div></div>`;
                break;
        }
        container.innerHTML = html;
    },

    updateVolumeInputs() {
        const shape = document.getElementById('volShape').value;
        const container = document.getElementById('volInputs');
        
        let html = '';
        switch(shape) {
            case 'cube':
                html = `<div class="input-group"><label>Side (a)</label><input type="number" id="volA" placeholder="Side length" step="any"></div>`;
                break;
            case 'cuboid':
                html = `<div class="input-group"><label>Length (l)</label><input type="number" id="volL" placeholder="Length" step="any"></div>
                        <div class="input-group"><label>Width (w)</label><input type="number" id="volW" placeholder="Width" step="any"></div>
                        <div class="input-group"><label>Height (h)</label><input type="number" id="volH" placeholder="Height" step="any"></div>`;
                break;
            case 'cylinder':
                html = `<div class="input-group"><label>Radius (r)</label><input type="number" id="volR" placeholder="Radius" step="any"></div>
                        <div class="input-group"><label>Height (h)</label><input type="number" id="volH" placeholder="Height" step="any"></div>`;
                break;
            case 'cone':
                html = `<div class="input-group"><label>Radius (r)</label><input type="number" id="volR" placeholder="Radius" step="any"></div>
                        <div class="input-group"><label>Height (h)</label><input type="number" id="volH" placeholder="Height" step="any"></div>`;
                break;
            case 'sphere':
                html = `<div class="input-group"><label>Radius (r)</label><input type="number" id="volR" placeholder="Radius" step="any"></div>`;
                break;
        }
        container.innerHTML = html;
    },

    updatePhInputs() {
        const mode = document.getElementById('phMode').value;
        const container = document.getElementById('phInputContainer');
        
        if (mode === 'h') {
            container.innerHTML = `<div class="input-group"><label>[H⁺] Concentration (mol/L)</label><input type="number" id="phHConc" placeholder="e.g. 1e-7" step="any"></div>`;
        } else if (mode === 'ph') {
            container.innerHTML = `<div class="input-group"><label>pH Value</label><input type="number" id="phValue" placeholder="e.g. 7" step="any"></div>`;
        } else {
            container.innerHTML = `<div class="input-group"><label>pH Value</label><input type="number" id="phValue2" placeholder="e.g. 7" step="any"></div>`;
        }
    },

    // ==================== CALCULATION HANDLERS ====================

    calculatePercentage() {
        const v1 = CalcEngine.validateNumber(document.getElementById('pctValue1').value);
        const v2 = CalcEngine.validateNumber(document.getElementById('pctValue2').value);
        
        if (!v1.valid) { this.showError('pctValue1', v1.error); return; }
        if (!v2.valid) { this.showError('pctValue2', v2.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.general.percentageOf(v1.value, v2.value);
        const result2 = CalcEngine.general.percentage(result, v2.value);
        
        this.displayResult('pctResult', CalcEngine.formatNumber(result), 'Value', `
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">Result = (Percentage / 100) × Total<br>${v1.value}% of ${v2.value} = (${v1.value}/100) × ${v2.value}</div>
            </div>
            <div class="result-section">
                <div class="result-section-title">Calculation Steps</div>
                <ul class="steps-list">
                    <li>Percentage = ${v1.value}%</li>
                    <li>Total value = ${v2.value}</li>
                    <li>Result = (${v1.value} / 100) × ${v2.value}</li>
                    <li class="step-eq">= ${CalcEngine.formatNumber(result)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Additional Info</div>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">
                    ${v1.value}% of ${v2.value} = ${CalcEngine.formatNumber(result)}<br>
                    This represents ${CalcEngine.formatNumber(result2)}% proportionally.
                </p>
            </div>
        `, 'percentage');
    },

    calculateRatio() {
        const a = CalcEngine.validateNumber(document.getElementById('ratioA').value, { nonZero: true });
        const b = CalcEngine.validateNumber(document.getElementById('ratioB').value);
        const c = CalcEngine.validateNumber(document.getElementById('ratioC').value);
        
        if (!a.valid) { this.showError('ratioA', a.error); return; }
        if (!b.valid) { this.showError('ratioB', b.error); return; }
        if (!c.valid) { this.showError('ratioC', c.error); return; }
        this.clearErrors();
        
        const x = (b.value * c.value) / a.value;
        
        this.displayResult('ratioResult', CalcEngine.formatNumber(x), 'X', `
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">A : B = C : X<br>X = (B × C) / A</div>
            </div>
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>A = ${a.value}, B = ${b.value}, C = ${c.value}</li>
                    <li>X = (${b.value} × ${c.value}) / ${a.value}</li>
                    <li class="step-eq">X = ${CalcEngine.formatNumber(x)}</li>
                </ul>
            </div>
        `, 'ratio-proportion');
    },

    calculateArea() {
        const shape = document.getElementById('areaShape').value;
        const unit = document.getElementById('areaUnit')?.value || 'm';
        let result, formula, steps;
        
        try {
            switch(shape) {
                case 'square': {
                    const a = CalcEngine.validateNumber(document.getElementById('areaA').value, { greaterThan: 0 });
                    if (!a.valid) throw new Error(a.error);
                    result = a.value * a.value;
                    formula = 'A = a²';
                    steps = `A = ${a.value}² = ${CalcEngine.formatNumber(result)} ${unit}²`;
                    break;
                }
                case 'rectangle': {
                    const l = CalcEngine.validateNumber(document.getElementById('areaL').value, { greaterThan: 0 });
                    const w = CalcEngine.validateNumber(document.getElementById('areaW').value, { greaterThan: 0 });
                    if (!l.valid) throw new Error(l.error);
                    if (!w.valid) throw new Error(w.error);
                    result = l.value * w.value;
                    formula = 'A = l × w';
                    steps = `A = ${l.value} × ${w.value} = ${CalcEngine.formatNumber(result)} ${unit}²`;
                    break;
                }
                case 'circle': {
                    const r = CalcEngine.validateNumber(document.getElementById('areaR').value, { greaterThan: 0 });
                    if (!r.valid) throw new Error(r.error);
                    result = CalcEngine.math.circleArea(r.value);
                    formula = 'A = πr²';
                    steps = `A = π × ${r.value}² = ${CalcEngine.formatNumber(result)} ${unit}²`;
                    break;
                }
                case 'triangle': {
                    const b = CalcEngine.validateNumber(document.getElementById('areaB').value, { greaterThan: 0 });
                    const h = CalcEngine.validateNumber(document.getElementById('areaH').value, { greaterThan: 0 });
                    if (!b.valid) throw new Error(b.error);
                    if (!h.valid) throw new Error(h.error);
                    result = 0.5 * b.value * h.value;
                    formula = 'A = ½ × b × h';
                    steps = `A = ½ × ${b.value} × ${h.value} = ${CalcEngine.formatNumber(result)} ${unit}²`;
                    break;
                }
                case 'trapezium': {
                    const a1 = CalcEngine.validateNumber(document.getElementById('areaA1').value, { greaterThan: 0 });
                    const a2 = CalcEngine.validateNumber(document.getElementById('areaA2').value, { greaterThan: 0 });
                    const h = CalcEngine.validateNumber(document.getElementById('areaH').value, { greaterThan: 0 });
                    if (!a1.valid) throw new Error(a1.error);
                    if (!a2.valid) throw new Error(a2.error);
                    if (!h.valid) throw new Error(h.error);
                    result = 0.5 * (a1.value + a2.value) * h.value;
                    formula = 'A = ½ × (a + b) × h';
                    steps = `A = ½ × (${a1.value} + ${a2.value}) × ${h.value} = ${CalcEngine.formatNumber(result)} ${unit}²`;
                    break;
                }
            }
            
            this.clearErrors();
            this.displayResult('areaResult', CalcEngine.formatNumber(result), `${unit}²`, `
                <div class="result-section">
                    <div class="result-section-title">Formula</div>
                    <div class="formula-box">${formula}</div>
                </div>
                <div class="result-section">
                    <div class="result-section-title">Calculation</div>
                    <ul class="steps-list"><li class="step-eq">${steps}</li></ul>
                </div>
            `, 'area-geometry');
        } catch(e) {
            this.showToast(e.message, 'error');
        }
    },

    calculateVolume() {
        const shape = document.getElementById('volShape').value;
        let result, formula, steps;
        
        try {
            switch(shape) {
                case 'cube': {
                    const a = CalcEngine.validateNumber(document.getElementById('volA').value, { greaterThan: 0 });
                    if (!a.valid) throw new Error(a.error);
                    result = Math.pow(a.value, 3);
                    formula = 'V = a³';
                    steps = `V = ${a.value}³ = ${CalcEngine.formatNumber(result)}`;
                    break;
                }
                case 'cuboid': {
                    const l = CalcEngine.validateNumber(document.getElementById('volL').value, { greaterThan: 0 });
                    const w = CalcEngine.validateNumber(document.getElementById('volW').value, { greaterThan: 0 });
                    const h = CalcEngine.validateNumber(document.getElementById('volH').value, { greaterThan: 0 });
                    if (!l.valid) throw new Error(l.error);
                    if (!w.valid) throw new Error(w.error);
                    if (!h.valid) throw new Error(h.error);
                    result = l.value * w.value * h.value;
                    formula = 'V = l × w × h';
                    steps = `V = ${l.value} × ${w.value} × ${h.value} = ${CalcEngine.formatNumber(result)}`;
                    break;
                }
                case 'cylinder': {
                    const r = CalcEngine.validateNumber(document.getElementById('volR').value, { greaterThan: 0 });
                    const h = CalcEngine.validateNumber(document.getElementById('volH').value, { greaterThan: 0 });
                    if (!r.valid) throw new Error(r.error);
                    if (!h.valid) throw new Error(h.error);
                    result = CalcEngine.math.cylinderVolume(r.value, h.value);
                    formula = 'V = πr²h';
                    steps = `V = π × ${r.value}² × ${h.value} = ${CalcEngine.formatNumber(result)}`;
                    break;
                }
                case 'cone': {
                    const r = CalcEngine.validateNumber(document.getElementById('volR').value, { greaterThan: 0 });
                    const h = CalcEngine.validateNumber(document.getElementById('volH').value, { greaterThan: 0 });
                    if (!r.valid) throw new Error(r.error);
                    if (!h.valid) throw new Error(h.error);
                    result = CalcEngine.math.coneVolume(r.value, h.value);
                    formula = 'V = (1/3)πr²h';
                    steps = `V = (1/3) × π × ${r.value}² × ${h.value} = ${CalcEngine.formatNumber(result)}`;
                    break;
                }
                case 'sphere': {
                    const r = CalcEngine.validateNumber(document.getElementById('volR').value, { greaterThan: 0 });
                    if (!r.valid) throw new Error(r.error);
                    result = CalcEngine.math.sphereVolume(r.value);
                    formula = 'V = (4/3)πr³';
                    steps = `V = (4/3) × π × ${r.value}³ = ${CalcEngine.formatNumber(result)}`;
                    break;
                }
            }
            
            this.clearErrors();
            this.displayResult('volResult', CalcEngine.formatNumber(result), 'units³', `
                <div class="result-section">
                    <div class="result-section-title">Formula</div>
                    <div class="formula-box">${formula}</div>
                </div>
                <div class="result-section">
                    <div class="result-section-title">Calculation</div>
                    <ul class="steps-list"><li class="step-eq">${steps}</li></ul>
                </div>
            `, 'volume-geometry');
        } catch(e) {
            this.showToast(e.message, 'error');
        }
    },

    calculateCoordinate() {
        const x1 = CalcEngine.validateNumber(document.getElementById('coordX1').value);
        const y1 = CalcEngine.validateNumber(document.getElementById('coordY1').value);
        const x2 = CalcEngine.validateNumber(document.getElementById('coordX2').value);
        const y2 = CalcEngine.validateNumber(document.getElementById('coordY2').value);
        
        if (!x1.valid) { this.showError('coordX1', x1.error); return; }
        if (!y1.valid) { this.showError('coordY1', y1.error); return; }
        if (!x2.valid) { this.showError('coordX2', x2.error); return; }
        if (!y2.valid) { this.showError('coordY2', y2.error); return; }
        this.clearErrors();
        
        const dist = CalcEngine.math.distance(x1.value, y1.value, x2.value, y2.value);
        const mid = CalcEngine.math.midpoint(x1.value, y1.value, x2.value, y2.value);
        const slope = CalcEngine.math.slope(x1.value, y1.value, x2.value, y2.value);
        
        this.displayResult('coordResult', CalcEngine.formatNumber(dist), 'units', `
            <div class="result-section">
                <div class="result-section-title">Distance</div>
                <div class="formula-box">d = √[(x₂-x₁)² + (y₂-y₁)²]</div>
                <ul class="steps-list">
                    <li>d = √[(${x2.value}-${x1.value})² + (${y2.value}-${y1.value})²]</li>
                    <li class="step-eq">d = ${CalcEngine.formatNumber(dist)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Midpoint</div>
                <div class="formula-box">M = ((x₁+x₂)/2, (y₁+y₂)/2)</div>
                <ul class="steps-list">
                    <li class="step-eq">M = (${CalcEngine.formatNumber(mid.x)}, ${CalcEngine.formatNumber(mid.y)})</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Slope</div>
                <div class="formula-box">m = (y₂-y₁)/(x₂-x₁)</div>
                <ul class="steps-list">
                    <li class="step-eq">m = ${slope === Infinity ? 'Undefined (vertical line)' : CalcEngine.formatNumber(slope)}</li>
                </ul>
            </div>
        `, 'coordinate-geometry');
    },

    calculateQuadratic() {
        const a = CalcEngine.validateNumber(document.getElementById('quadA').value, { nonZero: true });
        const b = CalcEngine.validateNumber(document.getElementById('quadB').value);
        const c = CalcEngine.validateNumber(document.getElementById('quadC').value);
        
        if (!a.valid) { this.showError('quadA', a.error); return; }
        if (!b.valid) { this.showError('quadB', b.error); return; }
        if (!c.valid) { this.showError('quadC', c.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.math.quadratic(a.value, b.value, c.value);
        
        let resultHTML = `
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">x = [-b ± √(b² - 4ac)] / 2a</div>
            </div>
            <div class="result-section">
                <div class="result-section-title">Discriminant</div>
                <ul class="steps-list">
                    <li>Δ = b² - 4ac = ${b.value}² - 4×${a.value}×${c.value}</li>
                    <li class="step-eq">Δ = ${CalcEngine.formatNumber(result.discriminant)}</li>
                </ul>
            </div>
        `;
        
        if (result.type === 'real') {
            this.displayResult('quadResult', `x₁ = ${CalcEngine.formatNumber(result.root1)}, x₂ = ${CalcEngine.formatNumber(result.root2)}`, 'Roots', resultHTML + `
                <div class="result-section">
                    <div class="result-section-title">Roots (Real)</div>
                    <ul class="steps-list">
                        <li>x₁ = [-${b.value} + √${CalcEngine.formatNumber(result.discriminant)}] / (2×${a.value})</li>
                        <li class="step-eq">x₁ = ${CalcEngine.formatNumber(result.root1)}</li>
                        <li>x₂ = [-${b.value} - √${CalcEngine.formatNumber(result.discriminant)}] / (2×${a.value})</li>
                        <li class="step-eq">x₂ = ${CalcEngine.formatNumber(result.root2)}</li>
                    </ul>
                </div>
            `, 'quadratic');
        } else {
            this.displayResult('quadResult', `${result.root1}`, 'Complex Roots', resultHTML + `
                <div class="result-section">
                    <div class="result-section-title">Roots (Complex)</div>
                    <ul class="steps-list">
                        <li class="step-eq">x₁ = ${result.root1}</li>
                        <li class="step-eq">x₂ = ${result.root2}</li>
                    </ul>
                </div>
            `, 'quadratic');
        }
    },

    calculateAverage() {
        const input = document.getElementById('avgValues').value.trim();
        if (!input) { this.showToast('Please enter values', 'error'); return; }
        
        const values = input.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        if (values.length === 0) { this.showToast('No valid numbers found', 'error'); return; }
        
        const avg = CalcEngine.general.average(values);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((a, b) => a + b, 0);
        
        this.displayResult('avgResult', CalcEngine.formatNumber(avg), 'Average', `
            <div class="result-section">
                <div class="result-section-title">Statistics</div>
                <ul class="steps-list">
                    <li>Count: ${values.length}</li>
                    <li>Sum: ${CalcEngine.formatNumber(sum)}</li>
                    <li>Min: ${CalcEngine.formatNumber(min)}</li>
                    <li>Max: ${CalcEngine.formatNumber(max)}</li>
                    <li class="step-eq">Average = ${CalcEngine.formatNumber(sum)} / ${values.length} = ${CalcEngine.formatNumber(avg)}</li>
                </ul>
            </div>
        `, 'average');
    },

    calculateDiscount() {
        const price = CalcEngine.validateNumber(document.getElementById('discPrice').value, { greaterThan: 0 });
        const percent = CalcEngine.validateNumber(document.getElementById('discPercent').value, { min: 0, max: 100 });
        
        if (!price.valid) { this.showError('discPrice', price.error); return; }
        if (!percent.valid) { this.showError('discPercent', percent.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.general.discount(price.value, percent.value);
        
        this.displayResult('discResult', CalcEngine.formatCurrency(result.finalPrice), 'Final Price', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>Original Price: ${CalcEngine.formatCurrency(price.value)}</li>
                    <li>Discount: ${percent.value}%</li>
                    <li>Discount Amount: ${CalcEngine.formatCurrency(result.discountAmount)}</li>
                    <li class="step-eq">Final Price: ${CalcEngine.formatCurrency(result.finalPrice)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">Discount = Price × (Discount% / 100)<br>Final Price = Price - Discount</div>
            </div>
        `, 'discount');
    },

    calculateProfitLoss() {
        const cost = CalcEngine.validateNumber(document.getElementById('plCost').value, { greaterThan: 0 });
        const selling = CalcEngine.validateNumber(document.getElementById('plSelling').value, { greaterThan: 0 });
        
        if (!cost.valid) { this.showError('plCost', cost.error); return; }
        if (!selling.valid) { this.showError('plSelling', selling.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.general.profitLoss(cost.value, selling.value);
        
        this.displayResult('plResult', `${result.type}: ${CalcEngine.formatCurrency(Math.abs(result.profit))}`, result.type, `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>Cost Price: ${CalcEngine.formatCurrency(cost.value)}</li>
                    <li>Selling Price: ${CalcEngine.formatCurrency(selling.value)}</li>
                    <li>${result.type} Amount: ${CalcEngine.formatCurrency(Math.abs(result.profit))}</li>
                    <li class="step-eq">${result.type} Margin: ${CalcEngine.formatNumber(result.margin)}%</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">${result.type} = Selling Price - Cost Price<br>Margin% = (${result.type} / Cost Price) × 100</div>
            </div>
        `, 'profit-loss');
    },

    calculateGst() {
        const amount = CalcEngine.validateNumber(document.getElementById('gstAmount').value, { greaterThan: 0 });
        const rate = CalcEngine.validateNumber(document.getElementById('gstRate').value, { greaterThan: 0 });
        const type = document.getElementById('gstType').value;
        
        if (!amount.valid) { this.showError('gstAmount', amount.error); return; }
        if (!rate.valid) { this.showError('gstRate', rate.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.general.gst(amount.value, rate.value, type);
        
        this.displayResult('gstResult', CalcEngine.formatCurrency(result.total), type === 'exclusive' ? 'Total (incl. GST)' : 'Base Amount', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>${type === 'exclusive' ? 'Base Amount' : 'Total Amount'}: ${CalcEngine.formatCurrency(type === 'exclusive' ? result.base : result.total)}</li>
                    <li>GST @ ${rate.value}%: ${CalcEngine.formatCurrency(result.tax)}</li>
                    <li class="step-eq">${type === 'exclusive' ? 'Total' : 'Base'}: ${CalcEngine.formatCurrency(type === 'exclusive' ? result.total : result.base)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">${type === 'exclusive' ? 'GST = Amount × Rate / 100<br>Total = Amount + GST' : 'Base = Amount × 100 / (100 + Rate)<br>GST = Amount - Base'}</div>
            </div>
        `, 'gst');
    },

    convertNumber() {
        const input = document.getElementById('numInput').value.trim();
        const fromBase = parseInt(document.getElementById('numFromBase').value);
        const toBase = parseInt(document.getElementById('numToBase').value);
        
        if (!input) { this.showToast('Please enter a number', 'error'); return; }
        
        try {
            const decimal = parseInt(input, fromBase);
            if (isNaN(decimal)) throw new Error('Invalid number for selected base');
            const result = decimal.toString(toBase).toUpperCase();
            
            this.displayResult('numResult', result, `Base ${toBase}`, `
                <div class="result-section">
                    <div class="result-section-title">Conversion</div>
                    <ul class="steps-list">
                        <li>Input: ${input} (base ${fromBase})</li>
                        <li>Decimal: ${decimal}</li>
                        <li class="step-eq">Result: ${result} (base ${toBase})</li>
                    </ul>
                </div>
            `, 'number-converter');
        } catch(e) {
            this.showToast(e.message, 'error');
        }
    },

    calculateConcrete() {
        const l = CalcEngine.validateNumber(document.getElementById('concLength').value, { greaterThan: 0 });
        const w = CalcEngine.validateNumber(document.getElementById('concWidth').value, { greaterThan: 0 });
        const d = CalcEngine.validateNumber(document.getElementById('concDepth').value, { greaterThan: 0 });
        const ratio = document.getElementById('concRatio').value;
        
        if (!l.valid) { this.showError('concLength', l.error); return; }
        if (!w.valid) { this.showError('concWidth', w.error); return; }
        if (!d.valid) { this.showError('concDepth', d.error); return; }
        this.clearErrors();
        
        const volume = CalcEngine.civil.concreteVolume(l.value, w.value, d.value);
        const materials = CalcEngine.civil.cementBags(volume, ratio);
        
        this.displayResult('concResult', CalcEngine.formatNumber(volume) + ' m³', 'Concrete Volume', `
            <div class="result-section">
                <div class="result-section-title">Material Estimate (Ratio ${ratio})</div>
                <ul class="steps-list">
                    <li>Volume = ${l.value} × ${w.value} × ${d.value} = ${CalcEngine.formatNumber(volume)} m³</li>
                    <li class="step-eq">Cement Bags: ${materials.cementBags} bags (${CalcEngine.formatNumber(materials.cementKg)} kg)</li>
                    <li>Sand: ${CalcEngine.formatNumber(materials.sandVolume)} m³</li>
                    <li>Aggregate: ${CalcEngine.formatNumber(materials.aggregateVolume)} m³</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">Volume = Length × Width × Depth<br>Dry Volume = Wet Volume × 1.54</div>
            </div>
        `, 'concrete-volume');
    },

    calculateBrickwork() {
        const l = CalcEngine.validateNumber(document.getElementById('brickLength').value, { greaterThan: 0 });
        const h = CalcEngine.validateNumber(document.getElementById('brickHeight').value, { greaterThan: 0 });
        const t = CalcEngine.validateNumber(document.getElementById('brickThickness').value, { greaterThan: 0 });
        
        if (!l.valid) { this.showError('brickLength', l.error); return; }
        if (!h.valid) { this.showError('brickHeight', h.error); return; }
        if (!t.valid) { this.showError('brickThickness', t.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.civil.brickwork(l.value, h.value, t.value);
        
        this.displayResult('brickResult', result.numBricks.toLocaleString(), 'Bricks', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>Wall Volume = ${l.value} × ${h.value} × ${t.value} = ${CalcEngine.formatNumber(result.wallVolume)} m³</li>
                    <li>Mortar Volume ≈ ${CalcEngine.formatNumber(result.mortarVolume)} m³ (25%)</li>
                    <li class="step-eq">Number of Bricks ≈ ${result.numBricks.toLocaleString()}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">Bricks = Wall Volume / (Brick Volume × 1.25)<br>Standard Brick: 230 × 115 × 75 mm</div>
            </div>
        `, 'brickwork');
    },

    calculateSteelWeight() {
        const dia = CalcEngine.validateNumber(document.getElementById('steelDia').value, { greaterThan: 0 });
        const len = CalcEngine.validateNumber(document.getElementById('steelLength').value, { greaterThan: 0 });
        
        if (!dia.valid) { this.showError('steelDia', dia.error); return; }
        if (!len.valid) { this.showError('steelLength', len.error); return; }
        this.clearErrors();
        
        const weight = CalcEngine.civil.steelWeight(dia.value, len.value);
        
        this.displayResult('steelResult', CalcEngine.formatNumber(weight), 'kg', `
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>Diameter = ${dia.value} mm</li>
                    <li>Length = ${len.value} m</li>
                    <li>Weight = (D² × L) / 162</li>
                    <li class="step-eq">Weight = (${dia.value}² × ${len.value}) / 162 = ${CalcEngine.formatNumber(weight)} kg</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">W (kg) = D² × L / 162<br>Where D = diameter in mm, L = length in m</div>
            </div>
        `, 'steel-weight');
    },

    calculateStressStrain() {
        const force = CalcEngine.validateNumber(document.getElementById('ssForce').value, { greaterThan: 0 });
        const area = CalcEngine.validateNumber(document.getElementById('ssArea').value, { greaterThan: 0 });
        const origLen = CalcEngine.validateNumber(document.getElementById('ssOrigLength').value, { greaterThan: 0 });
        const changeLen = CalcEngine.validateNumber(document.getElementById('ssChangeLength').value);
        const forceUnit = document.getElementById('ssForceUnit').value;
        
        if (!force.valid) { this.showError('ssForce', force.error); return; }
        if (!area.valid) { this.showError('ssArea', area.error); return; }
        if (!origLen.valid) { this.showError('ssOrigLength', origLen.error); return; }
        if (!changeLen.valid) { this.showError('ssChangeLength', changeLen.error); return; }
        this.clearErrors();
        
        // Convert force to N
        let forceN = force.value;
        if (forceUnit === 'kN') forceN *= 1000;
        else if (forceUnit === 'kgf') forceN *= 9.80665;
        
        const areaM2 = area.value * 1e-6; // mm² to m²
        const stress = CalcEngine.structural.stress(forceN, areaM2);
        const strain = CalcEngine.structural.strain(changeLen.value, origLen.value);
        const modulus = strain !== 0 ? stress / strain : 0;
        
        this.displayResult('ssResult', CalcEngine.formatNumber(stress / 1e6), 'MPa', `
            <div class="result-section">
                <div class="result-section-title">Stress</div>
                <ul class="steps-list">
                    <li>Force = ${CalcEngine.formatNumber(forceN)} N</li>
                    <li>Area = ${area.value} mm² = ${CalcEngine.formatNumber(areaM2)} m²</li>
                    <li class="step-eq">σ = F/A = ${CalcEngine.formatNumber(stress / 1e6)} MPa</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Strain</div>
                <ul class="steps-list">
                    <li>ΔL = ${changeLen.value} mm, L₀ = ${origLen.value} mm</li>
                    <li class="step-eq">ε = ΔL/L₀ = ${CalcEngine.formatNumber(strain)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Young's Modulus (from these values)</div>
                <ul class="steps-list">
                    <li class="step-eq">E = σ/ε = ${strain !== 0 ? CalcEngine.formatNumber(modulus / 1e9) + ' GPa' : 'Undefined (zero strain)'}</li>
                </ul>
            </div>
        `, 'stress-strain');
    },

    calculateYoungsModulus() {
        const stress = CalcEngine.validateNumber(document.getElementById('ymStress').value, { greaterThan: 0 });
        const strain = CalcEngine.validateNumber(document.getElementById('ymStrain').value, { greaterThan: 0 });
        
        if (!stress.valid) { this.showError('ymStress', stress.error); return; }
        if (!strain.valid) { this.showError('ymStrain', strain.error); return; }
        this.clearErrors();
        
        const e = CalcEngine.structural.youngsModulus(stress.value * 1e6, strain.value); // MPa to Pa
        
        this.displayResult('ymResult', CalcEngine.formatNumber(e / 1e9), 'GPa', `
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>Stress = ${stress.value} MPa = ${CalcEngine.formatNumber(stress.value * 1e6)} Pa</li>
                    <li>Strain = ${strain.value}</li>
                    <li class="step-eq">E = σ/ε = ${CalcEngine.formatNumber(e / 1e9)} GPa</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">E = σ / ε<br>Where σ = stress, ε = strain</div>
            </div>
        `, 'youngs-modulus');
    },

    calculateMolarity() {
        const mass = CalcEngine.validateNumber(document.getElementById('molMass').value, { greaterThan: 0 });
        const mw = CalcEngine.validateNumber(document.getElementById('molWeight').value, { greaterThan: 0 });
        const vol = CalcEngine.validateNumber(document.getElementById('molVolume').value, { greaterThan: 0 });
        
        if (!mass.valid) { this.showError('molMass', mass.error); return; }
        if (!mw.valid) { this.showError('molWeight', mw.error); return; }
        if (!vol.valid) { this.showError('molVolume', vol.error); return; }
        this.clearErrors();
        
        const moles = CalcEngine.chemistry.molesFromMass(mass.value, mw.value);
        const molarity = CalcEngine.chemistry.molarity(moles, vol.value / 1000);
        
        this.displayResult('molResult', CalcEngine.formatNumber(molarity), 'mol/L', `
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>Moles = Mass / MW = ${mass.value} / ${mw.value} = ${CalcEngine.formatNumber(moles)} mol</li>
                    <li>Volume = ${vol.value} mL = ${CalcEngine.formatNumber(vol.value / 1000)} L</li>
                    <li class="step-eq">Molarity = ${CalcEngine.formatNumber(moles)} / ${CalcEngine.formatNumber(vol.value / 1000)} = ${CalcEngine.formatNumber(molarity)} M</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">M = n / V = (mass / MW) / V(L)</div>
            </div>
        `, 'molarity');
    },

    calculateDilution() {
        const c1 = document.getElementById('dilC1').value;
        const v1 = document.getElementById('dilV1').value;
        const c2 = document.getElementById('dilC2').value;
        const v2 = document.getElementById('dilV2').value;
        
        const inputs = {
            c1: c1 ? parseFloat(c1) : null,
            v1: v1 ? parseFloat(v1) : null,
            c2: c2 ? parseFloat(c2) : null,
            v2: v2 ? parseFloat(v2) : null
        };
        
        const nullCount = Object.values(inputs).filter(v => v === null || isNaN(v)).length;
        if (nullCount !== 1) {
            this.showToast('Please leave exactly one field blank to solve for it', 'error');
            return;
        }
        
        const result = CalcEngine.chemistry.dilution(inputs.c1, inputs.v1, inputs.c2, inputs.v2);
        if (!result) { this.showToast('Calculation error', 'error'); return; }
        
        const solvedValue = result[result.solved];
        const labels = { c1: 'Initial Concentration', v1: 'Initial Volume', c2: 'Final Concentration', v2: 'Final Volume' };
        
        this.displayResult('dilResult', CalcEngine.formatNumber(solvedValue), result.solved.startsWith('c') ? 'conc.' : 'vol.', `
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>C₁ = ${result.c1 !== null ? CalcEngine.formatNumber(result.c1) : '?'}</li>
                    <li>V₁ = ${result.v1 !== null ? CalcEngine.formatNumber(result.v1) : '?'}</li>
                    <li>C₂ = ${result.c2 !== null ? CalcEngine.formatNumber(result.c2) : '?'}</li>
                    <li>V₂ = ${result.v2 !== null ? CalcEngine.formatNumber(result.v2) : '?'}</li>
                    <li class="step-eq">${labels[result.solved]} = ${CalcEngine.formatNumber(solvedValue)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">C₁V₁ = C₂V₂</div>
            </div>
        `, 'dilution');
    },

    calculatePh() {
        const mode = document.getElementById('phMode').value;
        let result, label, unit, formula, steps;
        
        try {
            if (mode === 'h') {
                const h = CalcEngine.validateNumber(document.getElementById('phHConc').value, { greaterThan: 0 });
                if (!h.valid) throw new Error(h.error);
                result = CalcEngine.chemistry.phFromH(h.value);
                label = 'pH';
                unit = '';
                formula = 'pH = -log[H⁺]';
                steps = `pH = -log(${h.value}) = ${CalcEngine.formatNumber(result)}`;
            } else if (mode === 'ph') {
                const ph = CalcEngine.validateNumber(document.getElementById('phValue').value);
                if (!ph.valid) throw new Error(ph.error);
                result = CalcEngine.chemistry.hFromPh(ph.value);
                label = '[H⁺]';
                unit = 'mol/L';
                formula = '[H⁺] = 10^(-pH)';
                steps = `[H⁺] = 10^(-${ph.value}) = ${CalcEngine.formatNumber(result)} mol/L`;
            } else {
                const ph = CalcEngine.validateNumber(document.getElementById('phValue2').value);
                if (!ph.valid) throw new Error(ph.error);
                result = CalcEngine.chemistry.pohFromPh(ph.value);
                label = 'pOH';
                unit = '';
                formula = 'pOH = 14 - pH';
                steps = `pOH = 14 - ${ph.value} = ${CalcEngine.formatNumber(result)}`;
            }
            
            this.clearErrors();
            this.displayResult('phResult', CalcEngine.formatNumber(result), unit, `
                <div class="result-section">
                    <div class="result-section-title">Formula</div>
                    <div class="formula-box">${formula}</div>
                </div>
                <div class="result-section">
                    <div class="result-section-title">Calculation</div>
                    <ul class="steps-list"><li class="step-eq">${steps}</li></ul>
                </div>
            `, 'ph-calculator');
        } catch(e) {
            this.showToast(e.message, 'error');
        }
    },

    calculateRsd() {
        const input = document.getElementById('rsdValues').value.trim();
        if (!input) { this.showToast('Please enter values', 'error'); return; }
        
        const values = input.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        if (values.length < 2) { this.showToast('Need at least 2 values', 'error'); return; }
        
        const mean = CalcEngine.statistics.mean(values);
        const sd = CalcEngine.lab.standardDeviation(values);
        const rsd = CalcEngine.lab.rsd(values);
        
        this.displayResult('rsdResult', CalcEngine.formatNumber(rsd), '% RSD', `
            <div class="result-section">
                <div class="result-section-title">Statistics</div>
                <ul class="steps-list">
                    <li>n = ${values.length}</li>
                    <li>Mean = ${CalcEngine.formatNumber(mean)}</li>
                    <li>SD = ${CalcEngine.formatNumber(sd)}</li>
                    <li class="step-eq">%RSD = (SD / Mean) × 100 = ${CalcEngine.formatNumber(rsd)}%</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">%RSD = (SD / x̄) × 100</div>
            </div>
        `, 'rsd');
    },

    calculateRecovery() {
        const spike = CalcEngine.validateNumber(document.getElementById('recSpike').value, { greaterThan: 0 });
        const measured = CalcEngine.validateNumber(document.getElementById('recMeasured').value, { greaterThan: 0 });
        
        if (!spike.valid) { this.showError('recSpike', spike.error); return; }
        if (!measured.valid) { this.showError('recMeasured', measured.error); return; }
        this.clearErrors();
        
        const rec = CalcEngine.lab.recovery(spike.value, measured.value);
        
        this.displayResult('recResult', CalcEngine.formatNumber(rec), '%', `
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>Spiked Amount = ${spike.value}</li>
                    <li>Measured Amount = ${measured.value}</li>
                    <li class="step-eq">% Recovery = (${measured.value} / ${spike.value}) × 100 = ${CalcEngine.formatNumber(rec)}%</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">% Recovery = (Measured / Spiked) × 100</div>
            </div>
        `, 'recovery');
    },

    calculateEmi() {
        const p = CalcEngine.validateNumber(document.getElementById('emiPrincipal').value, { greaterThan: 0 });
        const r = CalcEngine.validateNumber(document.getElementById('emiRate').value, { greaterThan: 0 });
        const y = CalcEngine.validateNumber(document.getElementById('emiYears').value, { greaterThan: 0 });
        
        if (!p.valid) { this.showError('emiPrincipal', p.error); return; }
        if (!r.valid) { this.showError('emiRate', r.error); return; }
        if (!y.valid) { this.showError('emiYears', y.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.banking.emi(p.value, r.value, y.value);
        
        this.displayResult('emiResult', CalcEngine.formatCurrency(result.emi), '/ month', `
            <div class="result-section">
                <div class="result-section-title">Loan Summary</div>
                <ul class="steps-list">
                    <li>Principal: ${CalcEngine.formatCurrency(result.principal)}</li>
                    <li>Total Interest: ${CalcEngine.formatCurrency(result.totalInterest)}</li>
                    <li>Total Payment: ${CalcEngine.formatCurrency(result.totalPayment)}</li>
                    <li>EMI × ${result.months} months</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">EMI = P × r × (1+r)ⁿ / [(1+r)ⁿ - 1]</div>
            </div>
        `, 'emi');
    },

    calculateSimpleInterest() {
        const p = CalcEngine.validateNumber(document.getElementById('siPrincipal').value, { greaterThan: 0 });
        const r = CalcEngine.validateNumber(document.getElementById('siRate').value, { greaterThan: 0 });
        const t = CalcEngine.validateNumber(document.getElementById('siTime').value, { greaterThan: 0 });
        
        if (!p.valid) { this.showError('siPrincipal', p.error); return; }
        if (!r.valid) { this.showError('siRate', r.error); return; }
        if (!t.valid) { this.showError('siTime', t.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.banking.simpleInterest(p.value, r.value, t.value);
        
        this.displayResult('siResult', CalcEngine.formatCurrency(result.amount), 'Total Amount', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>Principal: ${CalcEngine.formatCurrency(result.principal)}</li>
                    <li>Rate: ${result.rate}% p.a.</li>
                    <li>Time: ${result.time} years</li>
                    <li class="step-eq">Interest = ${CalcEngine.formatCurrency(result.interest)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">SI = (P × R × T) / 100<br>Amount = P + SI</div>
            </div>
        `, 'simple-interest');
    },

    calculateCompoundInterest() {
        const p = CalcEngine.validateNumber(document.getElementById('ciPrincipal').value, { greaterThan: 0 });
        const r = CalcEngine.validateNumber(document.getElementById('ciRate').value, { greaterThan: 0 });
        const t = CalcEngine.validateNumber(document.getElementById('ciTime').value, { greaterThan: 0 });
        const freq = parseInt(document.getElementById('ciFreq').value);
        
        if (!p.valid) { this.showError('ciPrincipal', p.error); return; }
        if (!r.valid) { this.showError('ciRate', r.error); return; }
        if (!t.valid) { this.showError('ciTime', t.error); return; }
        this.clearErrors();
        
        const result = CalcEngine.banking.compoundInterest(p.value, r.value, t.value, freq);
        
        this.displayResult('ciResult', CalcEngine.formatCurrency(result.amount), 'Total Amount', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>Principal: ${CalcEngine.formatCurrency(result.principal)}</li>
                    <li>Interest: ${CalcEngine.formatCurrency(result.interest)}</li>
                    <li class="step-eq">Amount = ${CalcEngine.formatCurrency(result.amount)}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula</div>
                <div class="formula-box">A = P(1 + r/n)^(nt)</div>
            </div>
        `, 'compound-interest');
    },

    calculateTimeDiff() {
        const start = document.getElementById('timeStart').value;
        const end = document.getElementById('timeEnd').value;
        
        if (!start || !end) { this.showToast('Please select both times', 'error'); return; }
        
        const [sh, sm, ss] = start.split(':').map(Number);
        const [eh, em, es] = end.split(':').map(Number);
        
        let startSec = sh * 3600 + sm * 60 + (ss || 0);
        let endSec = eh * 3600 + em * 60 + (es || 0);
        
        if (endSec < startSec) endSec += 86400; // next day
        
        const diff = endSec - startSec;
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        const decimalHours = diff / 3600;
        
        this.displayResult('timeResult', `${hours}h ${minutes}m ${seconds}s`, 'Duration', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>Start: ${start}</li>
                    <li>End: ${end}</li>
                    <li class="step-eq">Total: ${hours} hours, ${minutes} minutes, ${seconds} seconds</li>
                    <li>Decimal Hours: ${CalcEngine.formatNumber(decimalHours)}</li>
                </ul>
            </div>
        `, 'time-difference');
    },

    calculateDateDiff() {
        const start = document.getElementById('dateStart').value;
        const end = document.getElementById('dateEnd').value;
        
        if (!start || !end) { this.showToast('Please select both dates', 'error'); return; }
        
        const days = CalcEngine.time.daysBetween(start, end);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30.44);
        const years = Math.floor(days / 365.25);
        
        this.displayResult('dateResult', `${days} days`, 'Difference', `
            <div class="result-section">
                <div class="result-section-title">Breakdown</div>
                <ul class="steps-list">
                    <li>From: ${new Date(start).toLocaleDateString()}</li>
                    <li>To: ${new Date(end).toLocaleDateString()}</li>
                    <li class="step-eq">≈ ${years} years / ${months} months / ${weeks} weeks</li>
                </ul>
            </div>
        `, 'date-difference');
    },

    calculateAge() {
        const dob = document.getElementById('ageDob').value;
        if (!dob) { this.showToast('Please enter date of birth', 'error'); return; }
        
        const age = CalcEngine.time.age(dob);
        
        this.displayResult('ageResult', `${age.years} years`, 'Age', `
            <div class="result-section">
                <div class="result-section-title">Detailed Age</div>
                <ul class="steps-list">
                    <li class="step-eq">${age.years} years, ${age.months} months, ${age.days} days</li>
                </ul>
            </div>
        `, 'age-calculator');
    },

    calculateStats() {
        const input = document.getElementById('statsValues').value.trim();
        if (!input) { this.showToast('Please enter values', 'error'); return; }
        
        const values = input.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        if (values.length === 0) { this.showToast('No valid numbers found', 'error'); return; }
        
        const mean = CalcEngine.statistics.mean(values);
        const median = CalcEngine.statistics.median(values);
        const mode = CalcEngine.statistics.mode(values);
        const variance = CalcEngine.statistics.variance(values);
        const sd = CalcEngine.statistics.stdDev(values);
        const cv = CalcEngine.statistics.cv(values);
        const range = Math.max(...values) - Math.min(...values);
        
        this.displayResult('statsResult', CalcEngine.formatNumber(mean), 'Mean', `
            <div class="result-section">
                <div class="result-section-title">Descriptive Statistics</div>
                <ul class="steps-list">
                    <li>Count (n): ${values.length}</li>
                    <li>Sum: ${CalcEngine.formatNumber(values.reduce((a,b)=>a+b,0))}</li>
                    <li>Min: ${CalcEngine.formatNumber(Math.min(...values))}</li>
                    <li>Max: ${CalcEngine.formatNumber(Math.max(...values))}</li>
                    <li>Range: ${CalcEngine.formatNumber(range)}</li>
                    <li class="step-eq">Mean: ${CalcEngine.formatNumber(mean)}</li>
                    <li>Median: ${CalcEngine.formatNumber(median)}</li>
                    <li>Mode: ${mode.map(m => CalcEngine.formatNumber(m)).join(', ')}</li>
                    <li>Variance: ${CalcEngine.formatNumber(variance)}</li>
                    <li>SD: ${CalcEngine.formatNumber(sd)}</li>
                    <li>CV: ${CalcEngine.formatNumber(cv)}%</li>
                </ul>
            </div>
        `, 'descriptive-stats');
    },

    calculateBmi() {
        const w = CalcEngine.validateNumber(document.getElementById('bmiWeight').value, { greaterThan: 0 });
        const h = CalcEngine.validateNumber(document.getElementById('bmiHeight').value, { greaterThan: 0 });
        
        if (!w.valid) { this.showError('bmiWeight', w.error); return; }
        if (!h.valid) { this.showError('bmiHeight', h.error); return; }
        this.clearErrors();
        
        const heightM = h.value / 100;
        const bmi = CalcEngine.nutrition.bmi(w.value, heightM);
        const category = CalcEngine.nutrition.bmiCategory(bmi);
        
        this.displayResult('bmiResult', CalcEngine.formatNumber(bmi), 'kg/m²', `
            <div class="result-section">
                <div class="result-section-title">Category</div>
                <ul class="steps-list">
                    <li>Weight: ${w.value} kg</li>
                    <li>Height: ${h.value} cm = ${heightM} m</li>
                    <li class="step-eq">BMI = ${w.value} / (${heightM})² = ${CalcEngine.formatNumber(bmi)}</li>
                    <li style="color: var(--primary); font-weight: 600;">Category: ${category}</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">BMI Categories</div>
                <ul class="steps-list">
                    <li>Underweight: &lt; 18.5</li>
                    <li>Normal: 18.5 - 24.9</li>
                    <li>Overweight: 25 - 29.9</li>
                    <li>Obese: ≥ 30</li>
                </ul>
            </div>
        `, 'bmi');
    },

    calculateBmr() {
        const w = CalcEngine.validateNumber(document.getElementById('bmrWeight').value, { greaterThan: 0 });
        const h = CalcEngine.validateNumber(document.getElementById('bmrHeight').value, { greaterThan: 0 });
        const a = CalcEngine.validateNumber(document.getElementById('bmrAge').value, { greaterThan: 0 });
        const g = document.getElementById('bmrGender').value;
        
        if (!w.valid) { this.showError('bmrWeight', w.error); return; }
        if (!h.valid) { this.showError('bmrHeight', h.error); return; }
        if (!a.valid) { this.showError('bmrAge', a.error); return; }
        this.clearErrors();
        
        const bmr = CalcEngine.nutrition.bmr(w.value, h.value, a.value, g);
        
        this.displayResult('bmrResult', CalcEngine.formatNumber(bmr), 'kcal/day', `
            <div class="result-section">
                <div class="result-section-title">Calculation</div>
                <ul class="steps-list">
                    <li>Gender: ${g === 'male' ? 'Male' : 'Female'}</li>
                    <li>Weight: ${w.value} kg, Height: ${h.value} cm, Age: ${a.value}</li>
                    <li class="step-eq">BMR = ${CalcEngine.formatNumber(bmr)} kcal/day</li>
                </ul>
            </div>
            <div class="result-section">
                <div class="result-section-title">Formula (Mifflin-St Jeor)</div>
                <div class="formula-box">${g === 'male' ? 'BMR = 10W + 6.25H - 5A + 5' : 'BMR = 10W + 6.25H - 5A - 161'}</div>
            </div>
        `, 'bmr');
    },

    // ==================== SCIENTIFIC CALCULATOR ====================

    renderScientificCalculator() {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="calculator-view">
                <div class="calc-header">
                    <div class="calc-header-info">
                        <h2>Scientific Calculator</h2>
                        <span class="calc-category">Scientific</span>
                    </div>
                </div>
                <div class="scientific-calc">
                    <div class="scientific-mode">
                        <button class="mode-btn ${this.scientificMode === 'deg' ? 'active' : ''}" onclick="GRApp.setScientificMode('deg')">DEG</button>
                        <button class="mode-btn ${this.scientificMode === 'rad' ? 'active' : ''}" onclick="GRApp.setScientificMode('rad')">RAD</button>
                    </div>
                    <div class="scientific-display">
                        <div class="display-expr" id="sciExpr">${this.scientificExpr}</div>
                        <div class="display-result" id="sciResult">${this.scientificResult}</div>
                    </div>
                    <div class="scientific-pad">
                        <button class="fn" onclick="GRApp.sciInput('sin')">sin</button>
                        <button class="fn" onclick="GRApp.sciInput('cos')">cos</button>
                        <button class="fn" onclick="GRApp.sciInput('tan')">tan</button>
                        <button class="fn" onclick="GRApp.sciInput('log')">log</button>
                        
                        <button class="fn" onclick="GRApp.sciInput('asin')">sin⁻¹</button>
                        <button class="fn" onclick="GRApp.sciInput('acos')">cos⁻¹</button>
                        <button class="fn" onclick="GRApp.sciInput('atan')">tan⁻¹</button>
                        <button class="fn" onclick="GRApp.sciInput('ln')">ln</button>
                        
                        <button class="fn" onclick="GRApp.sciInput('sinh')">sinh</button>
                        <button class="fn" onclick="GRApp.sciInput('cosh')">cosh</button>
                        <button class="fn" onclick="GRApp.sciInput('tanh')">tanh</button>
                        <button class="fn" onclick="GRApp.sciInput('sqrt')">√</button>
                        
                        <button class="fn" onclick="GRApp.sciInput('pi')">π</button>
                        <button class="fn" onclick="GRApp.sciInput('e')">e</button>
                        <button class="fn" onclick="GRApp.sciInput('pow')">xʸ</button>
                        <button class="fn" onclick="GRApp.sciInput('cbrt')">∛</button>
                        
                        <button onclick="GRApp.sciInput('7')">7</button>
                        <button onclick="GRApp.sciInput('8')">8</button>
                        <button onclick="GRApp.sciInput('9')">9</button>
                        <button class="op" onclick="GRApp.sciInput('C')">C</button>
                        
                        <button onclick="GRApp.sciInput('4')">4</button>
                        <button onclick="GRApp.sciInput('5')">5</button>
                        <button onclick="GRApp.sciInput('6')">6</button>
                        <button class="op" onclick="GRApp.sciInput('/')">÷</button>
                        
                        <button onclick="GRApp.sciInput('1')">1</button>
                        <button onclick="GRApp.sciInput('2')">2</button>
                        <button onclick="GRApp.sciInput('3')">3</button>
                        <button class="op" onclick="GRApp.sciInput('*')">×</button>
                        
                        <button onclick="GRApp.sciInput('0')">0</button>
                        <button onclick="GRApp.sciInput('.')">.</button>
                        <button onclick="GRApp.sciInput('(')">(</button>
                        <button class="op" onclick="GRApp.sciInput('-')">−</button>
                        
                        <button onclick="GRApp.sciInput(')')">)</button>
                        <button class="op wide" onclick="GRApp.sciInput('=')">=</button>
                        <button class="op" onclick="GRApp.sciInput('+')">+</button>
                    </div>
                    <div style="margin-top: 1rem; text-align: center;">
                        <button class="btn btn-secondary btn-sm" onclick="GRApp.sciInput('AC')">All Clear</button>
                        <button class="btn btn-secondary btn-sm" onclick="GRApp.sciInput('back')">← Backspace</button>
                    </div>
                </div>
            </div>
        `;
    },

    setScientificMode(mode) {
        this.scientificMode = mode;
        this.renderScientificCalculator();
    },

    sciInput(key) {
        if (key === 'AC') {
            this.scientificExpr = '';
            this.scientificResult = '0';
        } else if (key === 'C') {
            this.scientificExpr = '';
            this.scientificResult = '0';
        } else if (key === 'back') {
            this.scientificExpr = this.scientificExpr.slice(0, -1);
        } else if (key === '=') {
            this.evaluateScientific();
        } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'sqrt', 'cbrt'].includes(key)) {
            this.scientificExpr += key + '(';
        } else if (key === 'pi') {
            this.scientificExpr += 'pi';
        } else if (key === 'e') {
            this.scientificExpr += 'e';
        } else if (key === 'pow') {
            this.scientificExpr += '^';
        } else {
            this.scientificExpr += key;
        }
        
        document.getElementById('sciExpr').textContent = this.scientificExpr || ' ';
        if (key !== '=') document.getElementById('sciResult').textContent = this.scientificResult;
    },

    evaluateScientific() {
        try {
            let expr = this.scientificExpr
                .replace(/pi/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/\^/g, '**')
                .replace(/sin\(/g, `CalcEngine.scientific.sin(`)
                .replace(/cos\(/g, `CalcEngine.scientific.cos(`)
                .replace(/tan\(/g, `CalcEngine.scientific.tan(`)
                .replace(/asin\(/g, `CalcEngine.scientific.asin(`)
                .replace(/acos\(/g, `CalcEngine.scientific.acos(`)
                .replace(/atan\(/g, `CalcEngine.scientific.atan(`)
                .replace(/sinh\(/g, `CalcEngine.scientific.sinh(`)
                .replace(/cosh\(/g, `CalcEngine.scientific.cosh(`)
                .replace(/tanh\(/g, `CalcEngine.scientific.tanh(`)
                .replace(/log\(/g, `CalcEngine.scientific.log(`)
                .replace(/ln\(/g, `CalcEngine.scientific.ln(`)
                .replace(/sqrt\(/g, `Math.sqrt(`)
                .replace(/cbrt\(/g, `CalcEngine.scientific.cbrt(`);
            
            // Append mode for trig functions
            if (this.scientificMode === 'deg') {
                expr = expr.replace(/CalcEngine.scientific\.(sin|cos|tan|asin|acos|atan)\(/g, `CalcEngine.scientific.$1(`);
                // We need to inject mode - simpler approach: wrap arguments
                // Actually, let's use a safer parser
            }
            
            // Safer: replace trig calls with mode injection
            const mode = this.scientificMode;
            expr = expr.replace(/CalcEngine\.scientific\.(sin|cos|tan)\(([^)]+)\)/g, `CalcEngine.scientific.$1($2,'${mode}')`);
            expr = expr.replace(/CalcEngine\.scientific\.(asin|acos|atan)\(([^)]+)\)/g, `CalcEngine.scientific.$1($2,'${mode}')`);
            
            // eslint-disable-next-line no-new-func
            const result = new Function('CalcEngine', 'Math', `"use strict"; return (${expr})`)(CalcEngine, Math);
            
            this.scientificResult = CalcEngine.formatNumber(result);
            document.getElementById('sciResult').textContent = this.scientificResult;
            
            this.addToHistory('scientific-calculator', 'Scientific Calculator', this.scientificExpr + ' = ' + this.scientificResult, this.scientificResult, 'scientific');
        } catch (e) {
            this.scientificResult = 'Error';
            document.getElementById('sciResult').textContent = 'Error';
        }
    },

    // ==================== UNIT CONVERTER ====================

    renderUnitConverter() {
        const content = document.getElementById('contentArea');
        const categories = Object.keys(CalculatorData.units);
        
        content.innerHTML = `
            <div class="calculator-view">
                <div class="calc-header">
                    <div class="calc-header-info">
                        <h2>Universal Unit Converter</h2>
                        <span class="calc-category">Utilities</span>
                    </div>
                </div>
                <div class="converter-categories" id="converterCats">
                    ${categories.map(cat => `<button class="cat-btn ${cat === 'length' ? 'active' : ''}" onclick="GRApp.setConverterCategory('${cat}')">${this.capitalize(cat)}</button>`).join('')}
                </div>
                <div class="calc-panel">
                    <div class="converter-grid">
                        <div class="input-group">
                            <label>From</label>
                            <div class="input-wrapper">
                                <input type="number" id="convFromValue" placeholder="Enter value" step="any" oninput="GRApp.performConversion()">
                                <select id="convFromUnit" onchange="GRApp.performConversion()"></select>
                            </div>
                        </div>
                        <button class="converter-swap" onclick="GRApp.swapUnits()" title="Swap units">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                        </button>
                        <div class="input-group">
                            <label>To</label>
                            <div class="input-wrapper">
                                <input type="number" id="convToValue" placeholder="Result" step="any" readonly>
                                <select id="convToUnit" onchange="GRApp.performConversion()"></select>
                            </div>
                        </div>
                    </div>
                    <div id="convFormula" style="color: var(--text-secondary); font-size: 0.9rem;"></div>
                </div>
            </div>
        `;
        
        this.currentConvCategory = 'length';
        this.updateConverterUnits();
    },

    setConverterCategory(cat) {
        this.currentConvCategory = cat;
        document.querySelectorAll('.converter-categories .cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === cat.toLowerCase() || 
                (cat === 'temperature' && btn.textContent === 'Temperature'));
        });
        this.updateConverterUnits();
    },

    updateConverterUnits() {
        const units = CalculatorData.units[this.currentConvCategory];
        const fromSel = document.getElementById('convFromUnit');
        const toSel = document.getElementById('convToUnit');
        
        const opts = Object.entries(units).map(([key, u]) => `<option value="${key}">${key} - ${u.name}</option>`).join('');
        fromSel.innerHTML = opts;
        toSel.innerHTML = opts;
        
        if (toSel.options[1]) toSel.selectedIndex = 1;
        this.performConversion();
    },

    performConversion() {
        const val = parseFloat(document.getElementById('convFromValue').value);
        const from = document.getElementById('convFromUnit').value;
        const to = document.getElementById('convToUnit').value;
        
        if (isNaN(val)) {
            document.getElementById('convToValue').value = '';
            return;
        }
        
        const result = CalcEngine.convertUnit(val, from, to, this.currentConvCategory);
        document.getElementById('convToValue').value = CalcEngine.formatNumber(result);
        
        const fromName = CalculatorData.units[this.currentConvCategory][from].name;
        const toName = CalculatorData.units[this.currentConvCategory][to].name;
        document.getElementById('convFormula').innerHTML = `
            <strong>${val} ${fromName}</strong> = <strong>${CalcEngine.formatNumber(result)} ${toName}</strong>
        `;
    },

    swapUnits() {
        const from = document.getElementById('convFromUnit');
        const to = document.getElementById('convToUnit');
        const temp = from.value;
        from.value = to.value;
        to.value = temp;
        this.performConversion();
    },

    // ==================== FAVORITES ====================

    renderFavorites() {
        const content = document.getElementById('contentArea');
        const favCalcs = CalculatorData.calculators.filter(c => this.favorites.has(c.id));
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h2>Favorites</h2>
                <p>${favCalcs.length} saved calculator${favCalcs.length !== 1 ? 's' : ''}</p>
            </div>
            ${favCalcs.length === 0 ? `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <h3>No favorites yet</h3>
                    <p>Click the star icon on any calculator to add it here.</p>
                </div>
            ` : `<div class="quick-calc-grid">${favCalcs.map(c => this.renderCalcCard(c.id, c.name, c.keywords.slice(0,3).join(', '), this.getCategoryIcon(c.category))).join('')}</div>`}
        `;
    },

    // ==================== HISTORY ====================

    renderHistory() {
        const content = document.getElementById('contentArea');
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h2>Calculation History</h2>
                <p>${this.history.length} calculation${this.history.length !== 1 ? 's' : ''}</p>
                ${this.history.length > 0 ? `<button class="btn btn-secondary btn-sm" onclick="GRApp.clearHistory()">Clear All</button>` : ''}
            </div>
            ${this.history.length === 0 ? `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    <h3>No history yet</h3>
                    <p>Your recent calculations will appear here.</p>
                </div>
            ` : `<div class="recent-list">${this.history.slice().reverse().map(h => `
                <div class="recent-item" onclick="GRApp.navigateTo('${h.category}', '${h.calculatorId}')">
                    <div class="recent-info">
                        <span class="recent-name">${h.calculatorName}</span>
                        <span class="recent-meta">${new Date(h.date).toLocaleString()}</span>
                    </div>
                    <span class="recent-result">${h.result}</span>
                </div>
            `).join('')}</div>`}
        `;
    },

    clearHistory() {
        if (confirm('Clear all calculation history?')) {
            this.history = [];
            this.saveStorage();
            this.renderHistory();
            this.showToast('History cleared', 'success');
        }
    },

    // ==================== SETTINGS ====================

    renderSettings() {
        const content = document.getElementById('contentArea');
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h2>Settings</h2>
                <p>Customize your calculator experience</p>
            </div>
            <div class="settings-grid">
                <div class="settings-card">
                    <h3>Appearance</h3>
                    <div class="setting-item">
                        <label>Theme</label>
                        <select id="setTheme" onchange="GRApp.updateSetting('theme', this.value)">
                            <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="system" ${this.settings.theme === 'system' ? 'selected' : ''}>System</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-card">
                    <h3>Number Format</h3>
                    <div class="setting-item">
                        <label>Decimal Precision</label>
                        <select id="setPrecision" onchange="GRApp.updateSetting('precision', parseInt(this.value))">
                            <option value="2" ${this.settings.precision === 2 ? 'selected' : ''}>2 decimal places</option>
                            <option value="3" ${this.settings.precision === 3 ? 'selected' : ''}>3 decimal places</option>
                            <option value="4" ${this.settings.precision === 4 ? 'selected' : ''}>4 decimal places</option>
                            <option value="6" ${this.settings.precision === 6 ? 'selected' : ''}>6 decimal places</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Notation</label>
                        <select id="setNotation" onchange="GRApp.updateSetting('notation', this.value)">
                            <option value="standard" ${this.settings.notation === 'standard' ? 'selected' : ''}>Standard</option>
                            <option value="scientific" ${this.settings.notation === 'scientific' ? 'selected' : ''}>Scientific</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-card">
                    <h3>Time & Date</h3>
                    <div class="setting-item">
                        <label>Time Format</label>
                        <select id="setTimeFormat" onchange="GRApp.updateSetting('timeFormat', this.value)">
                            <option value="12h" ${this.settings.timeFormat === '12h' ? 'selected' : ''}>12-hour</option>
                            <option value="24h" ${this.settings.timeFormat === '24h' ? 'selected' : ''}>24-hour</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-card">
                    <h3>Data</h3>
                    <div class="setting-item">
                        <label>Calculation History</label>
                        <button class="btn btn-secondary btn-sm" onclick="GRApp.clearHistory()">Clear History</button>
                    </div>
                    <div class="setting-item">
                        <label>Favorites</label>
                        <button class="btn btn-secondary btn-sm" onclick="GRApp.clearFavorites()">Clear Favorites</button>
                    </div>
                    <div class="setting-item">
                        <label>Reset All</label>
                        <button class="btn btn-secondary btn-sm" onclick="GRApp.resetAll()">Reset to Defaults</button>
                    </div>
                </div>
            </div>
        `;
    },

    updateSetting(key, value) {
        this.settings[key] = value;
        CalcEngine.settings[key] = value;
        this.saveStorage();
        
        if (key === 'theme') this.applyTheme();
        this.showToast('Setting saved', 'success');
    },

    clearFavorites() {
        if (confirm('Remove all favorites?')) {
            this.favorites.clear();
            this.saveStorage();
            this.showToast('Favorites cleared', 'success');
            if (this.currentCategory === 'favorites') this.renderFavorites();
        }
    },

    resetAll() {
        if (confirm('Reset all settings and data to defaults?')) {
            this.settings = { ...CalcEngine.settings };
            this.favorites.clear();
            this.history = [];
            this.saveStorage();
            this.applyTheme();
            this.showToast('All settings reset', 'success');
            this.renderSettings();
        }
    },

    // ==================== FORMULA LIBRARY ====================

    renderFormulaLibrary() {
        const content = document.getElementById('contentArea');
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h2>Formula Library</h2>
                <p>${CalculatorData.formulas.length} formulas available</p>
            </div>
            <div class="quick-calc-grid">
                ${CalculatorData.formulas.map(f => `
                    <div class="calc-card" onclick="GRApp.navigateTo('${f.category}', '${f.calculatorId}')">
                        <div class="calc-card-header">
                            <div class="calc-card-icon" style="font-size: 1.2rem;">∑</div>
                        </div>
                        <h3>${f.name}</h3>
                        <p style="font-family: var(--font-mono); color: var(--primary); font-weight: 600;">${f.formula}</p>
                        <p style="margin-top: 0.5rem;">${Object.entries(f.variables).map(([k,v]) => `${k}=${v}`).join(', ')}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ==================== ABOUT ====================

    renderAbout() {
        const content = document.getElementById('contentArea');
        
        content.innerHTML = `
            <div class="dashboard-header">
                <h2>About</h2>
                <p>GR All-in-One Calculation Toolkit</p>
            </div>
            <div class="calc-panel" style="max-width: 700px;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="brand-icon" style="width: 64px; height: 64px; font-size: 1.75rem; margin: 0 auto 1rem;">GR</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">ALL-IN-ONE CALCULATION TOOLKIT</h3>
                    <p style="color: var(--text-muted);">Scientific • Engineering • Laboratory • Chemistry • Physics • Finance • Time • Units</p>
                </div>
                <div style="line-height: 1.8; color: var(--text-secondary);">
                    <p><strong>Version:</strong> Phase 1</p>
                    <p><strong>Features:</strong> ${CalculatorData.calculators.length} calculators across 13 categories</p>
                    <p><strong>Storage:</strong> All data stored locally in your browser</p>
                    <p><strong>Offline:</strong> Install as PWA for offline use</p>
                    <p style="margin-top: 1rem;"><strong>Disclaimer:</strong> Calculations are provided for reference. Verify critical engineering and laboratory calculations against applicable standards.</p>
                </div>
            </div>
        `;
    },

    // ==================== UTILITY METHODS ====================

    displayResult(containerId, mainValue, unit, html, calculatorId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="result-main">
                <div class="result-main-label">Result</div>
                <div class="result-main-value">${mainValue}</div>
                <div class="result-main-unit">${unit}</div>
            </div>
            ${html}
            <div class="calc-buttons" style="margin-top: 1rem;">
                <button class="btn btn-success btn-sm" onclick="GRApp.copyResult('${mainValue} ${unit}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy Result
                </button>
            </div>
        `;
        
        this.addToHistory(calculatorId, CalculatorData.calculators.find(c => c.id === calculatorId)?.name || 'Calculator', '', mainValue + ' ' + unit, CalculatorData.calculators.find(c => c.id === calculatorId)?.category || 'general');
    },

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        // Remove existing error
        const existing = input.parentElement.parentElement.querySelector('.input-error');
        if (existing) existing.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error visible';
        errorDiv.textContent = message;
        input.parentElement.parentElement.appendChild(errorDiv);
        input.style.borderColor = 'var(--danger)';
    },

    clearErrors() {
        document.querySelectorAll('.input-error').forEach(e => e.remove());
        document.querySelectorAll('input, select, textarea').forEach(i => i.style.borderColor = '');
    },

    resetForm() {
        this.clearErrors();
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(i => {
            if (i.type === 'select-one') i.selectedIndex = 0;
            else if (i.type !== 'button') i.value = '';
        });
        
        // Clear result areas
        document.querySelectorAll('[id$="Result"]').forEach(r => {
            if (r.id !== 'searchResults') r.innerHTML = '';
        });
    },

    toggleFavorite(id) {
        if (this.favorites.has(id)) {
            this.favorites.delete(id);
            this.showToast('Removed from favorites', 'success');
        } else {
            this.favorites.add(id);
            this.showToast('Added to favorites', 'success');
        }
        this.saveStorage();
        
        // Update UI if in favorites view
        if (this.currentCategory === 'favorites') this.renderFavorites();
        else if (this.currentCalculator === id) this.renderCalculator(id);
        else {
            // Update any visible fav buttons
            document.querySelectorAll(`.calc-card-fav[onclick*="${id}"]`).forEach(btn => {
                const isFav = this.favorites.has(id);
                btn.classList.toggle('active', isFav);
                btn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
            });
        }
    },

    addToHistory(calculatorId, name, inputs, result, category) {
        this.history.push({
            calculatorId,
            calculatorName: name,
            inputs,
            result,
            category,
            date: new Date().toISOString()
        });
        
        if (this.history.length > 100) this.history.shift();
        this.saveStorage();
        this.updateStats();
    },

    printCalculator() {
        window.print();
    },

    performSearch(query) {
        const results = CalculatorData.calculators.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.category.toLowerCase().includes(query) ||
            c.keywords.some(k => k.toLowerCase().includes(query))
        );
        
        const container = document.getElementById('searchResults');
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item"><div class="search-result-name">No results found</div></div>';
        } else {
            container.innerHTML = results.slice(0, 8).map(r => `
                <div class="search-result-item" onclick="GRApp.selectSearchResult('${r.category}', '${r.id}')">
                    <div class="search-result-name">${r.name}</div>
                    <div class="search-result-category">${CalculatorData.categories.find(c => c.id === r.category)?.name || r.category}</div>
                </div>
            `).join('');
        }
        container.classList.add('active');
    },

    selectSearchResult(category, id) {
        document.getElementById('globalSearch').value = '';
        document.getElementById('searchResults').classList.remove('active');
        this.navigateTo(category, id);
    },

    filterSidebar(query) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const text = link.textContent.toLowerCase();
            link.style.display = text.includes(query) ? 'flex' : 'none';
        });
    },

    toggleTheme() {
        const themes = ['light', 'dark', 'system'];
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = themes[(themes.indexOf(current) + 1) % themes.length];
        this.settings.theme = next;
        this.applyTheme();
        this.saveStorage();
    },

    applyTheme() {
        let theme = this.settings.theme;
        if (theme === 'system') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
        
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.querySelector('.theme-text').textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    copyResult(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Result copied to clipboard', 'success');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast('Result copied to clipboard', 'success');
        });
    },

    getCategoryIcon(category) {
        const icons = {
            scientific: '∑', mathematics: '∫', general: '#', civil: '🏗',
            structural: '▣', chemistry: '⚗', laboratory: '🔬', banking: '₹',
            time: '⏱', statistics: '📊', nutrition: '⚖', 'unit-converter': '⇄'
        };
        return icons[category] || '●';
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    updateStats() {
        // Updates dashboard stats if visible
        if (this.currentCategory === 'dashboard') this.renderDashboard();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GRApp.init();
});

// Make global for inline handlers
window.GRApp = GRApp;