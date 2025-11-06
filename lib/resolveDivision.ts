import type { Division } from './types';

type ResolveDivisionParams = {
  divisions: Division[];
  requestedDivisionId?: string | null;
  fallbackDivisionId?: string | null;
};

type ResolveDivisionResult = {
  activeDivision: Division;
  shouldRedirect: boolean;
};

export function resolveActiveDivision({
  divisions,
  requestedDivisionId,
  fallbackDivisionId,
}: ResolveDivisionParams): ResolveDivisionResult {
  if (divisions.length === 0) {
    throw new Error('No divisions available to resolve selection.');
  }

  const fallbackDivision =
    (fallbackDivisionId ? divisions.find((division) => division.id === fallbackDivisionId) : undefined) ??
    divisions[0];

  if (!fallbackDivision) {
    throw new Error('Failed to determine a fallback division.');
  }

  if (!requestedDivisionId) {
    return {
      activeDivision: fallbackDivision,
      shouldRedirect: false,
    };
  }

  const matchingDivision = divisions.find((division) => division.id === requestedDivisionId);
  if (matchingDivision) {
    return {
      activeDivision: matchingDivision,
      shouldRedirect: false,
    };
  }

  return {
    activeDivision: fallbackDivision,
    shouldRedirect: true,
  };
}
