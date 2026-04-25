import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  FaUsers,
  FaClipboardList,
  FaBell,
  FaChartLine,
  FaBuilding,
  FaUserTie,
  FaFileAlt,
  FaBalanceScale
} from "react-icons/fa";

const DashboardCards = () => {
  const cardsData = [
    { title: "عدد الموظفين الكلي", number: 256, icon: <FaUsers size={25} />, color: "#1e3a8a" },
    { title: "الموظفين الرسميين", number: 12, icon: <FaUserTie size={25} />, color: "#0f766e" },
    { title: "العقود المؤقتة", number: 5, icon: <FaBalanceScale size={25} />, color: "#b45309" },
    { title: "المتقاعدين", number: 85, icon: <FaChartLine size={25} />, color: "#334155" },
    { title: "عقود التشغيل", number: 18, icon: <FaBuilding size={25} />, color: "#1d4ed8" },
    { title: "البرامج المعتمدة", number: 7, icon: <FaClipboardList size={25} />, color: "#047857" },
    { title: "الوزارات", number: 41, icon: <FaFileAlt size={25} />, color: "#475569" },
    { title: "نسبة الحضور الكلية", number: 83, icon: <FaBell size={25} />, color: "#9a3412" },
  ];

  return (
    <Row className="g-4">
      {cardsData.map((card, index) => (
        <Col md={3} key={index}>
          <Card
            style={{
              borderRadius: "12px",
              backgroundColor: "#f8f9fc",
              boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <Card.Body className="d-flex align-items-center">
              <div
                style={{
                  backgroundColor: card.color,
                  color: "white",
                  borderRadius: "50%",
                  width: "55px",
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                }}
              >
                {card.icon}
              </div>

              <div>
                <Card.Title className="mb-1 mx-2 mt-2 cardDashTit">
                  {card.title}
                </Card.Title>
                <h4 className="mx-3 mt-2 cardDashNum">
                  {card.number}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardCards;
