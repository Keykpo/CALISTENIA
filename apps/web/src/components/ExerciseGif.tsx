"use client";
import React, { useState } from 'react';

type Props = {
  exerciseId: string;
  exerciseName: string;
  width?: number;
  height?: number;
};

export function ExerciseGif({ exerciseId, exerciseName, width = 480, height = 360 }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const src = `/api/exercise-gif/${exerciseId}`;

  return (
    <div style={{ display: 'inline-block', position: 'relative', width, height }}>
      {isLoading && !hasError && (
        <div
          aria-label="Cargando GIF"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '4px solid #999',
              borderTopColor: '#333',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!hasError ? (
        <img
          src={src}
          alt={`GIF de ${exerciseName}`}
          width={width}
          height={height}
          style={{
            width,
            height,
            objectFit: 'contain',
            display: isLoading ? 'none' : 'block',
            background: '#fff',
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div
          role="img"
          aria-label={`Placeholder para ${exerciseName}`}
          style={{
            width,
            height,
            border: '2px dashed #aaa',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555',
            background: 'linear-gradient(135deg, #f8f8f8, #f0f0f0)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Demo próximamente</div>
            <div style={{ fontSize: 12 }}>No se pudo cargar el GIF de {exerciseName}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseGif;