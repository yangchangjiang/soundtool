export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/models/')) {
      const key = url.pathname.slice('/models/'.length);
      const rangeHdr = request.headers.get('Range');
      const corsHdrs = { 'Access-Control-Allow-Origin': '*' };
      const manifestKey = key + '.manifest';
      const manifest = await env.MODELS.get(manifestKey);
      let headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Type', 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      let status = 200;
      if (rangeHdr && /^bytes=\d+-\d*$/.test(rangeHdr.trim())) {
        const m = rangeHdr.trim().match(/^bytes=(\d+)-(\d*)$/);
        const start = parseInt(m[1], 10);
        let end = m[2] ? parseInt(m[2], 10) : null;
        if (manifest) {
          const info = JSON.parse(await manifest.text());
          const sizes = info.sizes, keys = info.parts;
          let total = 0;
          for (let si = 0; si < sizes.length; si++) total += sizes[si];
          if (end === null) end = total - 1;
          end = Math.min(end, total - 1);
          if (start > end) {
            return new Response('Range Not Satisfiable', { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
          }
          // 收集覆盖 [start, end] 的分片区间
          const segs = [];
          let off = 0;
          for (let pi = 0; pi < keys.length; pi++) {
            const ps = sizes[pi];
            const s0 = Math.max(start, off), s1 = Math.min(end, off + ps - 1);
            if (s0 <= s1) segs.push({ key: keys[pi], rel0: s0 - off, rel1: s1 - off });
            off += ps;
          }
          const parts = await Promise.all(segs.map(async function(sg) {
            const o = await env.MODELS.get(sg.key, { range: { offset: sg.rel0, length: sg.rel1 - sg.rel0 + 1 } });
            const ab = await o.arrayBuffer();
            return ab;
          }));
          const len = end - start + 1;
          const out = new Uint8Array(len);
          let p = 0;
          for (let ai = 0; ai < parts.length; ai++) {
            out.set(new Uint8Array(parts[ai]), p);
            p += parts[ai].byteLength;
          }
          status = 206;
          headers.set('Content-Length', String(len));
          headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
          headers.set('Accept-Ranges', 'bytes');
          return new Response(out, { status: 206, headers: headers });
        }
        const obj = await env.MODELS.get(key);
        if (!obj) return new Response('Not Found', { status: 404 });
        const total2 = obj.size;
        if (end === null) end = total2 - 1;
        end = Math.min(end, total2 - 1);
        if (start > end) {
          return new Response('Range Not Satisfiable', { status: 416, headers: { 'Content-Range': 'bytes */' + total2 } });
        }
        const o2 = await env.MODELS.get(key, { range: { offset: start, length: end - start + 1 } });
        const ab2 = await o2.arrayBuffer();
        headers.set('Content-Length', String(ab2.byteLength));
        headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + total2);
        headers.set('Accept-Ranges', 'bytes');
        return new Response(ab2, { status: 206, headers: headers });
      }
      if (manifest) {
        // 分片对象: 按清单流式拼接 (绕过 multipart 上传限制)
        try {
          const info = JSON.parse(await manifest.text());
          const parts = info.parts.slice();
          const headers = new Headers();
          headers.set('Content-Type', 'application/octet-stream');
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          if (info.sizes && info.sizes.length === parts.length) {
            let total = 0;
            for (let i = 0; i < info.sizes.length; i++) total += info.sizes[i];
            headers.set('Content-Length', String(total));
          }
          const readable = new ReadableStream({
            async pull(controller) {
              if (parts.length === 0) { controller.close(); return; }
              const obj = await env.MODELS.get(parts.shift());
              if (!obj) { controller.error(new Error('missing part')); return; }
              const reader = obj.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
              if (parts.length === 0) controller.close();
            }
          });
          return new Response(readable, { headers });
        } catch (e) {
          return new Response('manifest error: ' + String(e && e.message || e), { status: 500 });
        }
      }
      const obj = await env.MODELS.get(key);
      if (!obj) return new Response('not found', { status: 404 });
      obj.writeHttpMetadata(headers);
      headers.set('etag', obj.httpEtag);
      headers.set('Content-Type', 'application/octet-stream');
      headers.set('Content-Length', obj.size);
      // 模型文件名版本化 → 长缓存 (避免每次重下 1.3GB)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(obj.body, { headers });
    }
    // 测试页跨域隔离头 (run_worker_first 下 _headers 不生效, 在 Worker 层设置)
    if (url.pathname === '/assets/test/melo-gpu-test.html') {
      const resp = await env.ASSETS.fetch(request);
      const headers = new Headers(resp.headers);
      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
      return new Response(resp.body, { status: resp.status, headers });
    }
    // (临时上传端点已移除)
    return env.ASSETS.fetch(request);
  }
}
