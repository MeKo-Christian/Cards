/**
 * TopBar component - displays seed and game control buttons
 */

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
    <div className="flex justify-between items-center px-5 py-4 gap-4 flex-wrap sm:flex-row flex-col items-stretch">
      {isLocalhost && (
        <div className="flex items-center gap-2.5 text-[1.2em] font-medium text-[#888] sm:justify-start justify-center text-center">
          <span
            onClick={handleSeedClick}
            className="cursor-pointer"
            title="Click to copy URL with seed"
          >
            Seed: {seed}
          </span>
          {isSolvable ? (
            <span className="text-[0.72em] tracking-wider uppercase px-2 py-1 rounded-full bg-white/[0.08] text-[#cfe8c6] border border-[#cfe8c6]/35">
              Solvable
            </span>
          ) : null}
        </div>
      )}
      {!isLocalhost && isSolvable && (
        <div className="flex items-center gap-2.5 text-[1.2em] font-medium text-[#888] sm:justify-start justify-center text-center">
          <span className="text-[0.72em] tracking-wider uppercase px-2 py-1 rounded-full bg-white/[0.08] text-[#cfe8c6] border border-[#cfe8c6]/35">
            Solvable
          </span>
        </div>
      )}
      <div className="flex gap-4 items-center flex-wrap sm:justify-end justify-center flex-1">
        <div className="flex gap-2 flex-wrap">
          <button onClick={onNew} title="New Game (n)" className="min-w-[70px]">
            New
          </button>
          <button onClick={onRetry} title="Retry (r)" className="min-w-[70px]">
            Retry
          </button>
          <button
            onClick={onFinish}
            title="Finish (f)"
            className="min-w-[70px]"
          >
            Finish
          </button>
          {isLocalhost && (
            <button
              onClick={onSolve}
              title="Solve (s)"
              className="min-w-[70px]"
            >
              Solve
            </button>
          )}
          <button onClick={onUndo} title="Undo (u)" className="min-w-[70px]">
            Undo
          </button>
        </div>
      </div>
    </div>
  );
};
