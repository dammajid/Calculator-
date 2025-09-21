/* 
==================================================
CALCULATOR.JS - LOGIKA KALKULATOR
==================================================
File ini berisi semua logika JavaScript untuk kalkulator:
- State management dengan variabel global
- Fungsi input untuk angka dan operator
- Logika kalkulasi matematika
- Error handling dan validasi
- Keyboard support dan event listeners
- Utility functions
================================================== 
*/

// ==============================================
// GLOBAL VARIABLES - State Management
// ==============================================

let currentNumber = '0';        // Angka yang sedang diinput
let previousNumber = null;      // Angka sebelumnya untuk operasi
let operator = null;           // Operator yang dipilih (+, -, *, /)
let waitingForNewNumber = false; // Flag untuk menunggu input angka baru

// ==============================================
// DOM ELEMENTS - Referensi elemen HTML
// ==============================================

const display = document.getElementById('display');

// ==============================================
// DISPLAY FUNCTIONS - Fungsi mengelola tampilan
// ==============================================

/**
 * Memperbarui tampilan display dengan angka/hasil
 * @param {boolean} animate - Apakah menggunakan animasi
 */
function updateDisplay(animate = true) {
    // Format angka untuk tampilan yang lebih baik
    const formattedNumber = formatNumber(currentNumber);
    display.textContent = formattedNumber;
    
    // Tambahkan animasi kecil saat update
    if (animate) {
        display.style.transform = 'scale(1.02)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 100);
    }
}

/**
 * Format angka untuk tampilan (tambahkan koma pemisah ribuan)
 * @param {string} num - Angka yang akan diformat
 * @returns {string} Angka yang sudah diformat
 */
function formatNumber(num) {
    // Jika angka terlalu panjang, gunakan scientific notation
    if (num.length > 12) {
        const parsedNum = parseFloat(num);
        if (Math.abs(parsedNum) >= 1e12) {
            return parsedNum.toExponential(6);
        }
    }
    
    // Jika mengandung desimal, jangan format dengan koma
    if (num.includes('.')) {
        return num;
    }
    
    // Format dengan pemisah ribuan
    const parsedNum = parseInt(num);
    if (isNaN(parsedNum)) return num;
    
    return parsedNum.toLocaleString('id-ID');
}

// ==============================================
// INPUT FUNCTIONS - Fungsi input dari user
// ==============================================

/**
 * Input angka (0-9)
 * @param {string} num - Angka yang diinput (0-9)
 */
function inputNumber(num) {
    console.log(`Input angka: ${num}`);
    
    // Jika sedang menunggu angka baru atau display menampilkan 0
    if (waitingForNewNumber || currentNumber === '0') {
        currentNumber = num;
        waitingForNewNumber = false;
    } else {
        // Batasi panjang angka maksimal 12 digit
        if (currentNumber.replace(/[^\d]/g, '').length < 12) {
            currentNumber += num;
        }
    }
    updateDisplay();
}

/**
 * Input titik desimal (.)
 */
function inputDecimal() {
    console.log('Input decimal');
    
    // Jika sedang menunggu angka baru
    if (waitingForNewNumber) {
        currentNumber = '0.';
        waitingForNewNumber = false;
    } else {
        // Jika belum ada titik desimal, tambahkan
        if (!currentNumber.includes('.')) {
            currentNumber += '.';
        }
    }
    updateDisplay();
}

/**
 * Input operator (+, -, *, /)
 * @param {string} nextOperator - Operator yang dipilih
 */
function inputOperator(nextOperator) {
    console.log(`Input operator: ${nextOperator}`);
    
    const inputNumber = parseFloat(currentNumber.replace(/,/g, ''));

    // Jika ini adalah operator pertama
    if (previousNumber === null) {
        previousNumber = inputNumber;
    } else if (operator && !waitingForNewNumber) {
        // Jika sudah ada operator sebelumnya dan tidak menunggu angka baru
        const result = performCalculation();
        
        // Tampilkan hasil dan update state
        currentNumber = String(result);
        previousNumber = result;
        updateDisplay();
    }

    // Simpan operator baru dan set flag
    operator = nextOperator;
    waitingForNewNumber = true;
    
    // Highlight tombol operator yang aktif
    highlightOperator(nextOperator);
}

// ==============================================
// CALCULATION FUNCTIONS - Fungsi kalkulasi
// ==============================================

/**
 * Melakukan kalkulasi berdasarkan operator
 * @returns {number} Hasil kalkulasi
 */
function performCalculation() {
    const prev = parseFloat(String(previousNumber).replace(/,/g, ''));
    const current = parseFloat(currentNumber.replace(/,/g, ''));
    
    console.log(`Kalkulasi: ${prev} ${operator} ${current}`);
    
    // Validasi input
    if (isNaN(prev) || isNaN(current)) {
        return current || 0;
    }

    let result;

    // Operasi matematika berdasarkan operator
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            // Cek pembagian dengan nol
            if (current === 0) {
                showError('Tidak dapat dibagi nol');
                return 0;
            }
            result = prev / current;
            break;
        default:
            return current;
    }

    // Validasi hasil
    if (!isFinite(result)) {
        showError('Hasil tidak valid');
        return 0;
    }

    // Batasi digit desimal untuk hasil yang presisi
    return Math.round(result * 1000000000) / 1000000000;
}

/**
 * Fungsi untuk tombol equals (=)
 */
function calculate() {
    console.log('Calculate pressed');
    
    // Jika ada operator dan angka sebelumnya
    if (operator !== null && previousNumber !== null && !waitingForNewNumber) {
        const result = performCalculation();
        
        // Update tampilan dan reset state
        currentNumber = String(result);
        previousNumber = null;
        operator = null;
        waitingForNewNumber = true;
        
        updateDisplay();
        removeOperatorHighlight();
        
        console.log(`Hasil: ${result}`);
    }
}

// ==============================================
// UTILITY FUNCTIONS - Fungsi utility
// ==============================================

/**
 * Clear semua (tombol C)
 */
function clearDisplay() {
    console.log('Clear display');
    
    currentNumber = '0';
    previousNumber = null;
    operator = null;
    waitingForNewNumber = false;
    updateDisplay();
    removeOperatorHighlight();
}

/**
 * Hapus digit terakhir (tombol backspace)
 */
function deleteLast() {
    console.log('Delete last digit');
    
    // Hapus koma dulu jika ada
    let cleanNumber = currentNumber.replace(/,/g, '');
    
    if (cleanNumber.length > 1) {
        cleanNumber = cleanNumber.slice(0, -1);
        currentNumber = cleanNumber;
    } else {
        currentNumber = '0';
    }
    updateDisplay();
}

/**
 * Tampilkan pesan error
 * @param {string} message - Pesan error yang akan ditampilkan
 */
function showError(message) {
    console.error(`Error: ${message}`);
    
    display.textContent = 'Error';
    display.style.color = '#ff4444';
    
    // Reset setelah 2 detik
    setTimeout(() => {
        display.style.color = '#00ff88';
        clearDisplay();
    }, 2000);
}

/**
 * Highlight tombol operator yang aktif
 * @param {string} op - Operator yang akan di-highlight
 */
function highlightOperator(op) {
    // Hapus highlight sebelumnya
    removeOperatorHighlight();
    
    // Tambah highlight pada operator aktif
    const operatorBtn = document.querySelector(`[data-operator="${op}"]`);
    if (operatorBtn) {
        operatorBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)';
        operatorBtn.style.transform = 'scale(1.05)';
        operatorBtn.style.boxShadow = '0 8px 16px rgba(255, 107, 107, 0.4)';
    }
}

/**
 * Hapus highlight dari semua tombol operator
 */
function removeOperatorHighlight() {
    const operatorBtns = document.querySelectorAll('[data-operator]');
    operatorBtns.forEach(btn => {
        btn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    });
}

// ==============================================
// KEYBOARD SUPPORT - Support input keyboard
// ==============================================

/**
 * Event listener untuk input keyboard
 */
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    console.log(`Keyboard input: ${key}`);
    
    // Angka 0-9
    if (key >= '0' && key <= '9') {
        inputNumber(key);
    }
    // Operator
    else if (key === '+') {
        inputOperator('+');
    }
    else if (key === '-') {
        inputOperator('-');
    }
    else if (key === '*') {
        inputOperator('*');
    }
    else if (key === '/') {
        event.preventDefault(); // Prevent browser search
        inputOperator('/');
    }
    // Equals
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    // Decimal
    else if (key === '.' || key === ',') {
        inputDecimal();
    }
    // Clear
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    }
    // Backspace
    else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    }
});

// ==============================================
// BUTTON ANIMATION EFFECTS
// ==============================================

/**
 * Tambahkan efek ripple pada tombol
 */
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// ==============================================
// INITIALIZATION - Inisialisasi awal
// ==============================================

/**
 * Inisialisasi kalkulator saat halaman dimuat
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 Kalkulator sederhana berhasil dimuat!');
    console.log('📁 Struktur file terpisah:');
    console.log('   - index.html: Struktur HTML');
    console.log('   - css/styles.css: Styling dan animasi');
    console.log('   - js/calculator.js: Logika JavaScript');
    console.log('⌨️ Gunakan keyboard untuk input cepat!');
    
    // Update display awal
    updateDisplay(false);
    
    // Tambahkan CSS untuk efek ripple
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// ==============================================
// EXPORT FUNCTIONS (untuk testing)
// ==============================================

// Jika running di Node.js environment (untuk testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inputNumber,
        inputOperator,
        calculate,
        clearDisplay,
        performCalculation,
        formatNumber
    };
}