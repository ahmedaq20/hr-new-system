// import { useState } from "react";
// import FiltersModalEmp from "./FiltersModalEmp";

// function ClassificationHeader({ title = "عنوان افتراضي", desc = "وصف", onApplyFilters }) {
//   const [showFilters, setShowFilters] = useState(false);

//   return (
//     <>
//       <div className="employees-header d-flex justify-content-between align-items-center">
//         <div>
//           <h4 style={{ textAlign: "right", fontSize: "18px", fontWeight: "bold" }}>
//             {title}
//           </h4>
//           <p style={{ fontSize: "14px" }}>{desc}</p>
//         </div>

//         <div className="d-flex gap-2">
//           <button
//             className="btn btn-dark"
//             style={{ fontSize: "13px", padding: "6px 10px" }}>
//             إضافة قيمة جديدة
//           </button>
//           </div>

//       </div>
//         <p className="" style={{backgroundColor:'#Add8e6',color:'grey',paddingRight:'10px',paddingLeft:'10px',
//             paddingTop:'10px',paddingBottom:'10px'}}>يمكن للإداري ادخال قيم للموظفين الذين لا يمتلكون التصنيف من خلال تعديل بيانات الموظفين</p>

//       {showFilters && (
//         <FiltersModalEmp
//           onClose={() => setShowFilters(false)}
//           onApply={(filters) => {
//             onApplyFilters(filters);
//             setShowFilters(false);
//           }}
//         />
//       )}
//     </>
//   );
// }

// export default ClassificationHeader;

import { useState } from "react";
import AddGovermentModal from "./AddGovermentModal";

function ClassificationHeader({ title = "عنوان افتراضي", desc = "وصف", onAddItem }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="employees-header d-flex justify-content-between align-items-center">
        <div>
          <h4 style={{ textAlign: "right", fontSize: "18px", fontWeight: "bold" }}>
            {title}
          </h4>
          <p style={{ fontSize: "14px" }}>{desc}</p>
        </div>

        <button
          className="btn btn-dark"
          style={{ fontSize: "13px", padding: "6px 10px" }}
          onClick={() => setShowAddModal(true)}>
          إضافة قيمة جديدة
        </button>

      </div>
      <p className="" style={{
        backgroundColor: '#Add8e6', color: 'grey', paddingRight: '10px', paddingLeft: '10px',
        paddingTop: '10px', paddingBottom: '10px'
      }}>يمكن للإداري ادخال قيم للموظفين الذين لا يمتلكون التصنيف من خلال تعديل بيانات الموظفين</p>
      {showAddModal && (
        <AddGovermentModal
          onClose={() => setShowAddModal(false)}
          onSave={(item) => {
            onAddItem(item);
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

export default ClassificationHeader;
