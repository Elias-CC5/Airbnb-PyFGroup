'use client';

import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei';
import { Canvas, extend, useFrame, type ThreeEvent } from '@react-three/fiber';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

/** Rutas en `public/`. En Next no se importan los binarios: se sirven como estáticos. */
const MODELO = '/lanyard/card.glb';
const CINTA = '/lanyard/lanyard-band.png';
const ANVERSO = '/lanyard/card-front.png';

interface LanyardProps {
  /** Distancia de la cámara. Más alto = la tarjeta se ve más pequeña. */
  position?: [number, number, number];
  gravity?: [number, number, number];
  /** Se pasa al `<Canvas>`: útil para limitar la resolución en móviles. */
  dpr?: [number, number];
  className?: string;
}

/**
 * Tarjeta de credencial colgando de un cordón, con física real: se puede
 * arrastrar con el ratón y se balancea.
 *
 * Adaptado de React Bits, que asume Vite. Dos diferencias que importan:
 *
 * - El `.glb` y las texturas viven en `public/` y se cargan por URL. Así no
 *   hace falta tocar la configuración del bundler ni declarar módulos para
 *   los binarios.
 * - Se monta sólo en el cliente. Three.js no funciona en el render de
 *   servidor, así que la página lo carga con `dynamic(..., { ssr: false })`.
 *
 * Ojo con el peso: three + rapier son unos 600 kB comprimidos, más el modelo.
 * Por eso está aislado en su propio componente y se carga aparte del resto.
 */
export function Lanyard({
  position = [0, 0, 22],
  gravity = [0, -40, 0],
  dpr = [1, 1.75],
  className,
}: LanyardProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position, fov: 25 }}
        gl={{ alpha: true, antialias: true }}
        dpr={dpr}
        // Fondo transparente: la sección de la página pone el suyo.
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Banda />
        </Physics>

        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

/** Rigidez del cordón: valores altos lo vuelven una barra, bajos un chicle. */
const SEGMENTO = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };

function Banda({ maxSpeed = 50, minSpeed = 10 }) {
  // Cuatro eslabones: uno fijo arriba y tres que cuelgan.
  const fijo = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const tarjeta = useRef<RapierRigidBody>(null);

  const banda = useRef<THREE.Mesh & { geometry: { setPoints: (p: THREE.Vector3[]) => void } }>(null);

  const vec = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;

  const [curva] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );

  const [arrastre, setArrastre] = useState<false | THREE.Vector3>(false);
  const [encima, setEncima] = useState(false);
  const [ancho, setAncho] = useState(1000);
  const [alto, setAlto] = useState(1000);

  const { nodes, materials } = useGLTF(MODELO) as unknown as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.MeshPhysicalMaterial>;
  };
  const texturaCinta = useTexture(CINTA);
  const texturaTarjeta = useTexture(ANVERSO);

  // El modelo trae su propia textura; la sustituimos por la de la marca.
  useEffect(() => {
    const base = materials.base;
    if (!base) return;
    texturaTarjeta.colorSpace = THREE.SRGBColorSpace;
    texturaTarjeta.flipY = false;
    base.map = texturaTarjeta;
    base.needsUpdate = true;
  }, [materials, texturaTarjeta]);

  useEffect(() => {
    const medir = () => {
      setAncho(window.innerWidth);
      setAlto(window.innerHeight);
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  useRopeJoint(fijo, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, tarjeta, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (!encima) return;
    document.body.style.cursor = arrastre ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [encima, arrastre]);

  useFrame((state, delta) => {
    if (arrastre && tarjeta.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));

      // Despertar los eslabones: si están dormidos, la tarjeta se arrastra sola.
      [tarjeta, j1, j2, j3, fijo].forEach((r) => r.current?.wakeUp());
      tarjeta.current.setNextKinematicTranslation({
        x: vec.x - arrastre.x,
        y: vec.y - arrastre.y,
        z: vec.z - arrastre.z,
      });
    }

    if (!fijo.current || !j1.current || !j2.current || !j3.current || !banda.current) return;

    // Suaviza el recorrido del cordón: sin esto la curva tiembla.
    [j1, j2].forEach((ref) => {
      const r = ref.current!;
      const extra = r as RapierRigidBody & { lerped?: THREE.Vector3 };
      if (!extra.lerped) extra.lerped = new THREE.Vector3().copy(r.translation());
      const distancia = Math.max(0.1, Math.min(1, extra.lerped.distanceTo(r.translation())));
      extra.lerped.lerp(
        r.translation(),
        delta * (minSpeed + distancia * (maxSpeed - minSpeed)),
      );
    });

    curva.points[0].copy(j3.current.translation());
    curva.points[1].copy((j2.current as RapierRigidBody & { lerped: THREE.Vector3 }).lerped);
    curva.points[2].copy((j1.current as RapierRigidBody & { lerped: THREE.Vector3 }).lerped);
    curva.points[3].copy(fijo.current.translation());
    banda.current.geometry.setPoints(curva.getPoints(32));

    // Frena el giro sobre su propio eje para que la tarjeta mire al frente.
    if (tarjeta.current) {
      ang.copy(tarjeta.current.angvel());
      rot.copy(tarjeta.current.rotation() as unknown as THREE.Vector3);
      tarjeta.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curva.curveType = 'chordal';
  texturaCinta.wrapS = texturaCinta.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fijo} angularDamping={4} linearDamping={4} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...SEGMENTO}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...SEGMENTO}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...SEGMENTO}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={tarjeta}
          {...SEGMENTO}
          type={arrastre ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setEncima(true)}
            onPointerOut={() => setEncima(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).releasePointerCapture?.(e.pointerId);
              setArrastre(false);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setArrastre(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(tarjeta.current!.translation())),
              );
            }}
          >
            <mesh geometry={nodes.card?.geometry}>
              <meshPhysicalMaterial
                map={materials.base?.map ?? null}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip?.geometry} material={materials.metal} />
            <mesh geometry={nodes.clamp?.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={banda}>
        {/* @ts-expect-error — meshline se registra con extend() y no trae tipos JSX. */}
        <meshLineGeometry />
        {/* @ts-expect-error — idem. */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[ancho, alto]}
          useMap
          map={texturaCinta}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(MODELO);
