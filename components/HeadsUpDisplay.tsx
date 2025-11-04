"use client";

import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/gameStore";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toFixed(2).padStart(5, "0");
  return `${minutes}:${remainder}`;
};

function BoostBar() {
  const boostEnergy = useGameStore(state => state.boostEnergy);
  return (
    <div className="hud-boost">
      <span>Boost</span>
      <div className="hud-boost-bar">
        <div style={{ width: `${boostEnergy}%` }} />
      </div>
    </div>
  );
}

function Speedometer() {
  const speed = useGameStore(state => state.speed);
  const gear = useGameStore(state => state.gear);
  const speedText = speed.toFixed(0);
  return (
    <div className="hud-speed">
      <span className="hud-speed-value">{speedText}</span>
      <span className="hud-speed-label">km/h</span>
      <span className="hud-gear">G{gear}</span>
    </div>
  );
}

function Minimap() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      const carEl = document.getElementById("car-tracking-anchor");
      if (!carEl) return;
      const { dataset } = carEl;
      const x = Number(dataset.x ?? 0);
      const y = Number(dataset.z ?? 0);
      setPosition({ x, y });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hud-minimap">
      <div className="hud-minimap-grid">
        <div style={{ transform: `translate(${position.x * 0.08}px, ${position.y * 0.08}px)` }} className="hud-minimap-dot" />
      </div>
    </div>
  );
}

function RaceInfo() {
  const checkpointIndex = useGameStore(state => state.checkpointIndex);
  const totalCheckpoints = useGameStore(state => state.totalCheckpoints);
  const lapTime = useGameStore(state => state.lapTime);
  const bestLap = useGameStore(state => state.bestLap);
  const distance = useGameStore(state => state.distance);

  return (
    <div className="hud-race">
      <div>
        <span className="hud-label">Checkpoint</span>
        <span className="hud-value">{checkpointIndex + 1}/{totalCheckpoints}</span>
      </div>
      <div>
        <span className="hud-label">Lap</span>
        <span className="hud-value">{formatTime(lapTime)}</span>
      </div>
      <div>
        <span className="hud-label">Best</span>
        <span className="hud-value">{bestLap ? formatTime(bestLap) : "--:--"}</span>
      </div>
      <div>
        <span className="hud-label">Distance</span>
        <span className="hud-value">{distance.toFixed(1)} km</span>
      </div>
    </div>
  );
}

function TipsTicker() {
  const tips = useMemo(
    () => [
      "Press Shift to unleash turbo boost energy",
      "Drift through corners by combining steering and brake",
      "Collect checkpoints to record lap times",
      "Q / E let you glance left and right on the highway"
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const ticker = setInterval(() => {
      setIndex(prev => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(ticker);
  }, [tips.length]);

  return <div className="hud-ticker">{tips[index]}</div>;
}

export default function HeadsUpDisplay() {
  return (
    <div className="hud">
      <div className="hud-top">
        <RaceInfo />
        <Minimap />
      </div>
      <div className="hud-bottom">
        <TipsTicker />
        <div className="hud-bottom-right">
          <BoostBar />
          <Speedometer />
        </div>
      </div>
    </div>
  );
}
