// ==========================================
// KONFIGURASI GOOGLE SPREADSHEET & ACCESS CODE
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZnP0s0KngOwQ4WzpmDg09L_Uy0Ht_Bbs9lJCWw4Or2-I2lUZkBUgnj3pjsk_0mKPm/exec";

// Daftar Kode Master Cadangan
const VALID_ACCESS_CODES = ["ARAYA2026", "MASLOW88", "PREMIUM88", "LEADERVIP", "ARAYA55"];

// Database 25 Butir Pernyataan
const questions = [
    // Bagian 1: Fisiologis (1-5)
    { id: 1, level: "physio", text: "Saat ini, pemenuhan kebutuhan finansial dan fisik dasar adalah prioritas utama yang paling memotivasi saya bekerja/beraktivitas." },
    { id: 2, level: "physio", text: "Kondisi fisik yang prima dan fasilitas kerja yang nyaman sangat menentukan tingkat semangat harian saya." },
    { id: 3, level: "physio", text: "Kompensasi materi atau imbalan nyata adalah faktor terkuat yang membuat saya bersedia mengerahkan usaha ekstra." },
    { id: 4, level: "physio", text: "Jam istirahat, beban fisik yang seimbang, dan kelayakan tempat kerja lebih saya perhatikan dibanding status atau pujian." },
    { id: 5, level: "physio", text: "Saya merasa sulit fokus berkarya jika kebutuhan dasar dan sarana harian saya belum terpenuhi dengan layak." },
    
    // Bagian 2: Rasa Aman (6-10)
    { id: 6, level: "safety", text: "Kejelasan aturan, regulasi, dan kepastian jangka panjang membuat saya merasa tenang dan produktif." },
    { id: 7, level: "safety", text: "Saya lebih termotivasi dalam lingkungan yang stabil dan terstruktur dibanding lingkungan yang penuh ketidakpastian/risiko tinggi." },
    { id: 8, level: "safety", text: "Jaminan perlindungan (seperti tabungan aman, kepastian posisi, atau asuransi/tunjangan) memberi saya dorongan motivasi yang besar." },
    { id: 9, level: "safety", text: "Menghindari kesalahan dan menjaga keamanan posisi/kelangsungan kerja menjadi perhatian utama saya sehari-hari." },
    { id: 10, level: "safety", text: "Arahan atasan/SOP yang jelas dan transparan membuat saya bekerja jauh lebih efektif tanpa rasa cemas." },

    // Bagian 3: Sosial & Relasi (11-15)
    { id: 11, level: "social", text: "Diterima dan memiliki hubungan akrab dengan rekan kerja/komunitas membuat saya jauh lebih bersemangat dalam beraktivitas." },
    { id: 12, level: "social", text: "Suasana kekeluargaan dan saling mendukung dalam tim lebih berharga bagi saya daripada pencapaian yang diraih sendirian." },
    { id: 13, level: "social", text: "Saya termotivasi untuk berkontribusi lebih jika dilibatkan dalam kegiatan kebersamaan atau proyek kelompok." },
    { id: 14, level: "social", text: "Terjadinya konflik relasi atau suasana dingin di lingkungan kerja sangat menguras energi dan semangat saya." },
    { id: 15, level: "social", text: "Komunikasi terbuka dan rasa saling peduli antar-anggota tim adalah faktor kunci kenyamanan saya berkarya." },

    // Bagian 4: Harga Diri & Pengakuan (16-20)
    { id: 16, level: "esteem", text: "Apresiasi dan pengakuan atas pencapaian kerja memberikan dorongan moral yang sangat besar bagi saya." },
    { id: 17, level: "esteem", text: "Saya terdorong untuk membuktikan kemampuan terbaik saya agar diakui kompetensinya oleh orang lain/lingkungan." },
    { id: 18, level: "esteem", text: "Diberikan kepercayaan memegang tanggung jawab atau posisi penting membuat saya merasa dihargai." },
    { id: 19, level: "esteem", text: "Mendapatkan reputasi positif dan status yang layak atas kerja keras saya adalah hal yang sangat saya dambakan." },
    { id: 20, level: "esteem", text: "Kritik yang disampaikan tanpa menghargai usaha saya dapat menurunkan motivasi kerja saya secara drastis." },

    // Bagian 5: Aktualisasi Diri (21-25)
    { id: 21, level: "actual", text: "Saya sangat termotivasi ketika diberi ruang dan otonomi penuh untuk mengeksplorasi potensi diri saya secara mandiri." },
    { id: 22, level: "actual", text: "Menghadapi tantangan baru dan menciptakan karya inovatif jauh lebih memuaskan daripada sekadar bekerja sesuai rutinitas." },
    { id: 23, level: "actual", text: "Saya terdorong untuk terus belajar dan menguasai keahlian baru demi pertumbuhan kualitas diri pribadi." },
    { id: 24, level: "actual", text: "Memiliki kebebasan dalam mengambil keputusan kreatif memberikan kepuasan mendalam bagi saya." },
    { id: 25, level: "actual", text: "Makna dan dampak positif dari apa yang saya kerjakan bagi orang banyak adalah sumber motivasi tertinggi saya." }
];

const dimensionTitles = [
    "Level 1: Kebutuhan Fisiologis & Fasilitas Fisik",
    "Level 2: Kebutuhan Rasa Aman & Kepastian Sistem",
    "Level 3: Kebutuhan Sosial & Keterikatan Relasi",
    "Level 4: Kebutuhan Harga Diri & Pengakuan Kompetensi",
    "Level 5: Kebutuhan Aktualisasi Diri & Eksplorasi Potensi"
];

let currentPage = 0;
const questionsPerPage = 5;
const totalPages = 5;
let userAnswers = {};
let respondentData = {};
let calculatedScores = {};
let dominantDimension = "";
let currentTestId = "";
let radarChartInstance = null;

// STEP 1: MULAI ASESMEN DARI DATA DIRI
function startAssessment() {
    const nama = document.getElementById("nama").value.trim();
    const posisi = document.getElementById("posisi").value.trim() || "Umum";
    const whatsapp = document.getElementById("whatsapp").value.trim();

    if (!nama || !whatsapp) {
        alert("Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.");
        return;
    }

    respondentData = { 
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

// RENDER 5 SOAL PER HALAMAN (ADAPTIVE WIZARD)
function renderQuizPage() {
    const startIdx = currentPage * questionsPerPage;
    const currentQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

    const progressPct = ((currentPage + 1) / totalPages) * 100;
    document.getElementById("step-indicator").innerText = `Bagian ${currentPage + 1} dari ${totalPages}`;
    document.getElementById("percent-indicator").innerText = `${Math.round(progressPct)}%`;
    document.getElementById("progress-fill").style.width = `${progressPct}%`;
    document.getElementById("dimension-title").innerText = dimensionTitles[currentPage];

    document.getElementById("btn-prev").style.visibility = currentPage === 0 ? "hidden" : "visible";
    document.getElementById("btn-next").innerHTML = currentPage === totalPages - 1 
        ? `Selesai & Proses Hasil <i class="fa-solid fa-check"></i>` 
        : `Selanjutnya <i class="fa-solid fa-arrow-right"></i>`;

    const container = document.getElementById("quiz-page-container");
    container.innerHTML = currentQuestions.map(q => {
        const val = userAnswers[q.id] || "";
        return `
            <div class="quiz-card">
                <p><strong>${q.id}.</strong> ${q.text}</p>
                <div class="options-pill-group">
                    <div class="pill-option">
                        <input type="radio" name="q_${q.id}" id="q_${q.id}_5" value="5" ${val == 5 ? 'checked' : ''} onchange="saveAnswer(${q.id}, 5)">
                        <label for="q_${q.id}_5">
                            <span class="score-num">5</span>
                            <span class="score-label">Sangat Setuju</span>
                        </label>
                    </div>
                    <div class="pill-option">
                        <input type="radio" name="q_${q.id}" id="q_${q.id}_4" value="4" ${val == 4 ? 'checked' : ''} onchange="saveAnswer(${q.id}, 4)">
                        <label for="q_${q.id}_4">
                            <span class="score-num">4</span>
                            <span class="score-label">Setuju</span>
                        </label>
                    </div>
                    <div class="pill-option">
                        <input type="radio" name="q_${q.id}" id="q_${q.id}_3" value="3" ${val == 3 ? 'checked' : ''} onchange="saveAnswer(${q.id}, 3)">
                        <label for="q_${q.id}_3">
                            <span class="score-num">3</span>
                            <span class="score-label">Netral</span>
                        </label>
                    </div>
                    <div class="pill-option">
                        <input type="radio" name="q_${q.id}" id="q_${q.id}_2" value="2" ${val == 2 ? 'checked' : ''} onchange="saveAnswer(${q.id}, 2)">
                        <label for="q_${q.id}_2">
                            <span class="score-num">2</span>
                            <span class="score-label">Tidak Setuju</span>
                        </label>
                    </div>
                    <div class="pill-option">
                        <input type="radio" name="q_${q.id}" id="q_${q.id}_1" value="1" ${val == 1 ? 'checked' : ''} onchange="saveAnswer(${q.id}, 1)">
                        <label for="q_${q.id}_1">
                            <span class="score-num">1</span>
                            <span class="score-label">Sgt Tdk Setuju</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function saveAnswer(qId, value) {
    userAnswers[qId] = value;
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
        window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
        processFinalResults();
    }
}

function prevQuizPage() {
    if (currentPage > 0) {
        currentPage--;
        renderQuizPage();
        window.scrollTo({ top: 120, behavior: 'smooth' });
    }
}

// PROSES SKOR & INTEGRASI SPREADSHEET
function processFinalResults() {
    calculatedScores = { physio: 0, safety: 0, social: 0, esteem: 0, actual: 0 };
    questions.forEach(q => {
        calculatedScores[q.level] += userAnswers[q.id];
    });

    const metaLevels = [
        { key: "physio", name: "1. Fisiologis & Fisik Dasar" },
        { key: "safety", name: "2. Rasa Aman & Stabilitas" },
        { key: "social", name: "3. Sosial & Keterikatan Tim" },
        { key: "esteem", name: "4. Harga Diri & Pengakuan" },
        { key: "actual", name: "5. Aktualisasi Diri & Otonomi" }
    ];

    let maxScore = -1;
    metaLevels.forEach(lvl => {
        if (calculatedScores[lvl.key] > maxScore) {
            maxScore = calculatedScores[lvl.key];
            dominantDimension = lvl.key;
        }
    });

    // Generate ID Asesmen
    currentTestId = `MSL-${Date.now().toString().slice(-6)}`;

    // Populate Header Report
    document.getElementById("rep-nama").innerText = respondentData.nama;
    document.getElementById("rep-posisi").innerText = respondentData.posisi;
    document.getElementById("rep-tanggal").innerText = respondentData.tanggal;
    document.getElementById("rep-id").innerText = currentTestId;

    // Update Link Tombol WhatsApp dengan Data Responden
    const waText = encodeURIComponent(`Halo Admin Araya, saya ingin meminta Kode Akses untuk membuka Laporan Asesmen Maslow.\n\n*Nama:* ${respondentData.nama}\n*ID Asesmen:* ${currentTestId}\n*No. WA:* ${respondentData.whatsapp}`);
    const waUrl = `https://wa.me/6285232526003?text=${waText}`;
    
    document.getElementById("link-minta-kode").href = waUrl;
    document.getElementById("floating-wa-btn").href = waUrl;

    // Populate Table Score
    const tbody = document.getElementById("report-table-body");
    tbody.innerHTML = "";
    metaLevels.forEach(lvl => {
        const s = calculatedScores[lvl.key];
        const pct = Math.round((s / 25) * 100);
        let status = "Moderat";
        if (s >= 21) status = "Sangat Tinggi (Driver Utama)";
        else if (s >= 16) status = "Tinggi (Prioritas)";
        else if (s <= 10) status = "Rendah / Terpenuhi";

        tbody.innerHTML += `
            <tr>
                <td><strong>${lvl.name}</strong></td>
                <td><strong>${s}</strong> / 25</td>
                <td>${pct}%</td>
                <td>${status}</td>
            </tr>
        `;
    });

    const driverTitles = {
        physio: "Fisiologis & Kesejahteraan Fisik (Physiological Needs)",
        safety: "Rasa Aman & Kepastian Regulasi (Safety Needs)",
        social: "Sosial & Keterikatan Relasi Tim (Belonging Needs)",
        esteem: "Harga Diri & Pengakuan Kompetensi (Esteem Needs)",
        actual: "Aktualisasi Diri & Pertumbuhan Mandiri (Self-Actualization Needs)"
    };
    document.getElementById("rep-primary-driver").innerText = driverTitles[dominantDimension];

    // Build Detailed Narrative (Minimal 5 Kalimat) & Action Insights
    buildDetailedNarrative(calculatedScores, dominantDimension);
    buildDetailedActions(dominantDimension);

    // Kunci Konten Default (Paywall)
    lockFullReport();

    // Tampilkan Halaman Hasil
    document.getElementById("step-quiz").classList.add("hidden");
    document.getElementById("step-result").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    renderRadarChart(calculatedScores);

    // Kirim Data Lengkap ke Google Apps Script Spreadsheet
    sendDataToSpreadsheet({
        testId: currentTestId,
        nama: respondentData.nama,
        posisi: respondentData.posisi,
        whatsapp: respondentData.whatsapp,
        tanggal: respondentData.tanggal,
        fisiologis: calculatedScores.physio,
        rasaAman: calculatedScores.safety,
        sosial: calculatedScores.social,
        hargaDiri: calculatedScores.esteem,
        aktualisasi: calculatedScores.actual,
        driverUtama: driverTitles[dominantDimension]
    });
}

// GENERATOR INTERPRETASI MINIMAL 5 KALIMAT TERSTRUKTUR
function buildDetailedNarrative(scores, domKey) {
    const k1 = `Berdasarkan profil diagnostik kebutuhan Maslow, dorongan motivasi harian Anda saat ini paling dominan digerakkan oleh ${driverTitlesMapping(domKey)}, yang menjadi pusat perhatian mental dan alokasi energi kerja Anda sehari-hari.`;
    
    let k2 = (scores.physio >= 18 || scores.safety >= 18)
        ? `Pada fondasi kebutuhan dasar, Anda membutuhkan jaminan stabilitas materi, kejelasan regulasi SOP, serta kepastian lingkungan yang aman sebelum dapat berkarya secara tenang dan fokus.`
        : `Fondasi kebutuhan dasar dan rasa aman Anda saat ini berada dalam kondisi yang sangat memadai dan stabil, sehingga kecemasan terhadap kelangsungan fisik tidak lagi membebani fokus kerja Anda.`;

    let k3 = (scores.esteem >= 18 || scores.social >= 18)
        ? `Dalam dinamika interpersonal, kehangatan relasi tim, iklim saling mendukung, serta apresiasi terhadap kompetensi profesional Anda menjadi katalisator kuat yang melipatgandakan motivasi berkontribusi.`
        : `Terkait relasi sosial dan pengakuan eksternal, Anda memiliki kemandirian emosional yang tinggi dan tidak bergantung pada pujian orang lain untuk mempertahankan ritme produktivitas harian.`;

    let k4 = (scores.actual >= 18)
        ? `Pada aspek pertumbuhan personal, Anda memiliki dorongan aktualisasi diri yang sangat besar untuk mengeksplorasi potensi maksimal, memecahkan tantangan baru, serta berkreasi secara otonom.`
        : `Dorongan eksplorasi aktualisasi diri Anda saat ini berjalan selaras dengan rutinitas yang terstruktur, di mana Anda lebih memprioritaskan ketuntasan tugas secara presisi dibanding mengambil risiko perubahan.`;

    const k5 = `Secara keseluruhan, Anda akan mengeluarkan potensi terbaik dan mencapai kepuasan kinerja optimal apabila beraktivitas dalam ekosistem yang ${getIdealEnvironmentText(domKey)}.`;

    document.getElementById("rep-interpretation-text").innerText = `${k1} ${k2} ${k3} ${k4} ${k5}`;
}

function driverTitlesMapping(key) {
    const map = {
        physio: "kebutuhan Fisiologis dan kenyamanan fisik",
        safety: "kebutuhan Rasa Aman dan stabilitas sistem",
        social: "kebutuhan Sosial dan keharmonisan relasi kelompok",
        esteem: "kebutuhan Harga Diri dan pengakuan prestasi",
        actual: "kebutuhan Aktualisasi Diri dan pengembangan potensi penuh"
    };
    return map[key];
}

function getIdealEnvironmentText(key) {
    const map = {
        physio: "menjamin kelayakan alat kerja, proporsi beban kerja yang sehat, serta skema kompensasi materi yang adil dan tepat waktu",
        safety: "memiliki aturan SOP yang transparan, minim ambiguitas peran, serta menawarkan kepastian masa depan yang stabil",
        social: "mengedepankan budaya kerja guyub, komunikasi dua arah yang terbuka, serta minim gesekan konflik destruktif",
        esteem: "konsisten memberikan apresiasi formal atas capaian kerja, membuka ruang reputasi positif, dan memberikan kepercayaan tanggung jawab penting",
        actual: "memberikan kebebasan berinovasi (otonomi), mendukung pembelajaran keahlian baru, dan memfasilitasi gagasan kreatif berdampak luas"
    };
    return map[key];
}

function buildDetailedActions(domKey) {
    const selfMap = {
        physio: ["Disiplinkan waktu istirahat dan stamina fisik harian.", "Susun pengelolaan anggaran finansial pribadi secara teratur."],
        safety: ["Mintalah SOP dan indikator target tertulis kepada pimpinan.", "Buat ceklis mitigasi risiko sebelum memulai penugasan baru."],
        social: ["Terlibat aktif dalam diskusi kolaboratif dan forum tim.", "Bangun komunikasi suportif dan saling peduli antar-rekan."],
        esteem: ["Dokumentasikan rekam jejak portofolio prestasi secara rapi.", "Ambil inisiatif penugasan strategis untuk memperluas kontribusi."],
        actual: ["Luangkan waktu khusus mempelajari kompetensi masa depan.", "Ciptakan karya atau inovasi bernilai tambah tinggi bagi organisasi."]
    };

    const leaderMap = {
        physio: ["Pastikan kenyamanan sarana fisik dan kelayakan alat kerja.", "Tepati skema hak kompensasi dan insentif secara transparan."],
        safety: ["Berikan arahan penugasan spesifik tanpa kebijakan mendadak.", "Ciptakan atmosfer kerja yang aman dan memiliki kepastian karier."],
        social: ["Bangun iklim kerja kekeluargaan yang inklusif dan suportif.", "Cepat tanggap meredam gesekan relasional internal tim."],
        esteem: ["Beri apresiasi tulus atas setiap kontribusi nyata.", "Berikan pendelegasian wewenang yang menaikkan martabat profesionalnya."],
        actual: ["Berikan otonomi cara kerja selama sasaran akhir disepakati.", "Tantang dengan penugasan inovatif yang memerlukan pemikiran kreatif."]
    };

    document.getElementById("rep-self-actions").innerHTML = selfMap[domKey].map(a => `<li>${a}</li>`).join("");
    document.getElementById("rep-leader-actions").innerHTML = leaderMap[domKey].map(a => `<li>${a}</li>`).join("");
}

// SISTEM PAYWALL & KODE AKSES
function lockFullReport() {
    document.getElementById("full-report-content").classList.add("locked-content");
    document.getElementById("btn-download-pdf").disabled = true;
    document.getElementById("btn-download-pdf").innerHTML = `<i class="fa-solid fa-lock"></i> Laporan Terkunci (Masukkan Kode)`;
}

// VALIDASI KODE AKTIVASI DUA ARAH
async function validateAccessCode() {
    const inputCode = document.getElementById("input-access-code").value.trim().toUpperCase();
    if (!inputCode) {
        alert("Silakan ketik kode akses terlebih dahulu.");
        return;
    }

    const btnUnlock = document.querySelector(".btn-unlock");
    const originalText = btnUnlock.innerHTML;
    btnUnlock.disabled = true;
    btnUnlock.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa...`;

    // 1. Cek Online ke Google Apps Script Spreadsheet
    if (GOOGLE_SCRIPT_URL) {
        try {
            const checkUrl = `${GOOGLE_SCRIPT_URL}?action=checkCode&code=${encodeURIComponent(inputCode)}&nama=${encodeURIComponent(respondentData.nama || 'Peserta')}&whatsapp=${encodeURIComponent(respondentData.whatsapp || '')}&testId=${encodeURIComponent(currentTestId || '')}`;
            const response = await fetch(checkUrl);
            const result = await response.json();

            if (result.valid) {
                unlockReportSuccess();
                alert("Kode Akses Valid! Laporan lengkap dan fitur unduh PDF resmi telah terbuka.");
                return;
            } else {
                alert(result.message || "Kode akses tidak valid atau sudah pernah digunakan.");
                btnUnlock.disabled = false;
                btnUnlock.innerHTML = originalText;
                return;
            }
        } catch (err) {
            console.warn("Gagal terhubung ke Google Apps Script, mencoba verifikasi offline/fallback:", err);
        }
    }

    // 2. Fallback Verifikasi Kode Cadangan Master jika Offline
    if (VALID_ACCESS_CODES.includes(inputCode)) {
        unlockReportSuccess();
        alert("Kode Akses Valid! Laporan lengkap berhasil dibuka.");
    } else {
        alert("Kode Akses tidak valid atau tidak ditemukan. Silakan hubungi Admin via WhatsApp (0852-3252-6003).");
        btnUnlock.disabled = false;
        btnUnlock.innerHTML = originalText;
    }
}

function unlockReportSuccess() {
    document.getElementById("full-report-content").classList.remove("locked-content");
    document.getElementById("lock-banner").style.display = "none";
    
    const btnPdf = document.getElementById("btn-download-pdf");
    btnPdf.disabled = false;
    btnPdf.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Unduh / Cetak Laporan PDF Resmi`;
}

// RADAR CHART MASLOW
function renderRadarChart(scores) {
    const ctx = document.getElementById('maslowRadarChart').getContext('2d');
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Fisiologis', 'Rasa Aman', 'Sosial', 'Harga Diri', 'Aktualisasi Diri'],
            datasets: [{
                data: [scores.physio, scores.safety, scores.social, scores.esteem, scores.actual],
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                borderColor: '#2563eb',
                borderWidth: 2.5,
                pointBackgroundColor: '#dc2626',
                pointBorderColor: '#fff',
                pointRadius: 4.5
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: '#e2e8f0' },
                    grid: { color: '#e2e8f0' },
                    suggestedMin: 0,
                    suggestedMax: 25,
                    ticks: { stepSize: 5, font: { size: 9 } }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// SINKRONISASI DATA KE GOOGLE SPREADSHEET
function sendDataToSpreadsheet(payload) {
    if (!GOOGLE_SCRIPT_URL) return;

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    }).then(() => {
        console.log("Data berhasil dikirim ke Google Spreadsheet.");
    }).catch(err => {
        console.error("Gagal sinkron data ke Spreadsheet:", err);
    });
}
