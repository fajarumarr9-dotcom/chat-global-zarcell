// Data pengguna tersimpan di penyimpanan perangkat
let penggunaSaatIni = null;
let sambunganWebSocket;
const alamatServer = "wss://echo.websocket.events"; // Server uji coba

// Elemen halaman
const layarAkun = document.getElementById("layar-akun");
const aplikasi = document.getElementById("aplikasi");
const judulBentuk = document.getElementById("judul-bentuk");
const bentukDaftar = document.getElementById("bentuk-daftar");
const bentukMasuk = document.getElementById("bentuk-masuk");
const tautanMasuk = document.getElementById("tautan-masuk");
const tautanDaftar = document.getElementById("tautan-daftar");
const tombolDaftar = document.getElementById("tombol-daftar");
const tombolMasuk = document.getElementById("tombol-masuk");
const infoPengguna = document.getElementById("info-pengguna");
const statusSambungan = document.getElementById("status-sambungan");
const isiObrolan = document.getElementById("isi-obrolan");
const formKirim = document.getElementById("form-kirim");
const inputPesan = document.getElementById("input-pesan");

// Beralih antara halaman daftar dan masuk
tautanMasuk.addEventListener("click", () => {
    judulBentuk.innerText = "Masuk ke Akun";
    bentukDaftar.style.display = "none";
    bentukMasuk.style.display = "block";
});

tautanDaftar.addEventListener("click", () => {
    judulBentuk.innerText = "Daftar Akun Baru";
    bentukDaftar.style.display = "block";
    bentukMasuk.style.display = "none";
});

// Fungsi membuat ID 5 angka acak
function buatIdPengguna() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// Proses daftar akun
tombolDaftar.addEventListener("click", () => {
    const namaLengkap = document.getElementById("nama-lengkap").value.trim();
    const tanggalLahir = document.getElementById("tanggal-lahir").value;

    if (!namaLengkap || !tanggalLahir) {
        alert("Mohon isi semua kolom!");
        return;
    }

    const idPengguna = buatIdPengguna();
    const dataPengguna = { id: idPengguna, nama: namaLengkap, lahir: tanggalLahir };
    
    localStorage.setItem(`akun_${idPengguna}`, JSON.stringify(dataPengguna));
    alert(`Pendaftaran berhasil! ID kamu: ${idPengguna}\nSimpan ID ini untuk masuk nanti.`);

    // Langsung masuk setelah daftar
    penggunaSaatIni = dataPengguna;
    tampilkanAplikasi();
});

// Proses masuk akun
tombolMasuk.addEventListener("click", () => {
    const idMasuk = document.getElementById("id-masuk").value.trim();
    const dataTersimpan = localStorage.getItem(`akun_${idMasuk}`);

    if (!dataTersimpan) {
        alert("ID tidak ditemukan! Periksa kembali atau daftar dulu.");
        return;
    }

    penggunaSaatIni = JSON.parse(dataTersimpan);
    tampilkanAplikasi();
});

// Tampilkan halaman utama aplikasi
function tampilkanAplikasi() {
    layarAkun.style.display = "none";
    aplikasi.style.display = "flex";
    infoPengguna.innerText = `ID: ${penggunaSaatIni.id} | Nama: ${penggunaSaatIni.nama}`;
    sambungkanKeServer();
}

// Sambungan ke server obrolan
function sambungkanKeServer() {
    statusSambungan.className = "status-indikator ofline";
    statusSambungan.innerText = "🟠 Menyambung...";

    sambunganWebSocket = new WebSocket(alamatServer);

    sambunganWebSocket.onopen = () => {
        statusSambungan.className = "status-indikator daring";
        statusSambungan.innerText = "🟢 Terhubung";
        tambahPesanSistem("Kamu terhubung ke ruang obrolan.");
    };

    sambunganWebSocket.onclose = () => {
        statusSambungan.className = "status-indikator ofline";
        statusSambungan.innerText = "🔴 Terputus";
        tambahPesanSistem("Koneksi terputus. Coba muat ulang halaman.");
    };

    sambunganWebSocket.onmessage = (peristiwa) => {
        const data = JSON.parse(peristiwa.data);
        tambahPesanMasuk(data.pengirim, data.isi, data.waktu);
    };
}

// Kirim pesan
formKirim.addEventListener("submit", (e) => {
    e.preventDefault();
    const teksPesan = inputPesan.value.trim();
    if (!teksPesan || !sambunganWebSocket || sambunganWebSocket.readyState !== WebSocket.OPEN) return;

    const waktuSekarang = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dataPesan = {
        pengirim: penggunaSaatIni.nama,
        idPengirim: penggunaSaatIni.id,
        isi: teksPesan,
        waktu: waktuSekarang
    };

    // Kirim ke server
    sambunganWebSocket.send(JSON.stringify(dataPesan));
    // Tampilkan di layar pengirim
    tambahPesanKeluar(teksPesan, waktuSekarang);
    // Kosongkan kolom masukan
    inputPesan.value = "";
});

// Tambah pesan yang dikirim sendiri
function tambahPesanKeluar(isi, waktu) {
    const elemenPesan = document.createElement("div");
    elemenPesan.className = "pesan keluar";
    elemenPesan.innerHTML = `
        <div class="teks-pesan">${isi}</div>
        <div class="waktu-pesan"><i class="fas fa-check-double"></i> ${waktu}</div>
    `;
    isiObrolan.appendChild(elemenPesan);
    isiObrolan.scrollTop = isiObrolan.scrollHeight;
}

// Tambah pesan dari orang lain
function tambahPesanMasuk(pengirim, isi, waktu) {
    const elemenPesan = document.createElement("div");
    elemenPesan.className = "pesan masuk";
    elemenPesan.innerHTML = `
        <div class="nama-pengirim">${pengirim}</div>
        <div class="teks-pesan">${isi}</div>
        <div class="waktu-pesan">${waktu}</div>
    `;
    isiObrolan.appendChild(elemenPesan);
    isiObrolan.scrollTop = isiObrolan.scrollHeight;
}

// Tambah pesan sistem
function tambahPesanSistem(isi) {
    const elemenPesan = document.createElement("div");
    elemenPesan.style.textAlign = "center";
    elemenPesan.style.margin = "8px 0";
    elemenPesan.style.fontSize = "12px";
    elemenPesan.style.color = "#667781";
    elemenPesan.innerText = isi;
    isiObrolan.appendChild(elemenPesan);
    isiObrolan.scrollTop = isiObrolan.scrollHeight;
}
