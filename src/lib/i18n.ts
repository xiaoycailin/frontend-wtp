import { browser } from '$app/environment';

type Language = 'id' | 'en';

const translations = {
  id: {
    'nav.topup': 'Topup',
    'nav.products': 'Produk',
    'nav.checkTransaction': 'Cek Transaksi',
    'nav.leaderboard': 'Leaderboard',
    'nav.article': 'Artikel',
    'nav.account': 'Akun Saya',
    'nav.login': 'Masuk',
    'nav.register': 'Daftar',
    'nav.logout': 'Keluar',
    'nav.admin': 'Admin',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.view': 'Lihat',
    'auth.loginTitle': 'Masuk ke Akun',
    'auth.registerTitle': 'Buat Akun Baru',
    'product.price': 'Harga',
    'product.stock': 'Stok',
    'product.addToCart': 'Beli Sekarang',
    'product.description': 'Deskripsi',
    'product.conditionNote': 'Catatan Kondisi',
    'account.title': 'Akun Saya',
    'account.orderHistory': 'Riwayat Order',
    'account.profileInfo': 'Informasi Akun',
    'account.stats': 'Statistik',
    'account.totalTransactions': 'Total Transaksi',
    'filter.search': 'Cari produk...',
    'filter.category': 'Kategori',
    'filter.subCategory': 'Sub Kategori',
    'filter.sort': 'Urutkan',
    'filter.apply': 'Terapkan Filter',
    'filter.reset': 'Reset Filter',
    'sort.latest': 'Terbaru',
    'sort.oldest': 'Terlama',
    'sort.lowPrice': 'Harga Terendah',
    'sort.highPrice': 'Harga Tertinggi',
    'status.success': 'Sukses',
    'status.pending': 'Pending',
    'status.failed': 'Gagal',
  },
  en: {
    'nav.topup': 'Topup',
    'nav.products': 'Products',
    'nav.checkTransaction': 'Check Transaction',
    'nav.leaderboard': 'Leaderboard',
    'nav.article': 'Article',
    'nav.account': 'My Account',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'auth.loginTitle': 'Login to Account',
    'auth.registerTitle': 'Create New Account',
    'product.price': 'Price',
    'product.stock': 'Stock',
    'product.addToCart': 'Buy Now',
    'product.description': 'Description',
    'product.conditionNote': 'Condition Note',
    'account.title': 'My Account',
    'account.orderHistory': 'Order History',
    'account.profileInfo': 'Profile Information',
    'account.stats': 'Statistics',
    'account.totalTransactions': 'Total Transactions',
    'filter.search': 'Search products...',
    'filter.category': 'Category',
    'filter.subCategory': 'Sub Category',
    'filter.sort': 'Sort By',
    'filter.apply': 'Apply Filters',
    'filter.reset': 'Reset Filters',
    'sort.latest': 'Latest',
    'sort.oldest': 'Oldest',
    'sort.lowPrice': 'Lowest Price',
    'sort.highPrice': 'Highest Price',
    'status.success': 'Success',
    'status.pending': 'Pending',
    'status.failed': 'Failed',
  },
};

// Simple store for SSR compatibility
let lang: Language = 'id';

if (browser) {
  // Client-side initialization
  const saved = localStorage.getItem('lang');
  if (saved === 'id' || saved === 'en') {
    lang = saved;
  }
}

function t(key: string): string {
  return translations[lang][key] || key;
}

function setLanguage(l: Language) {
  lang = l;
  if (browser) {
    localStorage.setItem('lang', l);
  }
}

function toggleLanguage() {
  setLanguage(lang === 'id' ? 'en' : 'id');
}

export const i18n = {
  get lang() { return lang; },
  t,
  setLanguage,
  toggleLanguage,
};