// ===== AIR COOLAX - MOBILE APP SCRIPT =====

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    attachEventListeners();
    refreshTotal();
    loadBillHistory();
});

// App initialization
function initializeApp() {
    console.log('AIR COOLAX Mobile App initialized');
    generateQRCode();
}

// Attach all event listeners
function attachEventListeners() {
    // Table input listeners
    const table = document.getElementById('invoiceTable');
    table.addEventListener('input', function(e) {
        if (e.target.classList.contains('rate') || e.target.classList.contains('qty')) {
            const row = e.target.closest('tr');
            if (row) {
                calculateRowAmount(row);
                refreshTotal();
            }
        }
    });

    // UPI ID change listener
    const upiField = document.getElementById('upiId');
    if (upiField) {
        upiField.addEventListener('input', generateQRCode);
    }

    // PDF download
    document.getElementById('downloadPDF')
    .addEventListener('click', downloadPDF);
}



// ===== QR CODE FUNCTIONS =====
window.generateQRCode = function() {
    const totalElement = document.getElementById('totalAmountDisplay');
    const totalAmount = totalElement.innerText.replace(/[^0-9]/g, '') || '4000';
    
    document.getElementById('qrDynamicAmount').innerText = totalAmount;
    document.getElementById('qrAmountBadge').innerText = '₹' + totalAmount;
    
    const upiId = document.getElementById('upiId').innerText.trim() || 'usmaniarsh7-1@okicici';
    const payeeName = 'AIR COOLAX';
    
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR`;
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    try {
        new QRCode(qrContainer, {
            text: upiLink,
            width: 170,
            height: 170,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.error('QR failed', e);
        qrContainer.innerHTML = '<div style="color:red; text-align:center;">QR Error</div>';
    }
};

// ===== TABLE CALCULATIONS =====
window.calculateRowAmount = function(row) {
    const rateCell = row.querySelector('.rate');
    const qtyCell = row.querySelector('.qty');
    const amountCell = row.querySelector('.amount');
    
    if (!rateCell || !qtyCell || !amountCell) return 0;
    
    const rate = parseFloat(rateCell.innerText.trim()) || 0;
    const qty = parseFloat(qtyCell.innerText.trim()) || 0;
    const amount = rate * qty;
    
    amountCell.innerText = amount ? amount.toString() : '';
    return amount;
};

window.refreshTotal = function() {
    const rows = document.querySelectorAll('#tableBody tr');
    let total = 0;
    
    rows.forEach(row => {
        const amt = calculateRowAmount(row);
        if (amt && !isNaN(amt)) total += amt;
    });
    
    document.getElementById('totalAmountDisplay').innerText = total.toLocaleString('en-IN');
    generateQRCode();
    return total;
};

// ===== ROW MANAGEMENT =====
window.addNewRow = function() {
    const tbody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true" class="rate"></td>
        <td contenteditable="true" class="qty"></td>
        <td class="amount"></td>
        <td class="remove-row" onclick="removeRow(this)"><i class="fas fa-trash-alt"></i></td>
    `;
    
    tbody.appendChild(newRow);
    refreshTotal();
};

window.removeRow = function(elm) {
    const row = elm.closest('tr');
    if (row && document.querySelectorAll('#tableBody tr').length > 1) {
        row.remove();
        refreshTotal();
    } else {
        alert("At least one row required");
    }
};

// ===== RESET FUNCTION =====
window.resetToOriginal = function() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    // Main row
    const mainRow = document.createElement('tr');
    mainRow.innerHTML = `
        <td contenteditable="true">1</td>
        <td contenteditable="true">AC 1.5 ton Split Inverter With Pcb Repair</td>
        <td contenteditable="true" class="rate">400</td>
        <td contenteditable="true" class="qty">1</td>
        <td class="amount">4000</td>
        <td class="remove-row" onclick="removeRow(this)"><i class="fas fa-trash-alt"></i></td>
    `;
    tbody.appendChild(mainRow);
    
    // 6 empty rows
    for (let i = 0; i < 6; i++) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true" class="rate"></td>
            <td contenteditable="true" class="qty"></td>
            <td class="amount"></td>
            <td class="remove-row" onclick="removeRow(this)"><i class="fas fa-trash-alt"></i></td>
        `;
        tbody.appendChild(emptyRow);
    }
    
    // Reset form fields
    document.getElementById('clientName').innerText = 'Ankit Garg';
    document.getElementById('billNo').innerText = '852';
    document.getElementById('clientAddress').innerText = 'Flat 901 yoccka building nahar amrit Chandevali Mumbai';
    document.getElementById('billDate').innerText = '03/08/2025';
    document.getElementById('officeLine1').innerText = 'Office No.01/26, Tilak Nagar, 90ft Road Near Gulshan Hotel,';
    document.getElementById('officeLine2').innerText = 'Sakinaka Andheri (E), Mumbai – 400072';
    document.getElementById('contactMobile').innerHTML = '<i class="fas fa-mobile-alt"></i> +919557422118';
    document.getElementById('contactEmail').innerHTML = '<i class="fas fa-envelope"></i> msalik269@gmail.com';
    document.getElementById('footerMessage').innerText = 'Thank you for your time and consideration. I hope to see you again soon.';
    document.getElementById('signature').innerText = '✧ AIR COOLAX ✧';
    
    refreshTotal();
};

// ===== PDF GENERATION =====
function downloadPDF() {
    const toolbar = document.querySelector('.action-bar');
    const addBtn = document.querySelector('.add-row-btn');
    
    toolbar.style.display = 'none';
    addBtn.style.display = 'none';

    const element = document.getElementById('billCard');
    const billNumber = document.getElementById('billNo').innerText || '852';
    
    const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `AIRCOOLAX_${billNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        toolbar.style.display = 'grid';
        addBtn.style.display = 'flex';
    }).catch(() => {
        toolbar.style.display = 'grid';
        addBtn.style.display = 'flex';
        alert('PDF generation failed');
    });
}

// ===== FLASK API FUNCTIONS =====
window.saveBillToServer




// ===== UPI  API FUNCTIONS =====

function cashPayment(){

document.getElementById("upiSection").style.display="none";

}

function upiPayment(){

document.getElementById("upiSection").style.display="block";

}

function cashPayment() {

  const upi = document.getElementById("upiSection");

  if (upi) {
    upi.style.display = "none";
  }

}

function selectPayment(type) {
  const status = document.getElementById("paymentStatus");
  const onlineSection = document.getElementById("onlineSection");

  if (type === "cash") {
    status.innerHTML = "Payment Mode: Cash 💵";
    onlineSection.style.display = "none"; // hide QR
  } else {
    status.innerHTML = "Payment Mode: Online 💳";
    onlineSection.style.display = "block"; // show QR
  }
}

// Default pe CASH
document.addEventListener("DOMContentLoaded", function () {
  selectPayment("cash");
});

function generateBillNumber() {
  let lastBill = localStorage.getItem("lastBillNo") || "A0000";

  // Number part nikaalo
  let num = parseInt(lastBill.substring(1)) + 1;

  // Format: A001, A002...
  let newBill = "A" + num.toString().padStart(3, "0");

  // Save for next time
  localStorage.setItem("lastBillNo", newBill);

  // Set in UI
  document.getElementById("billNo").innerText = newBill;
}

// Page load pe run karo
document.addEventListener("DOMContentLoaded", function () {
  generateBillNumber();
});



function refreshPage() {
  resetToOriginal();   // sirf bill reset karega
}


















// ===== WHATSAPP DIRECT PDF SHARE FUNCTION =====
async function sharePDFonWhatsApp() {

    const toolbar = document.querySelector('.action-bar');
    const addBtn = document.querySelector('.add-row-btn');

    // Hide buttons before PDF capture
    if (toolbar) toolbar.style.display = 'none';
    if (addBtn) addBtn.style.display = 'none';

    const element = document.getElementById('billCard');
    const billNumber = document.getElementById('billNo').innerText || '000';

    const opt = {
        margin: 0.3,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {

        // Generate PDF as Blob
        const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');

        const file = new File(
            [pdfBlob],
            `AIRCOOLAX_${billNumber}.pdf`,
            { type: "application/pdf" }
        );

        // Check mobile support
        if (navigator.canShare && navigator.canShare({ files: [file] })) {

            await navigator.share({
                title: "AIR COOLAX Bill",
                text: "Here is your bill.",
                files: [file]
            });

        } else {
            alert("Sharing not supported on this device. Please use Chrome Android.");
        }

    } catch (error) {
        console.error(error);
        alert("PDF Share Failed");
    }

    // Show buttons again
    if (toolbar) toolbar.style.display = 'grid';
    if (addBtn) addBtn.style.display = 'flex';
}
