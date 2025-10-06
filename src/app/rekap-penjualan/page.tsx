"use client";
import { useEffect, useState } from 'react';
import { Search, ChevronDown, Printer } from 'lucide-react';
import SalesReportPrint from '@/components/print/SalesReportPrint';

// Interface definitions
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

interface DailyEntry {
  initialStock: number | null;
  remainingStock: number | null;
  cake: {
    id: string;
    name: string;
    sellingPrice: number;
    purchasePrice: number;
    producer: {
      id: string;
      name: string;
    };
  };
}

// Helper function to get the start and end of the week (Saturday to Friday)
const getWeekRange = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - ((day + 1) % 7);
  const saturday = new Date(d.setDate(diff));
  const friday = new Date(saturday);
  friday.setDate(saturday.getDate() + 6);
  return { start: saturday, end: friday };
};

// Helper function to format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

// Helper function to get week options (last 12 weeks)
const getWeekOptions = () => {
  const options = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const weekDate = new Date(today);
    weekDate.setDate(today.getDate() - (i * 7));
    const { start, end } = getWeekRange(weekDate);

    options.push({
      value: start.toISOString().slice(0, 10),
      label: `${formatDate(start)} - ${formatDate(end)}`,
      start,
      end
    });
  }

  return options;
};

export default function ProducerSalesSummary() {
  const [producersData, setProducersData] = useState<ProducerData[]>([]);
  const [filteredData, setFilteredData] = useState<ProducerData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weekOptions] = useState(getWeekOptions());
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (weekOptions.length > 0 && !selectedWeek) {
      setSelectedWeek(weekOptions[0].value);
    }
  }, [weekOptions, selectedWeek]);

  useEffect(() => {
    const fetchProducerData = async () => {
      if (!selectedWeek) return;

      setLoading(true);
      const selectedWeekOption = weekOptions.find(w => w.value === selectedWeek);
      if (!selectedWeekOption) return;

      const { start, end } = selectedWeekOption;
      const producerMap = new Map<string, ProducerData>();

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toLocaleDateString('en-CA');
        try {
          const res = await fetch(`/api/daily-entry?date=${dateStr}`);
          const dailyEntries: DailyEntry[] = await res.json();

          dailyEntries.forEach(entry => {
            const producerId = entry.cake.producer.id;
            const producerName = entry.cake.producer.name;
            const cakeId = entry.cake.id;
            const cakeName = entry.cake.name;

            if (!producerMap.has(producerId)) {
              producerMap.set(producerId, {
                id: producerId,
                name: producerName,
                total: 0,
                cakes: [],
                weeklyKirim: 0,
                weeklyLaku: 0,
                dailyData: {},
              });
            }

            const producer = producerMap.get(producerId)!;
            let cakeEntry = producer.cakes.find(c => c.id === cakeId);
            if (!cakeEntry) {
              cakeEntry = {
                id: cakeId,
                name: cakeName,
                kirim: 0,
                laku: 0,
                sellingPrice: entry.cake.sellingPrice,
                purchasePrice: entry.cake.purchasePrice,
                revenue: 0,
                profit: 0,
              };
              producer.cakes.push(cakeEntry);
            }

            if (!producer.dailyData[dateStr]) {
              producer.dailyData[dateStr] = {};
            }
            if (!producer.dailyData[dateStr][cakeId]) {
              producer.dailyData[dateStr][cakeId] = { kirim: null, laku: null, revenue: null };
            }

            if (entry.initialStock !== null && entry.remainingStock !== null) {
              const kirim = entry.initialStock;
              const laku = entry.initialStock - entry.remainingStock;
              const revenue = laku * entry.cake.sellingPrice;
              const profit = laku * (entry.cake.sellingPrice - entry.cake.purchasePrice);

              producer.dailyData[dateStr][cakeId] = { kirim, laku, revenue };

              cakeEntry.kirim += kirim;
              cakeEntry.laku += laku;
              cakeEntry.revenue += revenue;
              cakeEntry.profit += profit;

              producer.weeklyKirim += kirim;
              producer.weeklyLaku += laku;
              producer.total += revenue;
            }
          });
        } catch (error) {
          console.error(`Error fetching data for ${dateStr}:`, error);
        }
      }

      const producersArray = Array.from(producerMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setProducersData(producersArray);
      setLoading(false);
    };

    fetchProducerData();
  }, [selectedWeek, weekOptions]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(producersData);
    } else {
      const filtered = producersData.filter(producer =>
        producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.cakes.some(cake =>
          cake.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, producersData]);

  const selectedWeekOption = weekOptions.find(w => w.value === selectedWeek);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">
        Rangkuman Penjualan per Producer
      </h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Week Selector */}
        <div className="relative">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Pilih Minggu</option>
            {weekOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari producer atau kue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Print Button */}
        <button
          onClick={() => setShowPrintModal(true)}
          disabled={loading || filteredData.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Printer className="w-4 h-4" />
          Cetak Laporan
        </button>
      </div>

      {/* Period Info */}
      {selectedWeekOption && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 font-medium">
            Periode: {selectedWeekOption.label}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      )}

      {/* Producer Tables */}
      {!loading && (
        <div className="space-y-8">
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada data yang cocok dengan pencarian.' : 'Tidak ada data untuk periode ini.'}
              </p>
            </div>
          ) : (
            filteredData.map(producer => (
              <div key={producer.id} className="bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden">
                {/* Producer Header */}
                <div className="bg-green-700 text-white px-4 py-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Nama: {producer.name}</h3>
                    <div className="text-right">
                      <p className="text-sm opacity-90">TOTAL</p>
                      <p className="text-xl font-bold">{formatCurrency(producer.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left">TGL</th>
                        {producer.cakes.map(cake => (
                          <th key={cake.id} className="border border-gray-300 px-3 py-2 text-center" colSpan={2}>
                            <div>{cake.name}</div>
                            <div className="text-xs font-semibold text-green-700 mt-1">
                              (Total: {formatCurrency(cake.revenue)})
                            </div>
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2"></th>
                        {producer.cakes.map(cake => [
                          <th key={`${cake.id}-kirim`} className="border border-gray-300 px-2 py-1 text-xs">KIRIM</th>,
                          <th key={`${cake.id}-laku`} className="border border-gray-300 px-2 py-1 text-xs">LAKU</th>
                        ])}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Daily rows */}
                      {selectedWeekOption && (() => {
                        const days: Date[] = [];
                        const { start, end } = selectedWeekOption;
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                          days.push(new Date(d));
                        }
                        return days.map(day => {
                          const dateStr = day.toLocaleDateString('en-CA');
                          return (
                            <tr key={day.toISOString()}>
                              <td className="border border-gray-300 px-3 py-2">
                                {day.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                              </td>
                              {producer.cakes.map(cake => {
                                const daily = producer.dailyData?.[dateStr]?.[cake.id];
                                return [
                                  <td key={`${cake.id}-${dateStr}-kirim`} className="border border-gray-300 px-2 py-1 text-center">
                                    {daily && daily.kirim !== null ? daily.kirim : ''}
                                  </td>,
                                  <td key={`${cake.id}-${dateStr}-laku`} className="border border-gray-300 px-2 py-1 text-center">
                                    {daily && daily.laku !== null ? daily.laku : ''}
                                  </td>
                                ];
                              })}
                            </tr>
                          );
                        });
                      })()}

                      {/* Total Row */}
                      <tr className="bg-green-50 font-semibold">
                        <td className="border border-gray-300 px-3 py-2">Total</td>
                        {producer.cakes.map(cake => [
                          <td key={`${cake.id}-total-kirim`} className="border border-gray-300 px-2 py-1 text-center">
                            {cake.kirim}
                          </td>,
                          <td key={`${cake.id}-total-laku`} className="border border-gray-300 px-2 py-1 text-center">
                            {cake.laku}
                          </td>
                        ])}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Weekly Summary */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total Kirim Minggu Ini:</span>
                      <span className="ml-2 font-bold text-green-700">{producer.weeklyKirim}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Laku Minggu Ini:</span>
                      <span className="ml-2 font-bold text-green-700">{producer.weeklyLaku}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && selectedWeekOption && (
        <SalesReportPrint
          producersData={filteredData}
          selectedWeekOption={selectedWeekOption}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}