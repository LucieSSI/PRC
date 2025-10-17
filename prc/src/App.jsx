import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingDown, FileText, Clock } from 'lucide-react';
import OvertimeCalculator from './OvertimeCalculator';

export default function TaxCalculator() {
    const [currentPage, setCurrentPage] = useState('tax');
    const [name, setName] = useState('');
    const [monthlyRate, setMonthlyRate] = useState('30000');
    const [department, setDepartment] = useState('Technical');
    const [daysAbsent, setDaysAbsent] = useState('0');
    const [minutesLate, setMinutesLate] = useState('0');
    const [mealAllowance, setMealAllowance] = useState('0');
    const [regularOT, setRegularOT] = useState('0');
    const [restDayOT, setRestDayOT] = useState('0');
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

    const calculateSSS = (grossPay) => {
        const sssTable = [
            { min: 0, max: 4249.99, contribution: 180 },
            { min: 4250, max: 4749.99, contribution: 202.50 },
            { min: 4750, max: 5249.99, contribution: 225 },
            { min: 5250, max: 5749.99, contribution: 247.50 },
            { min: 5750, max: 6249.99, contribution: 270 },
            { min: 6250, max: 6749.99, contribution: 292.50 },
            { min: 6750, max: 7249.99, contribution: 315 },
            { min: 7250, max: 7749.99, contribution: 337.50 },
            { min: 7750, max: 8249.99, contribution: 360 },
            { min: 8250, max: 8749.99, contribution: 382.50 },
            { min: 8750, max: 9249.99, contribution: 405 },
            { min: 9250, max: 9749.99, contribution: 427.50 },
            { min: 9750, max: 10249.99, contribution: 450 },
            { min: 10250, max: 10749.99, contribution: 472.50 },
            { min: 10750, max: 11249.99, contribution: 495 },
            { min: 11250, max: 11749.99, contribution: 517.50 },
            { min: 11750, max: 12249.99, contribution: 540 },
            { min: 12250, max: 12749.99, contribution: 562.50 },
            { min: 12750, max: 13249.99, contribution: 585 },
            { min: 13250, max: 13749.99, contribution: 607.50 },
            { min: 13750, max: 14249.99, contribution: 630 },
            { min: 14250, max: 14749.99, contribution: 652.50 },
            { min: 14750, max: 15249.99, contribution: 675 },
            { min: 15250, max: 15749.99, contribution: 697.50 },
            { min: 15750, max: 16249.99, contribution: 720 },
            { min: 16250, max: 16749.99, contribution: 742.50 },
            { min: 16750, max: 17249.99, contribution: 765 },
            { min: 17250, max: 17749.99, contribution: 787.50 },
            { min: 17750, max: 18249.99, contribution: 810 },
            { min: 18250, max: 18749.99, contribution: 832.50 },
            { min: 18750, max: 19249.99, contribution: 855 },
            { min: 19250, max: 19749.99, contribution: 877.50 },
            { min: 19750, max: Infinity, contribution: 900 }
        ];

        for (let bracket of sssTable) {
            if (grossPay >= bracket.min && grossPay <= bracket.max) {
                return bracket.contribution;
            }
        }
        return 900;
    };

    const calculatePhilHealth = (monthlyRate) => {
        if (monthlyRate <= 10000) {
            return 137.5;
        } else if (monthlyRate > 10000 && monthlyRate <= 100000.01) {
            return monthlyRate * 0.01375;
        } else {
            return 550;
        }
    };

    const calculatePagIbig = () => {
        return 100;
    };

    const calculateTax = (taxableIncome) => {
        const taxBrackets = [
            { min: 0, max: 10417, base: 0, rate: 0, excess: 0 },
            { min: 10417, max: 16667, base: 0, rate: 0.15, excess: 10417 },
            { min: 16667, max: 33333, base: 937.50, rate: 0.20, excess: 16667 },
            { min: 33333, max: 83333, base: 4270.83, rate: 0.25, excess: 33333 },
            { min: 83333, max: 333333, base: 16770.83, rate: 0.30, excess: 83333 },
            { min: 333333, max: Infinity, base: 91770.83, rate: 0.35, excess: 333333 }
        ];

        for (let bracket of taxBrackets) {
            if (taxableIncome > bracket.min && taxableIncome <= bracket.max) {
                return bracket.base + (taxableIncome - bracket.excess) * bracket.rate;
            }
        }
        return 0;
    };

    const calculate = useCallback(() => {
        const monthly = parseFloat(monthlyRate) || 0;
        const absent = parseInt(daysAbsent) || 0;
        const late = parseInt(minutesLate) || 0;
        const meal = parseFloat(mealAllowance) || 0;
        const ot = parseFloat(regularOT) || 0;
        const restOt = parseFloat(restDayOT) || 0;

        // Calculate rates - using semi-monthly (24 pay periods per year)
        const dailyRate = (monthly * 12) / 261; // 261 working days per year
        const hourlyRate = dailyRate / 8;
        const minuteRate = hourlyRate / 60;
        const renderedDays = 11 - absent; // 11 working days in semi-monthly period
        const absentAmount = dailyRate * absent;
        const lateAmount = minuteRate * late;
        const totalMealAllowance = renderedDays * meal;
        const grossPay = (monthly / 2) + ot + restOt - absentAmount - lateAmount;
        const sss = calculateSSS(grossPay);
        const philhealth = calculatePhilHealth(monthly);
        const pagibig = calculatePagIbig();
        const compensationLevel = grossPay - sss - philhealth - pagibig;
        const taxBase = compensationLevel;
        const taxSemi = calculateTax(taxBase);
        const tax = taxSemi * 2;
        const shuttleAllocation = 10 * 10;
        const totalDeductions = sss + philhealth + pagibig + tax + shuttleAllocation;
        const netPay = grossPay - totalDeductions;

        setResults({
            monthlyRate: monthly,
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
            tax,
            shuttleAllocation,
            totalDeductions,
            netPay,
            compensationLevel,
            restDayOT: restOt,
            department
        });
    }, [monthlyRate, daysAbsent, minutesLate, mealAllowance, regularOT, restDayOT]);

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
                regularOT: parseFloat(regularOT) || 0,
                restDayOT: parseFloat(restDayOT) || 0,
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

    if (currentPage === 'overtime') {
        return <OvertimeCalculator onBack={() => setCurrentPage('tax')} />;
    }

    return (
        <div style={styles.container}>
            <div style={styles.innerContainer}>
                <div style={styles.header}>
                    <div style={styles.title}>
                        <Calculator size={40} />
                        <h1>Philippine Tax Calculator</h1>
                    </div>
                    <p style={styles.subtitle}>Calculate your SSS, PhilHealth, Pag-IBIG, and Income Tax</p>
                    <button
                        onClick={() => setCurrentPage('overtime')}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '1rem auto 0'
                        }}
                    >
                        <Clock size={20} />
                        Go to Overtime Calculator
                    </button>
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
                            <label style={styles.label}>Monthly Rate (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={monthlyRate}
                                onChange={handleChangeNonNegative(setMonthlyRate, false)}
                                style={styles.input}
                                placeholder="30000"
                            />
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
                            <label style={styles.label}>Regular Overtime (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={regularOT}
                                onChange={handleChangeNonNegative(setRegularOT, false)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Rest Day Overtime (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={restDayOT}
                                onChange={handleChangeNonNegative(setRestDayOT, false)}
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
                                    <span style={styles.rowLabel}>Absent Amount:</span>
                                    <span style={{...styles.rowValue, color: '#dc2626'}}>₱ {results.absentAmount.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Late Amount:</span>
                                    <span style={{...styles.rowValue, color: '#dc2626'}}>₱ {results.lateAmount.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Rest Day Overtime:</span>
                                    <span style={{...styles.rowValue, color: '#16a34a'}}>₱ {results.restDayOT.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Total Meal Allowance:</span>
                                    <span style={{...styles.rowValue, color: '#16a34a'}}>₱ {results.totalMealAllowance.toFixed(2)}</span>
                                </div>
                                <div style={styles.grossPayBox}>
                                    <span style={styles.grossPayLabel}>GROSS PAY:</span>
                                    <span style={styles.grossPayValue}>₱ {results.grossPay.toFixed(2)}</span>
                                </div>
                            </div>

                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>
                                    <TrendingDown size={24} color="#dc2626" />
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
                                <div style={styles.deductionBox}>
                                    <span style={styles.deductionLabel}>Total Deductions:</span>
                                    <span style={styles.deductionValue}>₱ {results.totalDeductions.toFixed(2)}</span>
                                </div>
                            </div>

                            <div style={styles.netPayCard}>
                                <h2 style={styles.netPayTitle}>NET PAY</h2>
                                <p style={styles.netPayValue}>₱ {results.netPay.toFixed(2)}</p>
                                <p style={styles.netPaySubtext}>Take-home pay after all deductions</p>
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
