/**
 * GR All-in-One Calculation Toolkit
 * Calculator Registry & Data
 * Phase 1
 */

const CalculatorData = {
    categories: [
        { id: 'dashboard', name: 'Dashboard', icon: 'grid' },
        { id: 'scientific', name: 'Scientific', icon: 'book' },
        { id: 'mathematics', name: 'Mathematics', icon: 'bar-chart' },
        { id: 'general', name: 'General', icon: 'square' },
        { id: 'civil', name: 'Civil Engineering', icon: 'home' },
        { id: 'structural', name: 'Structural', icon: 'layout' },
        { id: 'chemistry', name: 'Chemistry', icon: 'flask' },
        { id: 'laboratory', name: 'Laboratory', icon: 'grid' },
        { id: 'unit-converter', name: 'Unit Converter', icon: 'refresh-cw' },
        { id: 'banking', name: 'Banking & Finance', icon: 'dollar-sign' },
        { id: 'time', name: 'Time & Date', icon: 'clock' },
        { id: 'statistics', name: 'Statistics', icon: 'bar-chart' },
        { id: 'nutrition', name: 'Nutrition', icon: 'heart' }
    ],

    units: {
        length: {
            m: { name: 'Meter', factor: 1 },
            km: { name: 'Kilometer', factor: 1000 },
            cm: { name: 'Centimeter', factor: 0.01 },
            mm: { name: 'Millimeter', factor: 0.001 },
            in: { name: 'Inch', factor: 0.0254 },
            ft: { name: 'Foot', factor: 0.3048 },
            yd: { name: 'Yard', factor: 0.9144 },
            mi: { name: 'Mile', factor: 1609.344 }
        },
        area: {
            'm²': { name: 'Square Meter', factor: 1 },
            'km²': { name: 'Square Kilometer', factor: 1000000 },
            'cm²': { name: 'Square Centimeter', factor: 0.0001 },
            'mm²': { name: 'Square Millimeter', factor: 0.000001 },
            'ft²': { name: 'Square Foot', factor: 0.092903 },
            'ac': { name: 'Acre', factor: 4046.86 },
            'ha': { name: 'Hectare', factor: 10000 }
        },
        volume: {
            'm³': { name: 'Cubic Meter', factor: 1 },
            'L': { name: 'Liter', factor: 0.001 },
            'mL': { name: 'Milliliter', factor: 0.000001 },
            'ft³': { name: 'Cubic Foot', factor: 0.0283168 },
            'gal': { name: 'Gallon (US)', factor: 0.00378541 }
        },
        mass: {
            kg: { name: 'Kilogram', factor: 1 },
            g: { name: 'Gram', factor: 0.001 },
            mg: { name: 'Milligram', factor: 0.000001 },
            t: { name: 'Metric Ton', factor: 1000 },
            lb: { name: 'Pound', factor: 0.453592 },
            oz: { name: 'Ounce', factor: 0.0283495 }
        },
        pressure: {
            Pa: { name: 'Pascal', factor: 1 },
            kPa: { name: 'Kilopascal', factor: 1000 },
            MPa: { name: 'Megapascal', factor: 1000000 },
            bar: { name: 'Bar', factor: 100000 },
            psi: { name: 'PSI', factor: 6894.76 },
            atm: { name: 'Atmosphere', factor: 101325 }
        },
        force: {
            N: { name: 'Newton', factor: 1 },
            kN: { name: 'Kilonewton', factor: 1000 },
            kgf: { name: 'Kilogram-force', factor: 9.80665 },
            lbf: { name: 'Pound-force', factor: 4.44822 }
        },
        temperature: {
            C: { name: 'Celsius' },
            F: { name: 'Fahrenheit' },
            K: { name: 'Kelvin' }
        },
        energy: {
            J: { name: 'Joule', factor: 1 },
            kJ: { name: 'Kilojoule', factor: 1000 },
            cal: { name: 'Calorie', factor: 4.184 },
            kcal: { name: 'Kilocalorie', factor: 4184 },
            Wh: { name: 'Watt-hour', factor: 3600 },
            kWh: { name: 'Kilowatt-hour', factor: 3600000 }
        },
        power: {
            W: { name: 'Watt', factor: 1 },
            kW: { name: 'Kilowatt', factor: 1000 },
            hp: { name: 'Horsepower', factor: 745.7 }
        },
        time: {
            s: { name: 'Second', factor: 1 },
            min: { name: 'Minute', factor: 60 },
            h: { name: 'Hour', factor: 3600 },
            d: { name: 'Day', factor: 86400 },
            wk: { name: 'Week', factor: 604800 },
            mo: { name: 'Month', factor: 2592000 },
            y: { name: 'Year', factor: 31536000 }
        },
        speed: {
            'm/s': { name: 'Meter/second', factor: 1 },
            'km/h': { name: 'Kilometer/hour', factor: 0.277778 },
            mph: { name: 'Mile/hour', factor: 0.44704 },
            kn: { name: 'Knot', factor: 0.514444 }
        },
        density: {
            'kg/m³': { name: 'kg/m³', factor: 1 },
            'g/cm³': { name: 'g/cm³', factor: 1000 },
            'lb/ft³': { name: 'lb/ft³', factor: 16.0185 }
        },
        concentration: {
            'mg/L': { name: 'mg/L', factor: 1 },
            'µg/L': { name: 'µg/L', factor: 0.001 },
            ppm: { name: 'ppm', factor: 1 },
            ppb: { name: 'ppb', factor: 0.001 },
            'meq/L': { name: 'meq/L', factor: 1 }
        }
    },

    calculators: [
        // Scientific
        { id: 'scientific-calculator', name: 'Scientific Calculator', category: 'scientific', keywords: ['scientific', 'calculator', 'math', 'sin', 'cos', 'log'], hasView: true },
        { id: 'percentage', name: 'Percentage Calculator', category: 'general', keywords: ['percentage', 'percent', '%', 'ratio'], hasView: true },
        { id: 'ratio-proportion', name: 'Ratio & Proportion', category: 'general', keywords: ['ratio', 'proportion', 'compare'], hasView: true },
        
        // Mathematics
        { id: 'area-geometry', name: 'Area Calculator', category: 'mathematics', keywords: ['area', 'square', 'rectangle', 'circle', 'triangle'], hasView: true },
        { id: 'volume-geometry', name: 'Volume Calculator', category: 'mathematics', keywords: ['volume', 'cube', 'sphere', 'cylinder', 'cone'], hasView: true },
        { id: 'coordinate-geometry', name: 'Coordinate Geometry', category: 'mathematics', keywords: ['coordinate', 'distance', 'midpoint', 'slope'], hasView: true },
        { id: 'quadratic', name: 'Quadratic Equation', category: 'mathematics', keywords: ['quadratic', 'equation', 'roots', 'x²'], hasView: true },
        
        // General
        { id: 'average', name: 'Average Calculator', category: 'general', keywords: ['average', 'mean', 'arithmetic'], hasView: true },
        { id: 'discount', name: 'Discount Calculator', category: 'general', keywords: ['discount', 'sale', 'price', 'percent off'], hasView: true },
        { id: 'profit-loss', name: 'Profit & Loss', category: 'general', keywords: ['profit', 'loss', 'margin', 'cost', 'selling'], hasView: true },
        { id: 'gst', name: 'GST Calculator', category: 'general', keywords: ['gst', 'tax', 'vat', 'goods'], hasView: true },
        { id: 'number-converter', name: 'Number Base Converter', category: 'general', keywords: ['binary', 'decimal', 'hexadecimal', 'base', 'convert'], hasView: true },
        
        // Civil
        { id: 'concrete-volume', name: 'Concrete Volume', category: 'civil', keywords: ['concrete', 'volume', 'cement', 'construction'], hasView: true },
        { id: 'brickwork', name: 'Brickwork Calculator', category: 'civil', keywords: ['brick', 'mortar', 'wall', 'construction'], hasView: true },
        { id: 'steel-weight', name: 'Steel Weight', category: 'civil', keywords: ['steel', 'rebar', 'weight', 'bar', 'rod'], hasView: true },
        
        // Structural
        { id: 'stress-strain', name: 'Stress & Strain', category: 'structural', keywords: ['stress', 'strain', 'force', 'area', 'deformation'], hasView: true },
        { id: 'youngs-modulus', name: "Young's Modulus", category: 'structural', keywords: ['young', 'modulus', 'elasticity', 'stress', 'strain'], hasView: true },
        
        // Chemistry
        { id: 'molarity', name: 'Molarity Calculator', category: 'chemistry', keywords: ['molarity', 'moles', 'concentration', 'solution'], hasView: true },
        { id: 'dilution', name: 'Dilution Calculator', category: 'chemistry', keywords: ['dilution', 'c1v1', 'concentration', 'volume'], hasView: true },
        { id: 'ph-calculator', name: 'pH Calculator', category: 'chemistry', keywords: ['ph', 'poh', 'hydrogen', 'acid', 'base'], hasView: true },
        
        // Laboratory
        { id: 'rsd', name: 'RSD / %RSD', category: 'laboratory', keywords: ['rsd', 'precision', 'standard deviation', 'relative'], hasView: true },
        { id: 'recovery', name: '% Recovery', category: 'laboratory', keywords: ['recovery', 'accuracy', 'spike', 'analytical'], hasView: true },
        
        // Banking
        { id: 'emi', name: 'EMI Calculator', category: 'banking', keywords: ['emi', 'loan', 'mortgage', 'installment', 'interest'], hasView: true },
        { id: 'simple-interest', name: 'Simple Interest', category: 'banking', keywords: ['simple interest', 'principal', 'rate', 'time'], hasView: true },
        { id: 'compound-interest', name: 'Compound Interest', category: 'banking', keywords: ['compound', 'interest', 'investment', 'future value'], hasView: true },
        
        // Time
        { id: 'time-difference', name: 'Time Difference', category: 'time', keywords: ['time', 'difference', 'duration', 'hours'], hasView: true },
        { id: 'date-difference', name: 'Date Difference', category: 'time', keywords: ['date', 'days', 'between', 'age'], hasView: true },
        { id: 'age-calculator', name: 'Age Calculator', category: 'time', keywords: ['age', 'birthday', 'years', 'date'], hasView: true },
        
        // Statistics
        { id: 'descriptive-stats', name: 'Descriptive Statistics', category: 'statistics', keywords: ['mean', 'median', 'mode', 'standard deviation'], hasView: true },
        
        // Nutrition
        { id: 'bmi', name: 'BMI Calculator', category: 'nutrition', keywords: ['bmi', 'body mass index', 'weight', 'height'], hasView: true },
        { id: 'bmr', name: 'BMR Calculator', category: 'nutrition', keywords: ['bmr', 'basal metabolic rate', 'calories', 'energy'], hasView: true },
        
        // Unit Converter
        { id: 'unit-converter', name: 'Universal Unit Converter', category: 'unit-converter', keywords: ['unit', 'convert', 'length', 'mass', 'temperature'], hasView: true }
    ],

    formulas: [
        {
            id: 'cylinder-volume',
            name: 'Cylinder Volume',
            formula: 'V = πr²h',
            variables: { V: 'Volume', r: 'Radius', h: 'Height' },
            units: { V: 'm³', r: 'm', h: 'm' },
            category: 'mathematics',
            calculatorId: 'volume-geometry'
        },
        {
            id: 'circle-area',
            name: 'Circle Area',
            formula: 'A = πr²',
            variables: { A: 'Area', r: 'Radius' },
            units: { A: 'm²', r: 'm' },
            category: 'mathematics',
            calculatorId: 'area-geometry'
        },
        {
            id: 'stress-formula',
            name: 'Stress',
            formula: 'σ = F / A',
            variables: { σ: 'Stress', F: 'Force', A: 'Area' },
            units: { σ: 'Pa', F: 'N', A: 'm²' },
            category: 'structural',
            calculatorId: 'stress-strain'
        },
        {
            id: 'strain-formula',
            name: 'Strain',
            formula: 'ε = ΔL / L₀',
            variables: { ε: 'Strain', 'ΔL': 'Change in Length', 'L₀': 'Original Length' },
            units: { ε: 'dimensionless', 'ΔL': 'm', 'L₀': 'm' },
            category: 'structural',
            calculatorId: 'stress-strain'
        },
        {
            id: 'youngs-modulus-formula',
            name: "Young's Modulus",
            formula: 'E = σ / ε',
            variables: { E: "Young's Modulus", σ: 'Stress', ε: 'Strain' },
            units: { E: 'Pa', σ: 'Pa', ε: 'dimensionless' },
            category: 'structural',
            calculatorId: 'youngs-modulus'
        },
        {
            id: 'molarity-formula',
            name: 'Molarity',
            formula: 'M = n / V',
            variables: { M: 'Molarity', n: 'Moles of solute', V: 'Volume of solution (L)' },
            units: { M: 'mol/L', n: 'mol', V: 'L' },
            category: 'chemistry',
            calculatorId: 'molarity'
        },
        {
            id: 'dilution-formula',
            name: 'Dilution Equation',
            formula: 'C₁V₁ = C₂V₂',
            variables: { C₁: 'Initial Concentration', V₁: 'Initial Volume', C₂: 'Final Concentration', V₂: 'Final Volume' },
            units: { C₁: 'any', V₁: 'any', C₂: 'same as C₁', V₂: 'same as V₁' },
            category: 'chemistry',
            calculatorId: 'dilution'
        },
        {
            id: 'emi-formula',
            name: 'EMI Formula',
            formula: 'EMI = P × r × (1+r)ⁿ / [(1+r)ⁿ - 1]',
            variables: { EMI: 'Equated Monthly Installment', P: 'Principal', r: 'Monthly Interest Rate', n: 'Number of Months' },
            units: { EMI: 'currency', P: 'currency', r: 'decimal', n: 'months' },
            category: 'banking',
            calculatorId: 'emi'
        }
    ],

    molecularWeights: {
        H2O: 18.015,
        NaCl: 58.44,
        HCl: 36.46,
        NaOH: 40.00,
        H2SO4: 98.08,
        HNO3: 63.01,
        CaCO3: 100.09,
        CO2: 44.01,
        O2: 32.00,
        N2: 28.01,
        NH3: 17.03,
        CH4: 16.04,
        C6H12O6: 180.16,
        C2H5OH: 46.07,
        CaO: 56.08,
        SiO2: 60.08,
        Al2O3: 101.96,
        Fe2O3: 159.69,
        MgO: 40.30,
        K2O: 94.20
    }
};

// Make available globally
window.CalculatorData = CalculatorData;