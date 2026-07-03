export const CATEGORIES = [
  { slug: "ketaqwaan", name: "Bidang Ketaqwaan & Keagamaan", shortName: "Keagamaan" },
  { slug: "kepemimpinan", name: "Bidang Bela Negara & Kepemimpinan", shortName: "Kepemimpinan" },
  { slug: "lingkungan", name: "Bidang Pendidikan & Lingkungan", shortName: "Pendidikan & Lingkungan" },
  { slug: "olahraga-seni", name: "Bidang Olahraga & Seni", shortName: "Olahraga & Seni" },
  { slug: "jurnalistik-akademik", name: "Bidang Jurnalistik & Akademik", shortName: "Akademik" }
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  "ketaqwaan": ["Hadrah", "Tahsin/Tahfidz", "Tilawah/MTQ", "Kajian Keislaman"],
  "kepemimpinan": ["Pramuka", "Paskibra", "PMR"],
  "lingkungan": ["Pecinta Alam (Sispala)", "Kelompok Ilmiah Remaja (KIR)"],
  "olahraga-seni": ["Futsal", "Voli", "Pencak Silat", "Karate", "Paduan Suara", "Seni Tari"],
  "jurnalistik-akademik": ["Majalah Sekolah", "Klub Olimpiade/Sains"]
};
