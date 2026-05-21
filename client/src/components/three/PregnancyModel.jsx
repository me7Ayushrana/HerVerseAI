import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function PregnancyModel({ week }) {
  const groupRef = useRef();
  const coreRef = useRef();

  // Scale based on week
  const scale = Math.max(0.2, week / 40);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.set(scale * breathe, scale * breathe, scale * breathe);
    }
    if (coreRef.current) {
      // Simulate heartbeat pulsing for the inner core
      const pulse = 1 + Math.pow(Math.sin(state.clock.elapsedTime * 4), 4) * 0.1;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Calculate opacity and distortion based on development week
  const isEarly = week < 10;

  return (
    <group ref={groupRef}>
      {/* Outer Amniotic Sac / Womb Representation */}
      <Sphere args={[1.5, 64, 64]}>
        <MeshDistortMaterial 
          color="#F472B6" 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.1} 
          roughness={0.2} 
          transmission={0.9} // Glass-like
          opacity={1} 
          transparent 
          distort={0.2} 
          speed={1} 
        />
      </Sphere>

      {/* Inner Fetus Representation (stylized) */}
      <group ref={coreRef}>
        <Sphere args={[0.6, 32, 32]} position={[0, -0.2, 0]} scale={[1, 1.4, 1]}>
          <meshPhysicalMaterial 
            color="#FF9EBB" 
            emissive={isEarly ? "#FF9EBB" : "#000000"} 
            emissiveIntensity={isEarly ? 0.5 : 0} 
            roughness={0.4} 
            metalness={0.1}
          />
        </Sphere>
        {/* Head representation */}
        {!isEarly && (
          <Sphere args={[0.4, 32, 32]} position={[0, 0.6, 0.1]}>
            <meshPhysicalMaterial color="#FF9EBB" roughness={0.4} />
          </Sphere>
        )}
      </group>
    </group>
  );
}
