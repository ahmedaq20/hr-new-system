import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "المكتب الرئيسي - غزة", value: 80 },
  { name: "مكتب الشمال", value: 50},
  { name: "مكتب الوسطى", value: 10 },
  { name: "مكتب الجنوب", value: 48 },
  { name: "مكتب رفح", value: 100 },
];

const COLORS = [
  "#1e3a8a",
  "#2563eb",
  "#0f766e",
  "#64748b",
  "#334155",
];

function AttendanceChartDonut() {
  return (
    <div className="card p-3 mt-3" style={{width:'550px', marginRight:'7%'}}>
      <h6 className="fw-bold mb-3">الحضور والغياب الخاص بالموظفين</h6>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3">
        {data.map((item, index) => (
          <div key={index} className="d-flex align-items-center mb-1">
            <span
              style={{
                width: 10,
                height: 10,
                backgroundColor: COLORS[index],
                display: "inline-block",
                borderRadius: "50%",
                marginLeft: 8,
              }}
            ></span>
            <small>{item.name} ({item.value} موظف)</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttendanceChartDonut;
