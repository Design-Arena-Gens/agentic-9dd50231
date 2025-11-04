import dynamic from "next/dynamic";
import HeadsUpDisplay from "@/components/HeadsUpDisplay";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false
});

export default function HomePage() {
  return (
    <main>
      <div className="game-container">
        <GameCanvas />
        <HeadsUpDisplay />
        <div id="car-tracking-anchor" data-x={0} data-z={0} hidden />
        <div className="game-overlay">
          <div className="branding">
            <h1>Horizon Rush</h1>
            <p>Speed across a neon horizon. Master the drift. Own the festival.</p>
          </div>
          <div className="cta">
            <p>WASD / Arrows to drive · Space to brake · Shift to boost</p>
          </div>
        </div>
      </div>
    </main>
  );
}
