function EmployeesRow() {
  return (
    <tr>
      <td>1</td>
      <td>علاء عبد الله سليمان قديح</td>
      <td>رسمي</td>
      <td>974334252</td>
      <td>40758</td>
      <td>8860386</td>
      <td>1976-08-28</td>
      <td>-</td>
      <td>رئيس قسم التراخيص الصناعية</td>
      <td className="actions">
        <button className="btn btn-outline-danger btn-sm">🗑</button>
        <button className="btn btn-outline-secondary btn-sm">✏️</button>
        <button className="btn btn-outline-warning btn-sm">👁</button>
      </td>
    </tr>
  );
}

export default EmployeesRow;
