"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Sky, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useKeyboardControls } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/gameStore";
import { ACCELERATION, BOOST_DRAIN, BOOST_RECHARGE, BOOST_SPEED, BRAKE_FORCE, DRAG, MAX_SPEED, ROAD_COLOR, ROAD_WIDTH, TURN_RATE } from "@/lib/constants";
import { checkpointPositions } from "@/data/checkpoints";

type CarProps = {
  position?: THREE.Vector3;
};

const tempVec = new THREE.Vector3();
const forwardVector = new THREE.Vector3(0, 0, -1);

function CarBody(props: CarProps) {
  const chassis = useRef<THREE.Group>(null);
  const wheels = useMemo(() => new Array(4).fill(null).map(() => new THREE.Mesh()), []);
  const diffuseMap = useTexture("/textures/car-albedo.png");

  if (diffuseMap) {
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;
    diffuseMap.repeat.set(1, 1);
  }

  useFrame((_, delta) => {
    if (!chassis.current) return;
    const oscillation = Math.sin(performance.now() * 0.004) * 0.004;
    chassis.current.position.y = 0.45 + oscillation;
    wheels.forEach((wheel, index) => {
      if (!wheel.parent) return;
      const spinDir = index < 2 ? 1 : -1;
      wheel.rotation.x += delta * 6 * spinDir;
    });
  });

  return (
    <group ref={chassis} position={props.position ?? new THREE.Vector3(0, 0.25, 0)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color="#ff6b35" map={diffuseMap} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, -0.3]} castShadow>
        <boxGeometry args={[1.6, 0.6, 2.2]} />
        <meshStandardMaterial color="#232931" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.65, -0.8]}>
        <boxGeometry args={[1.2, 0.4, 1.4]} />
        <meshStandardMaterial color="#11141a" metalness={0.3} roughness={0.1} />
      </mesh>
      {[[0.9, -0.1, 1.3], [-0.9, -0.1, 1.3], [0.9, -0.1, -1.4], [-0.9, -0.1, -1.4]].map((pos, i) => (
        <mesh
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          ref={node => {
            if (!node) return;
            wheels[i] = node;
          }}
          position={pos as [number, number, number]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.45, 0.45, 0.35, 24]} />
          <meshStandardMaterial color="#111217" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 2.3]}>
        <boxGeometry args={[1.6, 0.3, 0.4]} />
        <meshStandardMaterial color="#ffc857" emissiveIntensity={0.35} emissive="#ffa600" />
      </mesh>
      <mesh position={[0, 0.2, -2.2]}>
        <boxGeometry args={[1.4, 0.2, 0.2]} />
        <meshStandardMaterial color="#4ecdc4" emissive="#74f2ce" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function HorizonTerrain() {
  const texture = useTexture("/textures/asphalt.jpg");

  if (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#0c101b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial map={texture} color={ROAD_COLOR} />
      </mesh>
    </group>
  );
}

function CitySilhouette() {
  const buildings = useMemo(() => {
    const instances: { position: [number, number, number]; scale: [number, number, number]; color: string }[] = [];
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed) * 10000;
      seed += 1;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 160; i += 1) {
      const radius = 240 + random() * 260;
      const angle = random() * Math.PI * 2;
      const height = 40 + random() * 180;
      instances.push({
        position: [Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius],
        scale: [20 + random() * 40, height, 20 + random() * 40],
        color: `hsl(${200 + random() * 40}, 40%, ${20 + random() * 25}%)`
      });
    }
    return instances;
  }, []);

  return (
    <group>
      {buildings.map((instance, index) => (
        <mesh
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          position={instance.position}
          scale={instance.scale}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={instance.color} metalness={0.2} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function CheckpointGates() {
  return (
    <group>
      {checkpointPositions.map((checkpoint, index) => (
        <group key={`checkpoint-${index}`} position={checkpoint.toArray() as [number, number, number]}>
          <mesh position={[-ROAD_WIDTH / 2, 4, 0]} castShadow>
            <boxGeometry args={[0.6, 8, 2]} />
            <meshStandardMaterial color="#ff4d6d" emissive="#ff758f" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[ROAD_WIDTH / 2, 4, 0]} castShadow>
            <boxGeometry args={[0.6, 8, 2]} />
            <meshStandardMaterial color="#56cfe1" emissive="#64dfdf" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 7.5, 0]}>
            <boxGeometry args={[ROAD_WIDTH, 2, 1]} />
            <meshStandardMaterial color="#e0fbfc" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NeonTrails() {
  const trailMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#3a86ff" }), []);
  const positions = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 250; i += 1) {
      const radius = 300 + Math.random() * 400;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 2 + 0.2;
      const length = Math.random() * 60 + 20;
      const start = new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      const end = start.clone().add(new THREE.Vector3(Math.cos(angle) * length, 0, Math.sin(angle) * length));
      points.push(start, end);
    }
    return points;
  }, []);

  return (
    <group>
      {positions.map((_, index) =>
        index % 2 === 0 ? (
          <mesh key={`trail-${index}`} position={positions[index].clone().add(positions[index + 1]).divideScalar(2)}>
            <boxGeometry args={[positions[index].distanceTo(positions[index + 1]), 0.2, 0.4]} />
            <meshBasicMaterial color="#3a86ff" />
          </mesh>
        ) : null
      )}
    </group>
  );
}

type CarControllerProps = {
  carRef: React.RefObject<THREE.Group>;
};

function CarController({ carRef }: CarControllerProps) {
  const inputs = useKeyboardControls();
  const velocity = useRef(0);
  const heading = useRef(0);
  const drift = useRef(0);
  const boostEnergy = useRef(100);
  const distance = useRef(0);
  const lapTime = useRef(0);
  const checkpointIndex = useRef(0);
  const store = useGameStore();
  const checkpointRadius = 32;

  useFrame((state, delta) => {
    const car = carRef.current;
    if (!car) return;

    lapTime.current += delta;

    const { forward, backward, left, right, brake, boost } = inputs;
    let speed = velocity.current;
    const boostActive = boost && boostEnergy.current > 0;
    const maxSpeed = boostActive ? BOOST_SPEED : MAX_SPEED;

    if (forward) speed += ACCELERATION * delta;
    if (backward) speed -= ACCELERATION * 0.6 * delta;

    if (!forward && !backward) {
      speed *= Math.pow(DRAG, delta * 60);
    }

    if (brake) {
      speed -= BRAKE_FORCE * delta;
      speed = Math.max(speed, 0);
    }

    speed = THREE.MathUtils.clamp(speed, -MAX_SPEED * 0.4, maxSpeed);

    const turnIntensity = THREE.MathUtils.clamp(speed / maxSpeed, 0, 1);
    let steering = 0;
    if (left) steering += 1;
    if (right) steering -= 1;
    heading.current += steering * TURN_RATE * turnIntensity * delta;

    const direction = heading.current;
    const forwardDir = forwardVector.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), direction);

    const moveDistance = speed * delta;
    car.position.addScaledVector(forwardDir, moveDistance);

    const lateralVelocity = steering * speed * 0.05;
    drift.current = THREE.MathUtils.lerp(drift.current, Math.abs(lateralVelocity), 0.1);

    car.rotation.y = direction;

    if (boostActive) {
      boostEnergy.current = Math.max(0, boostEnergy.current - BOOST_DRAIN * delta);
    } else {
      boostEnergy.current = Math.min(100, boostEnergy.current + BOOST_RECHARGE * delta);
    }

    velocity.current = speed;
    distance.current += Math.abs(moveDistance);

    const anchor = document.getElementById("car-tracking-anchor");
    if (anchor) {
      anchor.dataset.x = car.position.x.toFixed(1);
      anchor.dataset.z = car.position.z.toFixed(1);
    }

    const cameraOffset = new THREE.Vector3(0, 4.5, 9).applyAxisAngle(new THREE.Vector3(0, 1, 0), direction);
    const targetCameraPosition = tempVec.copy(car.position).add(cameraOffset);
    state.camera.position.lerp(targetCameraPosition, 1 - Math.pow(0.001, delta * 60));
    const lookOffsetFactor = inputs.lookLeft ? 1 : inputs.lookRight ? -1 : 0;
    const lookShift = new THREE.Vector3(lookOffsetFactor * 4, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), direction);
    const lookTarget = car.position.clone().add(new THREE.Vector3(0, 1.2, 0)).add(lookShift);
    state.camera.lookAt(lookTarget);

    const currentCheckpoint = checkpointPositions[checkpointIndex.current % checkpointPositions.length];
    if (car.position.distanceTo(currentCheckpoint) < checkpointRadius) {
      checkpointIndex.current += 1;
      if (checkpointIndex.current % checkpointPositions.length === 0) {
        if (!store.bestLap || lapTime.current < store.bestLap) {
          store.setTelemetry({ bestLap: lapTime.current });
        }
        lapTime.current = 0;
      }
    }

    const speedKmh = Math.max(0, speed * 3.6);

    store.setTelemetry({
      speed: speedKmh,
      gear: Math.max(1, Math.ceil(THREE.MathUtils.clamp(speedKmh / 30, 1, 7))),
      distance: distance.current / 1000,
      drift: drift.current,
      boostEnergy: boostEnergy.current,
      lapTime: lapTime.current,
      checkpointIndex: checkpointIndex.current % checkpointPositions.length,
      totalCheckpoints: checkpointPositions.length
    });
  });

  return null;
}

function LightingRig() {
  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[60, 140, 40]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
      />
      <pointLight position={[0, 20, 0]} intensity={0.5} color="#6c63ff" distance={500} />
    </group>
  );
}

const cameraInitialPosition = new THREE.Vector3(0, 4, 12);

export function GameScene() {
  const carRef = useRef<THREE.Group>(null);

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraInitialPosition.toArray()} fov={55} />
      <LightingRig />
      <Sky
        distance={450000}
        sunPosition={[0.4, 0.6, 0.1]}
        inclination={0.49}
        azimuth={0.08}
        turbidity={12}
        mieCoefficient={0.012}
        mieDirectionalG={0.95}
      />
      <Environment preset="sunset" />
      <HorizonTerrain />
      <CitySilhouette />
      <CheckpointGates />
      <NeonTrails />
      <group position={[0, 0, 0]}>
        <group ref={carRef}>
          <CarBody />
        </group>
      </group>
      <CarController carRef={carRef} />
    </>
  );
}

export default function GameCanvas() {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback={null}>
        <GameScene />
      </Suspense>
    </Canvas>
  );
}
