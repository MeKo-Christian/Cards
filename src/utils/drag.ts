/**
 * Utility functions for drag-and-drop operations
 */

import type { DropTarget } from "../types/drag";

export function areTargetsEqual(
  a: DropTarget | null,
  b: DropTarget | null
): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (a.type !== b.type) {
    return false;
  }

  if (a.type === "tableau") {
    return b.type === "tableau" && a.pileIndex === b.pileIndex;
  }

  return b.type === "foundation" && a.foundationIndex === b.foundationIndex;
}

export function getDropTargetFromPoint(
  x: number,
  y: number
): DropTarget | null {
  const element = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!element) {
    return null;
  }

  const foundationEl = element.closest<HTMLElement>("[data-foundation-index]");
  if (foundationEl) {
    const foundationIndex = Number(foundationEl.dataset.foundationIndex);
    return Number.isFinite(foundationIndex)
      ? ({ type: "foundation", foundationIndex } as DropTarget)
      : null;
  }

  const tableauEl = element.closest<HTMLElement>("[data-tableau-index]");
  if (tableauEl) {
    const pileIndex = Number(tableauEl.dataset.tableauIndex);
    return Number.isFinite(pileIndex)
      ? ({ type: "tableau", pileIndex } as DropTarget)
      : null;
  }

  return null;
}

type RectLike = Pick<DOMRect, "left" | "top" | "width" | "height">;

function getIntersectionArea(a: RectLike, b: RectLike): number {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.top + a.height, b.top + b.height);

  if (right <= left || bottom <= top) {
    return 0;
  }

  return (right - left) * (bottom - top);
}

export function getDropTargetFromRect(rect: DOMRect): DropTarget | null {
  let bestTarget: DropTarget | null = null;
  let bestArea = 0;

  const tableauPiles = document.querySelectorAll<HTMLElement>(
    ".tableau-pile[data-tableau-index]"
  );

  tableauPiles.forEach((pileEl) => {
    const pileIndex = Number(pileEl.dataset.tableauIndex);
    if (!Number.isFinite(pileIndex)) {
      return;
    }

    let targetEl: HTMLElement | null = null;
    const cards = pileEl.querySelectorAll<HTMLElement>(
      ".tableau-card[data-card-index]"
    );

    if (cards.length > 0) {
      let topCard = cards[0];
      let topIndex = Number(topCard.dataset.cardIndex);
      cards.forEach((card) => {
        const cardIndex = Number(card.dataset.cardIndex);
        if (Number.isFinite(cardIndex) && cardIndex >= topIndex) {
          topIndex = cardIndex;
          topCard = card;
        }
      });
      targetEl = topCard.querySelector<HTMLElement>(".card") || topCard;
    } else {
      targetEl = pileEl.querySelector<HTMLElement>(".tableau-empty") || pileEl;
    }

    if (!targetEl) {
      return;
    }

    const targetRect = targetEl.getBoundingClientRect();
    const area = getIntersectionArea(rect, targetRect);
    if (area > bestArea) {
      bestArea = area;
      bestTarget = { type: "tableau", pileIndex } as DropTarget;
    }
  });

  const foundationPiles = document.querySelectorAll<HTMLElement>(
    ".foundation-pile[data-foundation-index]"
  );

  foundationPiles.forEach((pileEl) => {
    const foundationIndex = Number(pileEl.dataset.foundationIndex);
    if (!Number.isFinite(foundationIndex)) {
      return;
    }

    const targetEl =
      pileEl.querySelector<HTMLElement>(".foundation-card .card") ||
      pileEl.querySelector<HTMLElement>(".foundation-card") ||
      pileEl.querySelector<HTMLElement>(".foundation-empty") ||
      pileEl;

    const targetRect = targetEl.getBoundingClientRect();
    const area = getIntersectionArea(rect, targetRect);
    if (area > bestArea) {
      bestArea = area;
      bestTarget = { type: "foundation", foundationIndex } as DropTarget;
    }
  });

  return bestTarget;
}

export function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
