export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
}

export type Point = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
