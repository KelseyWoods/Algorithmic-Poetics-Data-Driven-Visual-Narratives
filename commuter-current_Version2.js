// --- Configurable Data for Demo (replace with live data if available) ---
const ROUTES = [
  // Each route: { points: [ {x, y} ... ], baseFreq, color }
  { points: [ {x:0.1, y:0.2}, {x:0.5, y:0.3}, {x:0.8, y:0.5} ], baseFreq: 0.8, color: 'orange' }, // Main route
  { points: [ {x:0.2, y:0.7}, {x:0.5, y:0.3}, {x:0.7, y:0.1} ], baseFreq: 0.6, color: 'cyan' },   // Another
  { points: [ {x:0.3, y:0.8}, {x:0.5, y:0.6}, {x:0.5, y:0.3} ], baseFreq: 0.4, color: 'magenta' }, // Feeder
];

const HUBS = [
  // Place at intersections or main points
  { x: 0.5, y: 0.3 },
  { x: 0.5, y: 0.6 },
];

// --- Palette based on Time ---
function getPalette(hour) {
  if (hour >= 6 && hour < 10) { // Morning Peak
    return {
      bg: "#211006",
      lineGlow: "rgba(255, 200, 0, 0.5)",
      colors: ["#FFC300", "#FFD700", "#FFA500"],
      hub: "#fff"
    };
  } else if (hour >= 10 && hour < 16) { // Midday
    return {
      bg: "#0e1932",
      lineGlow: "rgba(0, 200, 255, 0.3)",
      colors: ["#6EC6FF", "#00C853", "#80D8FF"],
      hub: "#b0f0ff"
    };
  } else if (hour >= 16 && hour < 20) { // Evening peak
    return {
      bg: "#2a0a2e",
      lineGlow: "rgba(200, 0, 255, 0.3)",
      colors: ["#B71C1C", "#9C27B0", "#F50057"],
      hub: "#fff2"
    };
  } else { // Night
    return {
      bg: "#0a0c1a",
      lineGlow: "rgba(100, 150, 255, 0.2)",
      colors: ["#90caf9", "#bdbdbd", "#9fa8da"],
      hub: "#aaa"
    };
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }

const canvas = document.getElementById('art');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function animate() {
  // --- Time-based palette ---
  const now = new Date();
  const hour = now.getHours();
  const palette = getPalette(hour);
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Animate routes ---
  ROUTES.forEach((route, idx) => {
    // Simulate activity: peak at 8am/5pm
    let t = (hour < 12) ? Math.abs(8 - hour) : Math.abs(17 - hour);
    let act = Math.max(0, 1 - t/4) * 1.3 + Math.random()*0.1; // 0~1.3
    act = Math.max(act, 0.2);
    let thickness = lerp(2, 18, act * route.baseFreq);
    let speed = lerp(0.2, 2.0, act); // px per ms
    let color = palette.colors[idx % palette.colors.length];

    // Animate glowing line
    ctx.save();
    ctx.shadowBlur = thickness*2;
    ctx.shadowColor = palette.lineGlow;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = lerp(0.3, 1, act);

    ctx.beginPath();
    const pts = route.points.map(p => ({
      x: p.x * canvas.width,
      y: p.y * canvas.height
    }));
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i=1; i<pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }

    // Animate "flowing" dashes
    let dashOffset = (performance.now() * speed/40) % 40;
    ctx.setLineDash([40, 60]);
    ctx.lineDashOffset = -dashOffset;
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.restore();
  });

  // --- Animate hubs ---
  HUBS.forEach(hub => {
    const x = hub.x * canvas.width, y = hub.y * canvas.height;
    ctx.save();
    let act = 0;
    ROUTES.forEach(route => {
      if (route.points.some(p=>Math.abs(p.x-hub.x)<0.02 && Math.abs(p.y-hub.y)<0.02)) {
        let t = (hour < 12) ? Math.abs(8 - hour) : Math.abs(17 - hour);
        act += Math.max(0, 1 - t/4) * route.baseFreq;
      }
    });
    act = Math.min(act, 1.5);
    let pulse = Math.abs(Math.sin(performance.now()/500 + x + y));
    let r = lerp(10, 70, act) + pulse*10;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.fillStyle = palette.hub;
    ctx.shadowBlur = r*1.2;
    ctx.shadowColor = "#fff";
    ctx.fill();
    ctx.restore();
  });

  requestAnimationFrame(animate);
}

animate();