import React, { useState, useMemo } from 'react';
import { Department, Metric } from '@/types';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { useGetMetrics } from '@/hooks/useGetMetrics';
import { useGetDepartmentsMetrics } from '@/hooks/useGetDepartmentsMetrics';
import * as XLSX from 'xlsx';

export const DepartmentsMetricsTable: React.FC = () => {
  const { data: departments } = useGetDepartments();
  const { data: metrics } = useGetMetrics();
  const { data: departmentsMetrics } = useGetDepartmentsMetrics();

  const [yearFilter, setYearFilter] = useState<number>(2025);
  const [quarterFilter, setQuarterFilter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);

  const filteredMetrics = useMemo(() => {
    if (!departmentsMetrics) return [];
    return departmentsMetrics.filter(dm => dm.year === yearFilter && dm.quarter === quarterFilter);
  }, [departmentsMetrics, yearFilter, quarterFilter]);

  const metricsMap = useMemo(() => {
    const map = new Map<number, Map<number, number>>();
    filteredMetrics.forEach(dm => {
      if (!map.has(dm.department_id)) {
        map.set(dm.department_id, new Map<number, number>());
      }
      map.get(dm.department_id)?.set(dm.metrics_id, dm.value);
    });
    return map;
  }, [filteredMetrics]);

  const quarterlyMetrics = useMemo(() => {
    if (!metrics) return [];
    if (quarterFilter === 1) {
      return metrics.filter(m => [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13].includes(m.metric_id));
    } else if (quarterFilter === 2) {
      return metrics.filter(m => [9, 14, 15, 17].includes(m.metric_id));
    } else if (quarterFilter === 3) {
      return metrics.filter(m => [6, 7, 10, 11, 12, 13].includes(m.metric_id));
    } else if (quarterFilter === 4) {
      return metrics.filter(m => [9, 14, 15, 16, 17].includes(m.metric_id));
    }
    return metrics;
  }, [metrics, quarterFilter]);

  const formatMetricSubnumber = (subnumber: string | null | undefined): string => {
    return subnumber?.toLowerCase() === 'null' ? '' : subnumber || '';
  };

  const handleDownloadExcel = () => {
    if (!departments || !quarterlyMetrics) {
      alert('Данные еще не загружены');
      return;
    }

    // Создаем массив заголовков
    const headers = [
      { key: 'Кафедра', label: 'Кафедра' },
      ...quarterlyMetrics.map(metric => ({
        key: `${metric.metric_number}${formatMetricSubnumber(metric.metric_subnumber)}`,
        label: `${metric.metric_number}${formatMetricSubnumber(metric.metric_subnumber)}`
      })),
      { key: 'Итого', label: 'Итого' }
    ];

    // Создаем массив данных для экспорта
    const exportData = departments.map(dept => {
      const rowData: Record<string, any> = {};
      let rowTotal = 0;
      
      headers.forEach(header => {
        if (header.key === 'Кафедра') {
          rowData[header.key] = dept.nameOfDepartment;
        } else if (header.key === 'Итого') {
          rowData[header.key] = rowTotal || null;
        } else {
          const metric = quarterlyMetrics.find(m => 
            `${m.metric_number}${formatMetricSubnumber(m.metric_subnumber)}` === header.key
          );
          const value = metric ? metricsMap.get(dept.id)?.get(metric.metric_id) : undefined;
          rowData[header.key] = value !== undefined ? value : null;
          rowTotal += Number(value) || 0;
        }
      });

      return rowData;
    });

    // Добавляем строку с итогами по столбцам
    const columnTotals: Record<string, any> = { 'Кафедра': 'ВСЕГО:' };
    let grandTotal = 0;

    headers.forEach(header => {
      if (header.key !== 'Кафедра') {
        if (header.key === 'Итого') {
          columnTotals[header.key] = grandTotal || 0;
        } else {
          const total = exportData.reduce((sum, row) => sum + (Number(row[header.key]) || 0), 0);
          columnTotals[header.key] = total || 0;
          if (header.key !== 'Итого') {
            grandTotal += total;
          }
        }
      }
    });

    exportData.push(columnTotals);

    // Создаем книгу Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headers.map(h => h.key) });

    // Настраиваем ширину столбцов
    const maxDeptNameLength = Math.max(...departments.map(d => d.nameOfDepartment.length));
    const colWidths = [
      { wch: Math.min(Math.max(maxDeptNameLength, 10), 50) }, // Ширина для столбца "Кафедра" (мин 10, макс 50)
      ...quarterlyMetrics.map(() => ({ wch: 8 })), // Фиксированная ширина для показателей
      { wch: 10 } // Ширина для столбца "Итого"
    ];
    worksheet['!cols'] = colWidths;

    // Добавляем границы для всех ячеек
    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);
          
          if (!worksheet[cell_ref]) {
            worksheet[cell_ref] = {};
          }
          
          worksheet[cell_ref].s = {
            ...(worksheet[cell_ref].s || {}),
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            },
            alignment: { vertical: 'center', horizontal: 'center' }
          };
        }
      }

      // Форматируем итоговую строку
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: range.e.r };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        
        if (!worksheet[cell_ref]) continue;
        
        worksheet[cell_ref].s = {
          ...worksheet[cell_ref].s,
          font: { bold: true },
          fill: { fgColor: { rgb: 'D3D3D3' } } // Серый фон
        };
      }

      // Форматируем заголовки
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: range.s.r };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        
        if (!worksheet[cell_ref]) continue;
        
        worksheet[cell_ref].s = {
          ...worksheet[cell_ref].s,
          font: { bold: true },
          alignment: { horizontal: 'center' }
        };
      }

      // Выравнивание первого столбца по левому краю
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_address = { c: range.s.c, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        
        if (worksheet[cell_ref]?.s) {
          worksheet[cell_ref].s.alignment = { 
            ...worksheet[cell_ref].s.alignment,
            horizontal: 'left'
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Метрики кафедр");
    XLSX.writeFile(workbook, `Метрики_кафедр_${yearFilter}_Q${quarterFilter}.xlsx`);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Таблица метрик по кафедрам</h1>
        <button 
          onClick={handleDownloadExcel}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Скачать отчет в Excel
        </button>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2">
          Год:
          <input
            type="number"
            value={yearFilter}
            onChange={e => setYearFilter(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          Квартал:
          <select
            value={quarterFilter}
            onChange={e => setQuarterFilter(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[1, 2, 3, 4].map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex-1 overflow-auto w-full">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 bg-gray-200 border border-gray-300 p-2">
                Кафедра
              </th>
              {quarterlyMetrics?.map(metric => {
                const formattedSubnumber = formatMetricSubnumber(metric.metric_subnumber);
                return (
                  <th
                    key={`${metric.metric_id}-${formattedSubnumber}`}
                    className="sticky top-0 z-10 bg-gray-100 border border-gray-300 p-2 text-center"
                  >
                    <span
                      title={`${metric.metric_number ?? ''}${formattedSubnumber} ${metric.description ?? ''}`}
                      className="underline decoration-dotted cursor-help"
                    >
                      {metric.metric_number}{formattedSubnumber}
                    </span>
                  </th>
                );
              })}
              <th className="sticky top-0 z-10 bg-gray-100 border border-gray-300 p-2 text-center">
                Итого
              </th>
            </tr>
          </thead>
          <tbody>
            {departments?.map(dept => {
              let rowTotal = 0;
              return (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white border border-gray-300 p-2 font-medium">
                    {dept.nameOfDepartment}
                  </td>
                  {quarterlyMetrics?.map(metric => {
                    const value = metricsMap.get(dept.id)?.get(metric.metric_id);
                    rowTotal += Number(value) || 0;
                    return (
                      <td
                        key={`${metric.metric_id}-${dept.id}`}
                        className="border border-gray-300 p-2 text-center"
                      >
                        {value !== undefined ? value : ''}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 p-2 text-center font-medium">
                    {rowTotal || ''}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-bold">
              <td className="sticky left-0 z-10 bg-gray-200 border border-gray-300 p-2">
                ВСЕГО:
              </td>
              {quarterlyMetrics?.map(metric => {
                const total = departments?.reduce((sum, dept) => {
                  const value = metricsMap.get(dept.id)?.get(metric.metric_id) || 0;
                  return sum + Number(value);
                }, 0);
                return (
                  <td 
                    key={`total-${metric.metric_id}`} 
                    className="border border-gray-300 p-2 text-center"
                  >
                    {total || 0}
                  </td>
                );
              })}
              <td className="border border-gray-300 p-2 text-center">
                {departments?.reduce((sum, dept) => {
                  const rowTotal = quarterlyMetrics?.reduce((rowSum, metric) => {
                    const value = metricsMap.get(dept.id)?.get(metric.metric_id) || 0;
                    return rowSum + Number(value);
                  }, 0) || 0;
                  return sum + rowTotal;
                }, 0) || 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};