import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axios';
import { useGetEmployees } from '@/hooks/useGetEmployees';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Rec = {
  id: number;
  employee_id: number;
  metrics_id: number[];
  year: number;
  quarter: number;
  date_start: string;
  date_end: string;
};

export const EmployeePeriods: React.FC = () => {
  const { data: employees } = useGetEmployees();

  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined);
  const [records, setRecords] = useState<Rec[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [bulkYear, setBulkYear] = useState<number>(new Date().getFullYear());
  const [bulkQuarter, setBulkQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);
  const [bulkStart, setBulkStart] = useState<string>('');
  const [bulkEnd, setBulkEnd] = useState<string>('');
  const [bulkSaving, setBulkSaving] = useState<boolean>(false);

  const [allRecords, setAllRecords] = useState<Rec[]>([]);

  useEffect(() => {
    if (employees?.length && employeeId == null) {
      setEmployeeId(employees[0].employee_id);
    }
  }, [employees, employeeId]);

  useEffect(() => {
    if (employeeId == null) return;
    setLoading(true);
    apiClient
      .get<Rec[]>('/employees-to-metrics/?skip=0&limit=100')
      .then(res => {
        const mine = res.data.filter(r => r.employee_id === employeeId);
        setRecords(mine);
        if (mine[0]) {
          setYear(mine[0].year);
          setQuarter(mine[0].quarter);
          setDateStart(mine[0].date_start.slice(0, 10));
          setDateEnd(mine[0].date_end.slice(0, 10));
        } else {
          setYear(new Date().getFullYear());
          setQuarter(Math.floor(new Date().getMonth() / 3) + 1);
          setDateStart('');
          setDateEnd('');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    apiClient
      .get<Rec[]>('/employees-to-metrics/?skip=0&limit=1000')
      .then(res => setAllRecords(res.data))
      .catch(console.error);
  }, []);

  const onSave = async () => {
    if (employeeId == null) return alert('Выберите сотрудника');
    if (!dateStart || !dateEnd) return alert('Заполните даты');
    setSaving(true);
    const payload = {
      employee_id: employeeId,
      metrics_id: records[0]?.metrics_id ?? [],
      year,
      quarter,
      date_start: new Date(dateStart).toISOString(),
      date_end: new Date(dateEnd).toISOString(),
    };
    try {
      if (records[0]) {
        await apiClient.put(`/employees-to-metrics/${records[0].id}`, payload);
      } else {
        await apiClient.post('/employees-to-metrics/', payload);
      }
      alert('Сохранено');
      const res = await apiClient.get<Rec[]>('/employees-to-metrics/?skip=0&limit=100');
      setRecords(res.data.filter(r => r.employee_id === employeeId));
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при сохранении: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const onBulkSave = async () => {
    if (!bulkStart || !bulkEnd) return alert('Заполните даты');
    setBulkSaving(true);
    try {
      const res = await apiClient.get<Rec[]>('/employees-to-metrics/?skip=0&limit=1000');
      const all = res.data;

      for (const emp of employees || []) {
        const existing = all.find(r => r.employee_id === emp.employee_id);
        const payload = {
          employee_id: emp.employee_id,
          metrics_id: existing?.metrics_id ?? [],
          year: bulkYear,
          quarter: bulkQuarter,
          date_start: new Date(bulkStart).toISOString(),
          date_end: new Date(bulkEnd).toISOString(),
        };
        if (existing) {
          await apiClient.put(`/employees-to-metrics/${existing.id}`, payload);
        } else {
          await apiClient.post('/employees-to-metrics/', payload);
        }
      }

      alert('Периоды установлены всем сотрудникам');
      const updated = await apiClient.get<Rec[]>('/employees-to-metrics/?skip=0&limit=1000');
      setAllRecords(updated.data);
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при сохранении: ' + (err.response?.data?.detail || err.message));
    } finally {
      setBulkSaving(false);
    }
  };

  const current = records[0];

  
    return (
  <div className="flex flex-col gap-8 items-center p-6">
    <h1 className="text-2xl font-medium">Периоды по сотруднику</h1>

    {/* 🔷 Блок: Массовое назначение */}
    <div className="w-full max-w-4xl border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Назначить период всем сотрудникам</h2>
      <div className="flex flex-wrap gap-4 items-center">
        <label>
          Год:&nbsp;
          <input
            type="number"
            value={bulkYear}
            onChange={e => setBulkYear(+e.target.value)}
            className="w-20 border rounded px-2 py-1"
          />
        </label>
        <label>
          Квартал:&nbsp;
          <select
            value={bulkQuarter}
            onChange={e => setBulkQuarter(+e.target.value)}
            className="border rounded px-2 py-1"
          >
            {[1, 2, 3, 4].map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </label>
        <label>
          Дата начала:&nbsp;
          <input
            type="date"
            value={bulkStart}
            onChange={e => setBulkStart(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>
        <label>
          Дата окончания:&nbsp;
          <input
            type="date"
            value={bulkEnd}
            onChange={e => setBulkEnd(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>
        <Button onClick={onBulkSave} disabled={bulkSaving}>
          {bulkSaving ? 'Сохраняем…' : 'Сохранить всем'}
        </Button>
      </div>
    </div>

    {/* 🔷 Блок: Индивидуальное редактирование */}
    <div className="w-full max-w-4xl border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Редактировать период одного сотрудника</h2>

      <Select
        value={employeeId?.toString()}
        onValueChange={val => setEmployeeId(+val)}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Выберите сотрудника" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Сотрудники</SelectLabel>
            {employees?.map(e => (
              <SelectItem key={e.employee_id} value={e.employee_id.toString()}>
                {e.last_name} {e.first_name} {e.surname}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="mt-4">Загрузка…</div>
      ) : (
        <>
          <div className="mt-4 text-gray-700">
            {current ? (
              <>
                <strong>Текущий период:</strong>{' '}
                {current.date_start.slice(0, 10)} — {current.date_end.slice(0, 10)}
              </>
            ) : (
              'Текущий период не задан'
            )}
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-4">
              <label>
                Год:&nbsp;
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(+e.target.value)}
                  className="w-20 border rounded px-2 py-1"
                />
              </label>
              <label>
                Квартал:&nbsp;
                <select
                  value={quarter}
                  onChange={e => setQuarter(+e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {[1, 2, 3, 4].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-4">
              <label>
                Дата начала:&nbsp;
                <input
                  type="date"
                  value={dateStart}
                  onChange={e => setDateStart(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label>
                Дата окончания:&nbsp;
                <input
                  type="date"
                  value={dateEnd}
                  onChange={e => setDateEnd(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </label>
            </div>
            <Button
              onClick={onSave}
              disabled={saving}
              className="w-40 mt-2 text-lg"
            >
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </div>
        </>
      )}
    </div>

    {/* 🔷 Блок: Таблица */}
    <div className="w-full max-w-4xl">
      <h2 className="text-xl font-semibold mt-4">Периоды всех сотрудников</h2>
      <table className="w-full border mt-2 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">ФИО</th>
            <th className="border px-2 py-1">Год</th>
            <th className="border px-2 py-1">Квартал</th>
            <th className="border px-2 py-1">Начало</th>
            <th className="border px-2 py-1">Окончание</th>
          </tr>
        </thead>
        <tbody>
          {employees?.map(emp => {
            const rec = allRecords.find(r => r.employee_id === emp.employee_id);
            return (
              <tr key={emp.employee_id}>
                <td className="border px-2 py-1">
                  {emp.last_name} {emp.first_name} {emp.surname}
                </td>
                <td className="border px-2 py-1 text-center">{rec?.year ?? '—'}</td>
                <td className="border px-2 py-1 text-center">{rec?.quarter ?? '—'}</td>
                <td className="border px-2 py-1 text-center">{rec?.date_start?.slice(0, 10) ?? '—'}</td>
                <td className="border px-2 py-1 text-center">{rec?.date_end?.slice(0, 10) ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

};
