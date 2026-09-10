/* ScanField — procedural ambient placeholders for the Svaneti archive.
   One rendering language across all scenes: dark slate ground, glacial-ice lines/points, slow fog.
   Canvas 2D, dpr capped at 1, ~30fps, static frame on init (reduced-motion fallback).
   Scenes 5/7/8/9 read a scroll progress (0..1) set via .setProgress(); others loop on time.
   window.ScanField.create(canvas, variant). */
(function () {
  var ICE = '169,203,212', LIM = '237,236,232', GOLD = '198,164,110';
  function n2(x, y) { return Math.sin(x * 1.7 + Math.sin(y * 0.8)) + Math.sin(y * 1.3 + Math.sin(x * 0.6)); }
  function fbm(x, y, t) { return n2(x + t * 0.05, y) * 0.5 + n2(x * 2.1 + t * 0.03, y * 2.3) * 0.25 + n2(x * 4.3, y * 4.1 + t * 0.08) * 0.125; }
  function rand(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function bg(ctx, w, h) { ctx.fillStyle = '#22262A'; ctx.fillRect(0, 0, w, h); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function skyGlow(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(' + ICE + ',0.09)'); g.addColorStop(0.5, 'rgba(' + ICE + ',0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  function proj(p, ang, w, h, f, cyf, sp) {
    f = f || 2.2; cyf = cyf || 0.60; sp = sp || 0.42;
    var c = Math.cos(ang), s = Math.sin(ang);
    var x = p[0] * c - p[2] * s, z = p[0] * s + p[2] * c;
    var k = f / (f + z + 2.5);
    return [w / 2 + x * k * w * sp, h * cyf - p[1] * k * h * 0.5, k];
  }
  function line3(ctx, a, b, ang, w, h, col, lw, f, cyf, sp) {
    var pa = proj(a, ang, w, h, f, cyf, sp), pb = proj(b, ang, w, h, f, cyf, sp);
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1;
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
  }
  function ring3(ctx, cx, cz, r, y, ang, w, h, col, f, cyf, sp) {
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
    for (var i = 0; i <= 16; i++) {
      var a = i / 16 * Math.PI * 2, q = proj([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r], ang, w, h, f, cyf, sp);
      if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
    }
    ctx.stroke();
  }

  var V = {
    /* 1 · hero + special-project orbit (approved) */
    ridge: {
      draw: function (ctx, w, h, t) {
        bg(ctx, w, h); skyGlow(ctx, w, h);
        var shades = ['#39434A', '#323B41', '#2B3339', '#252C31', '#1E2428'];
        for (var L = 0; L < 5; L++) {
          var y0 = h * (0.34 + L * 0.135), amp = h * (0.05 + L * 0.02);
          ctx.beginPath(); ctx.moveTo(-4, h + 4);
          for (var x = -4; x <= w + 8; x += 8) ctx.lineTo(x, y0 + fbm(x * 0.004 + L * 13.7, L * 3.1, t * (0.4 + L * 0.18)) * amp);
          ctx.lineTo(w + 4, h + 4); ctx.closePath();
          ctx.fillStyle = shades[L]; ctx.fill();
          ctx.strokeStyle = 'rgba(' + ICE + ',' + (0.10 - L * 0.015) + ')'; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    },
    orbit: {
      init: function (S) {
        var r = rand(7), pts = [];
        for (var c = 0; c < 7; c++) {
          var cx = (r() - 0.5) * 1.7, cz = (r() - 0.5) * 1.7;
          for (var k = 0; k < 90; k++) pts.push([cx + (r() - 0.5) * 0.34, r() * 0.10 + (k % 9 === 0 ? r() * 0.16 : 0), cz + (r() - 0.5) * 0.34]);
        }
        for (var g2 = 0; g2 < 700; g2++) { var x = (r() - 0.5) * 2.4, z = (r() - 0.5) * 2.4; pts.push([x, fbm(x * 2, z * 2, 0) * 0.05, z]); }
        S.pts = pts;
      },
      draw: function (ctx, w, h, t, S) {
        bg(ctx, w, h); skyGlow(ctx, w, h);
        var ang = t * 0.05;
        for (var i = 0; i < S.pts.length; i++) {
          var q = proj(S.pts[i], ang, w, h);
          var a = clamp((q[2] - 0.35) * 1.6, 0, 1) * 0.8;
          if (a <= 0.01) continue;
          ctx.fillStyle = 'rgba(' + ICE + ',' + a.toFixed(3) + ')';
          ctx.fillRect(q[0], q[1], q[2] > 0.8 ? 2 : 1, q[2] > 0.8 ? 2 : 1);
        }
      }
    },

    /* 2 · the vault — a summit cross on a grassy shoulder above a sea of clouds */
    icon: {
      draw: function (ctx, w, h, t) {
        bg(ctx, w, h);
        // distant ridge behind the cloud sea
        ctx.beginPath(); ctx.moveTo(-4, h * 0.55);
        for (var x = -4; x <= w + 8; x += 10) ctx.lineTo(x, h * 0.34 + fbm(x * 0.003 + 40, 2, 0) * h * 0.07);
        ctx.lineTo(w + 4, h * 0.55); ctx.closePath();
        ctx.fillStyle = '#2A3138'; ctx.fill();
        // sea of clouds: soft drifting fog banks filling the valley
        for (var L = 0; L < 4; L++) {
          var yb = h * (0.42 + L * 0.13), amp = h * 0.05;
          ctx.beginPath(); ctx.moveTo(-4, h + 4);
          for (var x2 = -4; x2 <= w + 8; x2 += 12) ctx.lineTo(x2, yb + fbm(x2 * 0.0035 + L * 11, L * 2.3, t * (0.22 + L * 0.08)) * amp);
          ctx.lineTo(w + 4, h + 4); ctx.closePath();
          var fg = ctx.createLinearGradient(0, yb - amp, 0, yb + h * 0.2);
          fg.addColorStop(0, 'rgba(' + LIM + ',' + (0.10 + L * 0.045) + ')');
          fg.addColorStop(1, 'rgba(' + LIM + ',' + (0.03 + L * 0.02) + ')');
          ctx.fillStyle = fg; ctx.fill();
        }
        // grassy shoulder in the right foreground, sloping down to the left (cloud sea stays open under the UL text)
        function groundY(x3) { return h * 0.52 + ((w - x3) / w) * h * 0.55 + fbm(x3 * 0.006, 7, 0) * h * 0.025; }
        ctx.beginPath(); ctx.moveTo(w + 4, h + 4);
        for (var x3 = w + 4; x3 >= w * 0.15; x3 -= 8) ctx.lineTo(x3, groundY(x3));
        ctx.lineTo(w * 0.15, h + 4); ctx.closePath();
        ctx.fillStyle = '#1A2024'; ctx.fill();
        ctx.strokeStyle = 'rgba(' + ICE + ',0.14)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var x4 = w + 4; x4 >= w * 0.15; x4 -= 8) { var gy = groundY(x4); if (x4 >= w) ctx.moveTo(x4, gy); else ctx.lineTo(x4, gy); }
        ctx.stroke();
        // sparse grass ticks on the slope
        for (var g2 = 0; g2 < 40; g2++) {
          var gx = w - (g2 / 40) * w * 0.8 + Math.sin(g2 * 37.7) * 9, gy2 = groundY(gx);
          ctx.strokeStyle = 'rgba(' + ICE + ',0.12)';
          ctx.beginPath(); ctx.moveTo(gx, gy2); ctx.lineTo(gx + Math.sin(g2 * 3 + t * 0.3) * 1.5, gy2 - 4 - (g2 % 3) * 2); ctx.stroke();
        }
        // a couple of low pines on the slope edge
        for (var p2 = 0; p2 < 3; p2++) {
          var px = w * (0.58 - p2 * 0.14), py = groundY(px), ph2 = 16 + p2 * 6;
          ctx.strokeStyle = 'rgba(' + ICE + ',0.22)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px - ph2 * 0.3, py); ctx.lineTo(px, py - ph2); ctx.lineTo(px + ph2 * 0.3, py); ctx.closePath(); ctx.stroke();
        }
        // the summit cross — slender, on the crest, faint halo behind it
        var cxr = w * 0.78, cyb = groundY(cxr), ch2 = Math.min(h * 0.30, 220), arm = ch2 * 0.34;
        var halo = ctx.createRadialGradient(cxr, cyb - ch2 * 0.72, 0, cxr, cyb - ch2 * 0.72, ch2 * 1.1);
        halo.addColorStop(0, 'rgba(' + GOLD + ',' + (0.09 + 0.03 * Math.sin(t * 0.4)).toFixed(3) + ')');
        halo.addColorStop(1, 'rgba(' + GOLD + ',0)');
        ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(' + LIM + ',0.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cxr, cyb); ctx.lineTo(cxr, cyb - ch2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cxr - arm / 2, cyb - ch2 * 0.72); ctx.lineTo(cxr + arm / 2, cyb - ch2 * 0.72); ctx.stroke();
        ctx.lineCap = 'butt';
        // small cairn at the base
        ctx.strokeStyle = 'rgba(' + ICE + ',0.3)'; ctx.lineWidth = 1;
        ctx.strokeRect(cxr - 5, cyb - 8, 10, 8);
        // thin drifting fog wisp crossing the foreground
        var wy = h * 0.62 + Math.sin(t * 0.15) * 8;
        var wisp = ctx.createLinearGradient(0, wy - 24, 0, wy + 24);
        wisp.addColorStop(0, 'rgba(' + LIM + ',0)'); wisp.addColorStop(0.5, 'rgba(' + LIM + ',0.06)'); wisp.addColorStop(1, 'rgba(' + LIM + ',0)');
        ctx.fillStyle = wisp; ctx.fillRect(0, wy - 24, w, 48);
      }
    },

    /* 3 · full quality — patterned wall of VR headsets, a wave rippling through it */
    devices: {
      draw: function (ctx, w, h, t) {
        bg(ctx, w, h);
        var cell = 96, ox = (w % cell) / 2, oy = (h % cell) / 2;
        for (var i = -1; i * cell < w; i++) for (var j = -1; j * cell < h; j++) {
          var px = ox + i * cell + cell / 2, py = oy + j * cell + cell / 2;
          var ph = (i * 0.55 + j * 0.4) - t * 0.9;
          var wv = 0.5 + 0.5 * Math.sin(ph);
          var sc = 0.8 + 0.16 * wv, rot = 0.12 * Math.sin(ph);
          var a = 0.10 + 0.16 * wv;
          ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.scale(sc, sc);
          ctx.strokeStyle = 'rgba(' + ICE + ',' + a.toFixed(3) + ')'; ctx.lineWidth = 1.4;
          // VR headset glyph: goggle body + strap
          var gw = 34, gh = 18, r = 8;
          ctx.beginPath();
          ctx.moveTo(-gw / 2 + r, -gh / 2); ctx.lineTo(gw / 2 - r, -gh / 2);
          ctx.quadraticCurveTo(gw / 2, -gh / 2, gw / 2, -gh / 2 + r); ctx.lineTo(gw / 2, gh / 2 - r);
          ctx.quadraticCurveTo(gw / 2, gh / 2, gw / 2 - r, gh / 2); ctx.lineTo(-gw / 2 + r, gh / 2);
          ctx.quadraticCurveTo(-gw / 2, gh / 2, -gw / 2, gh / 2 - r); ctx.lineTo(-gw / 2, -gh / 2 + r);
          ctx.quadraticCurveTo(-gw / 2, -gh / 2, -gw / 2 + r, -gh / 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-gw / 2, -2); ctx.quadraticCurveTo(-gw / 2 - 7, -8, -gw / 2 - 9, -14);
          ctx.moveTo(gw / 2, -2); ctx.quadraticCurveTo(gw / 2 + 7, -8, gw / 2 + 9, -14); ctx.stroke();
          if (wv > 0.72) { ctx.fillStyle = 'rgba(' + LIM + ',' + ((wv - 0.72) * 0.9).toFixed(3) + ')'; ctx.fillRect(-6, -1.5, 3, 3); ctx.fillRect(3, -1.5, 3, 3); }
          ctx.restore();
        }
      }
    },

    /* 5 · missions — real Upper Svaneti boundary + road (window.SvanetiGeo); tiles materialize along the road (scroll) */
    missions: {
      init: function (S) {
        var geo = window.SvanetiGeo || { aspect: 2.1, boundary: [], road: [] };
        S.geo = geo;
        // POIs along the road; each gets an irregular cluster of tiles (seeded random blob)
        S.pois = [];
        var rd = geo.road, rr = rand(17);
        for (var k = 0; k < 8; k++) {
          var base = rd[Math.floor(k * (rd.length - 1) / 7)] || [0.5, 0.5];
          var tiles = [], used = {};
          var cx0 = 0, cy0 = 0;
          tiles.push([0, 0]); used['0,0'] = 1;
          var count = 8 + Math.floor(rr() * 8);
          while (tiles.length < count) {
            var src = tiles[Math.floor(rr() * tiles.length)];
            var dir = Math.floor(rr() * 4);
            var nx = src[0] + (dir === 0 ? 1 : dir === 1 ? -1 : 0);
            var ny = src[1] + (dir === 2 ? 1 : dir === 3 ? -1 : 0);
            var key = nx + ',' + ny;
            if (!used[key]) { used[key] = 1; tiles.push([nx, ny]); }
          }
          // per-tile reveal order offset for staggered appearance
          for (var ti = 0; ti < tiles.length; ti++) tiles[ti].push(rr());
          S.pois.push({ pt: base, tiles: tiles });
        }
      },
      draw: function (ctx, w, h, t, S) {
        bg(ctx, w, h);
        var geo = S.geo, p = S.p;
        if (!geo.boundary.length) return;
        // fit the geo bbox (aspect w/h) into the frame with margins, preserving shape
        var mw = w * 0.86, mh = h * 0.7, sc = Math.min(mw / geo.aspect, mh);
        var iw = sc * geo.aspect, ih = sc, mx = (w - iw) / 2, my = (h - ih) / 2;
        function P(pt) { return [mx + pt[0] * iw, my + pt[1] * ih]; }
        // boundary
        ctx.strokeStyle = 'rgba(' + ICE + ',0.32)'; ctx.lineWidth = 1.2; ctx.beginPath();
        for (var i = 0; i < geo.boundary.length; i++) { var q = P(geo.boundary[i]); if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
        ctx.closePath(); ctx.stroke();
        // relief hatching inside (clipped)
        ctx.save(); ctx.beginPath();
        for (var b = 0; b < geo.boundary.length; b++) { var qb = P(geo.boundary[b]); if (b === 0) ctx.moveTo(qb[0], qb[1]); else ctx.lineTo(qb[0], qb[1]); }
        ctx.closePath(); ctx.clip();
        ctx.strokeStyle = 'rgba(' + ICE + ',0.06)'; ctx.lineWidth = 1;
        for (var yy = my; yy < my + ih; yy += 20) { ctx.beginPath(); for (var xx = mx; xx <= mx + iw; xx += 8) ctx.lineTo(xx, yy + fbm(xx * 0.01, yy * 0.01, 0) * 9); ctx.stroke(); }
        ctx.restore();
        // tile clusters materialize only once the road head arrives, tile by tile
        var rd = geo.road, reach = p * (rd.length - 1);
        for (var k = 0; k < S.pois.length; k++) {
          var poiIdx = k * (rd.length - 1) / (S.pois.length - 1);
          var ta = clamp((reach - poiIdx) / 90, 0, 1); // 0 until head arrives, then grows
          if (ta <= 0.001) continue;
          var c = P(S.pois[k].pt), tiles = S.pois[k].tiles;
          for (var ti = 0; ti < tiles.length; ti++) {
            var tv = clamp((ta - tiles[ti][2]) / 0.25, 0, 1);
            if (tv <= 0.02) continue;
            ctx.strokeStyle = 'rgba(' + ICE + ',' + (0.55 * tv).toFixed(3) + ')'; ctx.lineWidth = 1;
            ctx.strokeRect(c[0] + tiles[ti][0] * 11 - 5, c[1] + tiles[ti][1] * 11 - 5, 10, 10);
          }
        }
        // road traversal
        var nSeg = Math.floor(reach);
        ctx.strokeStyle = 'rgba(' + LIM + ',0.85)'; ctx.lineWidth = 1.6; ctx.beginPath();
        for (var s = 0; s <= nSeg && s < rd.length; s++) { var ps = P(rd[s]); if (s === 0) ctx.moveTo(ps[0], ps[1]); else ctx.lineTo(ps[0], ps[1]); }
        ctx.stroke();
        var head = P(rd[Math.min(nSeg, rd.length - 1)]);
        ctx.fillStyle = 'rgba(' + LIM + ',0.95)'; ctx.beginPath(); ctx.arc(head[0], head[1], 3.2, 0, 7); ctx.fill();
      }
    },

    /* 6 · the instrument — FPV drone silhouette, wireframe, rotating in place */
    drone: {
      draw: function (ctx, w, h, t) {
        bg(ctx, w, h);
        var ang = t * 0.35, bob = Math.sin(t * 0.6) * 0.02;
        var f = 2.6, cyf = 0.52, sp = 0.5;
        var col = 'rgba(' + ICE + ',0.55)', dim = 'rgba(' + ICE + ',0.3)';
        var mm = [[0.42, 0.42], [-0.42, 0.42], [0.42, -0.42], [-0.42, -0.42]];
        var Y = bob;
        // arms
        for (var a = 0; a < 4; a++) line3(ctx, [0, Y, 0], [mm[a][0], Y, mm[a][1]], ang, w, h, col, 1.4, f, cyf, sp);
        // body plate quad
        var pl = [[0.13, Y, 0.13], [-0.13, Y, 0.13], [-0.13, Y, -0.13], [0.13, Y, -0.13]];
        for (var q = 0; q < 4; q++) line3(ctx, pl[q], pl[(q + 1) % 4], ang, w, h, col, 1.4, f, cyf, sp);
        // canopy (raised small box front)
        var cy2 = Y + 0.11;
        var cp = [[0.07, cy2, 0.09], [-0.07, cy2, 0.09], [-0.07, cy2, -0.05], [0.07, cy2, -0.05]];
        for (var q2 = 0; q2 < 4; q2++) {
          line3(ctx, cp[q2], cp[(q2 + 1) % 4], ang, w, h, dim, 1, f, cyf, sp);
          line3(ctx, pl[q2], cp[q2], ang, w, h, dim, 1, f, cyf, sp);
        }
        // FPV camera: forward-up stalk + tilted cam box
        line3(ctx, [0, Y + 0.04, 0.13], [0, Y + 0.17, 0.24], ang, w, h, 'rgba(' + LIM + ',0.7)', 1.4, f, cyf, sp);
        var cam = [[0.05, Y + 0.14, 0.22], [-0.05, Y + 0.14, 0.22], [-0.05, Y + 0.20, 0.28], [0.05, Y + 0.20, 0.28]];
        for (var c3 = 0; c3 < 4; c3++) line3(ctx, cam[c3], cam[(c3 + 1) % 4], ang, w, h, 'rgba(' + LIM + ',0.7)', 1.2, f, cyf, sp);
        // motors + spinning props
        for (var m = 0; m < 4; m++) {
          ring3(ctx, mm[m][0], mm[m][1], 0.055, Y + 0.02, ang, w, h, col, f, cyf, sp);
          var spin = t * 7 + m;
          for (var b2 = 0; b2 < 2; b2++) {
            var aa = spin + b2 * Math.PI;
            line3(ctx, [mm[m][0] + Math.cos(aa) * 0.15, Y + 0.03, mm[m][1] + Math.sin(aa) * 0.15],
              [mm[m][0] - Math.cos(aa) * 0.15, Y + 0.03, mm[m][1] - Math.sin(aa) * 0.15], ang, w, h, 'rgba(' + ICE + ',0.2)', 1, f, cyf, sp);
          }
        }
      }
    },

    /* 7 · the biome — height-field where vegetation appears stratified by altitude (scroll) */
    biome: {
      init: function (S, w, h) {
        var r = rand(52), veg = [];
        function terrainY(x) { return h * 0.74 - Math.abs(fbm(x * 0.004, 1.7, 0)) * h * 0.34; }
        S.terrainY = terrainY;
        for (var i = 0; i < 340; i++) {
          var x = r() * w, y = terrainY(x);
          var alt = clamp((h * 0.74 - y) / (h * 0.34), 0, 1); // 0 valley .. 1 ridge
          var type, reveal;
          if (alt > 0.62) { type = 'conifer'; reveal = 0.62 + (alt - 0.62); }        // high, last
          else if (alt < 0.30) { type = 'broadleaf'; reveal = alt * 0.7; }            // low, first
          else { type = 'shrub'; reveal = 0.30 + (alt - 0.30) * 0.6; }                // mid belt
          veg.push({ x: x, y: y, type: type, reveal: clamp(reveal, 0, 1), h: 6 + r() * 10 });
        }
        veg.sort(function (a, b) { return a.y - b.y; });
        S.veg = veg;
      },
      draw: function (ctx, w, h, t, S) {
        bg(ctx, w, h); skyGlow(ctx, w, h);
        var p = S.p;
        // stacked height-field contours
        ctx.strokeStyle = 'rgba(' + ICE + ',0.10)'; ctx.lineWidth = 1;
        for (var L = 0; L < 5; L++) {
          ctx.beginPath();
          for (var x = 0; x <= w; x += 8) ctx.lineTo(x, S.terrainY(x) + L * 16 + Math.sin(x * 0.02 + L) * 3);
          ctx.stroke();
        }
        for (var i = 0; i < S.veg.length; i++) {
          var v = S.veg[i], a = clamp((p - v.reveal) / 0.12, 0, 1);
          if (a <= 0.02) continue;
          var gh = v.h * a;
          ctx.strokeStyle = 'rgba(' + ICE + ',' + (0.28 + 0.35 * a).toFixed(3) + ')'; ctx.lineWidth = 1;
          if (v.type === 'conifer') {
            ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.lineTo(v.x - gh * 0.32, v.y); ctx.lineTo(v.x, v.y - gh); ctx.lineTo(v.x + gh * 0.32, v.y); ctx.closePath(); ctx.stroke();
          } else if (v.type === 'broadleaf') {
            ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.lineTo(v.x, v.y - gh * 0.5); ctx.stroke();
            ctx.beginPath(); ctx.arc(v.x, v.y - gh * 0.6, gh * 0.34, 0, 7); ctx.stroke();
          } else {
            ctx.beginPath(); ctx.arc(v.x, v.y - gh * 0.25, gh * 0.3, Math.PI, 0); ctx.stroke();
          }
        }
      }
    },

    /* 8 · the factory — node graph executing left to right (scroll) */
    pipeline: {
      init: function (S, w, h) {
        var r = rand(88), cols = 6, nodes = [], edges = [];
        for (var c = 0; c < cols; c++) {
          var n = c === 0 ? 1 : c === cols - 1 ? 1 : 2 + (r() > 0.5 ? 1 : 0);
          for (var k = 0; k < n; k++) nodes.push({ c: c, x: (c + 0.5) / cols, y: (k + 0.5) / n, ci: c });
        }
        for (var a = 0; a < nodes.length; a++) for (var b = 0; b < nodes.length; b++)
          if (nodes[b].c === nodes[a].c + 1 && r() > 0.25) edges.push([a, b]);
        S.nodes = nodes; S.edges = edges; S.cols = cols;
      },
      draw: function (ctx, w, h, t, S) {
        bg(ctx, w, h);
        var mx = w * 0.1, my = h * 0.18, iw = w - mx * 2, ih = h - my * 2;
        function P(n) { return [mx + n.x * iw, my + n.y * ih]; }
        var front = S.p * S.cols;
        for (var e = 0; e < S.edges.length; e++) {
          var A = S.nodes[S.edges[e][0]], B = S.nodes[S.edges[e][1]], pa = P(A), pb = P(B);
          var done = A.ci < front - 0.5;
          ctx.strokeStyle = done ? 'rgba(' + ICE + ',0.4)' : 'rgba(' + ICE + ',0.12)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
          if (done) {
            var fr = (t * 0.4 + e * 0.3) % 1;
            var dx = pa[0] + (pb[0] - pa[0]) * fr, dy = pa[1] + (pb[1] - pa[1]) * fr;
            ctx.fillStyle = 'rgba(' + LIM + ',0.85)'; ctx.beginPath(); ctx.arc(dx, dy, 2, 0, 7); ctx.fill();
          }
        }
        for (var i = 0; i < S.nodes.length; i++) {
          var n = S.nodes[i], q = P(n), lit = clamp((front - n.ci) / 0.6, 0, 1);
          ctx.strokeStyle = 'rgba(' + ICE + ',' + (0.25 + 0.4 * lit).toFixed(3) + ')'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, 7); ctx.stroke();
          if (lit > 0.4) { ctx.fillStyle = 'rgba(' + LIM + ',' + (0.7 * lit).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(q[0], q[1], 3.2, 0, 7); ctx.fill(); }
        }
      }
    },

    /* 9 · time axis — scans of one site stacking into existence, layer after layer (scroll) */
    timeline: {
      init: function (S) { S.N = 11; },
      draw: function (ctx, w, h, t, S) {
        bg(ctx, w, h);
        var shown = S.p * S.N, step = h * 0.045, baseY = h * 0.66;
        for (var k = 0; k < S.N; k++) {
          var app = clamp((shown - k), 0, 1);
          if (app <= 0.02) continue;
          var y = baseY - k * step, depth = k / S.N;
          var col = k === Math.floor(shown) ? LIM : ICE;
          var a = (0.12 + depth * 0.4) * app;
          // translucent fill
          ctx.beginPath(); ctx.moveTo(0, y);
          for (var x = 0; x <= w; x += 8) ctx.lineTo(x, y + fbm(x * 0.004 + k * 5.5, k, 0) * step * 1.4);
          ctx.lineTo(w, y + step * 2.4); ctx.lineTo(0, y + step * 2.4); ctx.closePath();
          ctx.fillStyle = 'rgba(' + col + ',' + (a * 0.35).toFixed(3) + ')'; ctx.fill();
          // crest line
          ctx.beginPath(); ctx.moveTo(0, y);
          for (var x2 = 0; x2 <= w; x2 += 8) ctx.lineTo(x2, y + fbm(x2 * 0.004 + k * 5.5, k, 0) * step * 1.4);
          ctx.strokeStyle = 'rgba(' + col + ',' + (a + 0.15).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke();
        }
        // time ticks
        ctx.fillStyle = 'rgba(' + ICE + ',0.4)';
        for (var m = 1; m < 12; m++) ctx.fillRect(w * m / 12, h - 14, 1, 6);
      }
    }
  };

  window.ScanField = {
    create: function (canvas, variant) {
      var v = V[variant] || V.ridge;
      var ctx = canvas.getContext('2d');
      var w = 2, h = 2, raf = null, t = Math.random() * 100, last = 0, S = {};
      var self = { p: 1 }; // default progress = full (reduced-motion static frame reads as complete)
      function resize() {
        var r = (canvas.parentElement || canvas).getBoundingClientRect();
        w = canvas.width = Math.max(2, Math.floor(r.width));
        h = canvas.height = Math.max(2, Math.floor(r.height));
        S = {}; if (v.init) v.init(S, w, h);
        S.p = self.p; v.draw(ctx, w, h, t, S);
      }
      function frame(now) {
        raf = requestAnimationFrame(frame);
        if (now - last < 33) return;
        t += Math.min(0.1, (now - last) / 1000); last = now;
        S.p = self.p; v.draw(ctx, w, h, t, S);
      }
      var ro = new ResizeObserver(resize); ro.observe(canvas.parentElement || canvas);
      resize();
      self.start = function () { if (raf) return; last = performance.now(); raf = requestAnimationFrame(frame); };
      self.stop = function () { if (raf) { cancelAnimationFrame(raf); raf = null; } };
      self.setProgress = function (p) { self.p = clamp(p, 0, 1); if (!raf) { S.p = self.p; v.draw(ctx, w, h, t, S); } };
      self.destroy = function () { self.stop(); ro.disconnect(); };
      return self;
    }
  };
})();
