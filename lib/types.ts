export interface League {
  id: string;
  name: string;
  age_group: string | null;
  created_at: string | null;
}

export interface Division {
  id: string;
  league_id: string;
  name: string;
  short_name: string | null;
  age_group: string | null;
  created_at: string | null;
}

export interface Team {
  id: string;
  division_id: string;
  name: string;
  short_name: string;
  badge_url: string | null;
  created_at: string | null;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  number: string | null;
  position: string | null;
  created_at: string | null;
}

export interface Match {
  id: string;
  division_id: string;
  match_date: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  notes: string | null;
  created_at: string | null;
}

export interface Goal {
  id: string;
  match_id: string;
  team_id: string;
  player_id: string | null;
  minute: number | null;
  is_own_goal: boolean;
  created_at: string | null;
}

export interface Headline {
  id: string;
  match_id: string | null;
  division_id: string;
  title: string;
  body: string | null;
  created_at: string | null;
}

export interface HeadlineWithDetails extends Headline {
  matches: {
    id: string;
    home_team: {
      name: string;
      short_name: string;
    } | null;
    away_team: {
      name: string;
      short_name: string;
    } | null;
    match_date: string | null;
  } | null;
  divisions: {
    name: string;
  } | null;
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  teamShortName: string;
  gp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  cleanSheets: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
}

export interface ScorerRow {
  rank?: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamShortName: string;
  goals: number;
  matchesWithGoal: number;
}

export interface GoalSummary {
  playerId: string;
  playerName: string;
  goals: number;
}

export interface LatestResult {
  matchId: string;
  matchDate: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    score: number;
  };
  notableScorers: GoalSummary[];
  notes: string | null;
}

export interface TeamRecordSummary {
  teamId: string;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export type MatchOutcome = 'W' | 'D' | 'L';

export interface TeamRecentMatch {
  matchId: string;
  matchDate: string;
  opponent: {
    id: string;
    name: string;
    shortName: string;
  };
  isHome: boolean;
  teamScore: number;
  opponentScore: number;
  outcome: MatchOutcome;
  notes: string | null;
}

export interface TeamScorerRow {
  playerId: string;
  playerName: string;
  goals: number;
  matchesWithGoal: number;
}

export interface MatchNoteSummary {
  matchId: string;
  matchDate: string;
  note: string;
}

export interface TeamPageData {
  team: Team;
  division: Division | null;
  record: TeamRecordSummary | null;
  recentMatches: TeamRecentMatch[];
  topScorers: TeamScorerRow[];
  matchNotes: MatchNoteSummary[];
}

export interface TeamStatHighlight {
  teamId: string;
  teamName: string;
  teamShortName: string;
  value: number;
  formattedValue?: string;
}

export interface DivisionSnapshotStats {
  topAttacks: TeamStatHighlight[];
  topDefenses: TeamStatHighlight[];
  cleanSheetLeaders: TeamStatHighlight[];
  leagueAvgGoalsPerGame: number;
}

export interface MatchGoalDetail {
  id: string;
  team_id: string;
  player_id: string | null;
  minute: number | null;
  is_own_goal: boolean;
}

export interface AdminMatchDetail {
  id: string;
  division_id: string;
  match_date: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  notes: string | null;
  goals: MatchGoalDetail[];
  home_team?: {
    id: string;
    name: string;
    short_name: string;
  } | null;
  away_team?: {
    id: string;
    name: string;
    short_name: string;
  } | null;
}

export type ScoreCorrectionStatus = 'pending' | 'in_review' | 'resolved';
export type ScoreCorrectionCategory = 'score_update' | 'goal_update' | 'general';

export interface ScoreCorrection {
  id: string;
  division_id: string | null;
  division_name: string | null;
  team_id: string | null;
  team_name: string | null;
  category: ScoreCorrectionCategory;
  contact_name: string;
  contact_email: string;
  contact_role: string | null;
  message: string;
  status: ScoreCorrectionStatus;
  notes: string | null;
  created_at: string | null;
}

export interface NewScoreCorrectionPayload {
  division_id?: string | null;
  division_name?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  category: ScoreCorrectionCategory;
  contact_name: string;
  contact_email: string;
  contact_role?: string | null;
  message: string;
}

export interface UpdateScoreCorrectionPayload {
  status?: ScoreCorrectionStatus;
  notes?: string | null;
}

export interface AdminPlayerDetail {
  id: string;
  team_id: string;
  name: string;
  number: string | null;
  position: string | null;
  team?: {
    id: string;
    name: string;
    short_name: string;
    division_id?: string;
  } | null;
}

export interface NewGoalPayload {
  minute: number | null;
  team_id: string;
  player_id: string | null;
  is_own_goal: boolean;
}

export interface NewMatchPayload {
  division_id: string;
  match_date: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  notes: string | null;
  goals: NewGoalPayload[];
}

export interface NewPlayerPayload {
  team_id: string;
  name: string;
  number: string | null;
  position: string | null;
}

export interface NewHeadlinePayload {
  division_id: string;
  match_id: string | null;
  title: string;
  body: string | null;
}
