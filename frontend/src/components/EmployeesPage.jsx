import EmployeesTable from "../components/EmployeesTable";
import EmployeesFilters from "./EmployeesFilters";
import EmployeesHeader from "./EmployeesHeader";
import EmployeesRow from "./EmployeesRow";

function EmployeesPage() {
  return (
    <div className="p-4">
      <EmployeesHeader/>
      <EmployeesFilters/>       
      <EmployeesTable />
    </div>
  );
}

export default EmployeesPage;
