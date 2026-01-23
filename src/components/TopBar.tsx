/**
 * TopBar component - displays seed and game control buttons
 */

import {
  TopBarContainer,
  SeedDisplay,
  SolvableBadgeOnly,
  GameControlButtons,
} from "./TopBarElements";

interface TopBarProps {
  seed: number;
  isSolvable: boolean;
  onNew: () => void;
  onRetry: () => void;
  onFinish: () => void;
  onSolve: () => void;
  onUndo: () => void;
}

export const TopBar = ({
  seed,
  isSolvable,
  onNew,
  onRetry,
  onFinish,
  onSolve,
  onUndo,
}: TopBarProps) => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const handleSeedClick = () => {
    // Copy current URL to clipboard
    navigator.clipboard?.writeText(window.location.href).catch(() => {
      // Ignore copy errors
    });
  };

  return (
    <TopBarContainer>
      {isLocalhost && (
        <SeedDisplay
          seed={seed}
          isSolvable={isSolvable}
          onSeedClick={handleSeedClick}
        />
      )}
      {!isLocalhost && <SolvableBadgeOnly isSolvable={isSolvable} />}
      <GameControlButtons
        isLocalhost={isLocalhost}
        onNew={onNew}
        onRetry={onRetry}
        onFinish={onFinish}
        onSolve={onSolve}
        onUndo={onUndo}
      />
    </TopBarContainer>
  );
};
