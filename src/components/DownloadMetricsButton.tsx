// components/DownloadMetricsButton.tsx
import React from 'react';
import * as XLSX from 'xlsx';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { useGetMetrics } from '@/hooks/useGetMetrics';
import { useGetDepartmentsMetrics } from '@/hooks/useGetDepartmentsMetrics';

export const DownloadMetricsButton: React.FC = () => {
  const { data: departments } = useGetDepartments();
  const { data: metrics } = useGetMetrics();
  const { data: departmentsMetrics } = useGetDepartmentsMetrics();

  const downloadExcel = () => {
    if (!departments || !metrics || !departmentsMetrics) {
      alert('Данные еще не загружены');
      return;
    }

    // Создаем массив данных для экспорта
    const exportData = departments.map(dept => {
      const rowData: Record<string, any> = { 'Кафедра': dept.nameOfDepartment };
      
      // Добавляем метрики для каждой кафедры
      metrics.forEach(metric => {
        const metricValue = departmentsMetrics.find(
          dm => dm.department_id === dept.id && dm.metrics_id === metric.metric_id
        );
        rowData[`${metric.metric_number}${metric.metric_subnumber}`] = metricValue?.value || '';
      });

      return rowData;
    });

    // Создаем новую книгу Excel
    const workbook = XLSX.utils.book_new();
    
    // Преобразуем данные в формат листа Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, "Метрики кафедр");
    
    // Генерируем файл и скачиваем
    XLSX.writeFile(workbook, `Метрики_кафедр_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <button 
      onClick={downloadExcel}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Скачать отчет в Excel
    </button>
  );
};