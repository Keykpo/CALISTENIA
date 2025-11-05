'use client';

import React, { useEffect, useRef } from 'react';

interface Skill {
  id: string;
  name: string;
  prerequisites?: Skill[];
}

interface UserSkill {
  id: string;
  skillId: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  skill: Skill;
}

interface SkillConnectionsProps {
  skills: Skill[];  // ✅ CAMBIADO: Ahora acepta Skill[] directamente
  userSkills: UserSkill[];  // ✅ AGREGADO: Para obtener el estado
  containerRef: React.RefObject<HTMLDivElement>;
}

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  skillId: string;
  prerequisiteId: string;
}

export default function SkillConnections({ skills, userSkills, containerRef }: SkillConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const connectionsRef = useRef<Connection[]>([]);

  const calculateConnections = () => {
    if (!containerRef.current) return [];

    const connections: Connection[] = [];
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    skills.forEach((skill) => {
      if (!skill || !skill.prerequisites || skill.prerequisites.length === 0) return;

      const skillElement = container.querySelector(`[data-skill-id="${skill.id}"]`) as HTMLElement;
      if (!skillElement) return;

      const skillRect = skillElement.getBoundingClientRect();
      const skillCenter = {
        x: skillRect.left - containerRect.left + skillRect.width / 2,
        y: skillRect.top - containerRect.top + skillRect.height / 2,
      };

      skill.prerequisites.forEach((prerequisite) => {
        if (!prerequisite || !prerequisite.id) return;
        
        const prerequisiteElement = container.querySelector(`[data-skill-id="${prerequisite.id}"]`) as HTMLElement;
        if (!prerequisiteElement) return;

        const prerequisiteRect = prerequisiteElement.getBoundingClientRect();
        const prerequisiteCenter = {
          x: prerequisiteRect.left - containerRect.left + prerequisiteRect.width / 2,
          y: prerequisiteRect.top - containerRect.top + prerequisiteRect.height / 2,
        };

        // Adjust connection points to card edges
        const angle = Math.atan2(skillCenter.y - prerequisiteCenter.y, skillCenter.x - prerequisiteCenter.x);
        const cardWidth = skillRect.width / 2;
        const cardHeight = skillRect.height / 2;

        const fromPoint = {
          x: prerequisiteCenter.x + Math.cos(angle) * cardWidth * 0.8,
          y: prerequisiteCenter.y + Math.sin(angle) * cardHeight * 0.8,
        };

        const toPoint = {
          x: skillCenter.x - Math.cos(angle) * cardWidth * 0.8,
          y: skillCenter.y - Math.sin(angle) * cardHeight * 0.8,
        };

        // ✅ CORREGIDO: Buscar el estado en userSkills
        const skillUserSkill = userSkills.find(us => us.skillId === skill.id);
        const prerequisiteUserSkill = userSkills.find(us => us.skillId === prerequisite.id);
        const isActive = prerequisiteUserSkill?.isCompleted && skillUserSkill?.isUnlocked;

        connections.push({
          from: fromPoint,
          to: toPoint,
          isActive: isActive || false,
          skillId: skill.id,
          prerequisiteId: prerequisite.id,
        });
      });
    });

    return connections;
  };

  const updateConnections = () => {
    connectionsRef.current = calculateConnections();
    renderConnections();
  };

  const renderConnections = () => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = svgRef.current;
    const container = containerRef.current;
    
    // Update SVG size to match container
    const containerRect = container.getBoundingClientRect();
    svg.style.width = `${containerRect.width}px`;
    svg.style.height = `${containerRect.height}px`;

    // Clear existing paths
    svg.innerHTML = '';

    // Create defs for arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Arrow markers
    const activeMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    activeMarker.id = 'activeArrow';
    activeMarker.setAttribute('markerWidth', '10');
    activeMarker.setAttribute('markerHeight', '10');
    activeMarker.setAttribute('refX', '8');
    activeMarker.setAttribute('refY', '3');
    activeMarker.setAttribute('orient', 'auto');
    activeMarker.innerHTML = '<polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />';

    const inactiveMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    inactiveMarker.id = 'inactiveArrow';
    inactiveMarker.setAttribute('markerWidth', '10');
    inactiveMarker.setAttribute('markerHeight', '10');
    inactiveMarker.setAttribute('refX', '8');
    inactiveMarker.setAttribute('refY', '3');
    inactiveMarker.setAttribute('orient', 'auto');
    inactiveMarker.innerHTML = '<polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />';

    defs.appendChild(activeMarker);
    defs.appendChild(inactiveMarker);
    svg.appendChild(defs);

    // Draw connections with orthogonal (elbow) arrows
    connectionsRef.current.forEach((connection, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Build orthogonal path: horizontal -> vertical -> horizontal
      const midX = connection.from.x + (connection.to.x - connection.from.x) * 0.5;
      const pathData = `M ${connection.from.x} ${connection.from.y} L ${midX} ${connection.from.y} L ${midX} ${connection.to.y} L ${connection.to.x} ${connection.to.y}`;

      path.setAttribute('d', pathData);
      path.setAttribute('stroke', connection.isActive ? '#3b82f6' : '#cbd5e1');
      path.setAttribute('stroke-width', connection.isActive ? '3' : '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', connection.isActive ? 'url(#activeArrow)' : 'url(#inactiveArrow)');
      path.setAttribute('opacity', connection.isActive ? '1' : '0.6');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      
      // Add animation classes
      path.classList.add('skill-connection-path');
      if (connection.isActive) {
        path.classList.add('active');
      }

      // Add hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('stroke-width', connection.isActive ? '4' : '3');
        path.setAttribute('opacity', '1');
        
        // Highlight connected skills
        const skillElement = containerRef.current?.querySelector(`[data-skill-id="${connection.skillId}"]`);
        const prerequisiteElement = containerRef.current?.querySelector(`[data-skill-id="${connection.prerequisiteId}"]`);
        
        if (skillElement) skillElement.classList.add('connection-highlight');
        if (prerequisiteElement) prerequisiteElement.classList.add('connection-highlight');
      });

      path.addEventListener('mouseleave', () => {
        path.setAttribute('stroke-width', connection.isActive ? '3' : '2');
        path.setAttribute('opacity', connection.isActive ? '1' : '0.6');
        
        // Remove highlight from connected skills
        const skillElement = containerRef.current?.querySelector(`[data-skill-id="${connection.skillId}"]`);
        const prerequisiteElement = containerRef.current?.querySelector(`[data-skill-id="${connection.prerequisiteId}"]`);
        
        if (skillElement) skillElement.classList.remove('connection-highlight');
        if (prerequisiteElement) prerequisiteElement.classList.remove('connection-highlight');
      });

      svg.appendChild(path);
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateConnections, 100);
    };

    const handleScroll = () => {
      updateConnections();
    };

    updateConnections();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    // Update connections when skills change
    const observer = new MutationObserver(() => {
      setTimeout(updateConnections, 100);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [skills, userSkills]);  // ✅ AGREGADO userSkills a las dependencias

  return (
    <>
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 pointer-events-none z-10"
        style={{ overflow: 'visible' }}
      />
      <style jsx>{`
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .skill-connection-path {
          transition: all 0.3s ease;
        }
        
        .connection-highlight {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          z-index: 20;
          position: relative;
        }
      `}</style>
    </>
  );
}