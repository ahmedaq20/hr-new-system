import React from "react";
import { Table, Card, Spinner, Alert, Button } from "react-bootstrap";
import { FaDownload, FaWallet, FaFileInvoiceDollar } from "react-icons/fa";
import api from "../api/axios";

const Salary = ({ payslips, loading, error }) => {
  const handleDownload = async (url) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'payslip.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("فشل تحميل الملف. يرجى المحاولة مرة أخرى.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="teal" style={{ color: '#016A74' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-2" dir="rtl">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 text-end">
        <div>
          <h4 className="fw-bold text-dark mb-1">قسائم الراتب</h4>
          <p className="text-muted small mb-0">عرض وتحميل قسائم الراتب الشهرية الخاصة بك</p>
        </div>
        <div className="p-3 bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
          <FaWallet size={24} style={{ color: "#016A74" }} />
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="text-center shadow-sm" style={{ borderRadius: '12px' }}>
          حدث خطأ أثناء جلب قائمة قسائم الراتب
        </Alert>
      )}

      {/* Table Section */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 text-center align-middle">
              <thead className="bg-light text-secondary small text-uppercase">
                <tr>
                  <th className="py-3 border-0" style={{ borderRadius: "15px 0 0 0" }}>#</th>
                  <th className="py-3 border-0">السنة</th>
                  <th className="py-3 border-0">الشهر</th>
                  <th className="py-3 border-0">تاريخ الإنشاء</th>
                  <th className="py-3 border-0" style={{ borderRadius: "0 15px 0 0" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payslips?.length > 0 ? (
                  payslips.map((payslip, index) => (
                    <tr key={payslip.id}>
                      <td className="fw-bold text-muted">{index + 1}</td>
                      <td>
                        <span className="fw-bold" style={{ color: "#4b5563" }}>{payslip.year}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark px-3 py-2 fw-normal border" style={{ borderRadius: '8px' }}>
                          {payslip.month_name}
                        </span>
                      </td>
                      <td className="text-muted small">{payslip.created_at}</td>
                      <td>
                        <Button
                          variant="teal"
                          size="sm"
                          className="d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                          style={{
                            backgroundColor: "#016A74",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            color: "white"
                          }}
                          onClick={() => handleDownload(payslip.download_url)}
                        >
                          <FaDownload size={12} />
                          تحميل القسيمة
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-5 text-muted text-center">
                      <div className="mb-3">
                        <FaFileInvoiceDollar size={48} style={{ color: '#dee2e6' }} />
                      </div>
                      لا توجد قسائم راتب متوفرة حالياً في ملفك
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-light border-start border-4 border-info shadow-sm" style={{ borderRadius: '12px' }}>
        <p className="mb-0 small text-muted text-end">
          <strong>ملاحظة:</strong> يتم تحديث قسائم الراتب شهرياً فور اعتمادها من قبل قسم الشؤون المالية.
        </p>
      </div>
    </div>
  );
};

export default Salary;
