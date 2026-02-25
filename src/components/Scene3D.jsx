import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Stars, Trail } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere({ position, color, speed = 1, distort = 0.4 }) {
    const meshRef = useRef()
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed
        }
    })
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
            <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={distort}
                    speed={2}
                    roughness={0.1}
                    metalness={0.8}
                    wireframe={false}
                    transparent
                    opacity={0.85}
                />
            </Sphere>
        </Float>
    )
}

function WaterRings() {
    const group = useRef()
    useFrame(({ clock }) => {
        if (group.current) group.current.rotation.z = clock.elapsedTime * 0.15
    })

    const rings = useMemo(() => (
        Array.from({ length: 5 }, (_, i) => ({
            radius: 2 + i * 0.8,
            opacity: 0.15 - i * 0.02,
        }))
    ), [])

    return (
        <group ref={group}>
            {rings.map((ring, i) => (
                <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[ring.radius, 0.02, 8, 80]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={ring.opacity} />
                </mesh>
            ))}
        </group>
    )
}

function FloatingOrbs() {
    const orbs = useRef([])
    const positions = useMemo(() => (
        Array.from({ length: 12 }, () => ({
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 6,
            z: (Math.random() - 0.5) * 4 - 2,
            size: Math.random() * 0.12 + 0.04,
            speed: Math.random() * 0.5 + 0.3,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.6 ? '#7c4dff' : '#00e5ff',
        }))
    ), [])

    useFrame(({ clock }) => {
        orbs.current.forEach((mesh, i) => {
            if (!mesh) return
            const p = positions[i]
            mesh.position.y = p.y + Math.sin(clock.elapsedTime * p.speed + p.phase) * 0.5
            mesh.position.x = p.x + Math.cos(clock.elapsedTime * p.speed * 0.5 + p.phase) * 0.3
        })
    })

    return (
        <>
            {positions.map((p, i) => (
                <mesh key={i} ref={el => orbs.current[i] = el} position={[p.x, p.y, p.z]}>
                    <sphereGeometry args={[p.size, 16, 16]} />
                    <meshBasicMaterial color={p.color} transparent opacity={0.7} />
                </mesh>
            ))}
        </>
    )
}

export default function Scene3D({ style }) {
    return (
        <div style={{ width: '100%', height: '100%', ...style }}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} color="#00e5ff" intensity={2} />
                <pointLight position={[-5, -5, -5]} color="#7c4dff" intensity={1.5} />
                <pointLight position={[0, 5, 0]} color="#00bcd4" intensity={1} />

                <Stars
                    radius={100}
                    depth={50}
                    count={2000}
                    factor={3}
                    saturation={0.8}
                    fade
                    speed={0.5}
                />

                <WaterRings />
                <FloatingOrbs />

                <AnimatedSphere position={[0, 0, 0]} color="#00bcd4" speed={0.8} distort={0.5} />
                <AnimatedSphere position={[3.5, 1, -2]} color="#7c4dff" speed={0.5} distort={0.3} />
                <AnimatedSphere position={[-3, -1, -1]} color="#0097a7" speed={0.6} distort={0.4} />
            </Canvas>
        </div>
    )
}
