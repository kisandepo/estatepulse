
import { Project } from '../types';

export const exportToExcel = (projects: Project[]) => {
  // We flatten the data for a meaningful report with explicit units
  const rows = [['Project', 'Location', 'Unit Number', 'Unit Type', 'Base Rate (INR/sqft)', 'Customer Name', 'Customer Phone', 'Offered Rate (INR/sqft)', 'Enquiry Status', 'Agent Name', 'Agent Phone', 'Interaction Date', 'Notes']];

  projects.forEach(project => {
    project.instruments.forEach(unit => {
      if (unit.interactions.length === 0) {
        // Row for units with no interactions
        rows.push([
          project.name,
          project.location,
          unit.number,
          unit.type,
          unit.baseRate.toString(),
          'N/A',
          'N/A',
          'N/A',
          'AVAILABLE',
          'N/A',
          'N/A',
          'N/A',
          'No interactions yet'
        ]);
      } else {
        unit.interactions.forEach(inter => {
          rows.push([
            project.name,
            project.location,
            unit.number,
            unit.type,
            unit.baseRate.toString(),
            inter.customerName,
            inter.customerPhone,
            inter.offeredRate.toString(),
            inter.status,
            inter.agentName,
            inter.agentPhone,
            new Date(inter.date).toLocaleDateString(),
            inter.notes || ''
          ]);
        });
      }
    });
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `EstatePulse_Full_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
