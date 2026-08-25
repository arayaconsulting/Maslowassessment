// Database 25 Butir Pernyataan Maslow
const questions = [
    // Level 1: Fisiologis & Dasar
    { id: 1, level: "physio", text: "1. Saat ini, pemenuhan kebutuhan finansial dan fisik dasar adalah prioritas utama yang paling memotivasi saya bekerja/beraktivitas." },
    { id: 2, level: "physio", text: "2. Kondisi fisik yang prima dan fasilitas kerja yang nyaman sangat menentukan tingkat semangat harian saya." },
    { id: 3, level: "physio", text: "3. Kompensasi materi atau imbalan nyata adalah faktor terkuat yang membuat saya bersedia mengerahkan usaha ekstra." },
    { id: 4, level: "physio", text: "4. Jam istirahat, beban fisik yang seimbang, dan kelayakan tempat kerja lebih saya perhatikan dibanding status atau pujian." },
    { id: 5, level: "physio", text: "5. Saya merasa sulit fokus berkarya jika kebutuhan dasar dan sarana harian saya belum terpenuhi dengan layak." },
    
    // Level 2: Rasa Aman & Stabilitas
    { id: 6, level: "safety", text: "6. Kejelasan aturan, regulasi, dan kepastian jangka panjang membuat saya merasa tenang dan produktif." },
    { id: 7, level: "safety", text: "7. Saya lebih termotivasi dalam lingkungan yang stabil dan terstruktur dibanding lingkungan yang penuh ketidakpastian/risiko tinggi." },
    { id: 8, level: "safety", text: "8. Jaminan perlindungan (seperti tabungan aman, kepastian posisi, atau asuransi/tunjangan) memberi saya dorongan motivasi yang besar." },
    { id: 9, level: "safety", text: "9. Menghindari kesalahan dan menjaga keamanan posisi/kelangsungan kerja menjadi perhatian utama saya sehari-hari." },
    { id: 10, level: "safety", text: "10. Arahan atasan/SOP yang jelas dan transparan membuat saya bekerja jauh lebih efektif tanpa rasa cemas." },

    // Level 3: Sosial & Relasi
    { id: 11, level: "social", text: "11. Diterima dan memiliki hubungan akrab dengan rekan kerja/komunitas membuat saya jauh lebih bersemangat dalam beraktivitas." },
    { id: 12, level: "social", text: "12. Suasana kekeluargaan dan saling mendukung dalam tim lebih berharga bagi saya daripada pencapaian yang diraih sendirian." },
    { id: 13, level: "social", text: "13. Saya termotivasi untuk berkontribusi lebih jika dilibatkan dalam kegiatan kebersamaan atau proyek kelompok." },
    { id: 14, level: "social", text: "14. Terjadinya konflik relasi atau suasana dingin di lingkungan kerja sangat menguras energi dan semangat saya." },
    { id: 15, level: "social", text: "15. Komunikasi terbuka dan rasa saling peduli antar-anggota tim adalah faktor kunci kenyamanan saya berkarya." },

    // Level 4: Harga Diri & Pengakuan
    { id: 16, level: "esteem", text: "16. Apresiasi dan pengakuan atas pencapaian kerja memberikan dorongan moral yang sangat besar bagi saya." },
    { id: 17, level: "esteem", text: "17. Saya terdorong untuk membuktikan kemampuan terbaik saya agar diakui kompetensinya oleh orang lain/lingkungan." },
    { id: 18, level: "esteem", text: "18. Diberikan kepercayaan memegang tanggung jawab atau posisi penting membuat saya merasa dihargai." },
    { id: 19, level: "esteem", text: "19. Mendapatkan reputasi positif dan status yang layak atas kerja keras saya adalah hal yang sangat saya dambakan." },
    { id: 20, level: "esteem", text: "20. Kritik yang disampaikan tanpa menghargai usaha saya dapat menurunkan motivasi kerja saya secara drastis." },

    // Level 5: Aktualisasi Diri & Pertumbuhan
    { id: 21, level: "actual", text: "21. Saya sangat termotivasi ketika diberi ruang dan otonomi penuh untuk mengeksplorasi potensi diri saya secara mandiri." },
    { id: 22, level: "actual", text: "22. Menghadapi tantangan baru dan menciptakan karya inovatif jauh lebih memuaskan daripada sekadar bekerja sesuai rutinitas." },
    { id: 23, level: "actual", text: "23. Saya terdorong untuk terus belajar dan menguasai keahlian baru demi pertumbuhan kualitas diri pribadi." },
    { id: 24, level: "actual", text: "24. Memiliki kebebasan dalam mengambil keputusan kreatif memberikan kepuasan mendalam bagi saya." },
    { id: 25, level: "actual", text: "25. Makna dan dampak positif dari apa yang saya kerjakan bagi orang banyak adalah sumber motivasi tertinggi saya." }
];

let myChart = null;

// Render Kuesioner
document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("questions-list");
    listContainer.innerHTML = questions.map(q => `
        <div class="question-item">
            <div class="question-text">${q.text}</div>
            <div class="options-row">
                <label class="option-label"><input type="radio" name="q_${q.id}" value="5" required> 5 (SS)</label>
                <label class="option-label"><input type="radio" name="q_${q.id}" value="4"> 4 (S)</label>
                <label class="option-label"><input type="radio" name="q_${q.id}" value="3"> 3 (N)</label>
                <label class="option-label"><input type="radio" name="q_${q.id}" value="2"> 2 (TS)</label>
                <label class="option-label"><input type="radio" name="q_${q.id}" value="1"> 1 (STS)</label>
            </div>
        </div>
    `).join("");
});

// Hitung Skor & Bangun Report
function calculateResult() {
    const nama = document.getElementById("nama").value.trim();
    const posisi = document.getElementById("posisi").value.trim() || "Umum / Profesional";

    if (!nama) {
        alert("Silakan isi nama lengkap terlebih dahulu.");
        document.getElementById("nama").focus();
        return;
    }

    // Hitung Skor
    let scores = { physio: 0, safety: 0, social: 0, esteem: 0, actual: 0 };
    for (let q of questions) {
        const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        if (!selected) {
            alert(`Pernyataan nomor ${q.id} belum diisi.`);
            return;
        }
        scores[q.level] += parseInt(selected.value);
    }

    // Set Data Header Report
    document.getElementById("res-nama").innerText = nama;
    document.getElementById("res-posisi").innerText = posisi;
    const now = new Date();
    document.getElementById("res-tanggal").innerText = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById("res-id").innerText = `#MSL-${Date.now().toString().slice(-6)}`;

    // Set Tabel Skor
    const levelsMeta = [
        { key: "physio", name: "1. Fisiologis & Fasilitas Fisik Dasar" },
        { key: "safety", name: "2. Rasa Aman, Aturan & Kepastian" },
        { key: "social", name: "3. Sosial, Relasi & Penerimaan Tim" },
        { key: "esteem", name: "4. Harga Diri, Apresiasi & Pengakuan" },
        { key: "actual", name: "5. Aktualisasi Diri & Otonomi Potensi" }
    ];

    const tbody = document.getElementById("score-table-body");
    tbody.innerHTML = "";
    
    let maxScore = -1;
    let dominantKey = "";

    levelsMeta.forEach(lvl => {
        const s = scores[lvl.key];
        const pct = Math.round((s / 25) * 100);
        let status = "Moderat (Seimbang)";
        if (s >= 21) status = "Sangat Tinggi (Driver Utama)";
        else if (s >= 16) status = "Tinggi (Prioritas)";
        else if (s <= 10) status = "Rendah (Terpenuhi / Stabil)";

        if (s > maxScore) {
            maxScore = s;
            dominantKey = lvl.key;
        }

        tbody.innerHTML += `
            <tr>
                <td>${lvl.name}</td>
                <td><b>${s}</b> / 25</td>
                <td>${pct}%</td>
                <td>${status}</td>
            </tr>
        `;
    });

    // Primary Driver Text
    const driverTitles = {
        physio: "Fisiologis & Kesejahteraan Fisik (Physiological Needs)",
        safety: "Rasa Aman & Stabilitas Sistem (Safety Needs)",
        social: "Sosial & Keterikatan Relasi (Belonging Needs)",
        esteem: "Harga Diri & Pengakuan Kompetensi (Esteem Needs)",
        actual: "Aktualisasi Diri & Pertumbuhan Otonom (Self-Actualization Needs)"
    };
    document.getElementById("primary-driver-text").innerText = driverTitles[dominantKey];

    // Bangun Interpretasi (Minimal 5 Kalimat) & Rekomendasi
    buildInterpretation(scores, dominantKey);
    buildActionInsights(dominantKey);

    // Ganti View & Render Chart
    document.getElementById("form-section").classList.add("hidden");
    document.getElementById("result-section").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    renderChart(scores);
}

// Logika Generator Interpretasi 5 Kalimat
function buildInterpretation(scores, dominantKey) {
    const k1 = `Berdasarkan profil penilaian, dorongan motivasi harian Anda saat ini paling kuat digerakkan oleh tingkat kebutuhan ${driverNamesMapping(dominantKey)}, yang menjadi poros utama pemusatan energi mental dan perhatian kerja Anda.`;
    
    let k2 = "";
    if (scores.physio >= 18 || scores.safety >= 18) {
        k2 = `Pada aspek pondasi kebutuhan dasar, Anda menaruh prioritas sangat tinggi pada kepastian finansial, keteraturan SOP, dan stabilitas lingkungan sebagai syarat mutlak sebelum dapat bekerja secara tenang dan optimal.`;
    } else {
        k2 = `Pondasi kebutuhan fisik dan rasa aman Anda berada pada tingkat yang relatif stabil dan aman, sehingga kekhawatiran terhadap hal-hal mendasar tidak lagi menjadi beban pikiran utama.`;
    }

    let k3 = "";
    if (scores.esteem >= 18 || scores.social >= 18) {
        k3 = `Dalam dinamika relasi interpersonal, penerimaan oleh rekan kelompok, iklim kekeluargaan, serta pengakuan terhadap reputasi dan kontribusi kerja Anda memegang peranan krusial dalam mendongkrak semangat berkarya.`;
    } else {
        k3 = `Mengenai hubungan sosial dan penghargaan eksternal, Anda menunjukkan sikap yang mandiri dan tidak terlalu bergantung pada pujian atau status formal untuk mempertahankan produktivitas harian.`;
    }

    let k4 = "";
    if (scores.actual >= 18) {
        k4 = `Pada dimensi aktualisasi diri, Anda memiliki ambisi bertumbuh yang sangat tinggi untuk mengeksplorasi potensi maksimal, memecahkan persoalan kompleks, serta berinovasi secara otonom.`;
    } else {
        k4 = `Dorongan eksplorasi dan aktualisasi diri Anda saat ini berjalan pada ritme teratur, di mana Anda lebih fokus pada ketuntasan tanggung jawab rutin secara presisi dibanding mengambil risiko inovasi baru.`;
    }

    const k5 = `Secara menyeluruh, Anda akan menunjukkan kinerja puncak dan kepuasan mendalam apabila beraktivitas dalam ekosistem yang ${getIdealEnvironment(dominantKey)}.`;

    document.getElementById("interpretation-text").innerText = `${k1} ${k2} ${k3} ${k4} ${k5}`;
}

function driverNamesMapping(key) {
    const map = {
        physio: "Fisiologis & Kebutuhan Fisik Dasar",
        safety: "Rasa Aman & Stabilitas",
        social: "Sosial & Keterikatan Tim",
        esteem: "Harga Diri & Pengakuan",
        actual: "Aktualisasi Diri & Otonomi"
    };
    return map[key];
}

function getIdealEnvironment(key) {
    const map = {
        physio: "menjamin kelayakan sarana kerja, beban fisik yang proporsional, serta skema kompensasi materi yang adil dan tepat waktu",
        safety: "memiliki kejelasan regulasi, sistem kerja yang terstruktur rapi, serta transparansi arah jangka panjang yang minim ambiguitas",
        social: "mengedepankan atmosfer kekeluargaan yang guyub, komunikasi dua arah yang hangat, serta bebas dari friksi konflik destruktif",
        esteem: "konsisten memberikan apresiasi atas capaian prestasi, membuka ruang reputasi positif, dan memberikan kepercayaan peran strategis",
        actual: "memberikan otonomi berkarya yang luas, mendukung eksperimen inovasi kreatif, dan memfasilitasi ruang belajar tanpa batas"
    };
    return map[key];
}

function buildActionInsights(dominantKey) {
    const selfActionsMap = {
        physio: [
            "Jaga disiplin pola istirahat dan stamina fisik agar stabilitas energi harian tetap prima.",
            "Rencanakan manajemen anggaran pribadi secara teratur untuk meminimalkan beban kecemasan harian."
        ],
        safety: [
            "Mintalah parameter kerja, target, dan SOP yang jelas kepada pimpinan sebelum mengeksekusi tugas.",
            "Susun perencanaan mitigasi mandiri dan ceklis kerja guna memastikan semua proses berjalan terkendali."
        ],
        social: [
            "Bangun interaksi positif dan aktif dalam kolaborasi tim untuk menjaga iklim kerja tetap harmonis.",
            "Ungkapkan ide maupun hambatan kerja melalui dialog terbuka dan komunikasi suportif."
        ],
        esteem: [
            "Dokumentasikan setiap hasil kerja dan pencapaian secara rapi untuk memperkuat bukti kompetensi.",
            "Ambil tanggung jawab baru yang menantang guna memperluas ruang kontribusi dan pengakuan profesional."
        ],
        actual: [
            "Luangkan waktu secara berkala untuk mengeksplorasi keahlian baru di luar rutinitas operasional.",
            "Fokuslah pada penciptaan karya atau solusi inovatif yang memberikan dampak positif luas bagi lingkungan."
        ]
    };

    const leaderActionsMap = {
        physio: [
            "Pastikan fasilitas fisik, kelayakan alat kerja, dan kenyamanan lingkungan operasional terjaga dengan baik.",
            "Berikan kepastian kompensasi, insentif, dan hak-hak dasar tim secara tertib dan transparan."
        ],
        safety: [
            "Berikan instruksi penugasan yang spesifik, transparan, dan lengkapi dengan pedoman standar kerja (SOP).",
            "Ciptakan lingkungan kerja yang stabil dan hindari perubahan kebijakan yang mendadak tanpa sosialisasi."
        ],
        social: [
            "Fasilitasi forum diskusi yang inklusif dan kegiatan kebersamaan untuk mempererat kekompakan tim.",
            "Bangun budaya empati dan segera selesaikan konflik relasional sebelum berkembang menjadi friksi tim."
        ],
        esteem: [
            "Berikan apresiasi dan pujian secara tulus atas dedikasi serta pencapaian yang diraih.",
            "Berikan pendelegasian wewenang dan amanah penting yang meningkatkan rasa percaya diri anggota tim."
        ],
        actual: [
            "Berikan keleluasaan dalam menentukan metode kerja (otonomi) selama target akhir tetap tercapai.",
            "Libatkan dalam proyek-proyek strategis/kreatif yang menuntut inisiatif mandiri dan pemecahan masalah baru."
        ]
    };

    document.getElementById("self-actions").innerHTML = selfActionsMap[dominantKey].map(act => `<li>${act}</li>`).join("");
    document.getElementById("leader-actions").innerHTML = leaderActionsMap[dominantKey].map(act => `<li>${act}</li>`).join("");
}

function renderChart(scores) {
    const ctx = document.getElementById('maslowChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Fisiologis', 'Rasa Aman', 'Sosial', 'Harga Diri', 'Aktualisasi Diri'],
            datasets: [{
                label: 'Skor Kebutuhan (Maks: 25)',
                data: [scores.physio, scores.safety, scores.social, scores.esteem, scores.actual],
                backgroundColor: 'rgba(30, 58, 138, 0.2)',
                borderColor: '#1e3a8a',
                borderWidth: 2,
                pointBackgroundColor: '#b91c1c',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#b91c1c',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 25,
                    ticks: { stepSize: 5 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function restartTest() {
    document.getElementById("quiz-form").reset();
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("form-section").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
