'use client';
import dynamic from 'next/dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GameAppProps {
  config: any;
  secretPassword?: string;
}

const loading = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13, background: '#06080F' }}>
    Loading…
  </div>
);

// Each variant is code-split independently — only the game the recipient
// actually opens ships to their device, not both.
const GAMES = {
  game_1: dynamic(() => import('./games/game_1/GameApp'), { ssr: false, loading }), // Heart Maze
  game_2: dynamic(() => import('./games/game_2/GameApp'), { ssr: false, loading }), // Hull Run
} as const;

// Selector wrapper: picks which mini-game to render.
// config.variant (or config.gameVariant) can later be exposed as a create-page
// option so recipients/creators can choose between games. Defaults to game_1
// (Heart Maze, the original game) — game_2 (Hull Run) stays available in the
// codebase for later, just not active by default.
export default function GameApp({ config, secretPassword }: GameAppProps) {
  const variant: keyof typeof GAMES =
    config?.variant in GAMES ? config.variant : config?.gameVariant in GAMES ? config.gameVariant : 'game_1';

  const Game = GAMES[variant] || GAMES.game_1;
  return <Game config={config} secretPassword={secretPassword} />;
}
