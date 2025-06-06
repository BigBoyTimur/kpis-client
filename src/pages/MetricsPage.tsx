import { useGetMetrics } from "@/hooks/useGetMetrics";
import { Metric } from "@/types";
import { useMemo, useState } from "react";
import { Button } from '@/components/ui/button';
import apiClient from "@/api/axios";
import { useUpdateMetrics } from "@/hooks/useUpdateMetrics"; // Импортируйте ваш новый хук

interface SectionHeader {
  section_id: number;
  description: string;
  is_header: true;
}

type TableItem = Metric | SectionHeader;

export const MetricsPage: React.FC = () => {
  const { data: metrics = [], isLoading, error } = useGetMetrics({ skip: 0, limit: 100 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetrics, setEditedMetrics] = useState<Metric[]>([]);

  // Используем хук для обновления метрик
  const { mutate: updateMetrics, isPending: isSaving } = useUpdateMetrics();

  // Инициализируем editedMetrics при первой загрузке данных
  useMemo(() => {
    if (metrics.length > 0 && editedMetrics.length === 0) {
      setEditedMetrics([...metrics]);
    }
  }, [metrics]);

  const tableData = useMemo(() => {
    if (!editedMetrics.length) return [];

    const result: TableItem[] = [];
    let currentSectionId: number | null = null;

    editedMetrics.forEach(metric => {
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
  }, [editedMetrics]);

  const downloadTable = async () => {
    try {
      const response = await apiClient.get('/table_maker/metrics', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'metrics.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка при скачивании таблицы:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Отмена редактирования - возвращаем исходные данные
      setEditedMetrics([...metrics]);
    }
    setIsEditing(!isEditing);
  };

  const handleMetricChange = (
    metricId: number,
    field: keyof Metric,
    value: string | number
  ) => {
    setEditedMetrics(prev =>
      prev.map(metric =>
        metric.metric_id === metricId ? { ...metric, [field]: value } : metric
      )
    );
  };

  const handleSaveChanges = () => {
    updateMetrics(editedMetrics, {
      onSuccess: () => {
        setIsEditing(false); // Выходим из режима редактирования после успешного сохранения
      },
    });
  };


  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки метрик: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Просмотр показателей</h1>
      <div className="flex gap-2 mb-4">
        <Button type="button" onClick={downloadTable}>
          Скачать документ
        </Button>
        <Button
          type="button"
          onClick={handleEditToggle}
          variant={isEditing ? "destructive" : "default"}
        >
          {isEditing ? "Отменить" : "Редактировать"}
        </Button>
        {/* Удаляем кнопку "Сохранить изменения" отсюда */}
        {/* {isEditing && (
          <Button
            type="button"
            onClick={handleSaveChanges}
            variant="default"
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        )} */}
      </div>
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
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.metric_number}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'metric_number', parseInt(e.target.value))
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.metric_number
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.metric_subnumber || ''}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'metric_subnumber', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.metric_subnumber || ''
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'description', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                        rows={2}
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.unit_of_measurement}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'unit_of_measurement', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.unit_of_measurement
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.base_level}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'base_level', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.base_level
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.average_level}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'average_level', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.average_level
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.goal_level}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'goal_level', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.goal_level
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.measurement_frequency}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'measurement_frequency', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.measurement_frequency
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <textarea
                        value={item.conditions}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'conditions', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                        rows={2}
                      />
                    ) : (
                      item.conditions
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <textarea
                        value={item.notes}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'notes', e.target.value)
                        }
                        className="w-full p-1 border rounded"
                        rows={2}
                      />
                    ) : (
                      item.notes
                    )}
                  </td>
                  <td className="border p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.points}
                        onChange={(e) =>
                          handleMetricChange(item.metric_id, 'points', parseInt(e.target.value))
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      item.points
                    )}
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Фиксированный блок кнопок в правом нижнем углу */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 flex gap-2 p-3 bg-white shadow-lg rounded-lg border border-gray-200">
          <Button
            type="button"
            onClick={handleEditToggle}
            variant="destructive"
          >
            Отменить
          </Button>
          <Button
            type="button"
            onClick={handleSaveChanges}
            variant="default"
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      )}
    </div>
  );
};