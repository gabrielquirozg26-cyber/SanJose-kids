import React, { useRef, useEffect } from 'react';

const GraficoProgreso = ({ data, title }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    canvas.width = width;
    canvas.height = 200;

    ctx.clearRect(0, 0, width, 200);
    if (data.length < 2) return;

    const maxNivel = Math.max(...data.map(d => d.nivel), 17);
    const xStep = width / (data.length - 1);
    const yScale = 180 / maxNivel;

    ctx.beginPath();
    ctx.moveTo(0, 200 - (data[0].nivel * yScale));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(i * xStep, 200 - (data[i].nivel * yScale));
    }
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < data.length; i++) {
      ctx.beginPath();
      ctx.arc(i * xStep, 200 - (data[i].nivel * yScale), 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter';
      ctx.fillText(data[i].nivel, i * xStep - 6, 200 - (data[i].nivel * yScale) - 6);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="text-white/40 text-center py-4">Sin datos suficientes</div>;
  }

  return (
    <div className="glass-card rounded-3xl p-4 border border-white/10">
      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
      <div className="w-full h-48">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="flex justify-between text-white/30 text-[9px] mt-2">
        <span>{new Date(data[0]?.fecha).toLocaleDateString()}</span>
        <span>{new Date(data[data.length-1]?.fecha).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default GraficoProgreso;