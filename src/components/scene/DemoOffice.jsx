export default function DemoOffice({ config }) {
  return <group>{config.colliders.map(c => <mesh key={c.id} position={c.center} receiveShadow castShadow><boxGeometry args={c.halfExtents.map(n => n * 2)} /><meshStandardMaterial color={c.color} roughness={0.85} /></mesh>)}
    {/* Decorative finishes belong only to this fictional, labeled test environment. */}
    {Array.from({ length: 15 }, (_, i) => <mesh key={i} position={[-4.85 + i * 0.22, 0.55, 0.335]}><boxGeometry args={[0.07, 1.05, 0.025]} /><meshStandardMaterial color="#5e4a39" /></mesh>)}
    <mesh position={[-3.3, 1.12, -0.25]}><boxGeometry args={[3.4, 0.04, 1.22]} /><meshStandardMaterial color="#e1d6bf" /></mesh>
    <mesh position={[0, 0.006, 3.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3, 4]} /><meshStandardMaterial color="#879c9c" roughness={1} /></mesh>
    <mesh position={[5.87, 1.9, 1.5]}><boxGeometry args={[0.02, 1.6, 6]} /><meshStandardMaterial color="#b9d8df" emissive="#a9c8d0" emissiveIntensity={0.2} /></mesh>
    {[-0.5, 1.5, 3.5].map(z => <mesh key={z} position={[5.84, 1.9, z]}><boxGeometry args={[0.05, 1.65, 0.055]} /><meshStandardMaterial color="#425653" /></mesh>)}
    <mesh position={[-3.1, 2.15, -1.88]}><boxGeometry args={[2.25, 0.65, 0.035]} /><meshStandardMaterial color="#344c48" /></mesh>
    <mesh position={[0, 3.15, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[12, 14]} /><meshStandardMaterial color="#e2e4df" /></mesh>
  </group>;
}
