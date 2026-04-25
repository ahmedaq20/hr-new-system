import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";

function ProgramsFilter() {
  return (
    <div className="employees-filters d-flex justify-content-start align-items-center mt-3 mx-3" style={{fontSize:'12px'}}>
       <Card className="shadow-sm h-100 cardEmp mx-2 p-1">
              <Card.Header className="cardHeader">إجمالي المشاريع</Card.Header>
              <Card.Body className="d-flex align-items-center " style={{ minHeight: "60px",textAlign:'right',color:'grey' }}>
               2
              </Card.Body>
            </Card>
            <Card className="shadow-sm h-100 cardEmp mx-2 p-1">
              <Card.Header className="cardHeader">آخر مشروع مضاف</Card.Header>
              <Card.Body className="d-flex align-items-center " style={{ minHeight: "60px",textAlign:'right',color:'grey' }}>
               المشروع الألماني
              </Card.Body>
            </Card>

      {/* <div className="d-flex align-items-center gap-2" style={{fontSize:'12px'}}>
        <span>عرض</span>
        <select className="form-select" style={{width:'70px',fontSize:'12px'}}>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        <span>سجل</span>
      </div> */}
    </div>
  );
}

export default ProgramsFilter;
