/**
 * TopBar component - displays seed and game control buttons
 */

import "./TopBar.css";

interface TopBarProps {
  seed: number;
  isSolvable: boolean;
  onNew: () => void;
  onRetry: () => void;
  onFinish: () => void;
  onSolve: () => void;
  onUndo: () => void;
}

export function TopBar({
  seed,
  isSolvable,
  onNew,
  onRetry,
  onFinish,
  onSolve,
  onUndo,
}: TopBarProps) {
  return (
    <div className="top-bar">
      <div className="seed-display">
        <span>Seed: {seed}</span>
        {isSolvable ? <span className="seed-badge">Solvable</span> : null}
      </div>
      <div className="top-bar-controls">
        <div className="button-group">
          <button onClick={onNew} title="New Game (n)">
            New
          </button>
          <button onClick={onRetry} title="Retry (r)">
            Retry
          </button>
          <button onClick={onFinish} title="Finish (f)">
            Finish
          </button>
          <button onClick={onSolve} title="Solve (s)">
            Solve
          </button>
          <button onClick={onUndo} title="Undo (u)">
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}
