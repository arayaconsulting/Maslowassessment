// ==========================================
// KONFIGURASI SPREADSHEET & MASTER PASSCODE
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZnP0s0KngOwQ4WzpmDg09L_Uy0Ht_Bbs9lJCWw4Or2-I2lUZkBUgnj3pjsk_0mKPm/exec";
const MASTER_PASSCODES = ["ARAYA2026", "MASLOW88", "PREMIUM88", "LEADERVIP", "ARAYA55"];

// 15 BUTIR PERNYATAAN ASLI SESUAI FILE EXCEL
const questions = [
    { id: 1, text: "Uang adalah satu-satunya cara memotivasi karyawan agar bekerja keras." },
    { id: 2, text: "Karyawan akan bekerja lebih baik lagi jika atasan selalu mengingatkan bahwa mereka akan kehilangan pekerjaan jika tidak bekerja secara efisien dan menolong perusahaan agar tetap mampu bersaing." },
    { id: 3, text: "Karyawan akan bekerja lebih baik/buruk tergantung pada lingkungan kerjanya." },
    { id: 4, text: "Rasa diterima oleh karyawan lain adalah faktor vital dalam memotivasi karyawan." },
    { id: 5, text: "Penghargaan secara pribadi atas kinerja lebih penting daripada penghargaan dalam bentuk uang." },
    { id: 6, text: "Menyediakan tunjangan pensiun dan tunjangan kesehatan merupakan langkah yang baik untuk memotivasi karyawan." },
    { id: 7, text: "Kebanyakan karyawan lebih suka bekerja sendiri dalam menangani proyek yang penuh tantangan." },
    { id: 8, text: "Kesempatan berpartisipasi dalam bakti sosial yang diadakan oleh perusahaan akan memotivasi karyawan bekerja dengan baik." },
    { id: 9, text: "Kesempatan berbangga diri atas prestasi yang telah diraih lebih penting bagi kebanyakan karyawan, daripada ucapan selamat dari atasan/rekan kerja." },
    { id: 10, text: "Umumnya, para karyawan bekerja dengan baik bila mereka diberi kepercayaan." },
    { id: 11, text: "Hubungan-hubungan yang berkualitas (baik) di dalam kelompok-kelompok kerja informal sangat penting untuk memotivasi karyawan bekerja lebih baik." },
    { id: 12, text: "Bila pekerjaan mereka diperhatikan dan dihargai oleh atasan, karyawan akan lebih termotivasi." },
    { id: 13, text: "Kebanyakan karyawan akan menerima kesempatan untuk bekerja sendiri dan membuat keputusan tanpa diawasi." },
    { id: 14, text: "Jaman sekarang ini, karyawan mau bekerja dengan baik hanya karena mereka senang masih memiliki pekerjaan." },
    { id: 15, text: "Sekalipun karyawan mencintai pekerjaannya, satu-satunya cara untuk memotivasi berkinerja lebih baik adalah dengan menyediakan peralatan dan mesin yang lebih modern." }
];

// STATE
let currentPage = 0;
const questionsPerPage = 3; // 15 Soal dibagi 5 Tahap (3 Soal per Halaman)
const totalPages = 5;
let userAnswers = {};
let userInfo = { nama: "", posisi: "", whatsapp: "", tanggal: "" };
let calculatedScores = { fisik: 0, aman: 0, bersama: 0, hargaDiri: 0, aktual: 0 };
let dominantKey = "";
let currentReportId = "";
let chartInstance = null;

// STEP 1: MULAI
function startAssessment() {
    const nama = document.getElementById("nama").value.trim();
    const posisi = document.getElementById("posisi").value.trim() || "Umum / Profesional";
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if (!nama || !whatsapp) {
        alert("Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.");
        return;
    }

    userInfo = {
        nama,
        posisi,
        whatsapp,
        tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    document.getElementById("step-identity").classList.add("hidden");
    document.getElementById("step-quiz").classList.remove("hidden");
    renderQuizPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// RENDER WIZARD PER 3 SOAL
function renderQuizPage() {
    const startIdx = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

    const progressPct = ((currentPage + 1) / totalPages) * 100;
    document.getElementById("step-indicator").innerText = `Bagian ${currentPage + 1} / ${totalPages}`;
    document.getElementById("percent-indicator").innerText = `${Math.round(progressPct)}%`;
    document.getElementById("progress-fill").style.width = `${progressPct}%`;

    document.getElementById("btn-prev").style.visibility = currentPage === 0 ? "hidden" : "visible";
    document.getElementById("btn-next").innerHTML = currentPage === totalPages - 1 
        ? `Selesai & Analisis <i class="fa-solid fa-check ml-1"></i>` 
        : `Selanjutnya <i class="fa-solid fa-arrow-right ml-1"></i>`;

    const container = document.getElementById("quiz-page-container");
    container.innerHTML = currentQuestions.map(q => {
        const val = userAnswers[q.id] !== undefined ? userAnswers[q.id] : "";
        return `
            <div class="quiz-item-box">
                <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-snug"><strong>${q.id}.</strong> ${q.text}</p>
                <div class="options-pill-group">
                    ${[
                        { val: 2, label: "+2 (SS)" },
                        { val: 1, label: "+1 (S)" },
                        { val: 0, label: "0 (N)" },
                        { val: -1, label: "-1 (TS)" },
                        { val: -2, label: "-2 (STS)" }
                    ].map(opt => `
                        <div class="pill-option">
                            <input type="radio" name="q_${q.id}" id="q_${q.id}_${opt.val}" value="${opt.val}" ${val === opt.val ? 'checked' : ''} onchange="userAnswers[${q.id}] = ${opt.val}">
                            <label for="q_${q.id}_${opt.val}">
                                <span class="score-num">${opt.val > 0 ? '+' + opt.val : opt.val}</span>
                                <span class="score-label">${opt.label}</span>
                            </label>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }).join("");
}

function nextQuizPage() {
    const startIdx = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

    for (let q of currentQuestions) {
        if (userAnswers[q.id] === undefined) {
            alert(`Pernyataan nomor ${q.id} belum dijawab.`);
            return;
        }
    }

    if (currentPage < totalPages - 1) {
        currentPage++;
        renderQuizPage();
        window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
        processAndSyncResults();
    }
}

function prevQuizPage() {
    if (currentPage > 0) {
        currentPage--;
        renderQuizPage();
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }
}

// PROSES SKOR SESUAI FORMULA EXCEL
async function processAndSyncResults() {
    // 1. Hitung Berdasarkan Pemetaan Excel
    // Kebutuhan Fisik = 1 + 3 + 15
    const fisik = (userAnswers[1] || 0) + (userAnswers[3] || 0) + (userAnswers[15] || 0);
    // Rasa Aman = 2 + 6 + 14
    const aman = (userAnswers[2] || 0) + (userAnswers[6] || 0) + (userAnswers[14] || 0);
    // Kebersamaan = 4 + 8 + 11
    const bersama = (userAnswers[4] || 0) + (userAnswers[8] || 0) + (userAnswers[11] || 0);
    // Harga Diri = 5 + 10 + 12
    const hargaDiri = (userAnswers[5] || 0) + (userAnswers[10] || 0) + (userAnswers[12] || 0);
    // Aktualisasi Diri = 7 + 9 + 13
    const aktual = (userAnswers[7] || 0) + (userAnswers[9] || 0) + (userAnswers[13] || 0);

    calculatedScores = { fisik, aman, bersama, hargaDiri, aktual };

    let maxScore = -999;
    ["fisik", "aman", "bersama", "hargaDiri", "aktual"].forEach(key => {
        if (calculatedScores[key] > maxScore) {
            maxScore = calculatedScores[key];
            dominantKey = key;
        }
    });

    currentReportId = `MSL-${Math.floor(100000 + Math.random() * 900000)}`;

    // Set Link Tombol WhatsApp Minta Kode
    const waMsg = `Halo Mas Ali, saya sudah selesai mengisi Tes Motivasi Maslow.\n\n*Nama:* ${userInfo.nama}\n*ID Registrasi:* ${currentReportId}\n*No. WA:* ${userInfo.whatsapp}\n\nMohon kode aktivasi untuk mengunduh laporan resmi.`;
    const waUrl = `https://wa.me/6285232526003?text=${encodeURIComponent(waMsg)}`;
    
    document.getElementById("wa-admin-btn").href = waUrl;
    document.getElementById("floating-wa").href = waUrl;

    // Tampilkan Paywall
    document.getElementById("step-quiz").classList.add("hidden");
    document.getElementById("step-paywall").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync Data ke Google Spreadsheet
    sendDataToSpreadsheet({
        testId: currentReportId,
        nama: userInfo.nama,
        posisi: userInfo.posisi,
        whatsapp: userInfo.whatsapp,
        tanggal: userInfo.tanggal,
        fisiologis: calculatedScores.fisik,
        rasaAman: calculatedScores.aman,
        sosial: calculatedScores.bersama,
        hargaDiri: calculatedScores.hargaDiri,
        aktualisasi: calculatedScores.aktual,
        driverUtama: getDriverTitle(dominantKey)
    });
}

// VALIDASI KODE AKTIVASI
async function validateAccessCode() {
    const inputCode = document.getElementById("input-access-code").value.trim().toUpperCase();
    if (!inputCode) {
        alert("Mohon masukkan kode aktivasi terlebih dahulu!");
        return;
    }

    const btn = document.getElementById("btn-unlock-code");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Memeriksa...`;

    try {
        if (GOOGLE_SCRIPT_URL) {
            const checkUrl = `${GOOGLE_SCRIPT_URL}?action=checkCode&code=${encodeURIComponent(inputCode)}&nama=${encodeURIComponent(userInfo.nama)}&whatsapp=${encodeURIComponent(userInfo.whatsapp)}&testId=${encodeURIComponent(currentReportId)}`;
            const res = await fetch(checkUrl);
            const result = await res.json();

            if (result.valid) {
                unlockFinalResult();
                return;
            } else if (!MASTER_PASSCODES.includes(inputCode)) {
                alert(result.message || "Kode aktivasi tidak valid atau sudah terpakai.");
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }
        }
    } catch (e) {
        console.warn("Gagal cek online, memeriksa master passcode...", e);
    }

    if (MASTER_PASSCODES.includes(inputCode)) {
        unlockFinalResult();
    } else {
        alert("Kode aktivasi tidak valid. Silakan hubungi admin via WhatsApp.");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function unlockFinalResult() {
    document.getElementById("step-paywall").classList.add("hidden");
    document.getElementById("step-final").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// POPULATE CANVAS DOKUMEN A4 SEBELUM EKSPOR PDF
function renderPDFCanvas() {
    document.getElementById("pdf-nama").innerText = userInfo.nama;
    document.getElementById("pdf-posisi").innerText = userInfo.posisi;
    document.getElementById("pdf-id").innerText = currentReportId;
    document.getElementById("pdf-tanggal").innerText = userInfo.tanggal;
    document.getElementById("pdf-footer-id").innerText = currentReportId;

    document.getElementById("pdf-dominant-title").innerText = getDriverTitle(dominantKey);
    document.getElementById("pdf-dominant-slogan").innerText = `"${getDriverSlogan(dominantKey)}"`;

    const meta = [
        { key: "fisik", name: "Kebutuhan Fisik (Fisiologis)", formula: "1 + 3 + 15" },
        { key: "aman", name: "Rasa Aman (Safety)", formula: "2 + 6 + 14" },
        { key: "bersama", name: "Kebersamaan (Sosial)", formula: "4 + 8 + 11" },
        { key: "hargaDiri", name: "Harga Diri (Esteem)", formula: "5 + 10 + 12" },
        { key: "aktual", name: "Aktualisasi Diri", formula: "7 + 9 + 13" }
    ];

    const tbody = document.getElementById("pdf-score-tbody");
    tbody.innerHTML = meta.map(m => {
        const s = calculatedScores[m.key];
        let status = "Rendah";
        if (s >= 4) status = "Sangat Tinggi (Driver)";
        else if (s >= 2) status = "Tinggi (Prioritas)";
        else if (s >= 0) status = "Moderat";

        return `
            <tr>
                <td class="p-1 border border-slate-200 font-semibold">${m.name}</td>
                <td class="p-1 border border-slate-200 text-center text-slate-500">${m.formula}</td>
                <td class="p-1 border border-slate-200 text-center font-bold">${s > 0 ? '+' + s : s}</td>
                <td class="p-1 border border-slate-200 text-blue-900 font-semibold">${status}</td>
            </tr>
        `;
    }).join("");

    renderPDFRadar();

    document.getElementById("pdf-narrative").innerText = buildFullNarrative(calculatedScores, dominantKey);

    const selfMap = {
        fisik: ["Disiplinkan pemulihan fisik dan stamina harian.", "Atur manajemen finansial pribadi secara proporsional."],
        aman: ["Mintalah kejelasan SOP dan indikator tertulis kepada atasan.", "Susun ceklis mitigasi risiko sebelum memulai penugasan."],
        bersama: ["Aktif membangun komunikasi guyub dalam tim kerja.", "Jalin kolaborasi yang saling mendukung antar-rekan."],
        hargaDiri: ["Dokumentasikan rekam jejak portofolio prestasi secara rapi.", "Ambil inisiatif penugasan strategis bernilai tambah."],
        aktual: ["Terus pelajari keterampilan baru yang menantang.", "Ciptakan inovasi karya mandiri yang berdampak luas."]
    };

    const leaderMap = {
        fisik: ["Pastikan kelayakan sarana fasilitas dan alat kerja.", "Jamin skema hak kompensasi tepat waktu dan adil."],
        aman: ["Berikan instruksi spesifik tanpa kebijakan mendadak.", "Ciptakan kepastian atmosfer kerja dan keberlangsungan posisi."],
        bersama: ["Bangun iklim kerja kekeluargaan yang inklusif.", "Cepat tanggap meredam gesekan relasi internal."],
        hargaDiri: ["Beri apresiasi tulus atas setiap capaian nyata.", "Berikan pendelegasian wewenang secara terhormat."],
        aktual: ["Beri otonomi penuh dalam menentukan metode kerja.", "Tantang dengan penugasan inovatif yang memerlukan kreativitas."]
    };

    document.getElementById("pdf-self-actions").innerHTML = selfMap[dominantKey].map(a => `<li>${a}</li>`).join("");
    document.getElementById("pdf-leader-actions").innerHTML = leaderMap[dominantKey].map(a => `<li>${a}</li>`).join("");
}

function renderPDFRadar() {
    const ctx = document.getElementById("pdfRadarCanvas").getContext("2d");
    if (chartInstance) chartInstance.destroy();

    // Normalisasi skala (-6 s/d +6 menjadi 0 s/d 12 untuk grafik radar)
    const norm = k => calculatedScores[k] + 6;

    chartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Fisik', 'Aman', 'Kebersamaan', 'Harga Diri', 'Aktualisasi'],
            datasets: [{
                data: [norm('fisik'), norm('aman'), norm('bersama'), norm('hargaDiri'), norm('aktual')],
                backgroundColor: 'rgba(30, 58, 138, 0.25)',
                borderColor: '#1e3a8a',
                borderWidth: 2,
                pointBackgroundColor: '#b45309',
                pointRadius: 3
            }]
        },
        options: {
            animation: false,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 12,
                    ticks: { display: false, stepSize: 3 },
                    pointLabels: { font: { size: 7.5, weight: 'bold' } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// LOGIKA PRESISI DIRECT DOWNLOAD PDF (html2canvas + jsPDF MURNI SEPERTI APP DISC)
async function downloadPDF() {
    const btn = document.getElementById('download-btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Membuat Dokumen PDF Resmi...`;

    renderPDFCanvas();
    await new Promise(r => setTimeout(r, 400));

    try {
        const certElement = document.getElementById('pdf-report-canvas');
        const canvas = await html2canvas(certElement, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            windowWidth: 794
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
        
        const userNameFormatted = userInfo.nama ? userInfo.nama.replace(/\s+/g, '_') : 'Peserta';
        pdf.save(`Laporan_Maslow_${userNameFormatted}.pdf`);

    } catch (error) {
        console.error("Gagal mendownload PDF:", error);
        alert("Terjadi kendala saat generate PDF. Silakan coba kembali.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-file-arrow-down mr-2"></i> Download Laporan (PDF)`;
    }
}

// HELPERS
function getDriverTitle(key) {
    const map = {
        fisik: "Kebutuhan Fisik (Fisiologis)",
        aman: "Kebutuhan Rasa Aman & Stabilitas",
        bersama: "Kebutuhan Kebersamaan & Relasi Sosial",
        hargaDiri: "Kebutuhan Harga Diri & Pengakuan",
        aktual: "Kebutuhan Aktualisasi Diri & Otonomi"
    };
    return map[key] || "Motivasi Terpadu";
}

function getDriverSlogan(key) {
    const map = {
        fisik: "Fokus utama pada kelayakan sarana fisik dan kompensasi materi nyata.",
        aman: "Fokus utama pada kepastian aturan SOP, minim risiko, dan stabilitas kerja.",
        bersama: "Fokus utama pada keharmonisan relasi, iklim guyub, dan penerimaan tim.",
        hargaDiri: "Fokus utama pada apresiasi prestasi, reputasi, dan martabat profesional.",
        aktual: "Fokus utama pada kemandirian otonomi, eksplorasi potensi, dan tantangan karya."
    };
    return map[key] || "";
}

function buildFullNarrative(scores, key) {
    const k1 = `Berdasarkan instrumen diagnostik kebutuhan Maslow, dorongan motivasi kerja Anda saat ini paling dominan dipicu oleh pemenuhan ${getDriverTitle(key)}, yang menjadi pusat orientasi dan energi produktivitas Anda sehari-hari.`;
    
    let k2 = (scores.fisik >= 3 || scores.aman >= 3)
        ? `Pada aspek fondasi dasar, Anda memerlukan kepastian jaminan kelayakan fasilitas, kejelasan aturan SOP tertulis, serta stabilitas lingkungan kerja sebelum dapat mengerahkan performa secara maksimal.`
        : `Fondasi kebutuhan dasar dan rasa aman Anda saat ini berada dalam persepsi yang relatif mapan dan terpenuhi, sehingga kekhawatiran terkait sarana fisik tidak mendominasi pikiran Anda.`;

    let k3 = (scores.hargaDiri >= 3 || scores.bersama >= 3)
        ? `Dalam interaksi lingkungan kerja, iklim saling mendukung dalam tim serta apresiasi tulus terhadap kompetensi profesional Anda menjadi pengungkit motivasi yang sangat signifikan.`
        : `Terkait hubungan sosial dan penghargaan eksternal, Anda memiliki kemandirian emosional yang baik dan tidak bergantung pada pengakuan orang lain untuk menjaga ritme kerja.`;

    let k4 = (scores.aktual >= 3)
        ? `Pada dorongan aktualisasi diri, Anda memiliki hasrat yang sangat kuat untuk mengambil tanggung jawab mandiri, memecahkan proyek yang menantang, serta berkreasi secara otonom tanpa pengawasan berlebih.`
        : `Dorongan aktualisasi diri Anda saat ini berjalan seimbang dengan ritme kerja terstruktur, di mana Anda lebih memprioritaskan ketuntasan target dibanding mencari risiko eksperimen baru.`;

    const k5 = `Secara keseluruhan, Anda akan memberikan kontribusi kinerja paling optimal apabila berada dalam ekosistem kerja yang ${scores.aman >= scores.aktual ? 'menjamin kepastian sistem yang transparan dan minim ambiguitas peran' : 'memberikan kepercayaan otonomi karya dan tantangan pengembangan potensi baru'}.`;

    return `${k1} ${k2} ${k3} ${k4} ${k5}`;
}

// SYNC DATA SPREADSHEET (NO CORS)
function sendDataToSpreadsheet(payload) {
    if (!GOOGLE_SCRIPT_URL) return;
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    }).then(() => {
        console.log("Data berhasil disinkronkan ke Google Spreadsheet.");
    }).catch(err => {
        console.error("Gagal sinkron data:", err);
    });
}
