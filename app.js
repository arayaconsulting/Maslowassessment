// ==========================================
// KONFIGURASI SPREADSHEET & MASTER PASSCODE
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZnP0s0KngOwQ4WzpmDg09L_Uy0Ht_Bbs9lJCWw4Or2-I2lUZkBUgnj3pjsk_0mKPm/exec";
const MASTER_PASSCODES = ["ARAYA2026", "MASLOW88", "PREMIUM88", "LEADERVIP", "ARAYA55"];

// 25 BUTIR PERNYATAAN TERDISTRIBUSI SILANG (INTERLEAVED SHUFFLE)
// Mencegah peserta menebak pola dimensi yang diuji
const questions = [
    { id: 1, dim: "physio", text: "Saat ini, pemenuhan kebutuhan finansial dan fasilitas fisik dasar adalah faktor utama yang paling memotivasi saya dalam bekerja/beraktivitas." },
    { id: 2, dim: "safety", text: "Kejelasan aturan, pembagian tugas (SOP), dan kepastian jangka panjang membuat saya merasa tenang dalam bekerja." },
    { id: 3, dim: "social", text: "Diterima dengan hangat dan memiliki hubungan akrab dengan rekan kerja/komunitas membuat saya bersemangat dalam beraktivitas." },
    { id: 4, dim: "esteem", text: "Apresiasi formal dan pengakuan atas hasil kerja memberikan dorongan semangat dan kepuasan moral yang sangat besar bagi saya." },
    { id: 5, dim: "actual", text: "Saya sangat termotivasi ketika diberi kebebasan dan otonomi penuh untuk mengeksplorasi ide-ide serta potensi diri saya." },
    { id: 6, dim: "safety", text: "Saya bekerja lebih produktif dalam lingkungan yang stabil dan terstruktur dibanding lingkungan yang penuh perubahan mendadak/risiko tinggi." },
    { id: 7, dim: "esteem", text: "Saya terdorong untuk membuktikan kompetensi terbaik agar diakui keahliannya dan dihormati oleh lingkungan profesional." },
    { id: 8, dim: "physio", text: "Kondisi fisik yang prima dan lingkungan kerja yang nyaman secara nyata menentukan tingkat produktivitas dan semangat harian saya." },
    { id: 9, dim: "actual", text: "Menghadapi tantangan baru dan menciptakan terobosan inovatif jauh lebih memuaskan daripada sekadar menjalankan rutinitas yang monoton." },
    { id: 10, dim: "social", text: "Suasana kerja yang harmonis dan saling mendukung dalam tim jauh lebih berharga bagi saya daripada pencapaian yang diraih sendirian." },
    { id: 11, dim: "social", text: "Saya terdorong untuk memberikan kontribusi terbaik apabila dilibatkan dalam kegiatan kebersamaan atau proyek kolaborasi tim." },
    { id: 12, dim: "physio", text: "Kompensasi materi atau imbalan finansial yang kompetitif adalah faktor pendorong terkuat saat saya mengerahkan usaha ekstra." },
    { id: 13, dim: "actual", text: "Saya memiliki dorongan internal yang kuat untuk terus belajar dan menguasai keahlian baru demi pertumbuhan kualitas diri pribadi." },
    { id: 14, dim: "safety", text: "Jaminan perlindungan kerja (seperti kepastian posisi, tabungan aman, atau tunjangan masa depan) memberikan dorongan motivasi yang besar bagi saya." },
    { id: 15, dim: "esteem", text: "Diberikan kepercayaan memegang wewenang penting atau peran strategis membuat saya merasa dihargai martabat profesionalnya." },
    { id: 16, dim: "esteem", text: "Memperoleh reputasi positif, status yang layak, dan penghargaan atas dedikasi kerja adalah hal yang sangat saya dambakan." },
    { id: 17, dim: "actual", text: "Memiliki ruang untuk mengambil keputusan kreatif dan merancang solusi secara mandiri memberikan kepuasan kerja tertinggi bagi saya." },
    { id: 18, dim: "safety", text: "Menjaga keteraturan sistem, meminimalkan potensi kesalahan, dan memastikan keamanan kelangsungan kerja adalah fokus utama saya." },
    { id: 19, dim: "social", text: "Adanya konflik relasional atau suasana kerja yang dingin antar-rekan sangat menguras energi dan menurunkan motivasi saya." },
    { id: 20, dim: "physio", text: "Waktu istirahat yang cukup, beban kerja yang seimbang, dan kelayakan sarana kerja lebih saya utamakan dibanding pujian sosial." },
    { id: 21, dim: "actual", text: "Makna dan dampak positif jangka panjang dari karya yang saya hasilkan bagi orang banyak adalah sumber motivasi terdalam saya." },
    { id: 22, dim: "social", text: "Komunikasi terbuka, kekeluargaan yang guyub, dan rasa saling peduli antar-anggota tim adalah faktor kunci kenyamanan saya berkarya." },
    { id: 23, dim: "esteem", text: "Kritik yang disampaikan secara sepihak tanpa menghargai usaha keras saya dapat menurunkan motivasi kerja saya secara drastis." },
    { id: 24, dim: "physio", text: "Saya merasa sulit untuk fokus berkarya secara optimal apabila kebutuhan pokok dan fasilitas penunjang belum terpenuhi secara layak." },
    { id: 25, dim: "safety", text: "Instruksi kerja dan arahan atasan yang transparan membuat saya dapat menyelesaikan tanggung jawab secara efektif tanpa rasa cemas." }
];

// STATE
let currentPage = 0;
const questionsPerPage = 5; // 25 Soal dibagi 5 Tahap (5 Soal per Halaman)
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

// RENDER WIZARD PER 5 SOAL (LABEL PILIHAN RAMAH PENGGUNA)
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

    const optionsData = [
        { val: 5, label: "Sangat Setuju", short: "SS" },
        { val: 4, label: "Setuju", short: "S" },
        { val: 3, label: "Netral", short: "N" },
        { val: 2, label: "Tidak Setuju", short: "TS" },
        { val: 1, label: "Sgt Tdk Setuju", short: "STS" }
    ];

    const container = document.getElementById("quiz-page-container");
    container.innerHTML = currentQuestions.map(q => {
        const val = userAnswers[q.id] !== undefined ? userAnswers[q.id] : "";
        return `
            <div class="quiz-item-box">
                <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-snug"><strong>${q.id}.</strong> ${q.text}</p>
                <div class="options-pill-group">
                    ${optionsData.map(opt => `
                        <div class="pill-option">
                            <input type="radio" name="q_${q.id}" id="q_${q.id}_${opt.val}" value="${opt.val}" ${val === opt.val ? 'checked' : ''} onchange="userAnswers[${q.id}] = ${opt.val}">
                            <label for="q_${q.id}_${opt.val}">
                                <span class="score-num font-bold">${opt.short}</span>
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

// PROSES SKOR AKUMULASI 5 DIMENSI
async function processAndSyncResults() {
    calculatedScores = { physio: 0, safety: 0, social: 0, esteem: 0, actual: 0 };
    
    questions.forEach(q => {
        const score = userAnswers[q.id] || 0;
        calculatedScores[q.dim] += score;
    });

    let maxScore = -1;
    ["physio", "safety", "social", "esteem", "actual"].forEach(key => {
        if (calculatedScores[key] > maxScore) {
            maxScore = calculatedScores[key];
            dominantKey = key;
        }
    });

    currentReportId = `MSL-${Math.floor(100000 + Math.random() * 900000)}`;

    // Set Link Tombol WhatsApp Minta Kode
    const waMsg = `Halo Mas Ali, saya sudah selesai mengisi Tes Maslow Need & Motivation.\n\n*Nama:* ${userInfo.nama}\n*ID Registrasi:* ${currentReportId}\n*No. WA:* ${userInfo.whatsapp}\n\nMohon kode aktivasi untuk mengunduh laporan resmi.`;
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
        fisiologis: calculatedScores.physio,
        rasaAman: calculatedScores.safety,
        sosial: calculatedScores.social,
        hargaDiri: calculatedScores.esteem,
        aktualisasi: calculatedScores.actual,
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
        { key: "physio", name: "1. Kebutuhan Fisiologis (Fisik Dasar)" },
        { key: "safety", name: "2. Kebutuhan Rasa Aman (Stabilitas)" },
        { key: "social", name: "3. Kebutuhan Sosial (Relasi Tim)" },
        { key: "esteem", name: "4. Kebutuhan Harga Diri (Pengakuan)" },
        { key: "actual", name: "5. Kebutuhan Aktualisasi Diri (Otonomi)" }
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

    renderPDFRadar();

    document.getElementById("pdf-narrative").innerText = buildFullNarrative(calculatedScores, dominantKey);

    const selfMap = {
        physio: ["Disiplinkan pemulihan fisik dan stamina kerja harian.", "Atur manajemen finansial dan anggaran pribadi secara proporsional."],
        safety: ["Mintalah kejelasan SOP dan target capaian tertulis kepada atasan.", "Susun ceklis mitigasi risiko sebelum memulai penugasan baru."],
        social: ["Aktif membangun komunikasi guyub dalam lingkungan kerja.", "Jalin kolaborasi yang saling mendukung antar-rekan satu tim."],
        esteem: ["Dokumentasikan rekam jejak portofolio prestasi kerja secara rapi.", "Ambil inisiatif penugasan strategis yang menaikkan nilai tambah."],
        actual: ["Terus pelajari keterampilan baru yang menantang potensi diri.", "Ciptakan inovasi karya mandiri yang memberikan dampak nyata."]
    };

    const leaderMap = {
        physio: ["Pastikan kelayakan sarana fasilitas dan kenyamanan alat kerja.", "Jamin skema kompensasi dan hak materi tepat waktu serta adil."],
        safety: ["Berikan instruksi penugasan spesifik tanpa kebijakan mendadak.", "Ciptakan atmosfer kepastian kerja dan kejelasan masa depan posisi."],
        social: ["Bangun iklim kerja kekeluargaan yang inklusif dan suportif.", "Cepat tanggap meredam friksi atau konflik relasional internal tim."],
        esteem: ["Beri apresiasi tulus atas setiap kontribusi dan capaian nyata.", "Berikan pendelegasian wewenang secara proporsional dan terhormat."],
        actual: ["Beri otonomi penuh dalam menentukan metode penyelesaian tugas.", "Tantang dengan penugasan inovatif yang membutuhkan daya cipta tinggi."]
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

// LOGIKA DIRECT DOWNLOAD PDF (html2canvas + jsPDF MURNI SEPERTI APP DISC)
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
        physio: "Kebutuhan Fisiologis & Kelayakan Fisik",
        safety: "Kebutuhan Rasa Aman & Stabilitas Sistem",
        social: "Kebutuhan Sosial & Keterikatan Relasi Tim",
        esteem: "Kebutuhan Harga Diri & Pengakuan Kompetensi",
        actual: "Kebutuhan Aktualisasi Diri & Eksplorasi Potensi"
    };
    return map[key] || "Motivasi Terpadu";
}

function getDriverSlogan(key) {
    const map = {
        physio: "Fokus utama pada kelayakan fasilitas fisik dan kompensasi materi nyata.",
        safety: "Fokus utama pada kejelasan regulasi SOP, minim risiko, dan kepastian karier.",
        social: "Fokus utama pada keharmonisan relasi kerja, iklim guyub, dan penerimaan tim.",
        esteem: "Fokus utama pada apresiasi prestasi, reputasi, dan martabat profesional.",
        actual: "Fokus utama pada kemandirian otonomi, eksplorasi potensi, dan tantangan inovasi."
    };
    return map[key] || "";
}

function buildFullNarrative(scores, key) {
    const k1 = `Berdasarkan instrumen diagnostik hierarki Maslow, dorongan motivasi kerja Anda saat ini paling dominan digerakkan oleh pemenuhan ${getDriverTitle(key)}, yang menjadi pusat perhatian mental dan orientasi produktivitas Anda sehari-hari.`;
    
    let k2 = (scores.physio >= 18 || scores.safety >= 18)
        ? `Pada aspek fondasi dasar, Anda membutuhkan jaminan stabilitas materi, kejelasan regulasi SOP, serta kepastian lingkungan kerja yang aman sebelum dapat berkarya secara tenang dan fokus.`
        : `Fondasi kebutuhan dasar dan rasa aman Anda saat ini berada dalam persepsi yang sangat memadai dan stabil, sehingga kecemasan terhadap kelangsungan fisik tidak lagi membebani fokus kerja Anda.`;

    let k3 = (scores.esteem >= 18 || scores.social >= 18)
        ? `Dalam dinamika relasi kerja, kehangatan iklim tim serta apresiasi tulus atas kompetensi profesional Anda menjadi katalisator kuat yang melipatgandakan motivasi berkontribusi.`
        : `Terkait relasi sosial dan penghargaan eksternal, Anda memiliki kemandirian emosional yang tinggi dan tidak bergantung pada pujian orang lain untuk mempertahankan ritme produktivitas harian.`;

    let k4 = (scores.actual >= 18)
        ? `Pada aspek pertumbuhan personal, Anda memiliki dorongan aktualisasi diri yang sangat besar untuk mengeksplorasi potensi maksimal, memecahkan tantangan baru, serta berkreasi secara otonom.`
        : `Dorongan aktualisasi diri Anda saat ini berjalan selaras dengan rutinitas yang terstruktur, di mana Anda lebih memprioritaskan ketuntasan tugas secara presisi dibanding mengambil risiko perubahan.`;

    const k5 = `Secara keseluruhan, Anda akan mengeluarkan potensi terbaik dan mencapai kepuasan kinerja optimal apabila beraktivitas dalam ekosistem kerja yang ${scores.safety >= scores.actual ? 'memiliki aturan SOP yang transparan, minim ambiguitas peran, serta menawarkan kepastian masa depan' : 'memberikan kebebasan berinovasi (otonomi), mendukung pembelajaran keahlian baru, dan memfasilitasi gagasan kreatif'}.`;

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
