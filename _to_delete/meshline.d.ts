/**
 * `meshline` no publica tipos, y sus elementos se registran en tiempo de
 * ejecución con `extend()` de react-three-fiber, así que TypeScript no sabe
 * que `<meshLineGeometry>` y `<meshLineMaterial>` existen.
 */
declare module 'meshline' {
  export const MeshLineGeometry: new () => import('three').BufferGeometry & {
    setPoints: (points: import('three').Vector3[]) => void;
  };
  export const MeshLineMaterial: new () => import('three').Material;
  export const MeshLine: unknown;
  export const MeshLineRaycast: unknown;
}
