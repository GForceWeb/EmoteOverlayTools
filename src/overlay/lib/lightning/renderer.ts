import { CLOUD_WIDTH, STRIKE_LEAD_MS, createLightningPlan, lightningCloudLeft } from "./model.ts";
import type { Point } from "./model.ts";
const CLOUD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="200" viewBox="0 0 640 200"><defs><linearGradient id="c" x2="0" y2="1"><stop stop-color="#8495b3"/><stop offset=".55" stop-color="#3c4c68"/><stop offset="1" stop-color="#1b263e"/></linearGradient></defs><path d="M90 172C18 175 18 90 77 88C65 25 157 9 190 49C216-7 306-6 337 45C388 10 464 37 469 81C544 39 619 93 595 135C626 174 566 190 528 180H105Z" fill="url(#c)" stroke="#a6c3e4" stroke-opacity=".3" stroke-width="2"/></svg>`;
/** Returns a cancellation function. A run owns one transparent canvas and one RAF. */
export function playLightning(host: HTMLElement, urls: string[], count = 200, interval = 50): () => void {
  const { timing, direction, strikes } = createLightningPlan(count, interval);
  if (!urls.length || !timing.strikes) {
    return () => { };
  }
  const canvas = document.createElement("canvas");
  canvas.className = "lightning-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1000";
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return () => { };
  }
  host.appendChild(canvas);
  const cloud = new Image();
  cloud.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(CLOUD_SVG)}`;
  // Keep the source list bounded even when a redeem supplies hundreds of URLs.
  const images = [...new Set(urls)].slice(0, 32).map(url => { const image = new Image(); image.src = url; return image; });
  let raf = 0, stopped = false;
  let start: number | undefined;
  function cancel() {
    if (stopped)
      return;
    stopped = true;
    cancelAnimationFrame(raf);
    canvas.remove();
  }
  function emote(imageIndex: number, x: number, y: number, size: number, opacity = 1, rotation = 0) {
    const image = images[imageIndex % images.length];
    if (!image.complete || !image.naturalWidth)
      return;
    ctx!.save();
    ctx!.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx!.translate(x, y);
    ctx!.rotate(rotation);
    const ratio = image.naturalWidth / image.naturalHeight;
    ctx!.drawImage(image, -size * ratio / 2, -size / 2, size * ratio, size);
    ctx!.restore();
  }
  function line(points: Point[], color: string, width: number, alpha: number, glow = 0) {
    ctx!.save();
    ctx!.globalAlpha = alpha;
    ctx!.strokeStyle = color;
    ctx!.lineWidth = width;
    ctx!.lineJoin = "miter";
    ctx!.shadowColor = color;
    ctx!.shadowBlur = glow;
    ctx!.beginPath();
    points.forEach((p, i) => i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y));
    ctx!.stroke();
    ctx!.restore();
  }
  function boltEmotes(points: Point[], alpha: number, size: number, progress: number, offset: number, taper = .12, skipJunction = false) {
    const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
    const total = lengths.reduce((a, b) => a + b, 0);
    let segment = 0, segmentStart = 0, icon = 0;
    // Continuous spacing prevents piles of duplicate emotes at zigzag corners.
    for (let distance = skipJunction ? size * .85 : 0; distance <= total * progress;) {
      while (segment < lengths.length - 1 && distance > segmentStart + lengths[segment]) {
        segmentStart += lengths[segment++];
      }
      const a = points[segment], b = points[segment + 1];
      const f = (distance - segmentStart) / lengths[segment];
      const localSize = size * (1 - taper * distance / total);
      emote(icon++ + offset, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, localSize, alpha);
      distance += localSize * .8;
    }
  }
  function frame(now: number) {
    if (stopped)
      return;
    if (!host.isConnected) {
      cancel();
      return;
    }
    // Emotes load during the cloud's entrance; failed images are skipped safely.
    if (start === undefined)
      start = now;
    const elapsed = now - start;
    // The OBS host has no intrinsic height. Measure the positioned canvas,
    // which fills the viewport even when the host has no intrinsic height.
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * pixelRatio)), height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx!.setTransform(canvas.width / 1280, 0, 0, canvas.height / 720, 0, 0);
    ctx!.clearRect(0, 0, 1280, 720);
    if (elapsed >= timing.duration) {
      cancel();
      return;
    }
    const index = Math.floor((elapsed - STRIKE_LEAD_MS) / timing.gap);
    const age = elapsed - STRIKE_LEAD_MS - index * timing.gap;
    const active = index >= 0 && index < strikes.length;
    const pulse = active ? Math.max(0, 1 - age / 380) : 0;
    const tint = "#c9dfff";
    ctx!.save();
    ctx!.globalAlpha = .96;
    if (cloud.complete && cloud.naturalWidth) {
      ctx!.drawImage(cloud, lightningCloudLeft(elapsed, timing.duration, direction), 4, CLOUD_WIDTH, 170);
    }
    if (active && age < 350) {
      const glow = ctx!.createRadialGradient(strikes[index].cloudX, 127, 4, strikes[index].cloudX, 127, 170);
      glow.addColorStop(0, tint);
      glow.addColorStop(1, "transparent");
      ctx!.globalAlpha = pulse * .58;
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, 1280, 230);
    }
    ctx!.restore();
    if (active) {
      const strike = strikes[index];
      // One brief exposure, then the bolt remains readable before dissolving.
      const exposure = Math.max(0, 1 - age / 100);
      ctx!.save();
      ctx!.globalAlpha = exposure * .11;
      ctx!.fillStyle = tint;
      ctx!.fillRect(0, 0, 1280, 720);
      ctx!.restore();
      const alpha = age < 165 ? 1 : Math.max(0, 1 - (age - 165) / 240);
      const progress = Math.min(1, age / 45);
      if (alpha > 0) {
        line(strike.points, tint, 10, alpha * .16, 28);
        line(strike.points, "#f4f9ff", 2, alpha * .9, 9);
        boltEmotes(strike.points, alpha, 34, progress, index);
        for (const branch of strike.branches) {
          const branchProgress = Math.max(0, Math.min(1, (progress - branch.startsAt) / (1 - branch.startsAt)));
          if (!branchProgress)
            continue;
          const branchAlpha = alpha * (branch.ground ? .9 : .55);
          line(branch.points, tint, 6, branchAlpha * .12, 18);
          for (let j = 1; j < branch.points.length; j++) {
            line(branch.points.slice(j - 1, j + 1), "#eff8ff", 1.8 - j / branch.points.length, branchAlpha * .8, 7);
          }
          boltEmotes(branch.points, branchAlpha, branch.ground ? 27 : 19, branchProgress, index + 1, branch.ground ? .38 : .6, true);
        }
      }
      const impactAge = age - 50;
      if (impactAge >= 0 && impactAge < 600) {
        const impacts = [{ x: strike.x, scale: 1 }, ...strike.branches.filter(branch => branch.ground).map(branch => ({ x: branch.points[branch.points.length - 1].x, scale: .6 }))];
        for (const impact of impacts) {
          const f = impactAge / 600;
          ctx!.save();
          ctx!.strokeStyle = tint;
          ctx!.globalAlpha = (1 - f) * .65 * impact.scale;
          ctx!.lineWidth = 3 * (1 - f);
          ctx!.beginPath();
          ctx!.ellipse(impact.x, 712, (22 + f * 155) * impact.scale, (4 + f * 20) * impact.scale, 0, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.restore();
          const glow = ctx!.createRadialGradient(impact.x, 712, 0, impact.x, 712, 190 * impact.scale);
          glow.addColorStop(0, tint);
          glow.addColorStop(1, "transparent");
          ctx!.save();
          ctx!.globalAlpha = (1 - f) * .33 * impact.scale;
          ctx!.fillStyle = glow;
          ctx!.fillRect(impact.x - 200, 512, 400, 208);
          ctx!.restore();
          const particles = Math.round(12 * impact.scale);
          for (let s = 0; s < particles; s++) {
            const angle = Math.PI + (s / (particles - 1)) * Math.PI;
            const speed = (70 + (s % 4) * 35) * impact.scale;
            emote(s + index, impact.x + Math.cos(angle) * f * speed * 1.6, 706 + Math.sin(angle) * f * speed + 110 * f * f, 24 * (1 - f * .45) * impact.scale, (1 - f) * .95, f * (s % 2 ? 2 : -2));
          }
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return cancel;
}
