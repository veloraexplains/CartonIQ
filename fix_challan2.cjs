const fs = require('fs');
const path = 'src/components/orders/DeliveryChallanModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the <tbody> block and replace it
const tbodyRegex = /<tbody[\s\S]*?<\/tbody>/;

const newTbody = `<tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                <tr>
                  <td className="py-3 px-3 font-sans text-slate-500 text-center">1</td>
                  <td className="py-3 px-3 font-sans">
                    <span className="font-bold text-slate-900 block">
                      {order?.boxType || 'Master Shipping Carton'}
                    </span>
                    <span className="text-slate-600 text-[10px] block">
                      {order?.dimensions ? \`Dims: \${order.dimensions}\` : ''}
                      {order?.boardPly ? \` | \${order.boardPly}\` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-sans text-slate-700">
                    {Math.ceil((order?.quantityOrdered || 0) / 25)} Strapped Bundles
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {(order?.quantityOrdered || 0).toLocaleString()} PCS
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">
                    {(order?.ratePerPiece || order?.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {((order?.quantityOrdered || 0) * (order?.ratePerPiece || order?.rate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>`;

if (tbodyRegex.test(content)) {
  content = content.replace(tbodyRegex, newTbody);
  fs.writeFileSync(path, content);
  console.log('✅ Challan row restored with math!');
} else {
  console.log('❌ Could not find the table body.');
}
