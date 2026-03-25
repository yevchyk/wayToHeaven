import type { TravelBoardData } from '@engine/types/travel';

import { chapter1UndergroundRouteBoard } from '@content/chapters/chapter-1/travel/underground-route.board';

export const travelBoardRegistry: Record<string, TravelBoardData> = {
  [chapter1UndergroundRouteBoard.id]: chapter1UndergroundRouteBoard,
};
