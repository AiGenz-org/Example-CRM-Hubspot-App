"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CrmOrbitScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.3, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.position.x = 1.45;
    scene.add(group);

    const nodeGeometry = new THREE.SphereGeometry(0.08, 24, 24);
    const hubGeometry = new THREE.IcosahedronGeometry(0.55, 2);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x5eead4 });
    const hotNodeMaterial = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const hubMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    group.add(hub);

    const points: THREE.Vector3[] = [];
    const nodeCount = 42;

    for (let index = 0; index < nodeCount; index += 1) {
      const angle = index * 0.74;
      const radius = 2.1 + (index % 6) * 0.28;
      const y = Math.sin(index * 1.31) * 1.35;
      const point = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius,
      );
      points.push(point);

      const node = new THREE.Mesh(
        nodeGeometry,
        index % 9 === 0 ? hotNodeMaterial : nodeMaterial,
      );
      node.position.copy(point);
      group.add(node);
    }

    const linePositions: number[] = [];

    points.forEach((point, index) => {
      linePositions.push(0, 0, 0, point.x, point.y, point.z);

      if (index > 0 && index % 2 === 0) {
        const previous = points[index - 1];
        linePositions.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
      }
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3),
    );

    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.2,
      }),
    );
    group.add(lines);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    resize();

    let animationFrame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = elapsed * 0.12;
      group.rotation.x = Math.sin(elapsed * 0.35) * 0.12;
      hub.rotation.x = elapsed * 0.32;
      hub.rotation.y = elapsed * 0.26;
      animationFrame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      container.removeChild(renderer.domElement);
      lineGeometry.dispose();
      nodeGeometry.dispose();
      hubGeometry.dispose();
      nodeMaterial.dispose();
      hotNodeMaterial.dispose();
      hubMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
