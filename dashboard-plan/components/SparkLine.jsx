window.SparkLine = function SparkLine({ data, color, fillColor }) {
  const W=260, H=55;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts = data.map((v,i) => {
    const x=(i/(data.length-1))*W;
    const y=H-((v-min)/range)*(H-10)-3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart-svg">
      <polygon points={`0,${H} ${pts.join(' ')} ${W},${H}`} fill={fillColor}/>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};
