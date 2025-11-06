// No styling utilities - CSS removed

function normalizeNamePart(part: string): string {
  if (!part) {
    return '';
  }

  return part.charAt(0).toUpperCase() + part.slice(1);
}

export function formatPlayerDisplayName(fullName: string | null | undefined): string {
  if (!fullName) {
    return 'Player';
  }

  const tokens = fullName
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return 'Player';
  }

  const firstName = normalizeNamePart(tokens[0]);
  if (tokens.length === 1) {
    return firstName;
  }

  const lastToken = tokens[tokens.length - 1];
  const lastInitial = lastToken.charAt(0).toUpperCase();

  if (!lastInitial) {
    return firstName;
  }

  return `${firstName} ${lastInitial}.`;
}
