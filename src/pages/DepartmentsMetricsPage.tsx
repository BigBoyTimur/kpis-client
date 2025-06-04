// pages/DepartmentsMetricsPage.tsx
import React from 'react';
import { DepartmentsMetricsTable } from '@/components/DepartmentsMetricsTable';

const DepartmentsMetricsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <DepartmentsMetricsTable />
    </div>
  );
};

export default DepartmentsMetricsPage;