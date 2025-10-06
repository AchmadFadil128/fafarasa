"use client";
import { useEffect } from 'react';

interface CakeData {
  id: string;
  name: string;
  kirim: number;
  laku: number;
  sellingPrice: number;
  purchasePrice: number;
  revenue: number;
  profit: number;
}

interface DailyCakeData {
  [cakeId: string]: {
    kirim: number | null;
    laku: number | null;
    revenue: number | null;
  };
}

interface ProducerData {
  id: string;
  name: string;
  total: number;
  cakes: CakeData[];
  weeklyKirim: number;
  weeklyLaku: number;
  dailyData: {
    [date: string]: DailyCakeData;
  };
}

interface SalesReportPrintProps {
  producersData: ProducerData[];
  selectedWeekOption: {
    label: string;
    start: Date;
    end: Date;
  } | null;
  onClose: () => void;
}

const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export default function SalesReportPrint({ 
  producersData, 
  selectedWeekOption, 
  onClose 
}: SalesReportPrintProps) {

  useEffect(() => {
    const getPrintContent = () => {
      if (!selectedWeekOption) return '';

      // Filter producers yang memiliki weeklyKirim > 0
      const activeProducers = producersData.filter(producer => producer.weeklyKirim > 0);

      if (activeProducers.length === 0) {
        return '<div style="text-align: center; padding: 20px; color: #666;">Tidak ada data untuk dicetak</div>';
      }

      const days: Date[] = [];
      const { start, end } = selectedWeekOption;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      // paginate producers into chunks of 8 (2x4 grid per page)
      const pages: ProducerData[][] = [];
      for (let i = 0; i < activeProducers.length; i += 8) {
        pages.push(activeProducers.slice(i, i + 8));
      }

      const renderProducerTable = (producer: ProducerData) => {
        return `
          <table class="producer-table">
            <thead>
              <tr>
                <th class="producer-header-cell" colspan="${1 + producer.cakes.length * 2}">
                  <div class="producer-header-row">
                    <div class="producer-name">${producer.name}</div>
                    <div class="producer-total">${formatCurrency(producer.total)}</div>
                  </div>
                </th>
              </tr>
              <tr>
                <th class="date-header">TGL</th>
                ${producer.cakes.map((cake) => `
                  <th class="cake-name-header" colspan="2">
                    <div>${cake.name}</div>
                    <div class="cake-total">${formatCurrency(cake.revenue)}</div>
                  </th>
                `).join('')}
              </tr>
              <tr>
                <th class="date-header"></th>
                ${producer.cakes.map(() => `
                  <th>KIRIM</th>
                  <th>LAKU</th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${days.map((day) => {
                const dateStr = day.toLocaleDateString('en-CA');
                return `
                  <tr>
                    <td class="date-header">
                      ${day.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </td>
                    ${producer.cakes.map((cake) => {
                      const daily = producer.dailyData?.[dateStr]?.[cake.id];
                      return `
                        <td class="data-cell">${daily && daily.kirim !== null ? daily.kirim : ''}</td>
                        <td class="data-cell">${daily && daily.laku !== null ? daily.laku : ''}</td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td>Total</td>
                ${producer.cakes.map((cake) => `
                  <td class="data-cell">${cake.kirim}</td>
                  <td class="data-cell">${cake.laku}</td>
                `).join('')}
              </tr>
              <tr class="summary-row">
                <td colspan="${1 + producer.cakes.length * 2}">
                  <div class="summary-grid">
                    <div class="summary-item">
                      <span class="summary-label">Total Kirim : </span>
                      <span class="summary-value"> ${producer.weeklyKirim}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Total Laku :  </span>
                      <span class="summary-value"> ${producer.weeklyLaku}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        `;
      };

      const pagesHtml = pages.map((chunk, pageIdx) => `
        <div class="page${pageIdx < pages.length - 1 ? ' page-break' : ''}">
          <div class="print-header">
            <div class="print-title">LAPORAN PENJUALAN PER PRODUCER</div>
            <div class="print-period">Periode: ${selectedWeekOption.label}</div>
            <div class="print-date">
              Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
          <div class="producers-grid">
            ${chunk.map((producer) => `
              <div class="producer-card">
                ${renderProducerTable(producer)}
              </div>
            `).join('')}
            ${Array.from({ length: Math.max(0, 8 - chunk.length) }).map(() => '<div class="producer-card empty"></div>').join('')}
          </div>
        </div>
      `).join('');

      return pagesHtml;
    };

    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Laporan Penjualan per Producer</title>
              <style>
                @page {
                  size: A4;
                  margin: 0.5cm;
                }
                
                body {
                  font-family: Arial, sans-serif;
                  font-size: 9px;
                  line-height: 1.3;
                  margin: 0;
                  padding: 0;
                }
                
                .page { 
                  padding: 8px; 
                }
                
                .page-break { 
                  page-break-after: always; 
                }

                .print-header {
                  text-align: center;
                  margin-bottom: 6px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 3px;
                }
                
                .print-title {
                  font-size: 11px;
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                
                .print-period {
                  font-size: 9px;
                  margin-bottom: 3px;
                }
                
                .print-date {
                  font-size: 8px;
                  color: #666;
                }
                
                .producers-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  grid-template-rows: repeat(4, 1fr);
                  gap: 3px;
                  height: calc(100vh - 60px);
                }
                
                .producer-card { 
                  border: 1px solid #000; 
                  padding: 4px; 
                  overflow: hidden; 
                }
                
                .producer-card.empty { 
                  border: none; 
                }
                
                .producer-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 8px;
                }
                
                .producer-table th,
                .producer-table td {
                  border: 1px solid #000;
                  padding: 2px 3px;
                  text-align: center;
                  vertical-align: middle;
                  min-width: 24px;
                }
                
                .producer-table th {
                  background-color: #e0e0e0;
                  font-weight: bold;
                }
                
                .producer-header-cell { 
                  background-color: #f0f0f0; 
                }
                
                .producer-header-row { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                }
                
                .producer-name { 
                  font-size: 12px; 
                  font-weight: bold; 
                }
                
                .producer-total { 
                  font-size: 12px; 
                  font-weight: bold; 
                }

                .cake-name-header {
                  font-weight: bold;
                  text-align: center;
                  font-size: 10px;
                  line-height: 1.2;
                }
                
                .cake-total {
                  font-size: 7px;
                  color: #666;
                  font-weight: normal;
                  display: block;
                  margin-top: 1px;
                }
                
                .date-header {
                  font-weight: bold;
                  font-size: 9px;
                  width: 30px;
                }
                
                .total-row {
                  background-color: #e8e8e8;
                  font-weight: bold;
                  font-size: 10px;
                }
                
                .data-cell {
                  font-size: 10px;
                  height: 12px;
                  line-height: 12px;
                }
                
                .summary-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 4px;
                }
                
                .summary-item {
                  display: flex;
                  font-size: 8px;
                }
                
                .summary-label {
                  font-weight: bold;
                  font-size: 12px;
                }
                
                .summary-value {
                  font-weight: bold;
                  font-size: 12px;
                }
                
              </style>
            </head>
            <body>
              ${getPrintContent()}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
      onClose();
    };

    // Auto print when component mounts
    setTimeout(handlePrint, 100);
  }, [onClose, selectedWeekOption, producersData]);

  if (!selectedWeekOption) {
    return null;
  }

  return null;
}