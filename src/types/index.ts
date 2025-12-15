export type Member = {
  id: string;
  first_name: string;
  last_name: string;
  rank: string;
  guild: string | null;
  points: number;
};

export type AttendanceLog = {
  member_id: string;
  date: string;
  slot: 'am' | 'pm';
  type: string;
};

export type MemberScore = {
  id: string;
  first_name: string;
  last_name: string;
  rank: string;
  guild: string | null;
  total_points: number; // To jest nasze obliczone pole
};