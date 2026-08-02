// Schema types — RS Royal Prima Jambi (matches actual Supabase project)

export type Dokter = {
  id: number;
  created_at: string;
  nama: string;
  spesialist: string;
  potourl: string | null;
  poliklinikid: number | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  status: boolean | null;
  poliklinik?: Poliklinik | null;
};

export type Poliklinik = {
  id: number;
  created_at: string;
  nama: string;
  lokasi: string | null;
  deskripsi: string | null;
  poto: string | null;
};

export type Jadwal = {
  id: number;
  created_at: string;
  dokterid: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  dokter?: Pick<Dokter, "nama" | "spesialist"> | null;
};

export type Fasilitas = {
  id: number;
  created_at: string;
  nama_fasilitas: string;
  deskripsi: string | null;
  gambar: string | null;
};

export type Asuransi = {
  id: number;
  created_at: string;
  nama_asuransi: string;
  logo: string | null;
};

export type Artikel = {
  id: number;
  created_at: string;
  idkategoriberita: number | null;
  judul: string;
  isi: string | null;
  gambar: string | null;
  penulis: string | null;
  kategoriberita?: Kategoriberita | null;
};

export type Berita = Artikel;

export type Kategoriberita = {
  id: number;
  created_at: string;
  namaKategori: string;
};

export type Testimoni = {
  id: number;
  created_at: string;
  nama_pasien: string;
  pekerjaan: string | null;
  testimoni: string | null;
};

export type Slider = {
  id: number;
  created_at: string;
  title: string | null;
  subtitle: string | null;
  image: string | null;
};

export type Tentangkami = {
  id: number;
  created_at: string;
  judul: string;
  isi: string | null;
  gambar: string | null;
  status: boolean | null;
  linkyoutube: string | null;
};

export type InfoCard = {
  id: number;
  emergency_title: string | null;
  emergency_desc: string | null;
  emergency_phone: string | null;
  timetable_title: string | null;
  timetable_desc: string | null;
  timetable_url: string | null;
  location_title: string | null;
  location_address: string | null;
  location_map_url: string | null;
  hp: string | null;
  created_at: string;
  updated_at: string;
};

export type PertanyaanPasien = {
  id: number;
  created_at: string;
  nama: string;
  email: string;
  hp: string;
  subject: string;
  pesan: string;
};

export type Database = {
  public: {
    Tables: {
      dokter: { Row: Dokter; Insert: Partial<Dokter>; Update: Partial<Dokter> };
      poliklinik: { Row: Poliklinik; Insert: Partial<Poliklinik>; Update: Partial<Poliklinik> };
      jadwal: { Row: Jadwal; Insert: Partial<Jadwal>; Update: Partial<Jadwal> };
      fasilitas: { Row: Fasilitas; Insert: Partial<Fasilitas>; Update: Partial<Fasilitas> };
      asuransi: { Row: Asuransi; Insert: Partial<Asuransi>; Update: Partial<Asuransi> };
      artikel: { Row: Artikel; Insert: Partial<Artikel>; Update: Partial<Artikel> };
      berita: { Row: Berita; Insert: Partial<Berita>; Update: Partial<Berita> };
      kategoriberita: { Row: Kategoriberita; Insert: Partial<Kategoriberita>; Update: Partial<Kategoriberita> };
      testimoni: { Row: Testimoni; Insert: Partial<Testimoni>; Update: Partial<Testimoni> };
      slider: { Row: Slider; Insert: Partial<Slider>; Update: Partial<Slider> };
      tentangkami: { Row: Tentangkami; Insert: Partial<Tentangkami>; Update: Partial<Tentangkami> };
      infoCard: { Row: InfoCard; Insert: Partial<InfoCard>; Update: Partial<InfoCard> };
      pertanyaanPasien: { Row: PertanyaanPasien; Insert: Partial<PertanyaanPasien>; Update: Partial<PertanyaanPasien> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
