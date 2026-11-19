/* Teacher's own files in lesson mode: PDF (pdf.js), PPTX (slides read with
 * JSZip) and DOCX (mammoth). Each becomes a list of pages with the file's own
 * aspect ratio, shown in the same slide frame as alaqai presentations. */

const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';
const loaded = {};
function script(src) {
  if (!loaded[src]) loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(s); });
  return loaded[src];
}

/** → { name, kind, ratio: number (w/h), pages: [{ type: 'canvas'|'html'|'image', … }] } */
export async function openFile(file) {
  const name = file.name;
  if (/\.pdf$/i.test(name) || file.type === 'application/pdf') return { name, kind: 'pdf', ...(await pdf(file)) };
  if (/\.pptx$/i.test(name)) return { name, kind: 'pptx', ...(await pptx(file)) };
  if (/\.docx$/i.test(name)) return { name, kind: 'docx', ...(await docx(file)) };
  if (/^image\//.test(file.type)) {
    const url = URL.createObjectURL(file);
    const ratio = await new Promise(r => { const i = new Image(); i.onload = () => r(i.width / i.height); i.src = url; });
    return { name, kind: 'image', ratio, pages: [{ type: 'image', src: url }] };
  }
  throw new Error('unsupported');
}

async function pdf(file) {
  await script(CDN + 'pdf.js/3.11.174/pdf.min.js');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.js/3.11.174/pdf.worker.min.js';
  const doc = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const first = (await doc.getPage(1)).getViewport({ scale: 1 });
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    // Rendered on demand at the size of the screen.
    pages.push({ type: 'pdf', render: async (canvas, width) => {
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: (width * (window.devicePixelRatio || 1)) / base.width });
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    } });
  }
  return { ratio: first.width / first.height, pages };
}

async function pptx(file) {
  await script(CDN + 'jszip/3.10.1/jszip.min.js');
  const zip = await window.JSZip.loadAsync(file);
  const pres = await zip.file('ppt/presentation.xml')?.async('string') || '';
  const m = pres.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
  const ratio = m ? Number(m[1]) / Number(m[2]) : 16 / 9;
  const names = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));
  const pages = [];
  for (const n of names) {
    const xml = await zip.file(n).async('string');
    const rels = await zip.file(n.replace('slides/', 'slides/_rels/') + '.rels')?.async('string') || '';
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    // Text boxes in order; the title placeholder first.
    const shapes = [...doc.getElementsByTagName('p:sp')].map(sp => {
      const isTitle = /type="(title|ctrTitle)"/.test(new XMLSerializer().serializeToString(sp.getElementsByTagName('p:nvSpPr')[0] || sp));
      const paras = [...sp.getElementsByTagName('a:p')].map(p => [...p.getElementsByTagName('a:t')].map(x => x.textContent).join('')).filter(Boolean);
      return { isTitle, paras };
    }).filter(s => s.paras.length);
    const title = (shapes.find(s => s.isTitle) || {}).paras || [];
    const body = shapes.filter(s => !s.isTitle).flatMap(s => s.paras);
    const images = [];
    for (const blip of [...doc.getElementsByTagName('a:blip')]) {
      const id = blip.getAttribute('r:embed');
      const target = (rels.match(new RegExp(`Id="${id}"[^>]*Target="([^"]+)"`)) || rels.match(new RegExp(`Target="([^"]+)"[^>]*Id="${id}"`)) || [])[1];
      if (!target) continue;
      const path = 'ppt/' + target.replace(/^\.\.\//, '');
      const f = zip.file(path);
      if (f && /\.(png|jpe?g|gif|webp|svg)$/i.test(path)) images.push(URL.createObjectURL(await f.async('blob')));
    }
    pages.push({ type: 'html', title: title.join(' '), body, images });
  }
  return { ratio, pages };
}

async function docx(file) {
  await script(CDN + 'mammoth/1.6.0/mammoth.browser.min.js');
  const res = await window.mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  // A Word document is shown as one scrolling page in a 4:3 sheet.
  return { ratio: 4 / 3, pages: [{ type: 'doc', html: res.value }] };
}
