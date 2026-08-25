// ==========================================
// KONFIGURASI SPREADSHEET & ACCESS CODE
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZnP0s0KngOwQ4WzpmDg09L_Uy0Ht_Bbs9lJCWw4Or2-I2lUZkBUgnj3pjsk_0mKPm/exec";
const MASTER_PASSCODES = ["ARAYA2026", "MASLOW88", "PREMIUM88", "LEADERVIP", "ARAYA55"];

// 25 Butir Pernyataan Maslow
const questions = [
    // Level 1: Fisiologis (1-5)
    { id: 1, level: "physio", text: "Saat ini, pemenuhan kebutuhan finansial dan fisik dasar adalah prioritas utama yang paling memotivasi saya bekerja/beraktivitas." },
    { id: 2, level: "physio", text: "Kondisi fisik yang prima dan fasilitas kerja yang nyaman sangat menentukan tingkat semangat harian saya." },
    { id: 3, level: "physio", text: "Kompensasi materi atau imbalan nyata adalah faktor terkuat yang membuat saya bersedia mengerahkan usaha ekstra." },
    { id: 4, level: "physio", text: "Jam istirahat, beban fisik yang seimbang, dan kelayakan tempat kerja lebih saya perhatikan dibanding status atau pujian." },
    { id: 5, level: "physio", text: "Saya merasa sulit fokus berkarya jika kebutuhan dasar dan sarana harian saya belum terpenuhi dengan layak." },
    
    // Level 2: Rasa Aman (6-10)
    { id: 6, level: "safety", text: "Kejelasan aturan, regulasi, dan kepastian jangka panjang membuat saya merasa tenang dan produktif." },
    { id: 7, level: "safety", text: "Saya lebih termotivasi dalam lingkungan yang stabil dan terstruktur dibanding lingkungan yang penuh ketidakpastian/risiko tinggi." },
    { id: 8, level: "safety", text: "Jaminan perlindungan (seperti tabungan aman, kepastian posisi, atau asuransi/tunjangan) memberi saya dorongan motivasi yang besar." },
    { id: 9, level: "safety", text: "Menghindari kesalahan dan menjaga keamanan posisi/kelangsungan kerja menjadi perhatian utama saya sehari-hari." },
    { id: 10, level: "safety", text: "Arahan atasan/SOP yang jelas dan transparan membuat saya bekerja jauh lebih efektif tanpa rasa cemas." },

    // Level 3: Sosial & Relasi (11-15)
    { id: 11, level: "social", text: "Diterima dan memiliki hubungan akrab dengan rekan kerja/komunitas membuat saya jauh lebih bersemangat dalam beraktivitas." },
    { id: 12, level: "social", text: "Suasana kekeluargaan dan saling mendukung dalam tim lebih berharga bagi saya daripada pencapaian yang diraih sendirian." },
    { id: 13, level: "social", text: "Saya termotivasi untuk berkontribusi lebih jika dilibatkan dalam kegiatan kebersamaan atau proyek kelompok." },
    { id: 14, level: "social", text: "Terjadinya konflik relasi atau suasana dingin di lingkungan kerja sangat menguras energi dan semangat saya." },
    { id: 15, level: "social", text: "Komunikasi terbuka dan rasa saling peduli antar-anggota tim adalah faktor kunci kenyamanan saya berkarya." },

    // Level 4: Harga Diri & Pengakuan (16-20)
    { id: 16, level: "esteem", text: "Apresiasi dan pengakuan atas pencapaian kerja memberikan dorongan moral yang sangat besar bagi saya." },
    { id: 17, level: "esteem", text: "Saya terdorong untuk membuktikan kemampuan terbaik saya agar diakui kompetensinya oleh orang lain/lingkungan." },
    { id: 18, level: "esteem", text: "Diberikan kepercayaan memegang tanggung jawab atau posisi penting membuat saya merasa dihargai." },
    { id: 19, level: "esteem", text: "Mendapatkan reputasi positif dan status yang layak atas kerja keras saya adalah hal yang sangat saya dambakan." },
    { id: 20, level: "esteem", text: "Kritik yang disampaikan tanpa menghargai usaha saya dapat menurunkan motivasi kerja saya secara drastis." },

    // Level 5: Aktualisasi Diri (21-25)
    { id: 21, level: "actual", text: "Saya sangat termotivasi ketika diberi ruang dan otonomi penuh untuk mengeksplorasi potensi diri saya secara mandiri." },
    { id: 22, level: "actual", text: "Menghadapi tantangan baru dan menciptakan karya inovatif jauh lebih memuaskan daripada sekadar bekerja sesuai rutinitas." },
    { id: 23, level: "actual", text: "Saya terdorong untuk terus belajar dan menguasai keahlian baru demi pertumbuhan kualitas diri pribadi." },
    { id: 24, level: "actual", text: "Memiliki kebebasan dalam mengambil keputusan kreatif memberikan kepuasan mendalam bagi saya." },
    { id: 25, level: "actual", text: "Makna dan dampak positif dari apa yang saya kerjakan bagi orang banyak adalah sumber motivasi tertinggi saya." }
];

const dimensionTitles = [
    "Level 1: Kebutuhan Fisiologis & Fisik Dasar",
    "Level 2: Kebutuhan Rasa Aman & Kepastian Sistem",
    "Level 3: Kebutuhan Sosial & Keterikatan Relasi",
    "Level 4: Kebutuhan Harga Diri & Pengakuan Kompetensi",
    "Level 5: Kebutuhan Aktualisasi Diri & Eksplorasi Potensi"
];

// STATE
let currentPage = 0;
const questionsPerPage = 5;
const totalPages = 5;
let userAnswers = {};
let userInfo = { nama: "", posisi: "", whatsapp: "", tanggal: "" };
let calculatedScores = { physio: 0, safety: 0, social: 0, esteem: 0, actual: 0 };
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

// RENDER WIZARD PER 5 SOAL
function renderQuizPage() {
    const startIdx = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

    const progressPct = ((currentPage + 1) / totalPages) * 100;
    document.getElementById("step-indicator").innerText = `Bagian ${currentPage + 1} / ${totalPages}`;
    document.getElementById("percent-indicator").innerText = `${Math.round(progressPct)}%`;
    document.getElementById("progress-fill").style.width = `${progressPct}%`;
    document.getElementById("dimension-title").innerText = dimensionTitles[currentPage];

    document.getElementById("btn-prev").style.visibility = currentPage === 0 ? "hidden" : "visible";
    document.getElementById("btn-next").innerHTML = currentPage === totalPages - 1 
        ? `Selesai & Analisis <i class="fa-solid fa-check ml-1"></i>` 
        : `Selanjutnya <i class="fa-solid fa-arrow-right ml-1"></i>`;

    const container = document.getElementById("quiz-page-container");
    container.innerHTML = currentQuestions.map(q => {
        const val = userAnswers[q.id] || "";
        return `
            <div class="quiz-item-box">
                <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-snug"><strong>${q.id}.</strong> ${q.text}</p>
                <div class="options-pill-group">
                    ${[5, 4, 3, 2, 1].map(score => {
                        const labels = { 5: "Sgt Setuju", 4: "Setuju", 3: "Netral", 2: "Tdk Setuju", 1: "Sgt Tdk" };
                        return `
                            <div class="pill-option">
                                <input type="radio" name="q_${q.id}" id="q_${q.id}_${score}" value="${score}" ${val == score ? 'checked' : ''} onchange="userAnswers[${q.id}] = ${score}">
                                <label for="q_${q.id}_${score}">
                                    <span class="score-num">${score}</span>
                                    <span class="score-label">${labels[score]}</span>
                                </label>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }).join("");
}

function nextQuizPage() {
    const startIdx = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

    for (let q of currentQuestions) {
        if (!userAnswers[q.id]) {
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

// PROSES SKOR & KIRIM KE GOOGLE SPREADSHEET
async function processAndSyncResults() {
    calculatedScores = { physio: 0, safety: 0, social: 0, esteem: 0, actual: 0 };
    questions.forEach(q => {
        calculatedScores[q.level] += userAnswers[q.id];
    });

    let maxScore = -1;
    ["physio", "safety", "social", "esteem", "actual"].forEach(key => {
        if (calculatedScores[key] > maxScore) {
            maxScore = calculatedScores[key];
            dominantKey = key;
        }
    });

    currentReportId = `MSL-${Math.floor(100000 + Math.random() * 900000)}`;

    // Set WA Order Button
    const waMsg = `Halo Mas Ali, saya sudah selesai tes Maslow Need & Motivation.\n\n*Nama:* ${userInfo.nama}\n*ID Registrasi:* ${currentReportId}\n*No. WA:* ${userInfo.whatsapp}\n\nMohon kode aktivasi untuk mengunduh laporan resmi.`;
    const waUrl = `https://wa.me/6285232526003?text=${encodeURIComponent(waMsg)}`;
    
    document.getElementById("wa-admin-btn").href = waUrl;
    document.getElementById("floating-wa").href = waUrl;

    // Tampilkan Layar Paywall
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
        fisiologis: calculatedScores.physio,
        rasaAman: calculatedScores.safety,
        sosial: calculatedScores.social,
        hargaDiri: calculatedScores.esteem,
        aktualisasi: calculatedScores.actual,
        driverUtama: getDriverTitle(dominantKey)
    });
}

// VALIDASI KODE DUA ARAH (APPS SCRIPT + MASTER FALLBACK)
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

// POPULATE KONTEN CANVAS DOKUMEN PDF A4
function renderPDFCanvas() {
    document.getElementById("pdf-nama").innerText = userInfo.nama;
    document.getElementById("pdf-posisi").innerText = userInfo.posisi;
    document.getElementById("pdf-id").innerText = currentReportId;
    document.getElementById("pdf-tanggal").innerText = userInfo.tanggal;
    document.getElementById("pdf-footer-id").innerText = currentReportId;

    document.getElementById("pdf-dominant-title").innerText = getDriverTitle(dominantKey);
    document.getElementById("pdf-dominant-slogan").innerText = `"${getDriverSlogan(dominantKey)}"`;

    // Table
    const meta = [
        { key: "physio", name: "1. Kebutuhan Fisiologis" },
        { key: "safety", name: "2. Rasa Aman & Stabilitas" },
        { key: "social", name: "3. Sosial & Keterikatan Tim" },
        { key: "esteem", name: "4. Harga Diri & Pengakuan" },
        { key: "actual", name: "5. Aktualisasi Diri" }
    ];

    const tbody = document.getElementById("pdf-score-tbody");
    tbody.innerHTML = meta.map(m => {
        const s = calculatedScores[m.key];
        const pct = Math.round((s / 25) * 100);
        let status = "Moderat";
        if (s >= 21) status = "Sangat Tinggi (Driver)";
        else if (s >= 16) status = "Tinggi (Prioritas)";
        else if (s <= 10) status = "Rendah / Terpenuhi";

        return `
            <tr>
                <td class="p-1 border border-slate-200 font-semibold">${m.name}</td>
                <td class="p-1 border border-slate-200 text-center font-bold">${s} / 25</td>
                <td class="p-1 border border-slate-200 text-center">${pct}%</td>
                <td class="p-1 border border-slate-200 text-blue-900 font-semibold">${status}</td>
            </tr>
        `;
    }).join("");

    // Radar Chart di Canvas PDF
    renderPDFRadar();

    // Narrative Minimal 5 Kalimat
    document.getElementById("pdf-narrative").innerText = buildFullNarrative(calculatedScores, dominantKey);

    // Actions
    const selfMap = {
        physio: ["Disiplinkan pola istirahat dan stamina fisik.", "Kelola anggaran operasional pribadi teratur."],
        safety: ["Mintalah kejelasan SOP dan target pada atasan.", "Susun ceklis mitigasi risiko kerja."],
        social: ["Aktif membangun komunikasi guyub di tim.", "Ciptakan suasana kerja yang saling mendukung."],
        esteem: ["Dokumentasikan portofolio prestasi kerja.", "Ambil tanggung jawab strategis yang menantang."],
        actual: ["Kembangkan keahlian inovatif masa depan.", "Ciptakan karya berdampak luas bagi organisasi."]
    };

    const leaderMap = {
        physio: ["Pastikan sarana dan alat kerja layak pakai.", "Jamin hak kompensasi tepat waktu dan adil."],
        safety: ["Berikan instruksi jelas tanpa aturan mendadak.", "Ciptakan atmosfer stabilitas kerja yang pasti."],
        social: ["Bangun iklim kerja kekeluargaan yang guyub.", "Cepat tanggap meredam gesekan relasi internal."],
        esteem: ["Beri apresiasi tulus atas setiap kontribusi.", "Delegasikan wewenang berbobot secara terhormat."],
        actual: ["Beri otonomi penuh dalam pengambilan solusi.", "Tantang dengan proyek inovasi terobosan baru."]
    };

    document.getElementById("pdf-self-actions").innerHTML = selfMap[dominantKey].map(a => `<li>${a}</li>`).join("");
    document.getElementById("pdf-leader-actions").innerHTML = leaderMap[dominantKey].map(a => `<li>${a}</li>`).join("");
}

function renderPDFRadar() {
    const ctx = document.getElementById("pdfRadarCanvas").getContext("2d");
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Fisiologis', 'Aman', 'Sosial', 'Pengakuan', 'Aktualisasi'],
            datasets: [{
                data: [calculatedScores.physio, calculatedScores.safety, calculatedScores.social, calculatedScores.esteem, calculatedScores.actual],
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
                    suggestedMax: 25,
                    ticks: { display: false, stepSize: 5 },
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

    // 1. Populate data ke canvas target
    renderPDFCanvas();

    // Tunggu render grafik canvas selesai
    await new Promise(r => setTimeout(r, 400));

    try {
        const certElement = document.getElementById('pdf-report-canvas');
        
        // 2. Render Bitmap Canvas Resolusi Tinggi (Scale 2)
        const canvas = await html2canvas(certElement, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            windowWidth: 794
        });

        // 3. Ekspor ke jsPDF Portrait A4 Standar (210mm x 297mm)
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
        physio: "Fisiologis & Kesejahteraan Fisik",
        safety: "Rasa Aman & Kepastian Sistem",
        social: "Sosial & Keterikatan Relasi Tim",
        esteem: "Harga Diri & Pengakuan Kompetensi",
        actual: "Aktualisasi Diri & Eksplorasi Potensi"
    };
    return map[key] || "Motivasi Terpadu";
}

function getDriverSlogan(key) {
    const map = {
        physio: "Fokus pada kelayakan fasilitas dasar dan stabilitas materi nyata.",
        safety: "Fokus pada kejelasan regulasi SOP, minim risiko, dan kepastian karier.",
        social: "Fokus pada kehangatan kolaborasi, iklim guyub, dan penerimaan tim.",
        esteem: "Fokus pada apresiasi kompetensi, martabat, dan reputasi profesional.",
        actual: "Fokus pada otonomi karya, pertumbuhan mandiri, dan dampak luas."
    };
    return map[key] || "";
}

function buildFullNarrative(scores, key) {
    const k1 = `Berdasarkan profil diagnostik kebutuhan Maslow, dorongan motivasi harian Anda saat ini paling dominan digerakkan oleh pemenuhan ${getDriverTitle(key)}, yang menjadi pusat perhatian mental dan alokasi energi kerja Anda sehari-hari.`;
    
    let k2 = (scores.physio >= 18 || scores.safety >= 18)
        ? `Pada fondasi kebutuhan dasar, Anda membutuhkan jaminan stabilitas materi, kejelasan regulasi SOP, serta kepastian lingkungan yang aman sebelum dapat berkarya secara tenang dan fokus.`
        : `Fondasi kebutuhan dasar dan rasa aman Anda saat ini berada dalam kondisi yang sangat memadai dan stabil, sehingga kecemasan terhadap kelangsungan fisik tidak lagi membebani ritme kerja Anda.`;

    let k3 = (scores.esteem >= 18 || scores.social >= 18)
        ? `Dalam dinamika relasi, iklim saling mendukung dalam tim serta apresiasi terhadap kompetensi profesional Anda menjadi katalisator kuat yang melipatgandakan motivasi berkontribusi.`
        : `Terkait relasi sosial dan pengakuan eksternal, Anda memiliki kemandirian emosional yang tinggi dan tidak bergantung pada pujian orang lain untuk mempertahankan standar produktivitas.`;

    let k4 = (scores.actual >= 18)
        ? `Pada aspek pertumbuhan personal, Anda memiliki dorongan aktualisasi diri yang sangat besar untuk mengeksplorasi potensi maksimal, memecahkan tantangan baru, serta berkreasi secara otonom.`
        : `Dorongan eksplorasi aktualisasi diri Anda saat ini berjalan selaras dengan rutinitas terstruktur, di mana Anda lebih memprioritaskan ketuntasan tugas secara presisi dibanding mengambil risiko perubahan.`;

    const k5 = `Secara keseluruhan, Anda akan mengeluarkan performa terbaik dan kepuasan kinerja optimal apabila beraktivitas dalam ekosistem yang ${scores.safety >= scores.actual ? 'memberikan kepastian aturan kerja yang transparan dan minim ambiguitas peran' : 'memberikan ruang otonomi berkarya dan memfasilitasi gagasan kreatif berdampak luas'}.`;

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
