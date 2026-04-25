// import { Row, Col } from "react-bootstrap";

// const DonutChart = () => {
//   // بيانات الدونات
//   const donutData = [
//     { label: "الموظفين", value: 120, color: "#4e73df" },
//     { label: "الإجازات", value: 40, color: "#1cc88a" },
//     { label: "التحذيرات", value: 25, color: "#f6c23e" },
//   ];

//   const total = donutData.reduce((s, i) => s + i.value, 0);
//   let cumulative = 0;

//   // بيانات المخطط البياني (bar بسيط)
//   const barData = [
//     { label: "يناير", value: 30 },
//     { label: "فبراير", value: 45 },
//     { label: "مارس", value: 20 },
//     { label: "أبريل", value: 60 },
//   ];

//   return (
//     <Row className="mt-4">
//       {/* Donut */}
//       <Col md={6} className="text-center">
//         <h6 className="mb-3">ملخص الموارد البشرية</h6>

//         <svg width="200" height="200" viewBox="0 0 36 36">
//           {donutData.map((item, index) => {
//             const start = (cumulative / total) * 100;
//             const percentage = (item.value / total) * 100;
//             cumulative += item.value;

//             return (
//               <circle
//                 key={index}
//                 cx="18"
//                 cy="18"
//                 r="15.915"
//                 fill="transparent"
//                 stroke={item.color}
//                 strokeWidth="3.5"
//                 strokeDasharray={`${percentage} ${100 - percentage}`}
//                 strokeDashoffset={-start}
//               />
//             );
//           })}

//           <text
//             x="18"
//             y="20"
//             textAnchor="middle"
//             fontSize="4"
//             fill="#333"
//             fontWeight="600"
//           >
//             {total}
//           </text>
//         </svg>

//         {donutData.map((item, i) => (
//           <div key={i} style={{ fontSize: "14px" }}>
//             <span
//               style={{
//                 display: "inline-block",
//                 width: "10px",
//                 height: "10px",
//                 background: item.color,
//                 borderRadius: "50%",
//                 marginLeft: "6px",
//               }}
//             />
//             {item.label} ({item.value})
//           </div>
//         ))}
//       </Col>

//       {/* Bar Chart */}
//       <Col md={6}>
//         <h6 className="mb-3 text-center">النشاط الشهري</h6>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "flex-end",
//             height: "200px",
//             gap: "15px",
//             padding: "10px",
//           }}
//         >
//           {barData.map((item, index) => (
//             <div key={index} style={{ textAlign: "center", flex: 1 }}>
//               <div
//                 style={{
//                   height: `${item.value * 2}px`,
//                   background: "#4e73df",
//                   borderRadius: "6px",
//                 }}
//               />
//               <small>{item.label}</small>
//             </div>
//           ))}
//         </div>
//       </Col>
//     </Row>
//   );
// };

// export default DonutChart;
