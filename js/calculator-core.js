/**
 * GR All-in-One Calculation Toolkit
 * Core Calculation Engine
 * Phase 1
 */

const CalcEngine = {
    // Settings
    settings: {
        precision: 4,
        notation: 'standard', // standard, scientific, significant
        theme: 'light',
        timeFormat: '24h'
    },

    // Validation
    validateNumber(value, options = {}) {
        const num = parseFloat(value);
        if (isNaN(num)) return { valid: false, error: 'Please enter a valid number.' };
        if (options.min !== undefined && num < options.min) return { valid: false, error: `Value must be at least ${options.min}.` };
        if (options.max !== undefined && num > options.max) return { valid: false, error: `Value must be at most ${options.max}.` };
        if (options.greaterThan !== undefined && num <= options.greaterThan) return { valid: false, error: `Value must be greater than ${options.greaterThan}.` };
        if (options.nonZero && num === 0) return { valid: false, error: 'Value cannot be zero.' };
        return { valid: true, value: num };
    },

    validateRequired(value, name = 'This field') {
        if (value === '' || value === null || value === undefined) {
            return { valid: false, error: `${name} is required.` };
        }
        return { valid: true, value };
    },

    // Formatting
    formatNumber(num, precision = null) {
        if (precision === null) precision = this.settings.precision;
        if (num === null || num === undefined || isNaN(num)) return '-';
        
        if (this.settings.notation === 'scientific') {
            return num.toExponential(precision);
        }
        
        // Handle very large or very small numbers
        if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(precision);
        }
        
        return parseFloat(num.toFixed(precision)).toString();
    },

    formatCurrency(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    },

    // Unit Conversion
    convertUnit(value, fromUnit, toUnit, category) {
        const units = CalculatorData.units[category];
        if (!units) return value;
        
        if (category === 'temperature') {
            return this.convertTemperature(value, fromUnit, toUnit);
        }
        
        const fromFactor = units[fromUnit]?.factor;
        const toFactor = units[toUnit]?.factor;
        if (!fromFactor || !toFactor) return value;
        
        // Convert to base then to target
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    },

    convertTemperature(value, from, to) {
        let celsius;
        // Convert to Celsius first
        switch(from) {
            case 'C': celsius = value; break;
            case 'F': celsius = (value - 32) * 5/9; break;
            case 'K': celsius = value - 273.15; break;
            default: celsius = value;
        }
        // Convert from Celsius to target
        switch(to) {
            case 'C': return celsius;
            case 'F': return (celsius * 9/5) + 32;
            case 'K': return celsius + 273.15;
            default: return celsius;
        }
    },

    // Scientific Calculations
    scientific: {
        sin(x, mode = 'deg') {
            return mode === 'deg' ? Math.sin(x * Math.PI / 180) : Math.sin(x);
        },
        cos(x, mode = 'deg') {
            return mode === 'deg' ? Math.cos(x * Math.PI / 180) : Math.cos(x);
        },
        tan(x, mode = 'deg') {
            return mode === 'deg' ? Math.tan(x * Math.PI / 180) : Math.tan(x);
        },
        asin(x, mode = 'deg') {
            const r = Math.asin(x);
            return mode === 'deg' ? r * 180 / Math.PI : r;
        },
        acos(x, mode = 'deg') {
            const r = Math.acos(x);
            return mode === 'deg' ? r * 180 / Math.PI : r;
        },
        atan(x, mode = 'deg') {
            const r = Math.atan(x);
            return mode === 'deg' ? r * 180 / Math.PI : r;
        },
        sinh(x) { return Math.sinh(x); },
        cosh(x) { return Math.cosh(x); },
        tanh(x) { return Math.tanh(x); },
        log(x) { return Math.log10(x); },
        ln(x) { return Math.log(x); },
        exp(x) { return Math.exp(x); },
        sqrt(x) { return Math.sqrt(x); },
        cbrt(x) { return Math.cbrt(x); },
        pow(x, y) { return Math.pow(x, y); },
        factorial(n) {
            if (n < 0) return NaN;
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        },
        permutation(n, r) {
            return this.factorial(n) / this.factorial(n - r);
        },
        combination(n, r) {
            return this.factorial(n) / (this.factorial(r) * this.factorial(n - r));
        }
    },

    // Mathematics
    math: {
        quadratic(a, b, c) {
            const discriminant = b * b - 4 * a * c;
            if (discriminant < 0) {
                const real = -b / (2 * a);
                const imag = Math.sqrt(-discriminant) / (2 * a);
                return {
                    type: 'complex',
                    root1: `${CalcEngine.formatNumber(real)} + ${CalcEngine.formatNumber(imag)}i`,
                    root2: `${CalcEngine.formatNumber(real)} - ${CalcEngine.formatNumber(imag)}i`,
                    discriminant
                };
            }
            const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            return { type: 'real', root1, root2, discriminant };
        },
        distance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },
        midpoint(x1, y1, x2, y2) {
            return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
        },
        slope(x1, y1, x2, y2) {
            if (x2 === x1) return Infinity;
            return (y2 - y1) / (x2 - x1);
        },
        circleArea(r) { return Math.PI * r * r; },
        circleCircumference(r) { return 2 * Math.PI * r; },
        sphereVolume(r) { return (4/3) * Math.PI * r * r * r; },
        sphereSurfaceArea(r) { return 4 * Math.PI * r * r; },
        cylinderVolume(r, h) { return Math.PI * r * r * h; },
        cylinderSurfaceArea(r, h) { return 2 * Math.PI * r * (r + h); },
        coneVolume(r, h) { return (1/3) * Math.PI * r * r * h; },
        coneSurfaceArea(r, h) { 
            const slant = Math.sqrt(r*r + h*h);
            return Math.PI * r * (r + slant);
        }
    },

    // General
    general: {
        percentage(part, whole) {
            if (whole === 0) return NaN;
            return (part / whole) * 100;
        },
        percentageOf(percent, whole) {
            return (percent / 100) * whole;
        },
        percentageChange(oldVal, newVal) {
            if (oldVal === 0) return NaN;
            return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
        },
        average(values) {
            if (!values.length) return 0;
            return values.reduce((a, b) => a + b, 0) / values.length;
        },
        discount(price, discountPercent) {
            const discountAmount = (discountPercent / 100) * price;
            return {
                discountAmount,
                finalPrice: price - discountAmount,
                savingsPercent: discountPercent
            };
        },
        profitLoss(cost, selling) {
            const profit = selling - cost;
            const margin = cost !== 0 ? (profit / cost) * 100 : 0;
            return {
                profit,
                margin,
                type: profit >= 0 ? 'Profit' : 'Loss'
            };
        },
        gst(amount, rate, type = 'exclusive') {
            if (type === 'exclusive') {
                const tax = (amount * rate) / 100;
                return { base: amount, tax, total: amount + tax, rate };
            } else {
                const base = (amount * 100) / (100 + rate);
                const tax = amount - base;
                return { base, tax, total: amount, rate };
            }
        }
    },

    // Civil
    civil: {
        concreteVolume(length, width, depth) {
            return length * width * depth;
        },
        cementBags(volume, ratio = '1:2:4') {
            // M15 grade, 1:2:4 ratio
            const parts = ratio.split(':').map(Number);
            const totalParts = parts.reduce((a, b) => a + b, 0);
            const cementPart = parts[0];
            const dryVolume = volume * 1.54; // 54% extra for voids
            const cementVolume = (cementPart / totalParts) * dryVolume;
            const cementBags = cementVolume / 0.0347; // 1 bag = 50kg ≈ 0.0347 m³
            return {
                cementBags: Math.ceil(cementBags),
                cementKg: cementBags * 50,
                sandVolume: (parts[1] / totalParts) * dryVolume,
                aggregateVolume: (parts[2] / totalParts) * dryVolume
            };
        },
        brickwork(wallLength, wallHeight, wallThickness, brickSize = { l: 0.23, w: 0.115, h: 0.075 }) {
            const wallVolume = wallLength * wallHeight * wallThickness;
            const brickVolume = brickSize.l * brickSize.w * brickSize.h;
            const mortarPercent = 0.25; // 25% mortar
            const numBricks = Math.ceil(wallVolume / (brickVolume * (1 + mortarPercent)));
            const mortarVolume = wallVolume * mortarPercent;
            return { wallVolume, numBricks, mortarVolume };
        },
        steelWeight(diameter, length) {
            // Weight = D² × L / 162 (kg), D in mm, L in m
            const weight = (diameter * diameter * length) / 162;
            return weight;
        }
    },

    // Structural
    structural: {
        stress(force, area) {
            if (area <= 0) return NaN;
            return force / area;
        },
        strain(changeLength, originalLength) {
            if (originalLength <= 0) return NaN;
            return changeLength / originalLength;
        },
        youngsModulus(stress, strain) {
            if (strain === 0) return NaN;
            return stress / strain;
        }
    },

    // Chemistry
    chemistry: {
        molarity(moles, volumeL) {
            if (volumeL <= 0) return NaN;
            return moles / volumeL;
        },
        molesFromMass(mass, molecularWeight) {
            if (molecularWeight <= 0) return NaN;
            return mass / molecularWeight;
        },
        dilution(c1, v1, c2, v2) {
            // Solve for missing value
            const inputs = { c1, v1, c2, v2 };
            const missing = Object.keys(inputs).filter(k => inputs[k] === null || inputs[k] === undefined || isNaN(inputs[k]));
            if (missing.length !== 1) return null;
            
            const m = missing[0];
            switch(m) {
                case 'c1': return { c1: (c2 * v2) / v1, v1, c2, v2, solved: 'c1' };
                case 'v1': return { c1, v1: (c2 * v2) / c1, c2, v2, solved: 'v1' };
                case 'c2': return { c1, v1, c2: (c1 * v1) / v2, v2, solved: 'c2' };
                case 'v2': return { c1, v1, c2, v2: (c1 * v1) / c2, solved: 'v2' };
            }
            return null;
        },
        phFromH(hConcentration) {
            if (hConcentration <= 0) return NaN;
            return -Math.log10(hConcentration);
        },
        pohFromPh(ph) {
            return 14 - ph;
        },
        hFromPh(ph) {
            return Math.pow(10, -ph);
        }
    },

    // Laboratory
    lab: {
        rsd(values) {
            if (values.length < 2) return NaN;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
            const sd = Math.sqrt(variance);
            return (sd / mean) * 100;
        },
        recovery(spikeAmount, measuredAmount) {
            if (spikeAmount <= 0) return NaN;
            return (measuredAmount / spikeAmount) * 100;
        },
        standardDeviation(values) {
            if (values.length < 2) return NaN;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
            return Math.sqrt(variance);
        }
    },

    // Banking
    banking: {
        emi(principal, annualRate, years) {
            const months = years * 12;
            const r = annualRate / 12 / 100;
            if (r === 0) return principal / months;
            const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
            const totalPayment = emi * months;
            const totalInterest = totalPayment - principal;
            return { emi, totalPayment, totalInterest, months, principal };
        },
        simpleInterest(principal, rate, time) {
            const interest = (principal * rate * time) / 100;
            return { interest, amount: principal + interest, principal, rate, time };
        },
        compoundInterest(principal, rate, time, frequency = 1) {
            const amount = principal * Math.pow(1 + (rate / 100) / frequency, frequency * time);
            return { amount, interest: amount - principal, principal, rate, time };
        }
    },

    // Time
    time: {
        daysBetween(date1, date2) {
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            const diff = Math.abs(d2 - d1);
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        },
        age(birthDate) {
            const birth = new Date(birthDate);
            const now = new Date();
            let years = now.getFullYear() - birth.getFullYear();
            const monthDiff = now.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
                years--;
            }
            const months = (now.getMonth() + 12 - birth.getMonth()) % 12;
            const days = now.getDate() - birth.getDate();
            return { years, months, days: Math.abs(days) };
        }
    },

    // Statistics
    statistics: {
        mean(values) {
            if (!values.length) return 0;
            return values.reduce((a, b) => a + b, 0) / values.length;
        },
        median(values) {
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },
        mode(values) {
            const counts = {};
            values.forEach(v => counts[v] = (counts[v] || 0) + 1);
            const maxCount = Math.max(...Object.values(counts));
            return Object.keys(counts).filter(k => counts[k] === maxCount).map(Number);
        },
        variance(values) {
            if (values.length < 2) return 0;
            const mean = this.mean(values);
            return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
        },
        stdDev(values) {
            return Math.sqrt(this.variance(values));
        },
        cv(values) {
            const mean = this.mean(values);
            if (mean === 0) return 0;
            return (this.stdDev(values) / mean) * 100;
        }
    },

    // Nutrition
    nutrition: {
        bmi(weight, height) {
            // weight in kg, height in m
            if (height <= 0) return NaN;
            return weight / (height * height);
        },
        bmr(weight, height, age, gender) {
            // Mifflin-St Jeor Equation
            if (gender === 'male') {
                return (10 * weight) + (6.25 * height * 100) - (5 * age) + 5;
            } else {
                return (10 * weight) + (6.25 * height * 100) - (5 * age) - 161;
            }
        },
        bmiCategory(bmi) {
            if (bmi < 18.5) return 'Underweight';
            if (bmi < 25) return 'Normal weight';
            if (bmi < 30) return 'Overweight';
            return 'Obese';
        }
    }
};

// Make available globally
window.CalcEngine = CalcEngine;