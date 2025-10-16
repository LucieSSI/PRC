import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';

export default function OvertimeCalculator({ onBack }) {
    const [activeTab, setActiveTab] = useState('regular');
    const [hourlyRate, setHourlyRate] = useState('200');
    const [totalHours, setTotalHours] = useState('0');
    const [holidayType, setHolidayType] = useState('rest-day');
    const [results, setResults] = useState(null);

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

    // Calculate results whenever inputs change
    useEffect(() => {
        const rate = parseFloat(hourlyRate) || 0;
        const hours = parseFloat(totalHours) || 0;

        if (hours <= 0) {
            setResults(null);
            return;
        }

        let first8Hours = 0;
        let succeedingHours = 0;
        let first8Pay = 0;
        let succeedingPay = 0;
        let rates = null;

        if (activeTab === 'regular') {
            // Regular overtime rates
            if (hours <= 8) {
                first8Hours = hours;
                first8Pay = rate * 1.25 * first8Hours; // 125% for regular overtime
            } else {
                first8Hours = 8;
                succeedingHours = hours - 8;
                first8Pay = rate * 1.25 * first8Hours; // 125% for first 8 hours
                succeedingPay = rate * 1.30 * succeedingHours; // 130% for succeeding hours
            }
        } else {
            // Rest day overtime rates
            const premiumRates = {
                'rest-day': { first8: 1.30, succeeding: 1.69 },
                'special-holiday': { first8: 1.30, succeeding: 1.69 },
                'special-holiday-rest-day': { first8: 1.69, succeeding: 1.95 },
                'legal-holiday': { first8: 2.00, succeeding: 2.60 },
                'legal-holiday-rest-day': { first8: 2.60, succeeding: 3.38 }
            };

            rates = premiumRates[holidayType];
            
            if (hours <= 8) {
                first8Hours = hours;
                first8Pay = rate * rates.first8 * first8Hours;
            } else {
                first8Hours = 8;
                succeedingHours = hours - 8;
                first8Pay = rate * rates.first8 * first8Hours;
                succeedingPay = rate * rates.succeeding * succeedingHours;
            }
        }

        const totalPay = first8Pay + succeedingPay;

        setResults({
            hourlyRate: rate,
            totalHours: hours,
            first8Hours,
            succeedingHours,
            first8Pay,
            succeedingPay,
            totalPay,
            holidayType: activeTab === 'rest-day' ? holidayType : null,
            rates,
            type: activeTab
        });
    }, [activeTab, hourlyRate, totalHours, holidayType]);

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
            fontSize: 'xxx-large',
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
        backButton: {
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500'
        },
        tabContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            gap: '1rem'
        },
        tab: {
            padding: '1rem 2rem',
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
            transition: 'all 0.2s'
        },
        activeTab: {
            background: 'white',
            color: '#667eea'
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
        totalPayCard: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        totalPayTitle: {
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
        },
        totalPayValue: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        totalPaySubtext: {
            fontSize: '0.875rem',
            opacity: '0.9'
        },
        holidayTypeCard: {
            background: '#fef3c7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
        },
        holidayTypeTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '0.5rem'
        },
        holidayTypeDescription: {
            fontSize: '0.875rem',
            color: '#92400e',
            opacity: '0.8'
        }
    };

    const holidayTypeDescriptions = {
        'rest-day': 'Rest Day / Sunday',
        'special-holiday': 'Special Holiday',
        'special-holiday-rest-day': 'Special Holiday & Rest Day',
        'legal-holiday': 'Legal Holiday',
        'legal-holiday-rest-day': 'Legal Holiday & Rest Day'
    };

    return (
        <div style={styles.container}>
            <button style={styles.backButton} onClick={onBack}>
                <ArrowLeft size={20} />
                Back to Tax Calculator
            </button>
            
            <div style={styles.innerContainer}>
                <div style={styles.header}>
                    <div style={styles.title}>
                        <Clock size={40} />
                        <h1>Overtime Calculator</h1>
                    </div>
                    <p style={styles.subtitle}>Calculate Regular and Rest Day Overtime Pay</p>
                </div>

                <div style={styles.tabContainer}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'regular' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('regular')}
                    >
                        <Clock size={20} />
                        Regular Overtime
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'rest-day' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('rest-day')}
                    >
                        <Calendar size={20} />
                        Rest Day Overtime
                    </button>
                </div>

                <div style={styles.gridMd}>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            <Clock size={24} color="#667eea" />
                            Input Details
                        </h2>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Hourly Rate (₱)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={hourlyRate}
                                onChange={handleChangeNonNegative(setHourlyRate, false)}
                                style={styles.input}
                                placeholder="200"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Total Hours Worked</label>
                            <input
                                type="number"
                                min="0"
                                step="0.25"
                                value={totalHours}
                                onChange={handleChangeNonNegative(setTotalHours, false)}
                                style={styles.input}
                                placeholder="0"
                            />
                        </div>

                        {activeTab === 'rest-day' && (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Holiday Type</label>
                                <select
                                    value={holidayType}
                                    onChange={(e) => setHolidayType(e.target.value)}
                                    style={{ ...styles.input, appearance: 'auto' }}
                                >
                                    <option value="rest-day">Rest Day / Sunday</option>
                                    <option value="special-holiday">Special Holiday</option>
                                    <option value="special-holiday-rest-day">Special Holiday & Rest Day</option>
                                    <option value="legal-holiday">Legal Holiday</option>
                                    <option value="legal-holiday-rest-day">Legal Holiday & Rest Day</option>
                                </select>
                            </div>
                        )}

                        {activeTab === 'rest-day' && (
                            <div style={styles.holidayTypeCard}>
                                <div style={styles.holidayTypeTitle}>
                                    {holidayTypeDescriptions[holidayType]}
                                </div>
                                <div style={styles.holidayTypeDescription}>
                                    Premium Rates: {(() => {
                                        const premiumRates = {
                                            'rest-day': { first8: 1.30, succeeding: 1.69 },
                                            'special-holiday': { first8: 1.30, succeeding: 1.69 },
                                            'special-holiday-rest-day': { first8: 1.69, succeeding: 1.95 },
                                            'legal-holiday': { first8: 2.00, succeeding: 2.60 },
                                            'legal-holiday-rest-day': { first8: 2.60, succeeding: 3.38 }
                                        };
                                        const rates = premiumRates[holidayType];
                                        return `${Math.round(rates.first8 * 100)}% for first 8 hours, ${Math.round(rates.succeeding * 100)}% for succeeding hours`;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    {results && (
                        <div style={styles.grid}>
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Calculation Breakdown</h2>

                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Hourly Rate:</span>
                                    <span style={styles.rowValue}>₱ {results.hourlyRate.toFixed(2)}</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>Total Hours:</span>
                                    <span style={styles.rowValue}>{results.totalHours} hours</span>
                                </div>
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>First 8 Hours:</span>
                                    <span style={styles.rowValue}>{results.first8Hours} hours</span>
                                </div>
                                {results.succeedingHours > 0 && (
                                    <div style={styles.row}>
                                        <span style={styles.rowLabel}>Succeeding Hours:</span>
                                        <span style={styles.rowValue}>{results.succeedingHours} hours</span>
                                    </div>
                                )}
                                <div style={styles.row}>
                                    <span style={styles.rowLabel}>First 8 Hours Pay:</span>
                                    <span style={{...styles.rowValue, color: '#16a34a'}}>
                                        ₱ {results.first8Pay.toFixed(2)}
                                    </span>
                                </div>
                                {results.succeedingPay > 0 && (
                                    <div style={styles.row}>
                                        <span style={styles.rowLabel}>Succeeding Hours Pay:</span>
                                        <span style={{...styles.rowValue, color: '#16a34a'}}>
                                            ₱ {results.succeedingPay.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={styles.totalPayCard}>
                                <h2 style={styles.totalPayTitle}>
                                    {activeTab === 'regular' ? 'REGULAR OVERTIME PAY' : 'REST DAY OVERTIME PAY'}
                                </h2>
                                <p style={styles.totalPayValue}>₱ {results.totalPay.toFixed(2)}</p>
                                <p style={styles.totalPaySubtext}>
                                    {activeTab === 'regular' 
                                        ? '125% for first 8 hours, 130% for succeeding hours'
                                        : results.rates ? `${Math.round(results.rates.first8 * 100)}% for first 8 hours, ${Math.round(results.rates.succeeding * 100)}% for succeeding hours` : ''
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
