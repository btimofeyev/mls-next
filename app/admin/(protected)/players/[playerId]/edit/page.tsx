import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayerForm } from '@/components/PlayerForm';
import { Surface } from '@/components/ui/Surface';
import { getPlayerWithTeam } from '@/lib/getPlayers';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';

type EditPlayerPageProps = {
  params: {
    playerId: string;
  };
};

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const player = await getPlayerWithTeam(params.playerId);

  if (!player || !player.team?.division_id) {
    notFound();
  }

  const initialData = {
    divisionId: player.team.division_id,
    teamId: player.team_id,
    name: player.name,
    number: player.number,
    position: player.position,
  };

  return (
    <AdminPageWrapper>
      <div className="admin-content-stack">
        <Surface padding="lg" variant="muted">
          <div>
            <h2>Edit Player</h2>
            <p>Update roster details for {player.name}.</p>
          </div>
          <Link
            href="/admin/players"
          >
            ← Back to players
          </Link>
        </Surface>
        <PlayerForm mode="edit" playerId={player.id} initialData={initialData} />
      </div>
    </AdminPageWrapper>
  );
}
