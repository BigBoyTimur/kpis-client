import { useGetMetrics } from "@/hooks/useGetMetrics";
import { Metric } from "@/types";
import { useMemo } from "react";

interface SectionHeader {
  section_id: number;
  description: string;
  is_header: true;
}

type TableItem = Metric | SectionHeader;
export const MetricsPage: React.FC = () => {
  const { data: metrics = [], isLoading, error } = useGetMetrics({ skip: 0, limit: 100 });

  const tableData = useMemo(() => {
    if (!metrics.length) return [];
    
    const result: TableItem[] = [];
    let currentSectionId: number | null = null;

    metrics.forEach(metric => {
      // Добавляем заголовок секции если она изменилась
      if (metric.section_id !== currentSectionId) {
        result.push({
          section_id: metric.section_id,
          description: metric.section?.description || `Секция ${metric.section_id}`,
          is_header: true
        });
        currentSectionId = metric.section_id;
      }
      
      // Добавляем метрику
      result.push(metric);
    });

    return result;
  }, [metrics]);

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки метрик: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Просмотр метрик</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2" rowSpan={2}>Номер</th>
              <th className="border p-2" rowSpan={2}>Под-номер</th>
              <th className="border p-2" rowSpan={2}>Показатели</th>
              <th className="border p-2" rowSpan={2}>Единица измерения</th>
              <th className="border p-2" colSpan={3}>Уровни выполнения</th>
              <th className="border p-2" rowSpan={2}>Периодичность</th>
              <th className="border p-2" rowSpan={2}>Условия</th>
              <th className="border p-2" rowSpan={2}>Примечание</th>
              <th className="border p-2" rowSpan={2}>Баллы</th>
            </tr>
            <tr>
              <th className="border p-2">Базовый (N=1)</th>
              <th className="border p-2">Нормальный (N=1.5)</th>
              <th className="border p-2">Надлежащий (N=2)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              'is_header' in item ? (
                <tr key={`section-${item.section_id}`} className="bg-gray-100">
                  <td className="border p-2 font-bold" colSpan={11}>
                    {item.description}
                  </td>
                </tr>
              ) : (
                <tr key={`metric-${item.metric_id}-${index}`}>
                  <td className="border p-2">{item.metric_number}</td>
                  <td className="border p-2">{item.metric_subnumber || ''}</td>
                  <td className="border p-2">{item.description}</td>
                  <td className="border p-2">{item.unit_of_measurement}</td>
                  <td className="border p-2">
                    <span className="mr-1"></span> {item.base_level}
                  </td>
                  <td className="border p-2">
                    <span className="mr-1"></span> {item.average_level}
                  </td>
                  <td className="border p-2">
                    <span className="mr-1"></span> {item.goal_level}
                  </td>
                  <td className="border p-2">{item.measurement_frequency}</td>
                  <td className="border p-2">{item.conditions}</td>
                  <td className="border p-2">{item.notes}</td>
                  <td className="border p-2">{item.points}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};