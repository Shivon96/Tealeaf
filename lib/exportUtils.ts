import { Farmer, CollectionRecord, AdvancePayment, FertilizerIssue } from '../types';

/**
 * Downloads a list of rows represented as arrays of values to a CSV file.
 * Automatically prepends the UTF-8 Byte Order Mark (BOM) to ensure that Microsoft Excel
 * parses non-ASCII / Unicode characters (like Sinhala letters in names) without bugs.
 */
export function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const BOM = "\uFEFF";
  
  const csvContent = rows
    .map(row => 
      row
        .map(val => {
          if (val === null || val === undefined) return '""';
          const stringVal = String(val);
          // Escape quote characters by doubling them per CSV spec
          const escaped = stringVal.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\r\n");

  const fullContent = BOM + headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n" + csvContent;
  const blob = new Blob([fullContent], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the Farmers data list into an Excel file.
 */
export function exportFarmersToExcel(farmers: Farmer[]) {
  const headers = ['Farmer ID', 'Name', 'Phone Number', 'Joined Date', 'Status', 'Notes'];
  const rows = farmers.map(f => [
    f.farmer_id_at_center,
    f.name,
    f.phone,
    new Date(f.joined_at).toLocaleDateString(),
    f.is_active ? 'Active' : 'Inactive',
    f.notes || ''
  ]);
  downloadCSV(headers, rows, `farmers_directory_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Exports the Tea Collections historical log into an Excel file.
 */
export function exportCollectionsToExcel(collections: CollectionRecord[]) {
  const headers = ['Reference ID', 'Farmer ID', 'Farmer Name', 'Weight (kg)', 'Grade', 'Price per kg (LKR)', 'Gross Amount (LKR)', 'Timestamp'];
  const rows = collections.map(c => [
    `#${c.id.toString().slice(-4)}`,
    c.farmer_id_at_center,
    c.farmer_name,
    c.weight,
    c.grade,
    c.price_per_kg,
    c.total_amount,
    new Date(c.timestamp).toLocaleString()
  ]);
  downloadCSV(headers, rows, `tea_collections_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Exports the Advance Payments log into an Excel file.
 */
export function exportAdvancesToExcel(advances: AdvancePayment[]) {
  const headers = ['Advance ID', 'Farmer ID', 'Farmer Name', 'Amount (LKR)', 'Reason/Description', 'Timestamp'];
  const rows = advances.map(a => [
    `#${a.id.toString().slice(-4)}`,
    a.farmer_id_at_center,
    a.farmer_name,
    a.amount,
    a.reason,
    new Date(a.timestamp).toLocaleString()
  ]);
  downloadCSV(headers, rows, `advance_payments_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Exports the Fertilizer Issuances log into an Excel file.
 */
export function exportFertilizersToExcel(fertilizers: FertilizerIssue[]) {
  const headers = ['Issue ID', 'Farmer ID', 'Farmer Name', 'Fertilizer Type', 'Quantity (Bags)', 'Cost per Bag (LKR)', 'Total Cost (LKR)', 'Timestamp'];
  const rows = fertilizers.map(f => [
    `#${f.id.toString().slice(-4)}`,
    f.farmer_id_at_center,
    f.farmer_name,
    f.type,
    f.quantity,
    f.cost_per_unit,
    f.total_cost,
    new Date(f.timestamp).toLocaleString()
  ]);
  downloadCSV(headers, rows, `fertilizer_issuances_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Exports complete aggregated totals per farmer to an Excel sheet.
 */
export function exportAggregatedSummaryToExcel(
  farmers: Farmer[],
  collections: CollectionRecord[],
  advances: AdvancePayment[],
  fertilizers: FertilizerIssue[]
) {
  const headers = [
    'Farmer ID',
    'Farmer Name',
    'Phone',
    'Leaf Weight Delivered (kg)',
    'Gross Earnings (LKR)',
    'Total Advances (LKR)',
    'Fertilizer Costs (LKR)',
    'Net Due Payout (LKR)'
  ];

  const rows = farmers.map(f => {
    // filter
    const farmerCollections = collections.filter(c => c.farmer_id_at_center === f.farmer_id_at_center);
    const farmerAdvances = advances.filter(a => a.farmer_id_at_center === f.farmer_id_at_center);
    const farmerFertilizers = fertilizers.filter(ff => ff.farmer_id_at_center === f.farmer_id_at_center);

    const weight = farmerCollections.reduce((acc, c) => acc + c.weight, 0);
    const gross = farmerCollections.reduce((acc, c) => acc + c.total_amount, 0);
    const advAmt = farmerAdvances.reduce((acc, a) => acc + a.amount, 0);
    const fertCost = farmerFertilizers.reduce((acc, ff) => acc + ff.total_cost, 0);
    const net = gross - advAmt - fertCost;

    return [
      f.farmer_id_at_center,
      f.name,
      f.phone,
      Number(weight.toFixed(2)),
      gross,
      advAmt,
      fertCost,
      net
    ];
  });

  downloadCSV(headers, rows, `center_balance_sheet_${new Date().toISOString().split('T')[0]}`);
}
