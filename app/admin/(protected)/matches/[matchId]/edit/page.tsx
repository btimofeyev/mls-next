import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MatchForm } from '@/components/MatchForm';
import { Surface } from '@/components/ui/Surface';
import { getMatchWithDetails } from '@/lib/getMatch';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';

type EditMatchPageProps = {
  params: {
    matchId: string;
  };
};

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const match = await getMatchWithDetails(params.matchId);

  if (!match) {
    notFound();
  }

  const initialData = {
    divisionId: match.division_id,
    matchDate: match.match_date,
    homeTeamId: match.home_team_id,
    awayTeamId: match.away_team_id,
    homeScore: match.home_score,
    awayScore: match.away_score,
    notes: match.notes,
    goals: match.goals.map((goal) => ({
      id: goal.id,
      minute: goal.minute,
      teamId: goal.team_id,
      playerId: goal.player_id,
      isOwnGoal: goal.is_own_goal,
    })),
  };

  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <div>
            <h2>Edit Match</h2>
            <p>
              {match.home_team?.short_name ?? 'Home'} vs {match.away_team?.short_name ?? 'Away'} — {match.match_date}
            </p>
          </div>
          <Link
            href="/admin/matches"
          >
            ← Back to matches
          </Link>
        </Surface>
        <MatchForm mode="edit" matchId={match.id} initialData={initialData} />
      </div>
    </AdminPageWrapper>
  );
}
