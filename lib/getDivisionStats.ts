import { cache } from 'react';
import { getStandings } from './getStandings';
import type { DivisionSnapshotStats, StandingRow, TeamStatHighlight } from './types';

function formatNumber(value: number, decimals = 2) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(decimals);
}

function buildHighlight(row: StandingRow, value: number, formatter: (v: number) => string): TeamStatHighlight {
  return {
    teamId: row.teamId,
    teamName: row.teamName,
    teamShortName: row.teamShortName,
    value,
    formattedValue: formatter(value),
  };
}

export const getDivisionStats = cache(async (divisionId: string): Promise<DivisionSnapshotStats> => {
  const standings = await getStandings(divisionId);
  const teamsWithGames = standings.filter((row) => row.gp > 0);

  const topAttacks = teamsWithGames
    .map((row) => buildHighlight(row, row.avgGoalsFor, (value) => `${formatNumber(value, 2)} GF/G`))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const topDefenses = teamsWithGames
    .map((row) => buildHighlight(row, row.avgGoalsAgainst, (value) => `${formatNumber(value, 2)} GA/G`))
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);

  const cleanSheetLeaders = standings
    .map((row) => buildHighlight(row, row.cleanSheets, (value) => `${formatNumber(value, 0)} CS`))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const totalGoals = teamsWithGames.reduce((acc, row) => acc + row.gf, 0);
  const totalGames = teamsWithGames.reduce((acc, row) => acc + row.gp, 0);

  const leagueAvgGoalsPerGame = totalGames > 0 ? Number((totalGoals / totalGames).toFixed(2)) : 0;

  return {
    topAttacks,
    topDefenses,
    cleanSheetLeaders,
    leagueAvgGoalsPerGame,
  };
});
