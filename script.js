// --- KONFIGURASI ---
        // Gunakan 'trilogy' untuk testing. Jika limit habis, ganti dengan API key pribadimu.
        const API_KEY = 'trilogy'; 

        /* ==========================================
           1. OOP: CLASS & ENCAPSULATION (User)
           ========================================== */
        class User {
            #age; // Private field (Encapsulation)

            constructor(age) {
                this.#age = parseInt(age);
            }

            // Getter untuk mengakses private field
            get age() {
                return this.#age;
            }
        }

        /* ==========================================
           2. OOP: ABSTRACTION
           ========================================== */
        // Abstract Class Film (Tidak bisa diinstansiasi langsung, hanya blueprint)
        class Film {
            #title;
            #year;
            #poster;
            #rating; // e.g., "PG-13", "R"

            constructor(data) {
                if (this.constructor === Film) {
                    throw new Error("Abstract class 'Film' cannot be instantiated directly.");
                }
                this.#title = data.Title;
                this.#year = data.Year;
                this.#poster = data.Poster;
                this.#rating = data.Rated || "Unrated";
            }

            // Getters
            get title() { return this.#title; }
            get poster() { return this.#poster; }
            get rating() { return this.#rating; }
            get info() { return `${this.#title} (${this.#year})`; }
 
            // Abstract Method (Harus di-override oleh child class)
            play() {
                throw new Error("Method 'play()' must be implemented.");
            }

            // Logic Validasi Usia (Encapsulation Logic)
            getMinAge() {
                // Konversi rating MPAA ke umur minimal
                const r = this.#rating;
                if (r === "G" || r === "PG") return 0;
                if (r === "PG-13") return 13;
                if (r === "R") return 17;
                if (r === "NC-17") return 18;
                return 13; // Default
            }
        }

        /* ==========================================
           3. OOP: INHERITANCE & POLYMORPHISM
           ========================================== */
        
        // Child Class 1: Horror
        class HorrorFilm extends Film {
            constructor(data) {
                super(data);
            }

            jumpScareLevel() {
                return "Jumpscare Sangat Tinggi! Jantung harap dijaga.";
            }

            // Polymorphism: Cara play beda
            play() {
                return `👻 Memutar FILM HORROR: "${this.title}"...<br>
                        🔊 Efek suara hantu diaktifkan.<br>
                        ⚠️ Peringatan: ${this.jumpScareLevel()}`;
            }
        }

        // Child Class 2: Action
        class ActionFilm extends Film {
            constructor(data) {
                super(data);
            }

            // Polymorphism
            play() {
                return `💥 Memutar FILM ACTION: "${this.title}"...<br>
                        🔊 Dolby Surround 7.1 System Active.<br>
                        🍿 Bersiap dengan Ledakan Visual yang Memukau!`;
            }
        }

        // Child Class 3: General / Default
        class GeneralFilm extends Film {
            constructor(data) {
                super(data);
            }

            // Polymorphism
            play() {
                return `▶️ Memutar Film: "${this.title}"...<br>
                        ☕ Selamat menikmati tontonan santai.`;
            }
        }

        /* ==========================================
           4. FACTORY PATTERN (Helper untuk OOP)
           ========================================== */
        class FilmFactory {
            static createFilm(apiData) {
                const genre = apiData.Genre || "";
                
                if (genre.includes("Horror")) {
                    return new HorrorFilm(apiData);
                } else if (genre.includes("Action")) {
                    return new ActionFilm(apiData);
                } else {
                    return new GeneralFilm(apiData);
                }
            }
        }

        /* ==========================================
           5. APP LOGIC (Controller)
           ========================================== */
        class App {
            constructor() {
                this.currentUser = null;
                this.currentFilm = null; // Objek film yang sedang dipilih
            }

            // 1. Set User Age
            setUserAge() {
                const input = document.getElementById('user-age-input').value;
                if (!input) return alert("Masukkan usia kamu dulu!");

                this.currentUser = new User(input);
                
                // UI Update
                document.getElementById('age-modal').classList.add('hidden');
                document.getElementById('home-page').classList.remove('hidden');
                document.getElementById('user-info').innerText = `User Age: ${this.currentUser.age} y.o`;
                
                this.searchMovies(); // Load default movies
            }

            // 2. Fetch Movies (List)
            async searchMovies() {
                const query = document.getElementById('search-input').value;
                const listContainer = document.getElementById('movie-list');
                listContainer.innerHTML = "Loading...";

                try {
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
                    const data = await res.json();

                    console.log('✅ Fetching Movie API Berhasil!', data.Search.length, 'Results.');
                    console.log('Data yang diterima:', data);

                    if (data.Response === "True") {
                        listContainer.innerHTML = ""; // Clear loading
                        data.Search.forEach(movieData => {
                            // Render kartu sederhana (belum jadi objek lengkap biar ringan)
                            const card = document.createElement('div');
                            card.className = 'movie-card';
                            card.innerHTML = `
                                <img src="${movieData.Poster !== "N/A" ? movieData.Poster : 'https://via.placeholder.com/300'}" alt="Poster">
                                <div class="movie-info">
                                    <h4>${movieData.Title}</h4>
                                    <small>${movieData.Year}</small>
                                </div>
                            `;
                            // Saat diklik, baru fetch detail lengkap untuk buat Objek OOP
                            card.onclick = () => this.selectFilm(movieData.imdbID);
                            listContainer.appendChild(card);
                        });
                    } else {
                        listContainer.innerHTML = "<p>Film tidak ditemukan.</p>";
                    }
                } catch (error) {
                    console.error(error);
                    listContainer.innerHTML = "<p>Film tidak ditemukan.</p>";
                }
            }

            // 3. Select & Validate Film
            async selectFilm(imdbID) {
                try {
                    // Fetch detail untuk dapat Rating Usia (misal: PG-13)
                    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
                    const data = await res.json();

                    // OOP: Gunakan Factory untuk membuat objek yang sesuai (Polymorphism preparation)
                    this.currentFilm = FilmFactory.createFilm(data);

                    // LOGIKA VALIDASI USIA
                    const minAge = this.currentFilm.getMinAge();
                    
                    if (this.currentUser.age < minAge) {
                        // Encapsulation: Data rating dilindungi, tapi kita pakai logic getter
                        alert(`⚠️ AKSES DITOLAK!\n\nFilm ini ratingnya "${this.currentFilm.rating}" (Min: ${minAge} tahun).\nUsia kamu baru ${this.currentUser.age} tahun.`);
                        return; // Stop, jangan buka detail
                    }

                    // Jika lolos, tampilkan detail
                    this.showDetail(data);

                } catch (error) {
                    console.error("Error detail:", error);
                }
            }

            // UI: Tampilkan Detail
            showDetail(data) {
                document.getElementById('home-page').classList.add('hidden');
                document.getElementById('detail-view').style.display = 'block';

                document.getElementById('detail-img').src = data.Poster;
                document.getElementById('detail-title').innerText = data.Title;
                document.getElementById('detail-year').innerText = data.Year;
                document.getElementById('detail-genre').innerText = data.Genre;
                document.getElementById('detail-rating').innerText = data.Rated;
                document.getElementById('detail-desc').innerText = data.Plot;
                document.getElementById('player-console').innerHTML = "[Status Player]: Siap memutar film...";
            }

            // 4. Play Movie (Polymorphism Action)
            playCurrentMovie() {
                if (this.currentFilm) {
                    const consoleDiv = document.getElementById('player-console');
                    
                    // Memanggil method .play() yang sifatnya Polimorfik
                    // Outputnya akan beda tergantung apakah dia Horror, Action, atau Biasa
                    const playMessage = this.currentFilm.play(); 
                    
                    consoleDiv.innerHTML = playMessage;
                }
            }

            // 5. Back to Home
            goHome() {
                document.getElementById('detail-view').style.display = 'none';
                document.getElementById('home-page').classList.remove('hidden');
                this.currentFilm = null;
            }
        }

        // ... (Script Class App di atas) ...

        // Inisialisasi Aplikasi
        const app = new App();

        // 1. Enter untuk SEARCH FILM
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                app.searchMovies();
            }
        });

        // 2. Enter untuk LOGIN UMUR (Ini yang baru)
        const ageInput = document.getElementById('user-age-input');
        ageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                app.setUserAge();
            }
        });