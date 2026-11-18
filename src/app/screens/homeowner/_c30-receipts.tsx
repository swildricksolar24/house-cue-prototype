import { useEffect, useState } from 'react';
import { homeowner } from '../../data/sample';
import { useCurrentHome } from '../../prototype/HomeContext';
import { FormDialog } from '../../shells/EditDialog';

/**
 * Review change: C30 Payments' "Download receipts" (it had no action). Two dialogs:
 * 1. Download receipts: period (This year / Last 12 months / Last 30 days / All time), what to include (All receipts /
 *    Home jobs / Membership and credits) and format (PDF / CSV spreadsheet). Download shows "Preparing…" briefly.
 * 2. Receipts downloaded (file name, how many, total, the list), or No receipts in this period (Choose another period).
 * The file is made in the browser from the sample payments below and saved with the browser's download; nothing is
 * sent anywhere. Held and disputed payments get receipts once settled, so they're left out.
 * Not a screen: the registry only picks up files named <CODE>-<slug>.tsx.
 */

type Receipt = { id: string; date: string; title: string; kind: 'job' | 'membership'; amount: number; status: string };

/** Settled payments from the C30 history (the AC hold and the frozen garage door job have no receipt yet) */
const RECEIPTS: Receipt[] = [
  { id: 'credits', date: '2026-01-08', title: 'Credit pack · 40 credits', kind: 'membership', amount: 9.99, status: 'Paid' },
  { id: 'pool', date: '2026-02-10', title: 'Pool pump repair', kind: 'job', amount: 288, status: 'Paid' },
  { id: 'pool-hold', date: '2026-03-12', title: 'Pool pump holdback', kind: 'job', amount: 32, status: 'Released' },
  { id: 'membership', date: '2026-03-15', title: 'Membership, annual (web checkout)', kind: 'membership', amount: 49, status: 'Paid' },
];

const THIS_YEAR = `This year (${new Date().getFullYear()})`;
const PERIODS = [THIS_YEAR, 'Last 12 months', 'Last 30 days', 'All time'];
const INCLUDES = ['All receipts', 'Home jobs', 'Membership and credits'];
const FORMATS = ['PDF', 'CSV spreadsheet'];

const money = (n: number) => `$${n.toFixed(2)}`;
const day = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function pick(period: string, include: string) {
  const now = new Date();
  const since =
    period === THIS_YEAR
      ? new Date(now.getFullYear(), 0, 1)
      : period === 'Last 12 months'
        ? new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        : period === 'Last 30 days'
          ? new Date(now.getTime() - 30 * 864e5)
          : new Date(0);
  return RECEIPTS.filter(
    (r) =>
      new Date(`${r.date}T12:00:00`) >= since &&
      (include === 'All receipts' || (include === 'Home jobs' ? r.kind === 'job' : r.kind === 'membership')),
  );
}

/** A one-page PDF with plain text lines (Helvetica), built by hand so the prototype needs no PDF library */
function pdfBlob(lines: string[]) {
  const esc = (s: string) => s.replace(/·/g, '-').replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, (m) => `\\${m}`);
  const text = `BT /F1 11 Tf 16 TL 56 760 Td ${lines.map((l) => `(${esc(l)}) Tj T*`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([out], { type: 'application/pdf' });
}

function csvBlob(rows: Receipt[]) {
  const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [
    'Date,Description,Type,Amount,Status',
    ...rows.map((r) => [r.date, cell(r.title), r.kind === 'job' ? 'Home job' : 'Membership and credits', r.amount.toFixed(2), r.status].join(',')),
    `,Total,,${rows.reduce((s, r) => s + r.amount, 0).toFixed(2)},`,
  ];
  return new Blob([lines.join('\r\n')], { type: 'text/csv' });
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

type Options = { period: string; include: string; format: string };
type Result = { file: string; rows: Receipt[]; total: number };

export function ReceiptsDownload({ onClose }: { onClose: () => void }) {
  const { home } = useCurrentHome();
  const [options, setOptions] = useState<Options>({ period: THIS_YEAR, include: INCLUDES[0], format: FORMATS[0] });
  const [stage, setStage] = useState<'options' | 'preparing' | 'done' | 'empty'>('options');
  const [result, setResult] = useState<Result | null>(null);

  // "Preparing…" for a moment, then make the file and save it
  useEffect(() => {
    if (stage !== 'preparing') return;
    const t = setTimeout(() => {
      const rows = pick(options.period, options.include);
      const total = rows.reduce((s, r) => s + r.amount, 0);
      const slug = options.period === THIS_YEAR ? String(new Date().getFullYear()) : options.period.toLowerCase().replace(/\s+/g, '-');
      const pdf = options.format === 'PDF';
      const file = `housecue-receipts-${slug}.${pdf ? 'pdf' : 'csv'}`;
      if (pdf) {
        save(
          pdfBlob([
            'HouseCue receipts',
            `${homeowner.firstName} ${homeowner.lastName} - ${home.address}, ${home.city}`,
            `${options.period} - ${options.include}`,
            '',
            ...rows.map((r) => `${day(r.date)}    ${r.title}    ${money(r.amount)}    ${r.status}`),
            '',
            `Total: ${money(total)}`,
            '',
            'Prototype export: sample data only.',
          ]),
          file,
        );
      } else {
        save(csvBlob(rows), file);
      }
      setResult({ file, rows, total });
      setStage('done');
    }, 800);
    return () => clearTimeout(t);
  }, [stage, options, home]);

  if (stage === 'done' && result) {
    return (
      <FormDialog
        title="Receipts downloaded"
        description={`${result.file} · ${result.rows.length} ${result.rows.length === 1 ? 'receipt' : 'receipts'} · ${money(result.total)}`}
        fields={[]}
        values={{}}
        submitLabel="Done"
        cancelLabel={null}
        countsAsEdit={false}
        onSave={onClose}
        onCancel={onClose}
      >
        <ul className="hc-c30-receipts">
          {result.rows.map((r) => (
            <li key={r.id}>
              <span className="hc-medium">{r.title}</span>
              <span className="hc-small hc-muted">
                {day(r.date)} · {money(r.amount)} · {r.status}
              </span>
            </li>
          ))}
        </ul>
        <p className="hc-small hc-muted">Check your browser’s downloads if it didn’t open.</p>
      </FormDialog>
    );
  }

  if (stage === 'empty') {
    return (
      <FormDialog
        title="No receipts in this period"
        description={`Nothing was paid ${options.period === 'Last 30 days' ? 'in the last 30 days' : `in ${options.period.toLowerCase()}`}${options.include === 'All receipts' ? '' : ` for ${options.include.toLowerCase()}`}. Try a longer period, like ${THIS_YEAR.toLowerCase()}.`}
        fields={[]}
        values={{}}
        submitLabel="Choose another period"
        cancelLabel="Close"
        countsAsEdit={false}
        onSave={() => setStage('options')}
        onCancel={onClose}
      />
    );
  }

  return (
    <FormDialog
      key="options"
      title="Download receipts"
      description={`Receipts for paid jobs, membership and credit packs at ${home.address}.`}
      fields={[
        { key: 'period', label: 'Period', field: { kind: 'select', options: PERIODS } },
        { key: 'include', label: 'Include', field: { kind: 'select', options: INCLUDES } },
        { key: 'format', label: 'Format', field: { kind: 'select', options: FORMATS } },
      ]}
      values={options}
      submitLabel={stage === 'preparing' ? 'Preparing…' : 'Download'}
      busy={stage === 'preparing'}
      countsAsEdit={false}
      onSave={(v) => {
        const next = { period: v.period, include: v.include, format: v.format };
        setOptions(next);
        setStage(pick(next.period, next.include).length ? 'preparing' : 'empty');
      }}
      onCancel={onClose}
      after={<p className="hc-small hc-muted">Held and disputed payments get a receipt once they’re settled.</p>}
    />
  );
}
