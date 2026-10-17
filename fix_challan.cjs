const fs = require('fs');
const path = 'src/components/orders/DeliveryChallanModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// We will use regex to find the <tbody> block and replace it
const tbodyRegex = /<tbody[\s\S]*?<\/tbody>/;

const newTbody = `<tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {order?.items?.map((item: any, idx: number) => {
                  const qty = item.quantity || order.quantityOrdered || 0;
                  const rate = item.rate || order.rate || 0;
                  const goodsValue = qty * rate;

                  return (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-sans text-slate-500 text-center">{idx + 1}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-bold text-slate-900 block">
                          {item.name || item.description || 'Corrugated Box'}
                        </span>
                        <span className="text-slate-600 text-[10px] block">
                          {item.dimensions ? \`Dims: \${item.dimensions}\` : ''}
                          {item.boardPly ? \` | \${item.boardPly}\` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-sans text-slate-700">
                        {Math.ceil(qty / 25)} Strapped Bundles
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {qty.toLocaleString()} PCS
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {goodsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>`;

if (tbodyRegex.test(content)) {
  content = content.replace(tbodyRegex, newTbody);
  fs.writeFileSync(path, content);
  console.log('✅ Challan Math and Description fixed successfully!');
} else {
  console.log('❌ Could not find the table body. Manual check needed.');
}
