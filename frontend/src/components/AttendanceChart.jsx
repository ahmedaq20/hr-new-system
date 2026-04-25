import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "الأحد", attendance: 430, absence: 15 },
  { day: "الإثنين", attendance: 420, absence: 18 },
  { day: "الثلاثاء", attendance: 440, absence: 10 },
  { day: "الأربعاء", attendance: 430, absence: 16 },
  { day: "الخميس", attendance: 415, absence: 20 },
];

function AttendanceChart() {
  return (
    <div className="card p-3 mt-3"  style={{width:'550px',height:'450px', marginRight:'7%'}}>
      <h6 className="fw-bold mb-3">متابعة حضور وغياب الموظفين</h6>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="attendance"
            stroke="#22c55e"
            strokeWidth={2}
            name="الحضور"
          />

          <Line
            type="monotone"
            dataKey="absence"
            stroke="#ef4444"
            strokeWidth={2}
            name="الغياب"
          />
        </LineChart>
      </ResponsiveContainer>

      <small className="text-muted d-block mt-2">
        متابعة نسب الحضور والغياب خلال الأسبوع الحالي
      </small>
    </div>
  );
}

export default AttendanceChart;
