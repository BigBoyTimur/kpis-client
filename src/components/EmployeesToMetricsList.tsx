type EnrichedEmployeesToMetrics = {
    employeeName: string;
    metrics: { metric_number: number; description: string; metric_subnumber: string; }[];
    quarter: number;
    year: number;
};

type EmployeesToMetricsListProps = {
    data: EnrichedEmployeesToMetrics[];
};

export const EmployeesToMetricsList = ({ data }: EmployeesToMetricsListProps) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Связи сотрудников и показателей</h2>
            {data.map((item, index) => (
                <div key={index} className="border p-4 rounded-md">
                    <p><strong>Сотрудник:</strong> {item.employeeName}</p>
                    <p><strong>Квартал:</strong> {item.quarter}</p>
                    <p><strong>Показатели:</strong></p>
                    <ul className="list-disc pl-6">
                        {item.metrics.map((metric, idx) => (
                            <li key={idx}>
                                <strong>Показатель {metric.metric_number}{metric.metric_subnumber}:</strong> {metric.description}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};