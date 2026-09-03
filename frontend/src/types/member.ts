export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  avatarUrl: string;
};

export type SessionResponse = { user: SessionUser };

export type Education = { level: string; institution: string };
export type Training = { name: string; date: string; place: string };

export type ProfileOrganization = {
  role: "CABANG" | "PAC";
  targetId: string;
  targetName: string;
  wilayahId: string;
  wilayahName: string;
  wilayahType: string;
};

export type Profile = {
  id: string;
  fullName: string;
  gender: string;
  phone: string;
  nik: string;
  nia: string;
  hasNik: boolean;
  hasNia: boolean;
  hasRfid: boolean;
  birthPlace: string;
  birthDate: string;
  address: string;
  rfid: string;
  hobby: string;
  occupation: string;
  educationHistory: string;
  trainingHistory: string;
  position: string;
  status: "DRAFT" | "PENDING" | "DITERIMA" | "DITOLAK";
  version: number;
  organization: ProfileOrganization | null;
};

export type OrganizationPeriod = { nama?: string };

export type OrganizationArea = {
  id: string;
  nama: string;
  jenis: string;
  periodeAktif?: OrganizationPeriod | null;
};

export type OrganizationUnit = {
  id: string;
  name: string;
  periodeAktif?: OrganizationPeriod | null;
  wilayah?: OrganizationArea[];
};

export type Organizations = {
  cabang?: OrganizationUnit;
  pac: OrganizationUnit[];
};

export type OrganizationsResponse = {
  success: boolean;
  data: Organizations;
  message?: string;
};
