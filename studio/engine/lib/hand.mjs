// The drawing hand: pen tip at (x, y), hand + sleeve trailing down-right.
export function drawHand(ctx, x, y, t, scale = 1) {
  const bob = Math.sin(t * 30) * 1.5, INK = '#2A2723';
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(scale, scale); ctx.rotate(-0.62);
  ctx.fillStyle = 'rgba(0,0,0,.10)'; ctx.beginPath(); ctx.ellipse(18, 205, 70, 150, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d1d1f'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-7, 26); ctx.lineTo(7, 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2d2d31'; ctx.fillRect(-9, 26, 18, 150);
  ctx.fillStyle = '#e8e8ea'; ctx.fillRect(-9, 60, 18, 8);
  ctx.fillStyle = '#F2C9A1'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(10, 120, 46, 60, 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-26, 84, 16, 24, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(28, 76, 14, 22, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-38, 168, 100, 260, 10); ctx.fill(); ctx.stroke();
  ctx.restore();
}
