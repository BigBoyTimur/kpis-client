export type Metric = {
    metric_number: number;
    metric_subnumber: string;
    description: string;
    unit_of_measurement: string;
    base_level: string;
    average_level: string;
    goal_level: string;
    measurement_frequency: string;
    conditions: string;
    notes: string;
    points: number;
    section_id: number;
    metric_id: number;
};

export type Department = {
    nameOfDepartment: string;
    affiliation: number;
    id: number;
}

export type Employee = {
    employee_id: number;
    first_name: string;
    last_name: string;
    surname: string;
    mail_box: string;
    number_phone: string;
};

export type EmployeesToMetrics = {
    employee_id: number;
    metrics_id: number[];
    quarter: number;
    date_start: Date;
    date_end: Date;
    year: number;
};