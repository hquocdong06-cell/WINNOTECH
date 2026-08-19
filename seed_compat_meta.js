/**
 * seed_compat_meta.js
 * Tự động populate compatibility_meta cho tất cả sản phẩm linh kiện PC.
 * Dùng rule-based detection từ tên sản phẩm.
 * Run: node seed_compat_meta.js
 */
require('dotenv').config()
const mongoose = require('mongoose')

// ══════════════════════════════════════════════════════════════
// DETECTION HELPERS
// ══════════════════════════════════════════════════════════════

function detectCpuSocket(name) {
  if (/Threadripper/i.test(name)) return 'TRX50'
  if (/Core Ultra\s*(5|7|9)\s*2[0-9]{2}/i.test(name)) return 'LGA1851'
  if (/Core Ultra/i.test(name) && /285K|265K|245K|225K|200S/i.test(name)) return 'LGA1851'
  if (/AM5/i.test(name)) return 'AM5'
  if (/Ryzen\s*(5|7|9)\s*(7[0-9]{3}|9[0-9]{3})/i.test(name)) return 'AM5'
  if (/78[0-9]{2}X3D|79[0-9]{2}X3D/i.test(name)) return 'AM5'
  if (/AM4/i.test(name)) return 'AM4'
  if (/Ryzen\s*(3|5|7|9)\s*(5[0-9]{3}|3[0-9]{3})/i.test(name)) return 'AM4'
  if (/LGA1700/i.test(name)) return 'LGA1700'
  if (/i[3579]-1[234][0-9]{3}/i.test(name)) return 'LGA1700'
  if (/LGA1200/i.test(name)) return 'LGA1200'
  if (/i[3579]-1[01][0-9]{3}/i.test(name)) return 'LGA1200'
  return null
}

function detectCpuTdp(name) {
  if (/i9-14900K/.test(name)) return 125
  if (/i9-13900KS/.test(name)) return 150
  if (/i9-13900K\b/.test(name)) return 125
  if (/i7-14700K/.test(name)) return 125
  if (/i7-14700F/.test(name)) return 65
  if (/i5-14600K/.test(name)) return 125
  if (/i5-14400F/.test(name)) return 65
  if (/i3-14100/.test(name)) return 58
  if (/i5-13600K/.test(name)) return 125
  if (/i7-13700K/.test(name)) return 125
  if (/i9-12900K/.test(name)) return 125
  if (/i3-12100/.test(name)) return 58
  if (/Core Ultra 9 285K|Core Ultra 7 265K/.test(name)) return 125
  if (/Core Ultra 5/.test(name)) return 65
  if (/7950X3D/.test(name)) return 120
  if (/7800X3D/.test(name)) return 120
  if (/7950X\b/.test(name)) return 170
  if (/9950X\b/.test(name)) return 170
  if (/7600X\b/.test(name)) return 105
  if (/9700X\b/.test(name)) return 65
  if (/7600\b/.test(name)) return 65
  if (/5600X\b/.test(name)) return 65
  if (/Threadripper PRO 7985/.test(name)) return 350
  return 65
}

function detectMbSocket(name) {
  if (/\b[XAB]6[57][0-9]E?\b/i.test(name)) return 'AM5'
  if (/\bA620\b/i.test(name)) return 'AM5'
  if (/\b[ABX]5[57][0-9]\b|\bA520\b|\bX470\b|\bB450\b/i.test(name)) return 'AM4'
  if (/\b[BZH]8[67][0-9]\b|\bZ890\b/i.test(name)) return 'LGA1851'
  if (/\b[BZH]7[67][0-9]\b|\bZ790\b|\bB760\b|\bH770\b/i.test(name)) return 'LGA1700'
  if (/\b[BZH]6[67][0-9]\b|\bZ690\b|\bB660\b/i.test(name)) return 'LGA1700'
  return null
}

function detectMbRamType(name) {
  if (/DDR5/i.test(name)) return 'DDR5'
  if (/DDR4|\bD4\b/i.test(name)) return 'DDR4'
  if (/\b[XAB]6[57][0-9]E?\b|\bA620\b/i.test(name)) return 'DDR5'
  if (/Z790|Z890/i.test(name)) return 'DDR5'
  if (/\b[ABX]5[57][0-9]\b|\bA520\b/i.test(name)) return 'DDR4'
  return 'DDR5'
}

function detectMbFormFactor(name) {
  if (/Mini-?ITX|mITX/i.test(name)) return 'ITX'
  if (/\b[A-Z]\d{3,4}M\b/.test(name)) return 'mATX'
  if (/M-ATX|mATX|Micro.?ATX/i.test(name)) return 'mATX'
  return 'ATX'
}

function detectRamType(name) {
  if (/DDR5/i.test(name)) return 'DDR5'
  if (/DDR4/i.test(name)) return 'DDR4'
  return null
}

function detectPsuWattage(name) {
  const m = name.match(/\b(\d{3,4})\s*W\b/i)
  return m ? parseInt(m[1]) : 0
}

function detectCaseFormFactor(name) {
  if (/Full.?Tower|E-ATX|EATX/i.test(name))
    return { form_factor: 'EATX', supported_ff: ['EATX', 'ATX', 'mATX', 'ITX'] }
  if (/M-ATX|mATX|Micro.?ATX/i.test(name))
    return { form_factor: 'mATX', supported_ff: ['mATX', 'ITX'] }
  if (/Mini.?ITX|NR200|SFX\b|SFF/i.test(name))
    return { form_factor: 'ITX', supported_ff: ['ITX'] }
  if (/AP201/i.test(name))
    return { form_factor: 'mATX', supported_ff: ['mATX', 'ITX'] }
  if (/C218M/i.test(name))
    return { form_factor: 'mATX', supported_ff: ['mATX', 'ITX'] }
  return { form_factor: 'ATX', supported_ff: ['ATX', 'mATX', 'ITX'] }
}

function detectGpuTier(name) {
  const n = name.toLowerCase()
  if (/4090|7900\s*xtx/.test(n)) return 5
  if (/4080|4070\s*ti|7900\s*xt(?!x)/.test(n)) return 4
  if (/4070(?!\s*ti)|7800\s*xt|7700\s*xt/.test(n)) return 3
  if (/4060\s*ti|7600\s*xt/.test(n)) return 2
  if (/4060(?!\s*ti)|7600\b|rtx\s*5060/.test(n)) return 1
  return 2
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const Product  = mongoose.connection.collection('Product')
  const Category = mongoose.connection.collection('Category')

  const cats   = await Category.find({}).toArray()
  const catMap = {}
  cats.forEach(c => { catMap[c.slug] = c._id })

  let total = 0

  const NULL_META = {
    socket: null, ram_type: null, form_factor: null,
    supported_ff: [], tdp: null, wattage: null, gpu_tier: null
  }

  async function updateCategory(slugs, buildMeta, label) {
    const catIds = slugs.map(s => catMap[s]).filter(Boolean)
    if (!catIds.length) { console.log('  Skip: ' + slugs.join(',')); return }
    const products = await Product.find({ cat_id: { $in: catIds } }).toArray()
    console.log('\n-- ' + label + ' (' + products.length + ' sp) --')
    for (const p of products) {
      const meta = buildMeta(p)
      await Product.updateOne({ _id: p._id }, { $set: { compatibility_meta: meta } })
      const info = [
        meta.socket && 'socket=' + meta.socket,
        meta.ram_type && 'ram=' + meta.ram_type,
        meta.form_factor && 'ff=' + meta.form_factor,
        meta.supported_ff && meta.supported_ff.length > 0 && 'supp=[' + meta.supported_ff.join(',') + ']',
        meta.tdp && 'tdp=' + meta.tdp + 'W',
        meta.wattage && 'psu=' + meta.wattage + 'W',
        meta.gpu_tier && 'tier=' + meta.gpu_tier,
      ].filter(Boolean).join(' | ')
      console.log('  OK: ' + p.name.slice(0, 42) + ' -> ' + (info || '(no meta)'))
      total++
    }
  }

  await updateCategory(['cpu'], p => ({
    ...NULL_META, socket: detectCpuSocket(p.name), tdp: detectCpuTdp(p.name)
  }), 'CPU')

  await updateCategory(['mainboard'], p => ({
    ...NULL_META,
    socket:      detectMbSocket(p.name),
    ram_type:    detectMbRamType(p.name),
    form_factor: detectMbFormFactor(p.name),
  }), 'Mainboard')

  await updateCategory(['ram'], p => ({
    ...NULL_META, ram_type: detectRamType(p.name)
  }), 'RAM')

  await updateCategory(['psu'], p => ({
    ...NULL_META, wattage: detectPsuWattage(p.name)
  }), 'PSU')

  await updateCategory(['case'], p => {
    const { form_factor, supported_ff } = detectCaseFormFactor(p.name)
    return { ...NULL_META, form_factor, supported_ff }
  }, 'Case')

  await updateCategory(['gpu'], p => ({
    ...NULL_META, gpu_tier: detectGpuTier(p.name)
  }), 'GPU')

  await updateCategory(['storage', 'ssd', 'hdd'], _p => ({ ...NULL_META }), 'Storage')
  await updateCategory(['cooling', 'tan-nhiet'],   _p => ({ ...NULL_META }), 'Cooling')

  console.log('\nDone! Updated ' + total + ' products.')
  await mongoose.disconnect()
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
