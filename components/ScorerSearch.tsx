'use client';

import { useState } from 'react';

type ScorerSearchProps = {
  scorers: Array<{
    playerId: string;
    playerName: string;
    teamShortName: string;
    goals: number;
    matchesWithGoal?: number;
  }>;
};

export default function ScorerSearch({ scorers }: ScorerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchScorer = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim() === '') {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    // Search for exact or partial matches
    const found = scorers.find(scorer =>
      scorer.playerName.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      const rank = scorers.findIndex(s => s.playerId === found.playerId) + 1;
      setSearchResult({ ...found, rank });
    } else {
      setSearchResult(null);
    }

    // Add a small delay to show searching state
    setTimeout(() => setIsSearching(false), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchScorer(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      setSearchResult(null);
    }
  };

  return (
    <div className="scorer-search">
      <div className="scorer-search-input-wrapper">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search player name..."
          className="scorer-search-input"
          autoComplete="off"
        />
        {isSearching && (
          <div className="scorer-search-loading" aria-hidden="true">
            <span>⟳</span>
          </div>
        )}
        {searchQuery && !isSearching && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResult(null);
            }}
            className="scorer-search-clear"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {searchResult && (
        <div className="scorer-search-result">
          <div className="scorer-search-result-header">
            <span className="scorer-search-rank">
              #{searchResult.rank}
            </span>
            <div className="scorer-search-result-info">
              <span className="scorer-search-name">
                {searchResult.playerName}
              </span>
              <span className="scorer-search-team">
                {searchResult.teamShortName}
              </span>
            </div>
            <span className="scorer-search-goals">
              {searchResult.goals} goals
            </span>
          </div>
          {searchResult.rank > 20 && (
            <div className="scorer-search-result-note">
              Not in top 20 • {searchResult.rank > 1 ? `${searchResult.rank - 1} players ahead` : 'Leading the pack'}
            </div>
          )}
        </div>
      )}

      {searchQuery && !searchResult && !isSearching && searchQuery.trim() !== '' && (
        <div className="scorer-search-no-results">
          No players found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}