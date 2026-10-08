// 1. Reverse string (recursive)
function balikString(s) {
    if (s.length <= 1) return s; // base case
    return balikString(s.slice(1)) + s[0];
}

// console.log(balikString('indonesia'));
// console.log(balikString('laravel'));

// 2. Find primes in a list
function cariPrima(deret) {
    const hasil = deret.filter((n) => {
        if (!Number.isInteger(n) || n < 2) return false;
        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) return false;
        }
        return true;
    });
    return hasil.length ? hasil.join(', ') : 'tidak ada';
}

// console.log(cariPrima([1, 3, 5, 7, 11, 15]));
// console.log(cariPrima([8, 10, 12, 14]));

// 3. Calculate age, input: mm-dd-yyyy
function hitungUmur(tanggalLahir) {
    const [m, d, y] = tanggalLahir.split('-').map(Number);
    const lahir = new Date(y, m - 1, d);
    const now = new Date();

    let tahun = now.getFullYear() - y;
    let bulan = now.getMonth() + 1 - m;
    let hari = now.getDate() - d;

    if (hari < 0) {
        // borrow days from the previous month
        const akhirBulanLalu = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        bulan--;
        hari = now.getDate() + akhirBulanLalu - Math.min(d, akhirBulanLalu);
    }
    if (bulan < 0) {
        tahun--;
        bulan += 12;
    }

    // count Feb 29 dates between birth date and today
    let kabisat = 0;
    for (let t = y; t <= now.getFullYear(); t++) {
        const feb29 = new Date(t, 1, 29); // rolls over to March in non-leap years
        if (feb29.getMonth() === 1 && feb29 > lahir && feb29 <= now) kabisat++;
    }

    return `${tahun} tahun, ${bulan} bulan, ${hari} hari, ${kabisat} tahun kabisat`;
}

// console.log(hitungUmur('08-12-1990'));

// 4. Manual sort (bubble sort)
function urutkan(deret) {
    const a = [...deret];
    for (let i = 0; i < a.length - 1; i++) {
        for (let j = 0; j < a.length - 1 - i; j++) {
            if (a[j] < a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
        }
    }
    return a;
}

console.log(urutkan([1, 3, 2, 9, 5]));
// console.log(urutkan([3, 7, -3, 5, 9, 5]));