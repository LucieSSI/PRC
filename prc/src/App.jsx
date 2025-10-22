import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingDown, FileText } from 'lucide-react';

export default function TaxCalculator() {
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('Technical');
    const [daysAbsent, setDaysAbsent] = useState('0');
    const [minutesLate, setMinutesLate] = useState('0');
    const [mealAllowance, setMealAllowance] = useState('0');
    const [regularOTHours, setRegularOTHours] = useState('0');
    const [restDayOTHours, setRestDayOTHours] = useState('0');
    const [restDayOTType, setRestDayOTType] = useState('rest-day');
    const [results, setResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const handleChangeNonNegative = (setValue, integer = false) => (e) => {
        const raw = e.target.value;
        if (raw === '') {
            setValue('');
            return;
        }
        let num = integer ? parseInt(raw) : parseFloat(raw);
        if (Number.isNaN(num) || num < 0) {
            num = 0;
        }
        if (integer) {
            num = Math.floor(num);
        }
        setValue(String(num));
    };

    const calculateSSS = (monthlyRate) => {
        // Updated SSS table based on 2025 schedule - focusing on employee contributions only
        const sssTable = [
            { min: 0, max: 5249.99, contribution: 250 }, // Below 5,250 - 5,000 MSC, Employee: 250
            { min: 5250, max: 5749.99, contribution: 275 }, // 5,250-5,749.99 - 5,500 MSC, Employee: 275
            { min: 5750, max: 6249.99, contribution: 300 }, // 5,750-6,249.99 - 6,000 MSC, Employee: 300
            { min: 6250, max: 6749.99, contribution: 325 }, // 6,250-6,749.99 - 6,500 MSC, Employee: 325
            { min: 6750, max: 7249.99, contribution: 350 }, // 6,750-7,249.99 - 7,000 MSC, Employee: 350
            { min: 7250, max: 7749.99, contribution: 375 }, // 7,250-7,749.99 - 7,500 MSC, Employee: 375
            { min: 7750, max: 8249.99, contribution: 400 }, // 7,750-8,249.99 - 8,000 MSC, Employee: 400
            { min: 8250, max: 8749.99, contribution: 425 }, // 8,250-8,749.99 - 8,500 MSC, Employee: 425
            { min: 8750, max: 9249.99, contribution: 450 }, // 8,750-9,249.99 - 9,000 MSC, Employee: 450
            { min: 9250, max: 9749.99, contribution: 475 }, // 9,250-9,749.99 - 9,500 MSC, Employee: 475
            { min: 9750, max: 10249.99, contribution: 500 }, // 9,750-10,249.99 - 10,000 MSC, Employee: 500
            { min: 10250, max: 10749.99, contribution: 525 }, // 10,250-10,749.99 - 10,500 MSC, Employee: 525
            { min: 10750, max: 11249.99, contribution: 550 }, // 10,750-11,249.99 - 11,000 MSC, Employee: 550
            { min: 11250, max: 11749.99, contribution: 575 }, // 11,250-11,749.99 - 11,500 MSC, Employee: 575
            { min: 11750, max: 12249.99, contribution: 600 }, // 11,750-12,249.99 - 12,000 MSC, Employee: 600
            { min: 12250, max: 12749.99, contribution: 625 }, // 12,250-12,749.99 - 12,500 MSC, Employee: 625
            { min: 12750, max: 13249.99, contribution: 650 }, // 12,750-13,249.99 - 13,000 MSC, Employee: 650
            { min: 13250, max: 13749.99, contribution: 675 }, // 13,250-13,749.99 - 13,500 MSC, Employee: 675
            { min: 13750, max: 14249.99, contribution: 700 }, // 13,750-14,249.99 - 14,000 MSC, Employee: 700
            { min: 14250, max: 14749.99, contribution: 725 }, // 14,250-14,749.99 - 14,500 MSC, Employee: 725
            { min: 14750, max: 15249.99, contribution: 750 }, // 14,750-15,249.99 - 15,000 MSC, Employee: 750
            { min: 15250, max: 15749.99, contribution: 775 }, // 15,250-15,749.99 - 15,500 MSC, Employee: 775
            { min: 15750, max: 16249.99, contribution: 800 }, // 15,750-16,249.99 - 16,000 MSC, Employee: 800
            { min: 16250, max: 16749.99, contribution: 825 }, // 16,250-16,749.99 - 16,500 MSC, Employee: 825
            { min: 16750, max: 17249.99, contribution: 850 }, // 16,750-17,249.99 - 17,000 MSC, Employee: 850
            { min: 17250, max: 17749.99, contribution: 875 }, // 17,250-17,749.99 - 17,500 MSC, Employee: 875
            { min: 17750, max: 18249.99, contribution: 900 }, // 17,750-18,249.99 - 18,000 MSC, Employee: 900
            { min: 18250, max: 18749.99, contribution: 925 }, // 18,250-18,749.99 - 18,500 MSC, Employee: 925
            { min: 18750, max: 19249.99, contribution: 950 }, // 18,750-19,249.99 - 19,000 MSC, Employee: 950
            { min: 19250, max: 19749.99, contribution: 975 }, // 19,250-19,749.99 - 19,500 MSC, Employee: 975
            { min: 19750, max: 20249.99, contribution: 1000 }, // 19,750-20,249.99 - 20,000 MSC, Employee: 1000
            { min: 20250, max: 20749.99, contribution: 1025 }, // 20,250-20,749.99 - 20,500 MSC, Employee: 1000+25
            { min: 20750, max: 21249.99, contribution: 1050 }, // 20,750-21,249.99 - 21,000 MSC, Employee: 1000+50
            { min: 21250, max: 21749.99, contribution: 1075 }, // 21,250-21,749.99 - 21,500 MSC, Employee: 1000+75
            { min: 21750, max: 22249.99, contribution: 1100 }, // 21,750-22,249.99 - 22,000 MSC, Employee: 1000+100
            { min: 22250, max: 22749.99, contribution: 1125 }, // 22,250-22,749.99 - 22,500 MSC, Employee: 1000+125
            { min: 22750, max: 23249.99, contribution: 1150 }, // 22,750-23,249.99 - 23,000 MSC, Employee: 1000+150
            { min: 23250, max: 23749.99, contribution: 1175 }, // 23,250-23,749.99 - 23,500 MSC, Employee: 1000+175
            { min: 23750, max: 24249.99, contribution: 1200 }, // 23,750-24,249.99 - 24,000 MSC, Employee: 1000+200
            { min: 24250, max: 24749.99, contribution: 1225 }, // 24,250-24,749.99 - 24,500 MSC, Employee: 1000+225
            { min: 24750, max: 25249.99, contribution: 1250 }, // 24,750-25,249.99 - 25,000 MSC, Employee: 1000+250
            { min: 25250, max: 25749.99, contribution: 1275 }, // 25,250-25,749.99 - 25,500 MSC, Employee: 1000+275
            { min: 25750, max: 26249.99, contribution: 1300 }, // 25,750-26,249.99 - 26,000 MSC, Employee: 1000+300
            { min: 26250, max: 26749.99, contribution: 1325 }, // 26,250-26,749.99 - 26,500 MSC, Employee: 1000+325
            { min: 26750, max: 27249.99, contribution: 1350 }, // 26,750-27,249.99 - 27,000 MSC, Employee: 1000+350
            { min: 27250, max: 27749.99, contribution: 1375 }, // 27,250-27,749.99 - 27,500 MSC, Employee: 1000+375
            { min: 27750, max: 28249.99, contribution: 1400 }, // 27,750-28,249.99 - 28,000 MSC, Employee: 1000+400
            { min: 28250, max: 28749.99, contribution: 1425 }, // 28,250-28,749.99 - 28,500 MSC, Employee: 1000+425
            { min: 28750, max: 29249.99, contribution: 1450 }, // 28,750-29,249.99 - 29,000 MSC, Employee: 1000+450
            { min: 29250, max: 29749.99, contribution: 1475 }, // 29,250-29,749.99 - 29,500 MSC, Employee: 1000+475
            { min: 29750, max: 30249.99, contribution: 1500 }, // 29,750-30,249.99 - 30,000 MSC, Employee: 1000+500
            { min: 30250, max: 30749.99, contribution: 1525 }, // 30,250-30,749.99 - 30,500 MSC, Employee: 1000+525
            { min: 30750, max: 31249.99, contribution: 1550 }, // 30,750-31,249.99 - 31,000 MSC, Employee: 1000+550
            { min: 31250, max: 31749.99, contribution: 1575 }, // 31,250-31,749.99 - 31,500 MSC, Employee: 1000+575
            { min: 31750, max: 32249.99, contribution: 1600 }, // 31,750-32,249.99 - 32,000 MSC, Employee: 1000+600
            { min: 32250, max: 32749.99, contribution: 1625 }, // 32,250-32,749.99 - 32,500 MSC, Employee: 1000+625
            { min: 32750, max: 33249.99, contribution: 1650 }, // 32,750-33,249.99 - 33,000 MSC, Employee: 1000+650
            { min: 33250, max: 33749.99, contribution: 1675 }, // 33,250-33,749.99 - 33,500 MSC, Employee: 1000+675
            { min: 33750, max: 34249.99, contribution: 1700 }, // 33,750-34,249.99 - 34,000 MSC, Employee: 1000+700
            { min: 34250, max: 34749.99, contribution: 1725 }, // 34,250-34,749.99 - 34,500 MSC, Employee: 1000+725
            { min: 34750, max: Infinity, contribution: 1750 } // 34,750 and over - 35,000 MSC, Employee: 1000+750
        ];

        for (let bracket of sssTable) {
            if (monthlyRate >= bracket.min && monthlyRate <= bracket.max) {
                return bracket.contribution;
            }
        }
        return 1750; // Default for highest bracket
    };

    const calculatePhilHealth = (monthlyRate) => {
        // Based on new formula from image
        if (monthlyRate <= 10000) {
            return 500; // Fixed deduction for bracket 1
        } else if (monthlyRate > 10000 && monthlyRate <= 99999.99) {
            return monthlyRate * 0.05; // 5% for bracket 2
        } else {
            return 5000; // Fixed deduction for bracket 3 (100,000 and above)
        }
    };

    const calculatePagIbig = (monthlyRate) => {
        // Based on new Pag-IBIG table from image
        if (monthlyRate <= 1500) {
            return monthlyRate * 0.01; // 1% for bracket 1
        } else if (monthlyRate > 1500 && monthlyRate <= 10000) {
            return monthlyRate * 0.02; // 2% for bracket 2, but cap at 200 for rates above 10,000
        } else {
            return 200; // Cap at 200 PHP for rates 10,000 and above
        }
    };

    const calculateTax = (taxBase) => {
        // Updated tax brackets based on new semi-monthly formula from image
        const taxBrackets = [
            { min: 0, max: 10417, compensationLevel: 0, rate: 0, additional: 0 },
            { min: 10417, max: 16667, compensationLevel: 10417, rate: 0.20, additional: 0 },
            { min: 16667, max: 33333, compensationLevel: 16667, rate: 0.25, additional: 1250.00 },
            { min: 33333, max: 83333, compensationLevel: 33333, rate: 0.30, additional: 5416.67 },
            { min: 83333, max: 333333, compensationLevel: 83333, rate: 0.32, additional: 20416.67 },
            { min: 333333, max: Infinity, compensationLevel: 333333, rate: 0.35, additional: 100416.67 }
        ];

        for (let bracket of taxBrackets) {
            if (taxBase > bracket.min && taxBase <= bracket.max) {
                // Formula: (Tax Base - Compensation Level) x Tax Rate + Additional
                return (taxBase - bracket.compensationLevel) * bracket.rate + bracket.additional;
            }
        }
        return 0;
    };

    // Check if employee is a leader for 5% increase
    const isLeader = (employeeName) => {
        if (!employeeName) return false;
        const nameLower = employeeName.toLowerCase();
        // Match using paired keywords (order-insensitive, case-insensitive);
        // only apply when BOTH keywords for a leader are present.
        const leaderKeywordPairs = [
            ['isiah', 'mendez'],
            ['gene', 'sarmiento'],
            ['chester', 'etac'],
            ['efraim', 'echipare']
        ];
        return leaderKeywordPairs.some(([firstKeyword, secondKeyword]) =>
            nameLower.includes(firstKeyword) && nameLower.includes(secondKeyword)
        );
    };

    const calculate = useCallback(() => {
        const absent = parseInt(daysAbsent) || 0;
        const late = parseInt(minutesLate) || 0;
        const meal = parseFloat(mealAllowance) || 0;
        const otHours = parseFloat(regularOTHours) || 0;
        const restOtHours = parseFloat(restDayOTHours) || 0;

        // Daily rate is constant at 550, with 5% increase for leaders
        let baseDailyRate = 550;
        if (isLeader(name)) {
            baseDailyRate = baseDailyRate * 1.05; // 5% increase for leaders
        }
        
        // Calculate monthly and hourly rates from daily rate
        const dailyRate = baseDailyRate;
        const monthlyRateFromDaily = (dailyRate * 261) / 12; // 261 working days per year
        const hourlyRate = dailyRate / 8;
        const minuteRate = hourlyRate / 60;
        const renderedDays = 10 - absent; // 10 working days in semi-monthly period
        const absentAmount = dailyRate * absent;
        const lateAmount = minuteRate * late;
        const totalMealAllowance = renderedDays * meal;
        // Compute overtime pay from hours
        let regularOTPay = 0;
        if (otHours > 0) {
            if (otHours <= 8) {
                regularOTPay = hourlyRate * 1.25 * otHours;
            } else {
                const first8 = 8;
                const succeeding = otHours - 8;
                regularOTPay = (hourlyRate * 1.25 * first8) + (hourlyRate * 1.30 * succeeding);
            }
        }

        let restDayOTPay = 0;
        if (restOtHours > 0) {
            const premiumRates = {
                'rest-day': { first8: 1.30, succeeding: 1.69 },
                'special-holiday': { first8: 1.30, succeeding: 1.69 },
                'special-holiday-rest-day': { first8: 1.69, succeeding: 1.95 },
                'legal-holiday': { first8: 2.00, succeeding: 2.60 },
                'legal-holiday-rest-day': { first8: 2.60, succeeding: 3.38 }
            };
            const rates = premiumRates[restDayOTType];
            if (restOtHours <= 8) {
                restDayOTPay = hourlyRate * rates.first8 * restOtHours;
            } else {
                const first8 = 8;
        const succeeding = restOtHours - 8;
        restDayOTPay = (hourlyRate * rates.first8 * first8) + (hourlyRate * rates.succeeding * succeeding);
    }
}

// Use the calculated monthly rate from daily rate for gross pay calculation
const grossPay = (baseDailyRate * 10) + regularOTPay + restDayOTPay  + totalMealAllowance; // Adjust back to old afterwards
        const sss = calculateSSS(monthlyRateFromDaily);
        const philhealth = calculatePhilHealth(monthlyRateFromDaily);
        const pagibig = calculatePagIbig(monthlyRateFromDaily);
        // Tax Base = Gross Pay - (SSS + PhilHealth + Pag-IBIG + Total Meal Allowance)
        const taxBase = grossPay - sss - philhealth - pagibig;
        const tax = calculateTax(taxBase); // This is already semi-monthly tax, but we need monthly
        const monthlyTax = tax * 2; // Convert semi-monthly to monthly
        const shuttleAllocation = 0;
        const totalDeductions = sss + philhealth + pagibig + monthlyTax + shuttleAllocation + absentAmount + lateAmount;
        const netPay = grossPay - totalDeductions;

        setResults({
            monthlyRate: monthlyRateFromDaily,
            dailyRate,
            hourlyRate,
            minuteRate,
            renderedDays,
            absentAmount,
            lateAmount,
            totalMealAllowance,
            grossPay,
            sss,
            philhealth,
            pagibig,
            tax: monthlyTax,
            shuttleAllocation,
            totalDeductions,
            netPay,
            compensationLevel: taxBase,
            regularOTHours: otHours,
            restDayOTHours: restOtHours,
            restDayOTType,
            regularOTPay,
            restDayOTPay,
            department
        });
    }, [daysAbsent, minutesLate, mealAllowance, regularOTHours, restDayOTHours, restDayOTType, name]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    const handleSaveToSheets = async () => {
        if (!results) return;
        const url = import.meta.env.VITE_SHEETS_WEBAPP_URL;
        if (!url) {
            setSubmitMessage('Sheets URL not configured. Define VITE_SHEETS_WEBAPP_URL in .env');
            return;
        }
        setSubmitting(true);
        setSubmitMessage('');
        try {
            const payload = {
                timestamp: new Date().toISOString(),
                name,
                department,
                monthlyRate: results.monthlyRate,
                dailyRate: results.dailyRate,
                hourlyRate: results.hourlyRate,
                minuteRate: results.minuteRate,
                renderedDays: results.renderedDays,
                absentAmount: results.absentAmount,
                lateAmount: results.lateAmount,
                totalMealAllowance: results.totalMealAllowance,
                grossPay: results.grossPay,
                sss: results.sss,
                philhealth: results.philhealth,
                pagibig: results.pagibig,
                tax: results.tax,
                shuttleAllocation: results.shuttleAllocation,
                totalDeductions: results.totalDeductions,
                netPay: results.netPay,
                compensationLevel: results.compensationLevel,
                regularOTHours: results.regularOTHours,
                regularOTPay: results.regularOTPay,
                restDayOTHours: results.restDayOTHours,
                restDayOTType: results.restDayOTType,
                restDayOTPay: results.restDayOTPay,
            };
            // Abort after 12s to avoid hanging UI
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);
            // Use no-cors to avoid CORS errors; response will be opaque
            await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            setSubmitMessage('Saved (response may be opaque). Check your Sheet for a new row.');
        } catch (err) {
            setSubmitMessage(`Failed to save: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem 1rem'
        },
        innerContainer: {
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'white'
        },
        title: {
            fontSize: 'large',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
        },
        subtitle: {
            fontSize: '1.1rem',
            opacity: '0.9'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem'
        },
        gridMd: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        cardTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        inputGroup: {
            marginBottom: '1rem'
        },
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
        },
        row: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: '1px solid #f3f4f6'
        },
        rowLabel: {
            color: '#6b7280'
        },
        rowValue: {
            fontWeight: '600',
            color: '#111827'
        },
        grossPayBox: {
            background: '#dbeafe',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        grossPayLabel: {
            fontWeight: 'bold',
            color: '#1e40af',
            fontSize: '1.1rem'
        },
        grossPayValue: {
            fontWeight: 'bold',
            color: '#1e40af',
            fontSize: '1.3rem'
        },
        deductionBox: {
            background: '#fef3c7',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        deductionLabel: {
            fontWeight: 'bold',
            color: '#92400e',
            fontSize: '1.1rem'
        },
        deductionValue: {
            fontWeight: 'bold',
            color: '#92400e',
            fontSize: '1.3rem'
        },
        netPayCard: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        netPayTitle: {
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
        },
        netPayValue: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        netPaySubtext: {
            fontSize: '0.875rem',
            opacity: '0.9'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.innerContainer}>
                <div style={styles.header}>
                    <div style={styles.title}>
                        <Calculator size={40} />
                        <h1>Philippine Tax Calculator</h1>
                    </div>
                    <p style={styles.subtitle}>Calculate your SSS, PhilHealth, Pag-IBIG, Income Tax, and Overtime</p>
                </div>

                <div style={styles.gridMd}>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            <FileText size={24} color="#667eea" />
                            Input Details
                        </h2>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                style={{ ...styles.input, appearance: 'auto' }}
                            >
                                <option value="Technical">Technical</option>
                                <option value="Support">Support</option>
                                <option value="Production">Production</option>
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={styles.input}
                                placeholder="e.g., Juan Dela Cruz"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Daily Rate (₱)</label>
                            <div style={{
                                ...styles.input, 
                                backgroundColor: '#f3f4f6', 
                                display: 'flex', 
                                alignItems: 'center',
                                color: '#374151'
                            }}>
                                {isLeader(name) ? '₱ 577.50 (Leader rate)' : '₱ 550.00 (Standard rate)'}
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Number of Days Absent</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={daysAbsent}
                                onChange={handleChangeNonNegative(setDaysAbsent, true)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Number of Minutes Late</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={minutesLate}
                                onChange={handleChangeNonNegative(setMinutesLate, true)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Meal Allowance Per Day (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={mealAllowance}
                                onChange={handleChangeNonNegative(setMealAllowance, false)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Regular Overtime Hours</label>
                            <input
                                type="number"
                                min="0"
                                step="0.25"
                                value={regularOTHours}
                                onChange={handleChangeNonNegative(setRegularOTHours, false)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Rest Day Overtime Type</label>
                            <select
                                value={restDayOTType}
                                onChange={(e) => setRestDayOTType(e.target.value)}
                                style={{ ...styles.input, appearance: 'auto' }}
                            >
                                <option value="rest-day">Rest Day / Sunday</option>
                                <option value="special-holiday">Special Holiday</option>
                                <option value="special-holiday-rest-day">Special Holiday & Rest Day</option>
                                <option value="legal-holiday">Legal Holiday</option>
                                <option value="legal-holiday-rest-day">Legal Holiday & Rest Day</option>
                            </select>
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Rest Day Overtime Hours</label>
                            <input
                                type="number"
                                min="0"
                                step="0.25"
                                value={restDayOTHours}
                                onChange={handleChangeNonNegative(setRestDayOTHours, false)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {results && (
                        <div style={styles.grid}>
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Computation</h2>

                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Daily Rate:</span>
                                    <span style={styles.rowValue}>₱ {results.dailyRate.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Hourly Rate:</span>
                                    <span style={styles.rowValue}>₱ {results.hourlyRate.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Minute Rate:</span>
                                    <span style={styles.rowValue}>₱ {results.minuteRate.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Rendered Days:</span>
                                    <span style={styles.rowValue}>{results.renderedDays} days</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Total Meal Allowance:</span>
                                    <span style={{...styles.rowValue, color: '#16a34a'}}>₱ {results.totalMealAllowance.toFixed(2)}</span>
                                </div>
                            <div style={styles.row}>
                                <span style={styles.rowLabel}>Regular OT Hours:</span>
                                <span style={styles.rowValue}>{results.regularOTHours} hrs</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.rowLabel}>Regular OT Pay:</span>
                                <span style={{...styles.rowValue, color: '#16a34a'}}>₱ {results.regularOTPay.toFixed(2)}</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.rowLabel}>Rest Day OT Hours:</span>
                                <span style={styles.rowValue}>{results.restDayOTHours} hrs</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.rowLabel}>Rest Day OT Type:</span>
                                <span style={styles.rowValue}>{restDayOTType}</span>
                            </div>
                            <div style={styles.row}>
                                <span style={styles.rowLabel}>Rest Day OT Pay:</span>
                                <span style={{...styles.rowValue, color: '#16a34a'}}>₱ {results.restDayOTPay.toFixed(2)}</span>
                            </div>
                            <div style={styles.grossPayBox}>
                                <span style={styles.grossPayLabel}>GROSS PAY:</span>
                                <span style={styles.grossPayValue}>₱ {results.grossPay.toFixed(2)}</span>
                            </div>
                            </div>

                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>
                                    <TrendingDown size={24} color="#dc2626"/>
                                    Deductions
                                </h2>

                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>SSS:</span>
                                    <span style={styles.rowValue}>₱ {results.sss.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>PhilHealth:</span>
                                    <span style={styles.rowValue}>₱ {results.philhealth.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Pag-IBIG:</span>
                                    <span style={styles.rowValue}>₱ {results.pagibig.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Tax:</span>
                                    <span style={styles.rowValue}>₱ {results.tax.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Shuttle Allocation:</span>
                                    <span style={styles.rowValue}>₱ {results.shuttleAllocation.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Absent Amount:</span>
                                    <span style={{
                                        ...styles.rowValue,
                                        color: '#dc2626'
                                    }}>₱ {results.absentAmount.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Late Amount:</span>
                                    <span style={{
                                        ...styles.rowValue,
                                        color: '#dc2626'
                                    }}>₱ {results.lateAmount.toFixed(2)}</span>
                                </div>
                                <div style={styles.deductionBox}>
                                    <span style={styles.deductionLabel}>Total Deductions:</span>
                                    <span style={styles.deductionValue}>₱ {results.totalDeductions.toFixed(2)}</span>
                                </div>
                            </div>

                            <div style={styles.netPayCard}>
                                <h2 style={styles.netPayTitle}>NET PAY</h2>
                                <p style={styles.netPayValue}>₱ {results.netPay.toFixed(2)}</p>
                                <p style={styles.netPaySubtext}>Take-home pay after all deductions</p>
                                <div style={{
                                    marginTop: '0.75rem',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        onClick={handleSaveToSheets}
                                        disabled={submitting}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            borderRadius: '8px',
                                            background: '#065f46',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {submitting ? 'Saving…' : 'Save to Google Sheet'}
                                    </button>
                                    {submitMessage && (
                                        <span style={{ fontSize: '0.9rem', color: 'white' }}>{submitMessage}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
